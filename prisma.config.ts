import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './libs/prisma-setup/prisma/schema/',
  migrations: {
    path: './libs/prisma-setup/prisma/migrations',
    // seed: 'pnpm dlx tsx ./libs/prisma-setup/src/seed/seed.ts',
    seed: 'pnpm dlx tsx ./libs/prisma-setup/src/seed/seedWithRawSql/seedWithRawSql.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
