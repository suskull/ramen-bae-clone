# 🦫 DBeaver Setup Guide

DBeaver Ultimate is an excellent choice for database learning! This guide shows you how to connect DBeaver to your Docker PostgreSQL database.

## Why DBeaver is Great for Learning

- **Better SQL editor** - Autocomplete, syntax highlighting
- **Visual tools** - ER diagrams, data editor
- **Multi-database** - Works with PostgreSQL, MySQL, etc.
- **Query history** - Never lose your work
- **Data visualization** - Charts and graphs
- **Professional tool** - Used in real companies

---

## 🚀 Quick Setup

### Step 1: Start Docker Database

```bash
cd Learning/0.2-Database-Basics
docker compose up -d

# Wait 30 seconds, then verify
docker compose ps
# Should show "Up (healthy)"
```

### Step 2: Create Connection in DBeaver

1. **Open DBeaver Ultimate**

2. **New Connection**
   - Click "New Database Connection" (plug icon)
   - Or: Database → New Database Connection
   - Or: `Cmd/Ctrl + Shift + N`

3. **Select PostgreSQL**
   - Choose "PostgreSQL"
   - Click "Next"

4. **Connection Settings**
   ```
   Host: localhost
   Port: 5432
   Database: learning_db
   Username: student
   Password: learn123
   ```

5. **Test Connection**
   - Click "Test Connection"
   - Should see "Connected" ✅
   - If prompted, download PostgreSQL driver (automatic)

6. **Finish**
   - Click "Finish"
   - Your connection appears in Database Navigator

### Step 3: Verify Setup

1. **Expand connection tree:**
   ```
   learning_db
   └── Databases
       └── learning_db
           └── Schemas
               └── public
                   └── Tables
                       └── welcome
   ```

2. **Run test query:**
   - Right-click connection → SQL Editor → New SQL Script
   - Type: `SELECT * FROM show_welcome();`
   - Press `Cmd/Ctrl + Enter` to run
   - Should see welcome messages! 🎉

---

## 🎯 DBeaver Features for Learning

### 1. SQL Editor

**Open SQL Editor:**
- Right-click connection → SQL Editor → New SQL Script
- Or: `Cmd/Ctrl + ]`

**Keyboard Shortcuts:**
- `Cmd/Ctrl + Enter` - Execute current statement
- `Cmd/Ctrl + Shift + Enter` - Execute all statements
- `Cmd/Ctrl + /` - Comment/uncomment line
- `Cmd/Ctrl + Space` - Autocomplete
- `Cmd/Ctrl + Shift + F` - Format SQL

**Pro Tips:**
- Highlight specific SQL to run just that part
- Use `--` for single-line comments
- Use `/* */` for multi-line comments

---

### 2. Working with Exercise Files

**Option A: Open SQL Files Directly**
```bash
# Open exercise file in DBeaver
# File → Open File → exercises/01-basic-crud.sql
```

**Option B: Copy-Paste Sections**
1. Open exercise file in VS Code
2. Copy a section (e.g., Exercise 1.1)
3. Paste into DBeaver SQL Editor
4. Run with `Cmd/Ctrl + Enter`

**Option C: Execute File**
1. Right-click connection → Tools → Execute Script
2. Select `exercises/01-basic-crud.sql`
3. Click "Start"

**Recommended:** Use Option B for learning - copy one exercise at a time

---

### 3. Visual Data Editor

**View Table Data:**
1. Expand connection → Schemas → public → Tables
2. Right-click table → View Data
3. Or: Double-click table

**Edit Data Visually:**
1. View table data
2. Double-click cell to edit
3. Press `Enter` to save
4. Or click "Save" button

**Filter Data:**
1. View table data
2. Click filter icon in toolbar
3. Add conditions visually
4. Click "Apply"

---

### 4. ER Diagrams

**Generate ER Diagram:**
1. Right-click database → View Diagram
2. Or: Right-click schema → View Diagram
3. Drag tables to canvas
4. DBeaver shows relationships automatically

**Useful for:**
- Understanding table relationships
- Visualizing foreign keys
- Planning database design

---

### 5. Query History

**View Past Queries:**
1. Window → Show View → Query Manager
2. Or: `Cmd/Ctrl + Shift + H`
3. See all queries you've run
4. Double-click to reopen

**Never lose work!** DBeaver saves everything automatically.

---

### 6. Data Export

**Export Query Results:**
1. Run query
2. Right-click results → Export Data
3. Choose format (CSV, JSON, SQL, Excel)
4. Click "Next" → "Finish"

**Export Table:**
1. Right-click table → Export Data
2. Choose format and options
3. Click "Finish"

---

### 7. SQL Formatting

**Auto-format SQL:**
1. Write messy SQL
2. Press `Cmd/Ctrl + Shift + F`
3. SQL is beautifully formatted!

**Example:**
```sql
-- Before
select p.name,c.name from products p join categories c on p.category_id=c.id where p.price>10;

-- After (Cmd/Ctrl + Shift + F)
SELECT 
  p.name,
  c.name
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.price > 10;
```

---

## 🎓 DBeaver Workflow for Exercises

### Recommended Workflow

1. **Open exercise file in VS Code** (for reading)
2. **Open DBeaver SQL Editor** (for practicing)
3. **Copy one exercise at a time** from VS Code to DBeaver
4. **Try to solve** without looking at solution
5. **Run query** with `Cmd/Ctrl + Enter`
6. **Check results**
7. **Compare with solution** if needed

### Example Session

