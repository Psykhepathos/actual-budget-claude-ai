# Use Node.js LTS
FROM node:20-alpine

# Install necessary tools
RUN apk add --no-cache python3 make g++

# Install Claude Code CLI globally
RUN npm install -g @anthropics/claude-code

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S claude -u 1001

# Change ownership of the app directory
RUN chown -R claude:nodejs /app

# Switch to non-root user
USER claude

# Expose port
EXPOSE 11434

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:11434/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["npm", "start"]