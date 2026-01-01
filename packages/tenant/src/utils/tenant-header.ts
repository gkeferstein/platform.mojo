/**
 * Tenant Header Utilities
 * 
 * Helper functions for working with tenant headers in service-to-service communication.
 */

import { TENANT_HEADERS, Tenant } from '../types/tenant.interface.js';

/**
 * Headers object type
 */
export type HeadersObject = Record<string, string | undefined>;

/**
 * Create standard tenant headers for service-to-service calls
 * 
 * @param tenant - The tenant context
 * @param serviceName - Name of the calling service
 * @returns Headers object to spread into fetch/axios calls
 * 
 * @example
 * ```ts
 * const response = await fetch(url, {
 *   headers: {
 *     ...createTenantHeaders(tenant, 'accounts.mojo'),
 *     'Content-Type': 'application/json',
 *   },
 * });
 * ```
 */
export function createTenantHeaders(
  tenant: Tenant | { id: string; slug?: string },
  serviceName: string
): HeadersObject {
  const headers: HeadersObject = {
    [TENANT_HEADERS.TENANT_ID]: tenant.id,
    [TENANT_HEADERS.SERVICE_NAME]: serviceName,
  };

  if ('slug' in tenant && tenant.slug) {
    headers[TENANT_HEADERS.TENANT_SLUG] = tenant.slug;
  }

  return headers;
}

/**
 * Extract tenant identifier from headers
 * 
 * Priority:
 * 1. x-tenant-id (UUID) - most specific
 * 2. x-tenant-slug (string) - fallback
 * 
 * @param headers - Request headers object
 * @returns Tenant identifier info or null
 */
export function extractTenantFromHeaders(
  headers: HeadersObject | Headers
): { type: 'id' | 'slug'; value: string } | null {
  const getHeader = (name: string): string | undefined => {
    if (headers instanceof Headers) {
      return headers.get(name) ?? undefined;
    }
    // Case-insensitive lookup for plain objects
    const lowerName = name.toLowerCase();
    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() === lowerName) {
        return value;
      }
    }
    return undefined;
  };

  const tenantId = getHeader(TENANT_HEADERS.TENANT_ID);
  if (tenantId) {
    return { type: 'id', value: tenantId };
  }

  const tenantSlug = getHeader(TENANT_HEADERS.TENANT_SLUG);
  if (tenantSlug) {
    return { type: 'slug', value: tenantSlug };
  }

  return null;
}

/**
 * Get the service name from headers
 * 
 * @param headers - Request headers object
 * @returns Service name or undefined
 */
export function getServiceNameFromHeaders(
  headers: HeadersObject | Headers
): string | undefined {
  if (headers instanceof Headers) {
    return headers.get(TENANT_HEADERS.SERVICE_NAME) ?? undefined;
  }
  
  const lowerName = TENANT_HEADERS.SERVICE_NAME.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }
  return undefined;
}

/**
 * Validate that required tenant headers are present
 * 
 * @param headers - Request headers object
 * @returns Validation result
 */
export function validateTenantHeaders(
  headers: HeadersObject | Headers
): { valid: boolean; error?: string } {
  const tenant = extractTenantFromHeaders(headers);
  
  if (!tenant) {
    return {
      valid: false,
      error: `Missing tenant header. Provide either ${TENANT_HEADERS.TENANT_ID} or ${TENANT_HEADERS.TENANT_SLUG}`,
    };
  }

  return { valid: true };
}










