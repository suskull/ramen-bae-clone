# 🐳 Learning SQL + Docker Together

This guide explains how to learn Docker while practicing SQL - killing two birds with one stone!

## Why Learn Docker with SQL?

### Docker Skills You'll Gain
- Container basics (images, containers, volumes)
- Docker Compose for multi-container apps
- Networking between containers
- Data persistence with volumes
- Environment configuration
- Logs and debugging
- Backup and restore strategies

### Real-World Benefits
- **DevOps skills** - Docker is industry standard
- **Portfolio boost** - Show Docker knowledge
- **Production ready** - Same setup as real deployments
- **Team collaboration** - Share identical environments
- **Cloud deployment** - Prepare for AWS/Azure/GCP

---

## Learning Path

### Week 1: SQL Basics + Docker Basics

**Day 1-2: Setup & Basic SQL**
- Install Docker Desktop
- Start containers with `docker compose up -d`
- Learn: What are containers?
- Complete: Exercise 1 (Basic CRUD)
- Docker Exercise: D1 (Understanding Containers)

**Day 3-4: Relationships + Docker Volumes**
- Complete: Exercise 2 (Relationships)
- Docker Exercise: D2 (Volumes and Data Persistence)
- Learn: How data persists in Docker

**Day 5-7: Advanced SQL + Docker Networking**
- Complete: Exercise 3 (Advanced Queries)
- Docker Exercise: D3 (Networking)
- Learn: How containers communicate

### Week 2: Real-World + Docker Operations

**Day 8-10: E-commerce Scenarios**
- Complete: Exercise 4 (Real-World)
- Docker Exercise: D4 (Environment Variables)
- Learn: Configuration management

**Day 11-12: Automation**
- Docker Exercise: D5 (Running SQL Scripts)
- Create automated setup scripts
- Learn: Infrastructure as code

**Day 13-14: Production Skills**
- Backup and restore strategies
- Resource monitoring
- Performance optimization
- Learn: Production operations

---

## Docker Concepts Explained

### 1. Images (The Blueprint)

**What**: A template for creating containers
**Example**: `postgres:16-alpine` is PostgreSQL packaged as an image

```bash
# List images
docker images

# Pull an image
docker pull postgres:16-alpine
```

**Real-world analogy**: Like a recipe - you can make many cakes (containers) from one recipe (image).

---

### 2. Containers (The Running Instance)

**What**: A running instance of an image
**Example**: `learning-postgres` is your running database

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Start/stop container
docker start learning-postgres
docker stop learning-postgres
```

**Real-world analogy**: Like a running program - the image is the .exe file, the container is the running process.

---

### 3. Volumes (Persistent Storage)

**What**: Storage that persists outside containers
**Example**: `postgres_data` stores your database files

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect 0.2-database-basics_postgres_data

# Remove volume (deletes data!)
docker volume rm 0.2-database-basics_postgres_data
```

**Real-world analogy**: Like an external hard drive - data stays even if you delete the computer (container).

---

### 4. Networks (Container Communication)

**What**: Allow containers to talk to each other
**Example**: pgAdmin connects to postgres via network

```bash
# List networks
docker network ls

# Inspect network
docker network inspect 0.2-database-basics_default
```

**Real-world analogy**: Like a local network - computers (containers) can find each other by name.

---

### 5. Docker Compose (Multi-Container Apps)

**What**: Define and run multi-container applications
**Example**: Your `docker-compose.yml` defines postgres + pgadmin

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f
```

**Real-world analogy**: Like a recipe book - defines how multiple dishes (containers) work together.

---

## Common Docker Commands

### Daily Use
```bash
# Start everything
docker compose up -d

# Stop everything
docker compose down

# View logs
docker compose logs -f

# Check status
docker compose ps

# Restart a service
docker compose restart postgres
```

### Debugging
```bash
# View container logs
docker logs learning-postgres

# Execute command in container
docker exec -it learning-postgres psql -U student -d learning_db

# Inspect container
docker inspect learning-postgres

# View resource usage
docker stats
```

### Cleanup
```bash
# Stop and remove containers
docker compose down

# Remove volumes too (deletes data!)
docker compose down -v

