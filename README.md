# NestJS E-commerce API

A comprehensive e-commerce API built with NestJS, featuring user authentication, product management with variants, categories, and order handling using Prisma ORM and PostgreSQL.

## Features

- **Authentication**: JWT-based user registration and login with role-based guards
- **Product Management**: CRUD operations for products, including variants (color, size, stock, price overrides)
- **Categories**: Hierarchical categories and subcategories
- **Orders & Cart**: Shopping cart and order management
- **Admin API**: Separate admin endpoints for content management
- **Public API**: Public-facing endpoints for storefront integration
- **Validation**: Class-validator DTOs for robust input validation
- **Database**: Prisma ORM with PostgreSQL, including migrations

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT with Passport
- **Validation**: class-validator
- **Testing**: Jest
- **Linting**: ESLint with Prettier

## Project Structure

```
├── apps/                 # Applications
│   ├── admin-api/        # Admin API (port 8001)
│   └── api/              # Public API (port 8000)
├── libs/                 # Shared libraries
│   ├── auth/             # Authentication module
│   ├── categories/       # Categories module
│   ├── common/           # Shared utilities and guards
│   ├── prisma-setup/     # Database setup and Prisma client
│   └── products/         # Products and variants module
├── restClient/           # HTTP request collections for testing
└── prisma/               # Database schema and migrations
```

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```
