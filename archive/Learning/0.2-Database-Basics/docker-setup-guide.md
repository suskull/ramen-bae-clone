# 🐳 Docker Setup Guide for Database Learning

Learn Docker while practicing SQL! This guide sets up PostgreSQL in Docker, giving you hands-on experience with containerization.

## Why Docker?

- **Isolated environment** - Won't affect your system
- **Easy cleanup** - Delete containers when done
- **Production-like** - Same setup as real deployments
- **Portable** - Works on any machine
- **Learn Docker** - Essential DevOps skill

---

## Prerequisites

### Install Docker Desktop

**macOS:**
1. Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
2. Open the `.dmg` file and drag to Applications
3. Launch Docker Desktop
4. Wait for Docker to start (whale icon in menu bar)

**Windows:**
1. Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
2. Run installer
3. Restart computer if prompted
4. Launch Docker Desktop

**Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Log out and back in
```

### Verify Installation
```bash
docker --version
docker compose version
```

---

## 🚀 Quick Start (5 minutes)

### Step 1: Create Docker Configuration

Create a file called `docker-compose.yml` in your `Learning/0.2-Database-Basics/` folder:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: learning-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: student
      POSTGRES_PASSWORD: learn123
      POSTGRES_DB: learning_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U student"]
      interval: 10s
      timeout: 5s
      retries: 5

  # pgAdmin (Web UI for PostgreSQL)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: learning-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: student@example.com
      PGADMIN_DEFAULT_PASSWORD: learn123
      PGADMIN_CONFIG_SERVER_MODE: 'False'
    ports:
      - "8080:80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
  pgadmin_data:
```

### Step 2: Start Your Database

```bash
# Navigate to the folder
cd Learning/0.2-Database-Basics

# Start containers (first time will download images)
docker compose up -d

# Check status
docker compose ps
```

You should see:
```
NAME                 STATUS              PORTS
learning-postgres    Up (healthy)        0.0.0.0:5432->5432/tcp
learning-pgadmin     Up                  0.0.0.0:8080->80/tcp
```

### Step 3: Access Your Database

