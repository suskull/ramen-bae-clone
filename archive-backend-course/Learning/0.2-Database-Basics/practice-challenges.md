# 🎯 Practice Challenges

Extra challenges to test your SQL mastery. These are more open-ended and require combining multiple concepts.

## 🌟 Beginner Challenges

### Challenge 1: Personal Library System

Design and implement a database for tracking your book collection.

**Requirements:**
- Books (title, author, ISBN, genre, pages)
- Reading status (to-read, reading, completed)
- Reading dates (started, finished)
- Personal rating and notes

**Tasks:**
1. Design the schema
2. Insert 10 sample books
3. Query books by status
4. Calculate average reading time
5. Find your highest-rated books

---

### Challenge 2: Recipe Manager

Build a database for storing recipes.

**Requirements:**
- Recipes (name, description, prep time, cook time)
- Ingredients with quantities
- Categories (breakfast, lunch, dinner, dessert)
- Difficulty levels

**Tasks:**
1. Design schema with relationships
2. Add 5 recipes with ingredients
3. Find recipes by ingredient
4. Calculate total prep + cook time
5. Find quick recipes (< 30 minutes)

---

### Challenge 3: Workout Tracker

Track your fitness activities.

**Requirements:**
- Exercises (name, type, muscle group)
- Workouts (date, duration, notes)
- Sets (exercise, reps, weight)
- Personal records

**Tasks:**
1. Design the schema
2. Log a week of workouts
3. Calculate total volume per muscle group
4. Track progress over time
5. Find personal bests

---

## 🔥 Intermediate Challenges

### Challenge 4: Social Media Feed

Build a simplified social media database.

**Requirements:**
- Users with profiles
- Posts with text and images
- Comments (nested replies)
- Likes on posts and comments
- Followers/following relationships
- Hashtags

**Tasks:**
1. Design complete schema
2. Create sample data (10 users, 20 posts)
3. Build a user's feed (posts from followed users)
4. Find trending hashtags
5. Calculate engagement rate per post
6. Implement "suggested users" (mutual followers)

---

### Challenge 5: Project Management System

Create a task management database.

**Requirements:**
- Projects with deadlines
- Tasks with status, priority, assignees
- Comments on tasks
- Time tracking
- File attachments
- Task dependencies

**Tasks:**
1. Design schema with all relationships
2. Add sample project with 15 tasks
3. Find overdue tasks
4. Calculate project completion percentage
5. Show critical path (dependent tasks)
6. Generate time reports per user

---

### Challenge 6: Event Ticketing System

Build a ticket sales database.

**Requirements:**
- Events (name, date, venue, capacity)
- Ticket types (VIP, general, early bird)
- Orders with multiple tickets
- Seat assignments
- Pricing tiers
- Discount codes

**Tasks:**
1. Design complete schema
2. Create 3 events with different ticket types
3. Process ticket orders
4. Check seat availability
5. Calculate revenue per event
6. Apply discount codes
7. Generate sales reports

---

## 💪 Advanced Challenges

### Challenge 7: Multi-Tenant SaaS Platform

Design a database for a SaaS application with multiple organizations.

**Requirements:**
- Organizations (tenants)
- Users belong to organizations
- Projects within organizations
- Role-based permissions
- Usage tracking and billing
- Data isolation between tenants

**Tasks:**
1. Design schema with tenant isolation
2. Implement Row Level Security (RLS)
3. Create sample data for 3 organizations
4. Query data ensuring tenant isolation
5. Calculate usage metrics per tenant
6. Generate billing reports

---

### Challenge 8: Marketplace Platform

Build a two-sided marketplace (like Etsy or Airbnb).

**Requirements:**
- Sellers and buyers (both are users)
- Product listings with variants
- Shopping cart and checkout
- Orders with multiple items
- Reviews and ratings (both ways)
- Messaging between users
- Payment tracking
- Shipping addresses

**Tasks:**
1. Design complete marketplace schema
2. Create 5 sellers with 20 products
3. Process orders with inventory management
4. Calculate seller ratings and metrics
5. Implement search with filters
6. Generate seller dashboard data
7. Track marketplace commission

---

