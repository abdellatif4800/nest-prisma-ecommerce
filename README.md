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

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
