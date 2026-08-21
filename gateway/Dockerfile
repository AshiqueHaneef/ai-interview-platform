FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
# npm run build = prisma generate (into src/generated) + tsc
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
# The container owns its schema: migrations are applied before the app boots.
COPY prisma.config.ts ./
COPY prisma ./prisma

EXPOSE 3001
CMD ["npm", "run", "start:migrated"]