# Clean up unused images
docker image prune -a

# Clean up everything
docker system prune -a --volumes
```

---

## Docker + SQL Workflow

### Morning Routine
```bash
# 1. Start Docker Desktop
# 2. Start containers
cd Learning/0.2-Database-Basics
docker compose up -d

# 3. Open pgAdmin
open http://localhost:8080

# 4. Start learning!
```

### During Practice
```bash
# Run SQL file
docker compose exec -T postgres psql -U student -d learning_db < exercises/01-basic-crud.sql

# Check logs if something breaks
docker compose logs postgres

# Restart if needed
docker compose restart postgres
```

### End of Day
```bash
# Option 1: Keep running (uses minimal resources)
# Just close pgAdmin

# Option 2: Stop containers
docker compose stop

# Option 3: Remove everything (data persists in volumes)
docker compose down
```

---

## Troubleshooting Guide

### Container Won't Start

**Check logs:**
```bash
docker compose logs postgres
```

**Common issues:**
- Port 5432 already in use → Change to 5433 in docker-compose.yml
- Docker Desktop not running → Start Docker Desktop
- Corrupted volume → `docker compose down -v` and restart

---

### Can't Connect to Database

**From pgAdmin:**
- Use `postgres` as hostname (not `localhost`)
- Containers communicate by service name

**From host machine:**
- Use `localhost` as hostname
- Port is `5432` (or whatever you set in docker-compose.yml)

**Test connection:**
```bash
docker compose exec postgres pg_isready -U student
```

---

### Out of Disk Space

**Check usage:**
```bash
docker system df
```

**Clean up:**
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything (careful!)
docker system prune -a --volumes
```

---

## Production Skills

### Backup Strategy

**Manual backup:**
```bash
# Create backup
docker compose exec -T postgres pg_dump -U student learning_db > backup.sql

# Restore backup
docker compose exec -T postgres psql -U student -d learning_db < backup.sql
```

**Automated backup script:**
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d-%H%M%S)
docker compose exec -T postgres pg_dump -U student learning_db > "backups/backup-$DATE.sql"
echo "Backup created: backup-$DATE.sql"
```

---

### Resource Limits

Add to docker-compose.yml:
```yaml
services:
  postgres:
    # ... existing config ...
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

### Health Checks

Already included in docker-compose.yml:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U student"]
  interval: 10s
  timeout: 5s
  retries: 5
```

**Check health:**
```bash
docker compose ps
# Should show "Up (healthy)"
```

---

## Docker Learning Resources

### Official Documentation
- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### Tutorials
- [Docker Curriculum](https://docker-curriculum.com/)
- [Play with Docker](https://labs.play-with-docker.com/)
- [Docker for Beginners](https://docker-curriculum.com/)

### Videos
- [Docker Tutorial for Beginners](https://www.youtube.com/watch?v=fqMOX6JJhGo)
- [Docker Compose Tutorial](https://www.youtube.com/watch?v=Qw9zlE3t8Ko)

---

## Skills Checklist

### Docker Basics
- [ ] Understand images vs containers
- [ ] Start/stop containers
- [ ] View logs
- [ ] Execute commands in containers
- [ ] Understand volumes
- [ ] Understand networks

### Docker Compose
- [ ] Read docker-compose.yml
- [ ] Start multi-container apps
- [ ] Configure environment variables
- [ ] Manage volumes
- [ ] View service logs

### Operations
- [ ] Create backups
- [ ] Restore from backup
- [ ] Monitor resource usage
- [ ] Troubleshoot issues
- [ ] Clean up resources

### Advanced
- [ ] Write custom Dockerfile
- [ ] Multi-stage builds
- [ ] Docker secrets
- [ ] Production deployment
- [ ] CI/CD integration

---

## Next Steps

1. ✅ Complete SQL exercises while using Docker
2. 📚 Read Docker documentation
3. 🎯 Complete Docker exercises D1-D5
4. 🚀 Apply to your Ramen Bae project
5. 💼 Add Docker to your resume/portfolio

---

**Remember**: Every time you use Docker for SQL practice, you're building two valuable skills simultaneously! 🐳 + 🗄️ = 💪