### Challenge 9: Learning Management System (LMS)

Create a database for online courses.

**Requirements:**
- Courses with modules and lessons
- Video content with progress tracking
- Quizzes with questions and answers
- Student enrollments
- Certificates upon completion
- Discussion forums
- Instructor ratings

**Tasks:**
1. Design comprehensive schema
2. Create 3 courses with full content
3. Track student progress
4. Calculate completion rates
5. Generate quiz results and grades
6. Issue certificates automatically
7. Build course recommendation engine

---

## 🚀 Expert Challenges

### Challenge 10: Analytics Dashboard

Build a database that powers an analytics dashboard.

**Requirements:**
- Time-series data (metrics over time)
- Multiple data sources
- Aggregations at different time intervals
- User segments and cohorts
- Funnel analysis
- A/B test results

**Tasks:**
1. Design schema for analytics events
2. Generate realistic time-series data
3. Calculate daily/weekly/monthly metrics
4. Perform cohort analysis
5. Build conversion funnels
6. Optimize queries for dashboard performance
7. Create materialized views for speed

---

### Challenge 11: Recommendation Engine

Build the database backend for a recommendation system.

**Requirements:**
- User behavior tracking (views, clicks, purchases)
- Product relationships (similar items)
- Collaborative filtering data
- User preferences and history
- Real-time recommendations

**Tasks:**
1. Design schema for tracking interactions
2. Generate user behavior data
3. Find "users who bought X also bought Y"
4. Calculate product similarity scores
5. Build personalized recommendations
6. Implement trending items algorithm
7. Optimize for real-time queries

---

### Challenge 12: Distributed System

Design a database that supports a distributed application.

**Requirements:**
- Multi-region data replication
- Conflict resolution strategies
- Event sourcing pattern
- CQRS (Command Query Responsibility Segregation)
- Audit trail for all changes
- Data versioning

**Tasks:**
1. Design event-sourced schema
2. Implement command and query models
3. Create audit trail system
4. Handle concurrent updates
5. Implement data versioning
6. Build event replay functionality
7. Design for eventual consistency

---

## 🎨 Creative Challenges

### Challenge 13: Your Own Project

Design a database for a project you're passionate about!

**Ideas:**
- Music streaming service
- Food delivery app
- Travel planning platform
- Gaming leaderboard
- Podcast directory
- Art portfolio site
- Job board
- Real estate listings

**Requirements:**
- Identify all entities and relationships
- Design normalized schema
- Create realistic sample data
- Write complex queries for features
- Optimize for performance
- Document your design decisions

---

## 📊 Challenge Completion Tracker

Track your progress:

**Beginner:**
- [ ] Challenge 1: Personal Library
- [ ] Challenge 2: Recipe Manager
- [ ] Challenge 3: Workout Tracker

**Intermediate:**
- [ ] Challenge 4: Social Media Feed
- [ ] Challenge 5: Project Management
- [ ] Challenge 6: Event Ticketing

**Advanced:**
- [ ] Challenge 7: Multi-Tenant SaaS
- [ ] Challenge 8: Marketplace Platform
- [ ] Challenge 9: Learning Management System

**Expert:**
- [ ] Challenge 10: Analytics Dashboard
- [ ] Challenge 11: Recommendation Engine
- [ ] Challenge 12: Distributed System

**Creative:**
- [ ] Challenge 13: Your Own Project

---

## 💡 Tips for Success

1. **Start with ERD** - Draw your schema before writing SQL
2. **Sample data matters** - Create realistic, diverse data
3. **Test edge cases** - What happens with empty results?
4. **Optimize gradually** - Make it work, then make it fast
5. **Document decisions** - Why did you choose this design?
6. **Ask for feedback** - Share your solutions with others

---

## 🎓 Learning Resources

- [Database Design Tutorial](https://www.postgresqltutorial.com/)
- [SQL Practice](https://sqlzoo.net/)
- [PostgreSQL Exercises](https://pgexercises.com/)
- [LeetCode Database Problems](https://leetcode.com/problemset/database/)

---

**Remember**: The best way to learn is by building! Pick a challenge that excites you and dive in. 🚀
