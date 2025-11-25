# ⚡ Quick Start Guide

Get up and running in 5 minutes!

## 🐳 Docker Setup (Recommended)

### 1. Install Docker Desktop
- Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
- Install and launch Docker Desktop
- Wait for Docker to start (whale icon in menu bar/system tray)

### 2. Start Database
```bash
# Navigate to this folder
cd Learning/0.2-Database-Basics

# Start containers (first time downloads images ~100MB)
docker compose up -d

# Wait 30 seconds for startup
# Check status (should show "Up (healthy)")
docker compose ps
```

### 3. Access Database

**Option A: DBeaver (Recommended if you have it)**
1. Open DBeaver Ultimate
2. New Connection → PostgreSQL
3. Connection details:
   - Host: `localhost`
   - Port: `5432`
   - Database: `learning_db`
   - Username: `student`
   - Password: `learn123`
4. Test Connection → Finish

See detailed guide: [dbeaver-setup-guide.md](dbeaver-setup-guide.md)

**Option B: pgAdmin (Web Interface)**
1. Open [http://localhost:8080](http://localhost:8080)
2. Login: `student@example.com` / `learn123`
3. Add Server:
   - Right-click "Servers" → Register → Server
   - **General**: Name = `Learning Database`
   - **Connection**: 
     - Host = `postgres`
     - Port = `5432`
     - Database = `learning_db`
     - Username = `student`
     - Password = `learn123`
   - Save

**Option C: Command Line**
```bash
docker compose exec postgres psql -U student -d learning_db
```

### 4. Test Connection
Run this in DBeaver, pgAdmin, or psql:
```sql
SELECT * FROM show_welcome();
```

You should see welcome messages! 🎉

### 5. Start Learning
Open `exercises/01-basic-crud.sql` and start practicing!

---

## ☁️ Supabase Setup (Alternative)

### 1. Create Account
- Go to [supabase.com](https://supabase.com)
- Sign up (free)

### 2. Create Project
- Click "New Project"
- Name: `database-learning`
- Choose password and region
- Wait 2-3 minutes

### 3. Access SQL Editor
- Click "SQL Editor" in sidebar
- Start writing queries!

### 4. Test Connection
```sql
SELECT 'Hello Supabase!' as message;
```

### 5. Start Learning
Copy exercises into SQL Editor and practice!

---

## 🚀 Next Steps

1. ✅ Setup complete
2. 📖 Read [Database Fundamentals](theory/database-fundamentals.md)
3. 💪 Start [Exercise 1: Basic CRUD](exercises/01-basic-crud.sql)
4. 🎯 Track progress in [README.md](README.md)

---

## 🆘 Troubleshooting

### Docker Issues

**"Cannot connect to Docker daemon"**
- Make sure Docker Desktop is running
- Look for whale icon in menu bar/system tray

**"Port 5432 already in use"**
- Another PostgreSQL is running
- Stop it or change port in docker-compose.yml to `5433:5432`

**"Container not healthy"**
```bash
# Check logs
docker compose logs postgres

# Restart
docker compose restart
```

### Supabase Issues

**"Project not loading"**
- Wait a few more minutes
- Refresh page
- Check [status.supabase.com](https://status.supabase.com)

**"Can't run queries"**
- Make sure project is fully initialized (green status)
- Try refreshing SQL Editor

---

## 📚 Resources

- [Full Setup Guide](setup-guide.md)
- [Docker Setup Guide](docker-setup-guide.md)
- [SQL Quick Reference](sql-quick-reference.md)

---

**Ready to learn?** Start with [Exercise 1](exercises/01-basic-crud.sql)! 🎓
