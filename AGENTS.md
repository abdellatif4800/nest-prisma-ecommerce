# AGENTS.md

This document provides guidelines for agentic coding agents working in this NestJS e-commerce API.

## Build/Lint/Test Commands

### Build

- `pnpm run build` - Build the project to dist/ directory

### Lint & Format

- `pnpm run lint` - Run ESLint with auto-fix
- `pnpm run format` - Format code with Prettier

### Test

- `pnpm test` - Run all unit tests
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run test:cov` - Run tests with coverage report
- `pnpm run test:e2e` - Run end-to-end tests
- `pnpm run test:debug` - Debug tests with Node inspector

**Run a single test:**

```bash
# Run a specific test file
jest src/features/auth/auth.service.spec.ts

# Run tests matching a pattern
jest --testNamePattern="should create user"

# Run tests in watch mode for a specific file
jest src/features/auth/auth.service.spec.ts --watch
```

## Code Style Guidelines

### Imports

- Group imports by library, NestJS, local modules
- Use absolute imports with `src/` prefix for local files: `import { PrismaService } from 'src/prismaSetup/prisma.service'`
- Keep each import on its own line
- NestJS decorators first: `import { Controller, Get, Post } from '@nestjs/common'`

### Formatting (Prettier)

- Single quotes: `"singleQuote": true`
- Trailing commas: `"trailingComma": "all"`
- End of line: auto-detected

### TypeScript Configuration

- Target: ES2023, Module: nodenext
- `strictNullChecks: true`, `noImplicitAny: false`
- Use definite assignment assertion `!` for guaranteed values: `process.env.PORT!`
- Paths: `src/*` maps to `./src/*`

### Naming Conventions

- Classes: PascalCase (`AuthService`, `AuthController`)
- Methods: camelCase (`create`, `findAll`, `findOne`)
- DTOs: PascalCase with "Dto" suffix (`CreateAuthDto`, `LoginAuthDto`)
- Services: lowercase when injected (`private prisma`, `private authService`)
- Routes: kebab-case for endpoints (`@Controller('auth')`, `@Post('registration')`)
- Files: kebab-case for feature folders (`auth.service.ts`, `auth.controller.ts`)

### Error Handling

- Use NestJS HTTP exceptions from `@nestjs/common`
- `ConflictException` for duplicate resources
- `UnauthorizedException` for authentication failures
- `BadRequestException` for invalid input
- Throw descriptive messages

### NestJS Conventions

- Decorators above methods/classes with consistent spacing
- Constructor injection with `private readonly`
- Controller routes: `@Get(':id')` with `@Param('id') id: string`
- Convert string params with `+`: `this.productsService.findOne(+id)`
- Use `async/await` for all Prisma operations
- Use `select` in Prisma queries to exclude sensitive data (passwords)

### Structure

- Features organized in `src/features/` folder
- Each feature: `*.controller.ts`, `*.service.ts`, `dto/*.dto.ts`, `*.module.ts`, `*.spec.ts`
- Shared services in `src/prismaSetup/`
- Prisma generated client in `src/prismaSetup/generatedClient/`

### Validation (class-validator)

- Use decorators from `class-validator`
- `@IsString()`, `@IsEmail()`, `@IsEnum()`, `@IsOptional()`, `@MinLength()`
- DTO properties use definite assignment assertion: `username!: string`

### Testing

- Unit tests: `*.spec.ts` files alongside source files
- E2E tests: in `test/` directory
- Mock PrismaService in tests
- Use NestJS `Test.createTestingModule` for unit tests
- Use `supertest` for E2e API testing

### Database (Prisma)

- Use `PrismaService` injected into services
- `extends PrismaClient` with `OnModuleInit`
- Async database operations
- Use select to control returned fields
- Use `findUnique`, `create`, `update`, `delete` methods

### ESLint Rules

- `@typescript-eslint/no-explicit-any: off` - `any` type allowed
- `@typescript-eslint/no-floating-promises: warn` - Await promises
- `@typescript-eslint/no-unsafe-argument: warn` - Type-check arguments
- Prettier integration enforced

### Global Configuration

- Global API prefix: `api`
- Global validation pipe: `{ whitelist: true, transform: true }`
- Environment variables via `@nestjs/config`
- JSON logging enabled

### Prisma Schema

- Database models: User, Product, Category, SubCategory, Cart, CartItem, Order, OrderItem
- Enums: Role
- Schema split across multiple files in `prisma/schema/`

### When Making Changes

1. Run `pnpm run lint` and `pnpm run format` before committing
2. Ensure tests pass: `pnpm test`
3. Run build: `pnpm run build`
4. Check E2E tests: `pnpm run test:e2e`
