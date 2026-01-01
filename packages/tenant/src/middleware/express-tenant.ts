/**
 * Express Tenant Middleware
 * 
 * Unified tenant resolution middleware for Express-based MOJO services.
 * 
 * Supports multiple tenant identification methods:
 * 1. x-tenant-id header (UUID) - highest priority
 * 2. x-tenant-slug header - fallback
 * 3. API Key tenant_id - from authenticated requests
 * 4. Default tenant - configurable fallback
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import {
  Tenant,
  TenantContext,
  TenantResolverOptions,
  TenantError,
  TenantSource,
  TENANT_HEADERS,
  isValidUUID,
} from '../types/tenant.interface.js';

// Extend Express types
declare global {
  namespace Express {
    interface Request {
      /** Resolved tenant (null if allowNoTenant is true and no tenant found) */
      tenant?: Tenant | null;
      
      /** Full tenant context with resolution metadata */
      tenantContext?: TenantContext | null;
    }
  }
}

/**
 * Express middleware options
 */
export interface ExpressTenantMiddlewareOptions extends TenantResolverOptions {
  /** Custom logger */
  logger?: {
    debug: (msg: string, data?: object) => void;
    error: (msg: string, data?: object) => void;
  };
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
 * Extract tenant_id from API key info if present
 */
function extractTenantIdFromApiKey(req: Request): string | null {
  const apiKeyInfo = (req as any).apiKeyInfo;
  if (apiKeyInfo?.tenant_id) {
    return apiKeyInfo.tenant_id;
  }
  
  // Also check for tenantId set by other auth middleware
  const tenantId = (req as any).tenantId;
  if (tenantId) {
    return tenantId;
  }
  
  return null;
}

/**
 * Resolve tenant from request
 */
async function resolveTenant(
  req: Request,
  options: TenantResolverOptions
): Promise<{ tenant: Tenant | null; source: TenantSource; rawIdentifier?: string }> {
  // 1. Try x-tenant-id header (UUID)
  const tenantIdHeader = req.get(TENANT_HEADERS.TENANT_ID);
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
  const tenantSlugHeader = req.get(TENANT_HEADERS.TENANT_SLUG);
  if (tenantSlugHeader) {
    const tenant = await options.findBySlug(tenantSlugHeader);
    if (tenant) {
      return { tenant, source: 'header_slug', rawIdentifier: tenantSlugHeader };
    }
  }

  // 3. Try tenant_id from API key
  const apiKeyTenantId = extractTenantIdFromApiKey(req);
  if (apiKeyTenantId) {
    const tenant = await options.findById(apiKeyTenantId);
    if (tenant) {
      return { tenant, source: 'api_key', rawIdentifier: apiKeyTenantId };
    }
  }

  // 4. Try Clerk org_id from JWT if available
  if (options.findByClerkOrgId) {
    const clerkUser = (req as any).clerkUser;
    const clerkOrgId = clerkUser?.orgId || clerkUser?.organizationId;
    if (clerkOrgId) {
      const tenant = await options.findByClerkOrgId(clerkOrgId);
      if (tenant) {
        return { tenant, source: 'jwt_org_id', rawIdentifier: clerkOrgId };
      }
    }
  }

  // 5. Try default tenant
  if (options.defaultTenantSlug) {
    const tenant = await options.findBySlug(options.defaultTenantSlug);
    if (tenant) {
      return { tenant, source: 'default', rawIdentifier: options.defaultTenantSlug };
    }
  }

  return { tenant: null, source: 'default' };
}

/**
 * Create Express tenant middleware
 * 
 * @example
 * ```ts
 * import { expressTenantMiddleware } from '@mojo/tenant/express';
 * 
 * app.use(expressTenantMiddleware({
 *   findById: (id) => db.tenants.findUnique({ where: { id } }),
 *   findBySlug: (slug) => db.tenants.findUnique({ where: { slug } }),
 *   defaultTenantSlug: 'mojo',
 * }));
 * 
 * // In route handler
 * app.get('/api/data', (req, res) => {
 *   const tenant = req.tenant!;
 *   // Use tenant...
 * });
 * ```
 */
export function expressTenantMiddleware(
  options: ExpressTenantMiddlewareOptions
): RequestHandler {
  const skipRoutes = [...DEFAULT_SKIP_ROUTES, ...(options.skipRoutes || [])];
  const logger = options.logger || {
    debug: () => {},
    error: console.error,
  };

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip tenant resolution for certain routes
    if (shouldSkipRoute(req.path, skipRoutes)) {
      next();
      return;
    }

    try {
      const { tenant, source, rawIdentifier } = await resolveTenant(req, options);

      if (!tenant) {
        if (options.allowNoTenant) {
          req.tenant = null;
          req.tenantContext = null;
          next();
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

        res.status(404).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
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

        res.status(403).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      // Set tenant context on request
      req.tenant = tenant;
      req.tenantContext = {
        tenant,
        source,
        rawIdentifier,
      };

      logger.debug('Tenant resolved', {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        source,
      });

      next();
    } catch (err) {
      const error = err as TenantError;
      
      if (options.onError) {
        options.onError(error);
      }

      logger.error('Tenant resolution error', { error });

      res.status(error.code === 'INVALID_TENANT_ID' ? 400 : 500).json({
        success: false,
        error: {
          code: error.code || 'TENANT_RESOLUTION_ERROR',
          message: error.message || 'Error resolving tenant',
        },
      });
    }
  };
}

/**
 * Middleware to require a tenant on the request
 * Use after expressTenantMiddleware when allowNoTenant is true
 */
export function requireTenant(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.tenant) {
      res.status(400).json({
        success: false,
        error: {
          code: 'TENANT_REQUIRED',
          message: 'This endpoint requires a tenant context',
        },
      });
      return;
    }
    next();
  };
}

export default expressTenantMiddleware;

// Re-export types for convenience
export type { Tenant, TenantContext, TenantResolverOptions, TenantError };










