/**
 * @mojo/tenant
 * 
 * Unified tenant middleware and types for MOJO microservices.
 * 
 * @example Basic usage with Fastify
 * ```ts
 * import { fastifyTenantPlugin, Tenant } from '@mojo/tenant';
 * // or
 * import { fastifyTenantPlugin } from '@mojo/tenant/fastify';
 * 
 * fastify.register(fastifyTenantPlugin, {
 *   findById: (id) => prisma.tenant.findUnique({ where: { id } }),
 *   findBySlug: (slug) => prisma.tenant.findUnique({ where: { slug } }),
 *   defaultTenantSlug: 'mojo',
 * });
 * ```
 * 
 * @example Basic usage with Express
 * ```ts
 * import { expressTenantMiddleware, Tenant } from '@mojo/tenant';
 * // or
 * import { expressTenantMiddleware } from '@mojo/tenant/express';
 * 
 * app.use(expressTenantMiddleware({
 *   findById: (id) => db.tenants.findById(id),
 *   findBySlug: (slug) => db.tenants.findBySlug(slug),
 *   defaultTenantSlug: 'mojo',
 * }));
 * ```
 * 
 * @example Service-to-service calls
 * ```ts
 * import { createTenantHeaders } from '@mojo/tenant';
 * 
 * const response = await fetch(url, {
 *   headers: {
 *     ...createTenantHeaders(tenant, 'accounts.mojo'),
 *     'Content-Type': 'application/json',
 *   },
 * });
 * ```
 */

// Types
export {
  Tenant,
  TenantStatus,
  TenantSource,
  TenantContext,
  TenantResolverOptions,
  TenantErrorCode,
  TenantError,
  TENANT_HEADERS,
  isValidUUID,
  isValidSlug,
} from './types/tenant.interface.js';

// Utilities
export {
  createTenantHeaders,
  extractTenantFromHeaders,
  getServiceNameFromHeaders,
  validateTenantHeaders,
  HeadersObject,
} from './utils/tenant-header.js';

// Fastify middleware
export {
  fastifyTenantPlugin,
  FastifyTenantPluginOptions,
} from './middleware/fastify-tenant.js';

// Express middleware
export {
  expressTenantMiddleware,
  ExpressTenantMiddlewareOptions,
  requireTenant,
} from './middleware/express-tenant.js';










