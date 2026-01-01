# @mojo/tenant

Unified tenant middleware and types for MOJO microservices.

## Installation

```bash
pnpm add @mojo/tenant
```

## Features

- **Unified Types**: Common `Tenant` interface across all services
- **Fastify Plugin**: For kontakte.mojo, accounts.mojo, campus.mojo
- **Express Middleware**: For payments.mojo
- **Header Utilities**: For service-to-service communication
- **Multiple Identification Methods**:
  - `x-tenant-id` header (UUID) - highest priority
  - `x-tenant-slug` header - fallback
  - Clerk JWT `org_id` - from authenticated requests
  - API Key `tenant_id` - for API-authenticated requests
  - Default tenant - configurable fallback

## Usage

### Fastify

```typescript
import Fastify from 'fastify';
import { fastifyTenantPlugin } from '@mojo/tenant';

const fastify = Fastify();

fastify.register(fastifyTenantPlugin, {
  findById: (id) => prisma.tenant.findUnique({ where: { id } }),
  findBySlug: (slug) => prisma.tenant.findUnique({ where: { slug } }),
  findByClerkOrgId: (clerkOrgId) => prisma.tenant.findUnique({ where: { clerkOrgId } }),
  defaultTenantSlug: 'mojo',
  skipRoutes: ['/webhooks'],
});

// In route handlers
fastify.get('/api/data', async (request, reply) => {
  const tenant = request.tenant!;
  console.log(`Request for tenant: ${tenant.slug}`);
});
```

### Express

```typescript
import express from 'express';
import { expressTenantMiddleware } from '@mojo/tenant';

const app = express();

app.use(expressTenantMiddleware({
  findById: (id) => db.tenants.findById(id),
  findBySlug: (slug) => db.tenants.findBySlug(slug),
  defaultTenantSlug: 'mojo',
}));

// In route handlers
app.get('/api/data', (req, res) => {
  const tenant = req.tenant!;
  console.log(`Request for tenant: ${tenant.slug}`);
});
```

### Service-to-Service Calls

```typescript
import { createTenantHeaders } from '@mojo/tenant';

// When calling another MOJO service
const response = await fetch('https://payments.mojo.example/api/orders', {
  headers: {
    ...createTenantHeaders(tenant, 'accounts.mojo'),
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify(data),
});
```

## Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `findById` | `(id: string) => Promise<Tenant \| null>` | **Required**. Lookup tenant by UUID |
| `findBySlug` | `(slug: string) => Promise<Tenant \| null>` | **Required**. Lookup tenant by slug |
| `findByClerkOrgId` | `(clerkOrgId: string) => Promise<Tenant \| null>` | Optional. Lookup by Clerk org ID |
| `defaultTenantSlug` | `string` | Optional. Default tenant if none specified |
| `skipRoutes` | `string[]` | Optional. Routes to skip tenant resolution |
| `allowNoTenant` | `boolean` | Optional. Allow requests without tenant |
| `onError` | `(error: TenantError) => void` | Optional. Custom error handler |

## Tenant Interface

```typescript
interface Tenant {
  id: string;           // UUID
  slug: string;         // Human-readable identifier
  name: string;         // Display name
  clerkOrgId?: string;  // Clerk Organization ID
  isPersonal?: boolean; // Personal tenant flag
  status?: 'active' | 'pending' | 'suspended';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

## Headers

| Header | Purpose |
|--------|---------|
| `x-tenant-id` | UUID of the tenant (primary) |
| `x-tenant-slug` | Slug of the tenant (fallback) |
| `x-service-name` | Name of calling service (for audit) |

## License

UNLICENSED - Internal MOJO package










