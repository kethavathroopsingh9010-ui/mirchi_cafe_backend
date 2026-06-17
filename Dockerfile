# ================================================
# STAGE 1: BUILD THE APPLICATION
# ================================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including development dependencies for the TS compiler)
RUN npm ci

# Copy the rest of your application source code
COPY . .

# Build the production distribution (creates the /dist folder)
RUN npm run build

# Prune development dependencies to keep production footprint minimal
RUN npm prune --production

# ================================================
# STAGE 2: PRODUCTION RUNTIME ENVIRONMENT
# ================================================
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Set production environment variable flag
ENV NODE_ENV=production

# Copy built distribution assets and production node modules from Stage 1
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Expose the default NestJS application network port
EXPOSE 3000

# Start the application using the compiled main execution block
CMD ["node", "dist/main"]