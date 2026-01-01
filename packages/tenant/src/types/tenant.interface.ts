/**
 * Unified Tenant Types for MOJO Microservices
 * 
 * All MOJO services should use these types for consistent multitenancy handling.
 */

/**
 * Core Tenant interface - the unified schema across all services
 */
export interface Tenant {
  /** UUID - Primary Key */
  id: string;
  
  /** Human-readable identifier (URL-safe) */
  slug: string;
  
  /** Display name */
  name: string;
  
  /** Optional Clerk Organization ID for SSO mapping */
  clerkOrgId?: string | null;
  
  /** Whether this is a personal tenant (vs organization) */
  isPersonal?: boolean;
  
  /** Tenant status */
  status?: TenantStatus;
  
  /** Flexible metadata storage */
  metadata?: Record<string, unknown>;
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Tenant status enum
 */
export type TenantStatus = 'active' | 'pending' | 'suspended' | 'restricted';

/**
 * How the tenant was identified in the request
 */
export type TenantSource = 'header_id' | 'header_slug' | 'jwt_org_id' | 'api_key' | 'default';

/**
 * Context attached to request after tenant resolution
 */
export interface TenantContext {
  /** The resolved tenant */
  tenant: Tenant;
  
  /** How the tenant was identified */
  source: TenantSource;
  
  /** Original tenant identifier from request (before resolution) */
  rawIdentifier?: string;
}

/**
 * Options for tenant resolution
 */
export interface TenantResolverOptions {
  /** Function to lookup tenant by ID (UUID) */
  findById: (id: string) => Promise<Tenant | null>;
  
  /** Function to lookup tenant by slug */
  findBySlug: (slug: string) => Promise<Tenant | null>;
  
  /** Function to lookup tenant by Clerk Organization ID */
  findByClerkOrgId?: (clerkOrgId: string) => Promise<Tenant | null>;
  
  /** Default tenant slug to use if no tenant is specified */
  defaultTenantSlug?: string;
  
  /** Routes to skip tenant resolution (e.g., /health) */
  skipRoutes?: string[];
  
  /** Whether to allow requests without tenant (returns null instead of error) */
  allowNoTenant?: boolean;
  
  /** Custom error handler */
  onError?: (error: TenantError) => void;
}

/**
 * Error types for tenant resolution
 */
export type TenantErrorCode = 
  | 'TENANT_NOT_FOUND'
  | 'TENANT_SUSPENDED'
  | 'TENANT_HEADER_MISSING'
  | 'TENANT_RESOLUTION_ERROR'
  | 'INVALID_TENANT_ID';

/**
 * Tenant resolution error
 */
export interface TenantError {
  code: TenantErrorCode;
  message: string;
  identifier?: string;
  source?: TenantSource;
}

/**
 * Standard header names for tenant identification
 */
export const TENANT_HEADERS = {
  /** Primary header - UUID */
  TENANT_ID: 'x-tenant-id',
  
  /** Fallback header - slug */
  TENANT_SLUG: 'x-tenant-slug',
  
  /** Service name for audit/logging */
  SERVICE_NAME: 'x-service-name',
} as const;

/**
 * Type guard to check if a value is a valid UUID
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Type guard to check if a value is a valid slug
 */
export function isValidSlug(value: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(value) && value.length >= 2 && value.length <= 63;
}










