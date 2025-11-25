# 🗄️ Module 2: Database Basics & SQL Fundamentals

**Status**: 🚀 **READY TO START!**  
**Estimated Duration**: 2-3 days  
**Difficulty**: ⭐⭐⭐ (Beginner to Intermediate)

## 🎯 Learning Objectives

### Primary Goals
- [ ] Understand what databases are and why we need them
- [ ] Learn the difference between SQL and NoSQL databases
- [ ] Master basic SQL queries (SELECT, INSERT, UPDATE, DELETE)
- [ ] Understand database relationships (one-to-many, many-to-many)
- [ ] Design simple database schemas
- [ ] Practice with Supabase SQL Editor

### Secondary Goals  
- [ ] Learn database constraints and validation
- [ ] Understand indexes and performance
- [ ] Practice Row Level Security (RLS) in Supabase
- [ ] Create database functions and triggers

## 🏗️ What You'll Build

### 1. **Blog Database System**
- Posts table with authors and content
- Categories for organizing posts
- Tags with many-to-many relationships
- Comments system

### 2. **E-commerce Practice (Ramen Bae)**
- Products and categories
- Shopping cart system
- Order management
- Reviews and ratings

### 3. **SQL Query Mastery**
- Basic CRUD operations
- JOINs across multiple tables
- Aggregations and analytics
- Subqueries and advanced patterns

## 📁 Folder Structure

```
0.2-Database-Basics/
├── README.md                        # This overview
├── setup-guide.md                  # Supabase/Local setup
├── docker-setup-guide.md           # Docker setup (learn Docker + SQL)
├── sql-quick-reference.md          # SQL cheat sheet
├── practice-challenges.md          # Extra challenges
├── theory/                          # Database concepts
│   ├── database-fundamentals.md    # Core concepts
│   └── relationships-guide.md      # Understanding relationships
└── exercises/                       # SQL practice exercises
    ├── 01-basic-crud.sql           # Create, Read, Update, Delete
    ├── 02-relationships.sql        # Joins and foreign keys
    ├── 03-advanced-queries.sql     # Aggregations, subqueries
    └── 04-real-world.sql           # Practical scenarios
```

## 🚀 Learning Journey

### **Step 1: Setup** ⏱️ (15-30 minutes)
- **Option A**: Docker setup (learn Docker + SQL) - [Docker Guide](docker-setup-guide.md)
- **Option B**: Supabase (quick start) - [Setup Guide](setup-guide.md)
- Choose based on your learning goals

### **Step 2: Database Theory** ⏱️ (30 minutes)  
- [📚 Database Fundamentals](theory/database-fundamentals.md)
- [🔗 Relationships Guide](theory/relationships-guide.md)
- Understand why databases vs frontend state
- Learn about data persistence

### **Step 3: Basic SQL** ⏱️ (60 minutes)
- [💪 Exercise 1: Basic CRUD](exercises/01-basic-crud.sql)
- Create your first table
- Insert, read, update, delete data
- Practice filtering and sorting

### **Step 4: Relationships** ⏱️ (90 minutes)
- [💪 Exercise 2: Relationships](exercises/02-relationships.sql)
- One-to-many relationships
- Many-to-many with junction tables
- Master JOIN operations

### **Step 5: Advanced Queries** ⏱️ (60 minutes)
- [💪 Exercise 3: Advanced Queries](exercises/03-advanced-queries.sql)
- Aggregations (COUNT, AVG, SUM)
- GROUP BY and HAVING
- Subqueries and CTEs

### **Step 6: Real-World Practice** ⏱️ (90 minutes)
- [💪 Exercise 4: Real-World Scenarios](exercises/04-real-world.sql)
- Build complete features
- Optimize queries
- Handle edge cases

## 💡 Why This Matters for Ramen Bae

- **Product Catalog**: Store products with categories and variants
- **User Management**: Handle user profiles and authentication
- **Shopping Cart**: Persistent cart across sessions
- **Reviews System**: Link users to products with ratings
- **Order History**: Track purchases and order status
- **Inventory**: Manage stock levels in real-time

## 🔗 Connection to APIs

Your database knowledge connects to APIs:
- **GET /products** → `SELECT * FROM products`
- **POST /products** → `INSERT INTO products`
- **PUT /products/:id** → `UPDATE products WHERE id = ?`
- **DELETE /products/:id** → `DELETE FROM products WHERE id = ?`

## 📊 Progress Tracking

Track your progress as you complete each section:

**Setup:**
- [ ] Choose environment (Docker or Supabase)
- [ ] Complete setup and verify connection
- [ ] (Optional) Complete Docker exercises D1-D5

**SQL Exercises:**
- [ ] Complete Exercise 1: Basic CRUD
- [ ] Complete Exercise 2: Relationships
- [ ] Complete Exercise 3: Advanced Queries
- [ ] Complete Exercise 4: Real-World Scenarios

**Projects:**
- [ ] Build blog database schema
- [ ] Build e-commerce schema
- [ ] Practice with Ramen Bae data

## 🎓 Success Criteria

You'll know you've mastered this module when you can:
- ✅ Create tables with proper data types
- ✅ Write queries to retrieve specific data
- ✅ Design relationships between tables
- ✅ Use JOINs to combine data
- ✅ Optimize queries with indexes
- ✅ Implement data validation with constraints

---

**Ready to master databases?** Start with the [Setup Guide](setup-guide.md)! 🚀
