# 🛠️ Database Learning Environment Setup

Choose your learning environment based on your goals:

- **🐳 Docker** (Recommended for learning Docker + SQL) - [Jump to Docker Setup](#-docker-setup-learn-docker--sql)
- **☁️ Supabase** (Recommended for quick start) - [Jump to Supabase Setup](#️-supabase-setup-quick-start)
- **💻 Local PostgreSQL** (Advanced) - [Jump to Local Setup](#-local-postgresql-advanced)

---

## 🐳 **Docker Setup (Learn Docker + SQL)**

**Best for:** Learning Docker while practicing SQL, production-like environment

### Why Docker?
- Learn Docker (essential DevOps skill)
- Isolated environment
- Easy cleanup
- Production-like setup
- Works on any machine

### Quick Start

See the complete guide: **[Docker Setup Guide](docker-setup-guide.md)**

**TL;DR:**
```bash
# 1. Install Docker Desktop from docker.com
# 2. Create docker-compose.yml (see guide)
# 3. Start containers
docker compose up -d

# 4. Access pgAdmin at http://localhost:8080
# Login: student@example.com / learn123
```

**Connection Details:**
- Host: `localhost`
- Port: `5432`
- Database: `learning_db`
- Username: `student`
- Password: `learn123`

---

## ☁️ **Supabase Setup (Quick Start)**

**Best for:** Quick start, no installation, built-in SQL editor

Supabase provides a free PostgreSQL database with a built-in SQL editor - perfect for learning!

### Step 1: Create Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email

### Step 2: Create Project
1. Click "New Project"
2. Fill in details:
   - **Name**: `database-learning`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is perfect
3. Click "Create new project"
4. Wait 2-3 minutes for setup

### Step 3: Access SQL Editor
1. In your project dashboard, click "SQL Editor" in sidebar
2. You'll see a blank editor - this is where you'll practice!
3. Try your first query:
   ```sql
   SELECT 'Hello Database!' as message;
   ```
4. Click "Run" or press `Cmd/Ctrl + Enter`

### Step 4: Save Connection Details
You'll need these for your Ramen Bae project later:

1. Go to "Settings" → "API"
2. Copy and save:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

---

## 🔌 **Testing Your Connection**

### Quick Test
Run this in SQL Editor:
```sql
-- Test connection
SELECT 
  'Database connection successful!' as message,
  version() as postgres_version,
  current_database() as database_name,
  current_user as user_name;
```

You should see a result table with your database info!

### Create Your First Table
```sql
-- Create a simple test table
CREATE TABLE test_table (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert test data
INSERT INTO test_table (message) VALUES ('My first database entry!');

-- Read it back
SELECT * FROM test_table;
```

---

## 💻 **Alternative: Local PostgreSQL (Optional)**

If you prefer working locally:

### macOS (using Homebrew)
```bash
brew install postgresql
brew services start postgresql
createdb learning_db
psql learning_db
```

### Windows
1. Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer
3. Use pgAdmin (included)

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql
sudo -u postgres psql
```

---

## 📱 **Quick Practice (No Setup)**

Want to try SQL immediately? Use these online editors:

- **DB Fiddle**: [db-fiddle.com](https://www.db-fiddle.com/) - PostgreSQL support
- **SQLite Online**: [sqliteonline.com](https://sqliteonline.com/) - Switch to PostgreSQL mode
- **SQL Tryit**: [w3schools.com/sql/trysql.asp](https://www.w3schools.com/sql/trysql.asp)

---

## 🛠️ **Supabase SQL Editor Tips**

### Keyboard Shortcuts
- **Run Query**: `Cmd/Ctrl + Enter`
- **Format SQL**: `Shift + Alt + F`
- **Comment Line**: `Cmd/Ctrl + /`

### Multiple Queries
```sql
-- Run multiple queries at once
CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT);
INSERT INTO users (name) VALUES ('Alice'), ('Bob');
SELECT * FROM users;
```

### Save Your Queries
1. Click "Save" button in SQL Editor
2. Name your query (e.g., "Exercise 1")
3. Access saved queries from sidebar

### View Tables
```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Describe a table structure
\d table_name
```

---

## 🚨 **Troubleshooting**

### Can't Connect to Supabase
- Check your internet connection
- Verify project is fully initialized (green status)
- Try refreshing the page

### Query Errors
- Read error messages carefully
- Check for typos in SQL keywords
- Ensure semicolons at end of statements
- Verify table/column names exist

### Reset Everything
```sql
-- Drop all tables (careful!)
DROP TABLE IF EXISTS table_name CASCADE;

-- Or use Supabase dashboard:
-- Database → Tables → Click table → Delete
```

---

## ✅ **Verification Checklist**

### Docker Setup
- [ ] Docker Desktop installed and running
- [ ] Containers started with `docker compose up -d`
- [ ] pgAdmin accessible at localhost:8080
- [ ] Can connect to database
- [ ] Test query runs successfully

### Supabase Setup
- [ ] Supabase account created
- [ ] Project is running (green status)
- [ ] SQL Editor is accessible
- [ ] Test query runs successfully
- [ ] Can create and query tables
- [ ] Connection details saved

### Local PostgreSQL Setup
- [ ] PostgreSQL installed
- [ ] Database created
- [ ] Can connect with psql
- [ ] Test query runs successfully

---

## 🚀 **Next Steps**

Once setup is complete:
1. Read [Database Fundamentals](theory/database-fundamentals.md)
2. Start [Exercise 1: Basic CRUD](exercises/01-basic-crud.sql)
3. Practice with sample data
4. Build your first schema

**Pro Tip**: Keep the SQL Editor open in one tab and these exercises in another for easy reference!

---

## 📚 **Additional Resources**

- [Supabase SQL Docs](https://supabase.com/docs/guides/database)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [SQL Cheat Sheet](https://www.sqltutorial.org/sql-cheat-sheet/)

Ready to start learning? Head to [Exercise 1](exercises/01-basic-crud.sql)! 🎯
