# Module 7: Docker Fundamentals (Containerization for Developers)

## Learning Objectives
- Understand what Docker is and why it's useful
- Learn containerization concepts
- Create Dockerfiles for Next.js applications
- Use Docker Compose for multi-service setups
- Relate Docker to frontend development workflows

## 7.1 What is Docker?

### The "Works on My Machine" Problem

**Frontend analogy:**
```javascript
// Developer A's machine
node --version // v18.0.0
npm install // Works fine!

// Developer B's machine  
node --version // v16.0.0
npm install // Breaks! Different Node version
```

**The Problem:**
- Different operating systems (Mac, Windows, Linux)
- Different Node/Python/etc. versions
- Different system dependencies
- "It works on my machine" syndrome

**Docker Solution:**
```dockerfile
# Everyone uses the EXACT same environment
FROM node:18-alpine
# Now everyone has Node 18, guaranteed!
```

**WHY Docker**: Like having a `package.json` for your entire runtime environment, not just dependencies

### Docker vs Virtual Machines

**Frontend analogy:**
```javascript
// Virtual Machine = Running a full computer inside your computer
// Like opening a Windows VM on Mac - heavy and slow

// Docker Container = Running just the app in an isolated environment
// Like running a function in its own scope - lightweight and fast
```

**Comparison:**
```
Virtual Machine:
- Full OS (5-10 GB)
- Minutes to start
- Heavy resource usage

Docker Container:
- Just your app + dependencies (100-500 MB)
- Seconds to start
- Lightweight
```

## 7.2 Docker Concepts

### Images vs Containers

**Frontend analogy:**
```javascript
// Docker Image = Class definition
class App {
  constructor() {
    this.port = 3000;
  }
}

// Docker Container = Instance of the class
const container1 = new App(); // Running instance
const container2 = new App(); // Another running instance
```

**Docker:**
```bash
# Image = Blueprint (like a class)
docker build -t my-app .

# Container = Running instance (like an object)
docker run my-app  # Instance 1
docker run my-app  # Instance 2
```

### Layers (Caching for Speed)

**Frontend analogy:**
```javascript
// Like memoization - cache results to avoid recomputation
const memoize = (fn) => {
  const cache = {};
  return (arg) => {
    if (cache[arg]) return cache[arg]; // Use cached result
    cache[arg] = fn(arg);
    return cache[arg];
  };
};
```

**Docker:**
```dockerfile
# Each instruction creates a layer (cached)
FROM node:18-alpine        # Layer 1 (cached)
WORKDIR /app               # Layer 2 (cached)
COPY package*.json ./      # Layer 3 (cached if package.json unchanged)
RUN npm install            # Layer 4 (cached if layer 3 unchanged)
COPY . .                   # Layer 5 (changes often)
RUN npm run build          # Layer 6 (runs only if layer 5 changed)
```

## 7.3 Creating a Dockerfile for Next.js

### Basic Dockerfile

```dockerfile
# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

**Frontend analogy:**
```javascript
// Like a setup script that runs in order
async function setupApp() {
  await installDependencies();  // RUN npm install
  await buildApp();             // RUN npm run build
  await startServer();          // CMD npm start
}
```

### Multi-Stage Build (Optimized)

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Runner (Final image)
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy only necessary files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
```

**WHY Multi-Stage**: Final image only contains what's needed to run (smaller, faster, more secure)

**Frontend analogy:**
```javascript
// Like tree-shaking in webpack
// Build process includes everything, but final bundle only includes used code

// Development (large)
import * as lodash from 'lodash';

// Production (small)
import { debounce } from 'lodash'; // Only includes debounce
```

### Development Dockerfile

```dockerfile
# Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Use dev server with hot reload
CMD ["npm", "run", "dev"]
```

## 7.4 Docker Compose (Multi-Service Setup)

### What is Docker Compose?

**Frontend analogy:**
```javascript
// Instead of starting services manually:
startDatabase();
startBackend();
startFrontend();
startRedis();

// Docker Compose = Start everything with one command
docker-compose up
```

### Basic docker-compose.yml

```yaml
version: '3.8'

services:
  # Next.js application
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/ramenbae
      - NEXT_PUBLIC_SUPABASE_URL=http://supabase:8000
    depends_on:
      - db
      - supabase

  # PostgreSQL database
  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=ramenbae
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Supabase (local development)
  supabase:
    image: supabase/postgres:15
    ports:
      - "8000:8000"
    environment:
      - POSTGRES_PASSWORD=password

volumes:
  postgres_data:
```

**Usage:**
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f app
```

## 7.5 Docker Commands Cheat Sheet

### Image Commands

```bash
# Build image
docker build -t my-app .

# List images
docker images

# Remove image
docker rmi my-app

# Pull image from registry
docker pull node:18-alpine
```

### Container Commands

```bash
# Run container
docker run -p 3000:3000 my-app

# Run in background
docker run -d -p 3000:3000 my-app

# List running containers
docker ps

# List all containers
docker ps -a

# Stop container
docker stop <container-id>

# Remove container
docker rm <container-id>

# View logs
docker logs <container-id>

# Execute command in container
docker exec -it <container-id> sh
```

### Cleanup Commands

```bash
# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove everything unused
docker system prune -a