**Option A: pgAdmin Web Interface**
1. Open browser: [http://localhost:8080](http://localhost:8080)
2. Login:
   - Email: `student@example.com`
   - Password: `learn123`
3. Add server:
   - Right-click "Servers" → "Register" → "Server"
   - **General tab**: Name: `Learning Database`
   - **Connection tab**:
     - Host: `postgres` (container name)
     - Port: `5432`
     - Database: `learning_db`
     - Username: `student`
     - Password: `learn123`
   - Click "Save"

**Option B: Command Line (psql)**
```bash
# Connect to database
docker compose exec postgres psql -U student -d learning_db

# You're now in PostgreSQL!
# Try: SELECT 'Hello Docker!' as message;
```

**Option C: VS Code Extension**
1. Install "PostgreSQL" extension by Chris Kolkman
2. Add connection:
   - Host: `localhost`
   - Port: `5432`
   - Database: `learning_db`
   - Username: `student`
   - Password: `learn123`

---

## 🐳 Docker Commands You'll Use

### Starting and Stopping

```bash
# Start containers
docker compose up -d

# Stop containers (keeps data)
docker compose stop

# Start stopped containers
docker compose start

# Stop and remove containers (keeps data in volumes)
docker compose down

# Stop and remove everything including data
docker compose down -v
```

### Viewing Logs

```bash
# View all logs
docker compose logs

# Follow logs (live)
docker compose logs -f

# View specific service
docker compose logs postgres
docker compose logs pgadmin

# Last 50 lines
docker compose logs --tail=50
```

### Checking Status

```bash
# List running containers
docker compose ps

# Detailed container info
docker ps

# View resource usage
docker stats
```

### Executing Commands

```bash
# Run SQL command
docker compose exec postgres psql -U student -d learning_db -c "SELECT version();"

# Open psql shell
docker compose exec postgres psql -U student -d learning_db

# Run SQL file
docker compose exec -T postgres psql -U student -d learning_db < my-script.sql
```

---

## 📁 Project Structure

```
Learning/0.2-Database-Basics/
├── docker-compose.yml           # Docker configuration
├── init-scripts/                # SQL scripts run on first start
│   └── 00-setup.sql            # Initial database setup
├── exercises/                   # Your practice exercises
│   ├── 01-basic-crud.sql
│   └── ...
└── backups/                     # Database backups
    └── backup-2024-01-27.sql
```

---

## 🎯 Docker Learning Exercises

### Exercise D1: Understanding Containers

```bash
# List all containers
docker ps -a

# Inspect postgres container
docker inspect learning-postgres

# View container logs
docker logs learning-postgres

# Check resource usage
docker stats learning-postgres
```

**What you learned:**
- Containers are isolated processes
- Each container has its own filesystem
- Logs are captured automatically
- Resource usage is monitored

---

### Exercise D2: Volumes and Data Persistence

```bash
# List volumes
docker volume ls

# Inspect postgres data volume
docker volume inspect 0.2-database-basics_postgres_data

# Stop and remove containers
docker compose down

# Start again - data is still there!
docker compose up -d

# Verify data persists
docker compose exec postgres psql -U student -d learning_db -c "SELECT * FROM posts;"
```

**What you learned:**
- Volumes persist data outside containers
- Removing containers doesn't delete volumes
- Data survives container restarts

---

### Exercise D3: Networking

```bash
# List networks
docker network ls

# Inspect the network
docker network inspect 0.2-database-basics_default

# Test connectivity between containers
docker compose exec pgadmin ping postgres
```

**What you learned:**
- Containers can communicate by name
- Docker creates isolated networks
- Services in same compose file share a network

---

### Exercise D4: Environment Variables

Edit `docker-compose.yml` to change the password:

```yaml
environment:
  POSTGRES_PASSWORD: new_secure_password
```

```bash
# Recreate container with new env vars
docker compose up -d --force-recreate

# Test new password
docker compose exec postgres psql -U student -d learning_db
```

**What you learned:**
- Environment variables configure containers
- Changes require container recreation
- Sensitive data should use secrets (advanced)

---

### Exercise D5: Running SQL Scripts

Create `init-scripts/00-setup.sql`:

```sql
-- This runs automatically on first start
CREATE TABLE IF NOT EXISTS docker_test (
  id SERIAL PRIMARY KEY,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO docker_test (message) VALUES 
('Docker setup successful!');
```

```bash
# Recreate database to run init scripts
docker compose down -v
docker compose up -d

# Wait for healthy status
docker compose ps

# Verify script ran
docker compose exec postgres psql -U student -d learning_db -c "SELECT * FROM docker_test;"
```

**What you learned:**
- Init scripts run on first database start
- Useful for automated setup
- Volume must be deleted to re-run scripts

---

## 🔧 Troubleshooting

### Port Already in Use

**Error:** `Bind for 0.0.0.0:5432 failed: port is already allocated`

**Solution:** Change the port in `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Use 5433 on host, 5432 in container
```

Then connect using port `5433`.

---

### Container Won't Start

```bash
# Check logs
docker compose logs postgres

# Common issues:
# 1. Docker Desktop not running
# 2. Port conflict
# 3. Corrupted volume

# Reset everything
docker compose down -v
docker compose up -d
```

---

### Can't Connect to Database

```bash
# Check if container is healthy
docker compose ps

# Should show "Up (healthy)"
# If not, check logs:
docker compose logs postgres

# Test connection from host
docker compose exec postgres pg_isready -U student

# Test from inside container
docker compose exec postgres psql -U student -d learning_db -c "SELECT 1;"
```

---

### pgAdmin Can't Connect

**Issue:** Can't connect to postgres from pgAdmin

**Solution:** Use `postgres` as hostname (not `localhost`)
- pgAdmin runs in a container
- Containers communicate by service name
- `postgres` is the service name in docker-compose.yml

---

### Out of Disk Space

```bash
# Check Docker disk usage
docker system df

# Clean up unused images
docker image prune -a

# Clean up unused volumes
docker volume prune

# Nuclear option (removes everything)
docker system prune -a --volumes
```

---

## 💾 Backup and Restore

### Create Backup

```bash
# Backup to file
docker compose exec -T postgres pg_dump -U student learning_db > backup.sql

# Backup with timestamp
docker compose exec -T postgres pg_dump -U student learning_db > "backup-$(date +%Y%m%d-%H%M%S).sql"

# Compressed backup
docker compose exec -T postgres pg_dump -U student learning_db | gzip > backup.sql.gz
```

### Restore Backup

```bash
# Restore from file
docker compose exec -T postgres psql -U student -d learning_db < backup.sql

# Restore compressed backup
gunzip -c backup.sql.gz | docker compose exec -T postgres psql -U student -d learning_db
```

---

## 🎓 Docker Concepts You're Learning

### 1. Images
- **What**: Blueprint for containers
- **Example**: `postgres:16-alpine` is a pre-built PostgreSQL image
- **Learning**: You're using official images from Docker Hub

### 2. Containers
- **What**: Running instance of an image
- **Example**: `learning-postgres` is your running database
- **Learning**: Containers are isolated and disposable

### 3. Volumes
- **What**: Persistent storage outside containers
- **Example**: `postgres_data` stores your database files
- **Learning**: Data survives container deletion

### 4. Networks
- **What**: Allow containers to communicate
- **Example**: pgAdmin connects to postgres by name
- **Learning**: Docker creates isolated networks

### 5. Compose
- **What**: Define multi-container applications
- **Example**: Your `docker-compose.yml` defines postgres + pgadmin
- **Learning**: Infrastructure as code

---

## 🚀 Next Steps

### Beginner
- [x] Start containers with `docker compose up -d`
- [x] Connect to database via pgAdmin
- [x] Run your first SQL query
- [ ] Complete Exercise D1-D5

### Intermediate
- [ ] Create custom init scripts
- [ ] Set up automated backups
- [ ] Configure resource limits
- [ ] Use Docker networks

### Advanced
- [ ] Create custom Dockerfile
- [ ] Multi-stage builds
- [ ] Docker secrets for passwords
- [ ] Production deployment

---

## 📚 Docker Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Docker Tutorial](https://docker-curriculum.com/)

---

## ✅ Verification Checklist

Before starting SQL exercises:
- [ ] Docker Desktop installed and running
- [ ] `docker compose up -d` successful
- [ ] Both containers show "Up" status
- [ ] Can access pgAdmin at localhost:8080
- [ ] Can connect to postgres from pgAdmin
- [ ] Can run SQL queries
- [ ] Understand basic Docker commands

---

**Ready to learn SQL with Docker?** Start with [Exercise 1: Basic CRUD](exercises/01-basic-crud.sql)! 🎯

**Pro Tip**: Keep Docker Desktop running while working through exercises. You can monitor resource usage and logs in real-time!
