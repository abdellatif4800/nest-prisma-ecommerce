import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './libs/prisma-setup/prisma/schema/',
  migrations: {
    path: './libs/prisma-setup/prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