```sql
-- Exercise 1.1: Simple SELECT
-- TODO: Write a query to select all users

-- YOUR CODE HERE:
SELECT * FROM posts;

-- Run with Cmd/Ctrl + Enter
-- Check results in bottom panel
-- Compare with solution if needed
```

---

## 🔧 DBeaver Settings for Learning

### Enable Autocomplete

1. Preferences → Editors → SQL Editor → Code Completion
2. Check "Enable auto activation"
3. Set delay to 500ms
4. Check "Insert single proposals automatically"

### Show Line Numbers

1. Preferences → Editors → Text Editors
2. Check "Show line numbers"

### Set Default Schema

1. Right-click connection → Edit Connection
2. Go to "PostgreSQL" tab
3. Set "Show database" to `learning_db`
4. Set "Show schema" to `public`
5. Click "OK"

---

## 💡 DBeaver Tips & Tricks

### Tip 1: Multiple SQL Scripts
- Open multiple SQL Editor tabs
- One for exercises, one for testing
- Switch with `Cmd/Ctrl + Tab`

### Tip 2: Bookmarks
- Right-click connection → Add Bookmark
- Quick access to frequently used databases

### Tip 3: SQL Templates
- Preferences → Editors → SQL Editor → Templates
- Create shortcuts for common queries
- Type shortcut + `Tab` to expand

### Tip 4: Dark Theme
- Preferences → User Interface → Appearance
- Choose "Dark" theme
- Easier on eyes for long sessions

### Tip 5: Pin Connections
- Right-click connection → Pin Connection
- Stays at top of Database Navigator

---

## 🐛 Troubleshooting

### Can't Connect to Database

**Error:** "Connection refused" or "Could not connect"

**Solutions:**
```bash
# 1. Check Docker is running
docker compose ps

# 2. Restart containers
docker compose restart

# 3. Check logs
docker compose logs postgres

# 4. Verify port
# Make sure nothing else uses port 5432
lsof -i :5432
```

**In DBeaver:**
- Edit Connection → Test Connection
- Check host is `localhost` (not `postgres`)
- Check port is `5432`

---

### Driver Download Issues

**Error:** "Driver not found" or "Download failed"

**Solution:**
1. Edit Connection → Driver Settings
2. Click "Download/Update"
3. Wait for download
4. Click "OK"

Or manually:
1. Download PostgreSQL JDBC driver from [jdbc.postgresql.org](https://jdbc.postgresql.org/)
2. Edit Connection → Driver Settings → Libraries
3. Add JAR file
4. Click "OK"

---

### Query Runs Forever

**Issue:** Query doesn't complete

**Solutions:**
- Click "Cancel" button (red square)
- Or: `Cmd/Ctrl + Shift + C`
- Check for missing `LIMIT` on large tables
- Check for missing `WHERE` clause

---

### Can't See Tables

**Issue:** Tables don't appear in navigator

**Solutions:**
1. Right-click connection → Refresh
2. Or: Press `F5`
3. Check you're looking in correct schema (`public`)
4. Verify tables exist: `SELECT * FROM information_schema.tables;`

---

## 📊 DBeaver vs pgAdmin

| Feature | DBeaver | pgAdmin |
|---------|---------|---------|
| SQL Editor | ⭐⭐⭐⭐⭐ Better | ⭐⭐⭐ Good |
| Autocomplete | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐ Basic |
| ER Diagrams | ⭐⭐⭐⭐⭐ Built-in | ⭐⭐⭐ Available |
| Data Editor | ⭐⭐⭐⭐⭐ Visual | ⭐⭐⭐ Basic |
| Multi-DB | ⭐⭐⭐⭐⭐ All DBs | ⭐ PostgreSQL only |
| Learning Curve | ⭐⭐⭐⭐ Easy | ⭐⭐⭐ Moderate |

**Verdict:** DBeaver is better for learning! ✅

---

## 🎯 Quick Reference

### Essential Shortcuts

| Action | Shortcut |
|--------|----------|
| New SQL Script | `Cmd/Ctrl + ]` |
| Execute Statement | `Cmd/Ctrl + Enter` |
| Execute All | `Cmd/Ctrl + Shift + Enter` |
| Format SQL | `Cmd/Ctrl + Shift + F` |
| Autocomplete | `Cmd/Ctrl + Space` |
| Comment Line | `Cmd/Ctrl + /` |
| Query History | `Cmd/Ctrl + Shift + H` |
| Refresh | `F5` |

### Connection Details

```
Host: localhost
Port: 5432
Database: learning_db
Username: student
Password: learn123
```

---

## ✅ Verification Checklist

Before starting exercises:
- [ ] Docker containers running (`docker compose ps`)
- [ ] DBeaver Ultimate installed and opened
- [ ] Connection created and tested
- [ ] Can see `welcome` table in navigator
- [ ] Can run `SELECT * FROM show_welcome();`
- [ ] SQL Editor opens and runs queries
- [ ] Autocomplete works (`Cmd/Ctrl + Space`)

---

## 🚀 You're Ready!

Your setup is perfect for learning:
- ✅ Docker for production-like environment
- ✅ DBeaver for professional SQL editing
- ✅ All exercises ready to practice

**Start here:** Open `exercises/01-basic-crud.sql` in VS Code, then practice in DBeaver!

---

## 📚 DBeaver Resources

- [DBeaver Documentation](https://dbeaver.com/docs/)
- [DBeaver Shortcuts](https://dbeaver.com/docs/wiki/Shortcuts/)
- [Video Tutorials](https://www.youtube.com/c/DBeaver)

**Pro Tip:** DBeaver Ultimate has even more features - explore the menus and discover tools as you learn! 🦫
