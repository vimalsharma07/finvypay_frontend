# ---------- Builder ----------
    FROM node:22-alpine AS builder

    WORKDIR /app
    
    # Copy only lock files first (cache win)
    COPY package.json package-lock.json ./
    
    RUN npm ci --legacy-peer-deps
    
    # Copy rest AFTER deps
    COPY . .
    
    RUN npm run build
    
    # ---------- Runner ----------
    FROM node:22-alpine AS runner
    
    WORKDIR /app
    ENV NODE_ENV=production
    
    RUN addgroup -g 1001 -S nodejs \
        && adduser -S nextjs -u 1001
    
    COPY --from=builder /app/public ./public
    COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
    COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
    
    USER nextjs
    
    EXPOSE 3000
    CMD ["node", "server.js"]