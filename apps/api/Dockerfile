FROM node:24


# Set CI to true to prevent TTY errors
ENV CI=true

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /usr/src/app

# Copy root workspace files
COPY pnpm-lock.yaml package.json ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile

# RUN pnpm install --frozen-lockfile

COPY . .

# COPY nest-cli.json tsconfig.build.json tsconfig.json  eslint.config.mjs prisma.config.ts ./
#
# COPY apps ./
#
# COPY libs ./

RUN pnpm run build api

#CMD ["pnpm", "dev"]
CMD ["node", "dist/apps/api/src/main"]
