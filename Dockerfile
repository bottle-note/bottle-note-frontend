# Build stage
FROM node:22.11.0-alpine AS build
WORKDIR /usr/src/app

# Install build dependencies for sharp
RUN apk add --no-cache python3 make g++

COPY package.json ./
COPY yarn.lock ./

# Install dependencies including sharp
RUN yarn install
RUN yarn add sharp

COPY . .
RUN yarn build

# Production stage
FROM node:22.11.0-alpine AS production
WORKDIR /usr/src/app

# Copy necessary files from build stage
COPY --from=build /usr/src/app/.next/standalone ./
COPY --from=build /usr/src/app/.next/static ./.next/static
COPY --from=build /usr/src/app/public ./public
COPY --from=build /usr/src/app/node_modules ./node_modules

EXPOSE 3000

# Use the correct command for standalone mode
CMD ["node", "--no-deprecation", "server.js"]
