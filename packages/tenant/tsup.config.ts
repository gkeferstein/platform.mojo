import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'middleware/fastify-tenant': 'src/middleware/fastify-tenant.ts',
    'middleware/express-tenant': 'src/middleware/express-tenant.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
});