# Remove volumes
docker volume prune
```

## 7.6 Environment Variables

### .env File

```bash
# .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ramenbae
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
```

### Using in Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

COPY . .
RUN npm install
RUN npm run build

EXPOSE $PORT

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
services:
  app:
    build: .
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - PORT=3000
```

**Frontend analogy:**
```javascript
// Like using process.env in Next.js
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## 7.7 Volumes (Persistent Data)

### Why Volumes?

**The Problem:**
```bash
# Container data is lost when container stops
docker run my-app
# Create some data
docker stop my-app
# Data is gone! 😱
```

**The Solution:**
```yaml
# docker-compose.yml
services:
  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Persistent storage

volumes:
  postgres_data:  # Named volume
```

**Frontend analogy:**
```javascript
// Without volumes = useState (lost on unmount)
const [data, setData] = useState([]);

// With volumes = localStorage (persists)
localStorage.setItem('data', JSON.stringify(data));
```

### Types of Volumes

```yaml
services:
  app:
    volumes:
      # Named volume (managed by Docker)
      - app_data:/app/data
      
      # Bind mount (maps to host directory)
      - ./src:/app/src
      
      # Anonymous volume (temporary)
      - /app/node_modules

volumes:
  app_data:
```

## 7.8 Docker Networking

### Service Communication

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      # Use service name as hostname
      - API_URL=http://backend:4000

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://db:5432/mydb

  db:
    image: postgres:15
    # No ports exposed to host, only accessible to other services
```

**Frontend analogy:**
```javascript
// Services can talk to each other by name
// Like importing modules
import { api } from './backend';  // backend service
import { db } from './database';  // db service
```

## 7.9 Practical Example: Ramen Bae Development Setup

### Project Structure

```
ramen-bae-clone/
├── docker-compose.yml
├── Dockerfile
├── Dockerfile.dev
├── .dockerignore
├── .env.example
└── app/
    ├── package.json
    └── ...
```

### .dockerignore

```
# .dockerignore (like .gitignore for Docker)
node_modules
.next
.git
.env
.env.local
*.log
```

### Complete docker-compose.yml

```yaml
version: '3.8'

services:
  # Next.js App
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/ramenbae
      - NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - db
    command: npm run dev

  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=ramenbae
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # pgAdmin (Database GUI)
  pgadmin:
    image: dpage/pgadmin4
    ports:
      - "5050:80"
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@ramenbae.com
      - PGADMIN_DEFAULT_PASSWORD=admin
    depends_on:
      - db

volumes:
  postgres_data:
```

### Usage

```bash
# Start development environment
docker-compose up

# Access:
# - App: http://localhost:3000
# - Database: localhost:5432
# - pgAdmin: http://localhost:5050

# Run commands in container
docker-compose exec app npm install lodash
docker-compose exec app npm run build

# View logs
docker-compose logs -f app

# Restart service
docker-compose restart app

# Stop everything
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

## 7.10 Best Practices

### 1. Use Specific Image Tags

```dockerfile
# ❌ Bad: Version can change
FROM node:latest

# ✅ Good: Specific version
FROM node:18-alpine
```

### 2. Minimize Layers

```dockerfile
# ❌ Bad: Multiple RUN commands
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git

# ✅ Good: Combine commands
RUN apt-get update && \
    apt-get install -y curl git && \
    rm -rf /var/lib/apt/lists/*
```

### 3. Order Matters (Caching)

```dockerfile
# ❌ Bad: Code changes invalidate dependency cache
COPY . .
RUN npm install

# ✅ Good: Dependencies cached separately
COPY package*.json ./
RUN npm install
COPY . .
```

### 4. Use .dockerignore

```
# .dockerignore
node_modules
.git
.env
*.log
.next
```

### 5. Don't Run as Root

```dockerfile
# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Switch to non-root user
USER nextjs
```

## 7.11 Troubleshooting

### Common Issues

**Issue: Port already in use**
```bash
# Error: port 3000 is already allocated
# Solution: Stop other service or use different port
docker-compose down
# or
docker-compose up -p 3001:3000
```

**Issue: Changes not reflecting**
```bash
# Solution: Rebuild image
docker-compose up --build
```

**Issue: Out of disk space**
```bash
# Solution: Clean up
docker system prune -a
docker volume prune
```

**Issue: Can't connect to database**
```bash
# Solution: Check if database is ready
docker-compose logs db
# Wait for "database system is ready to accept connections"
```

## 7.12 Key Takeaways

- **Docker = Consistent environment** across all machines
- **Images = Blueprints**, Containers = Running instances
- **Layers = Caching** for faster builds
- **Docker Compose = Multi-service** orchestration
- **Volumes = Persistent data** that survives container restarts
- **Networking = Services** can communicate by name
- **Best practices**: Specific tags, layer optimization, .dockerignore

## 7.13 Quick Reference

```bash
# Development workflow
docker-compose up              # Start all services
docker-compose up --build      # Rebuild and start
docker-compose down            # Stop all services
docker-compose logs -f app     # View logs
docker-compose exec app sh     # Shell into container

# Cleanup
docker-compose down -v         # Remove volumes
docker system prune -a         # Clean everything
```

## Next Module Preview

In Module 8, we'll learn about Security Best Practices - how to protect your application from common vulnerabilities and attacks!
