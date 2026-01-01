/**
 * Fastify Tenant Middleware
 * 
 * Unified tenant resolution plugin for Fastify-based MOJO services.
 * 
 * Supports multiple tenant identification methods:
 * 1. x-tenant-id header (UUID) - highest priority
 * 2. x-tenant-slug header - fallback
 * 3. Clerk JWT org_id - from authenticated requests
 * 4. Default tenant - configurable fallback
 */

import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import {
  Tenant,
  TenantContext,
  TenantResolverOptions,
  TenantError,
  TenantSource,
  TENANT_HEADERS,
  isValidUUID,
} from '../types/tenant.interface.js';

// Extend Fastify types
declare module 'fastify' {
  interface FastifyRequest {
    /** Resolved tenant (null if allowNoTenant is true and no tenant found) */
    tenant: Tenant | null;
    
    /** Full tenant context with resolution metadata */
    tenantContext: TenantContext | null;
  }
}

/**
 * Fastify plugin options
 */
export interface FastifyTenantPluginOptions extends TenantResolverOptions {
  /** Plugin name for Fastify registration */
  pluginName?: string;
}

/**
 * Default routes to skip tenant resolution
 */
const DEFAULT_SKIP_ROUTES = [
  '/health',
  '/api/health',
  '/metrics',
  '/api/metrics',
  '/.well-known',
];

/**
 * Check if route should skip tenant resolution
 */
function shouldSkipRoute(url: string, skipRoutes: string[]): boolean {
  const pathname = url.split('?')[0];
  return skipRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Extract Clerk org_id from JWT payload if present
 */
function extractClerkOrgIdFromRequest(request: FastifyRequest): string | null {
  // Check if there's a decoded JWT payload with org_id
  // This assumes Clerk auth middleware has already run
  const auth = (request as any).auth;
  if (auth?.clerkOrgId) {
    return auth.clerkOrgId;
  }
  
  // Also check for user object with org info
  const user = (request as any).user;
  if (user?.orgId || user?.organizationId) {
    return user.orgId || user.organizationId;
  }
  
  return null;
}

/**
 * Resolve tenant from request
 */
async function resolveTenant(
  request: FastifyRequest,
  options: TenantResolverOptions
): Promise<{ tenant: Tenant | null; source: TenantSource; rawIdentifier?: string }> {
  // 1. Try x-tenant-id header (UUID)
  const tenantIdHeader = request.headers[TENANT_HEADERS.TENANT_ID] as string | undefined;
  if (tenantIdHeader) {
    if (!isValidUUID(tenantIdHeader)) {
      throw {
        code: 'INVALID_TENANT_ID',
        message: `Invalid tenant ID format: ${tenantIdHeader}`,
        identifier: tenantIdHeader,
        source: 'header_id',
      } as TenantError;
    }
    
    const tenant = await options.findById(tenantIdHeader);
    if (tenant) {
      return { tenant, source: 'header_id', rawIdentifier: tenantIdHeader };
    }
  }

  // 2. Try x-tenant-slug header
  const tenantSlugHeader = request.headers[TENANT_HEADERS.TENANT_SLUG] as string | undefined;
  if (tenantSlugHeader) {
    const tenant = await options.findBySlug(tenantSlugHeader);
    if (tenant) {
      return { tenant, source: 'header_slug', rawIdentifier: tenantSlugHeader };
    }
  }

  // 3. Try Clerk org_id from JWT
  if (options.findByClerkOrgId) {
    const clerkOrgId = extractClerkOrgIdFromRequest(request);
    if (clerkOrgId) {
      const tenant = await options.findByClerkOrgId(clerkOrgId);
      if (tenant) {
        return { tenant, source: 'jwt_org_id', rawIdentifier: clerkOrgId };
      }
    }
  }

  // 4. Try default tenant
  if (options.defaultTenantSlug) {
    const tenant = await options.findBySlug(options.defaultTenantSlug);
    if (tenant) {
      return { tenant, source: 'default', rawIdentifier: options.defaultTenantSlug };
    }
  }

  return { tenant: null, source: 'default' };
}

/**
 * Create Fastify tenant plugin
 */
const tenantPlugin: FastifyPluginAsync<FastifyTenantPluginOptions> = async (
  fastify,
  options
) => {
  const skipRoutes = [...DEFAULT_SKIP_ROUTES, ...(options.skipRoutes || [])];

  // Decorate request with tenant properties
  fastify.decorateRequest('tenant', null);
  fastify.decorateRequest('tenantContext', null);

  // Add onRequest hook for tenant resolution
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip tenant resolution for certain routes
    if (shouldSkipRoute(request.url, skipRoutes)) {
      return;
    }

    try {
      const { tenant, source, rawIdentifier } = await resolveTenant(request, options);

      if (!tenant) {
        if (options.allowNoTenant) {
          request.tenant = null;
          request.tenantContext = null;
          return;
        }

        const error: TenantError = {
          code: 'TENANT_NOT_FOUND',
          message: rawIdentifier 
            ? `Tenant not found: ${rawIdentifier}`
            : 'No tenant specified and no default tenant configured',
          identifier: rawIdentifier,
          source,
        };

        if (options.onError) {
          options.onError(error);
        }

        return reply.code(404).send({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      // Check tenant status
      if (tenant.status === 'suspended') {
        const error: TenantError = {
          code: 'TENANT_SUSPENDED',
          message: `Tenant ${tenant.slug} is suspended`,
          identifier: tenant.slug,
          source,
        };

        if (options.onError) {
          options.onError(error);
        }

        return reply.code(403).send({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      // Set tenant context on request
      request.tenant = tenant;
      request.tenantContext = {
        tenant,
        source,
        rawIdentifier,
      };

      fastify.log.debug({
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        source,
      }, 'Tenant resolved');

    } catch (err) {
      const error = err as TenantError;
      
      if (options.onError) {
        options.onError(error);
      }

      fastify.log.error({ error }, 'Tenant resolution error');

      return reply.code(error.code === 'INVALID_TENANT_ID' ? 400 : 500).send({
        error: {
          code: error.code || 'TENANT_RESOLUTION_ERROR',
          message: error.message || 'Error resolving tenant',
        },
      });
    }
  });
};

/**
 * Export as Fastify plugin with proper encapsulation
 */
export const fastifyTenantPlugin = fp(tenantPlugin, {
  name: '@mojo/tenant',
  fastify: '4.x',
});

export default fastifyTenantPlugin;

// Re-export types for convenience
export type { Tenant, TenantContext, TenantResolverOptions, TenantError };










