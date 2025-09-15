# DebateRank - Mathematics & Debating Platform Setup

## 🚀 Quick Start Commands

### 1. Start the Platform
```bash
# Navigate to project directory
cd /home/Angel/Documents/insert_disk2_to_continue/Personal-projects/Debating-platform

# Stop any running containers
docker-compose down

# Build and start all services
docker-compose up --build
```

### 2. Initialize Database (First Run Only)
```bash
# In a new terminal, run migrations
docker-compose exec backend npm run migrate
```

### 3. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Database**: localhost:5432

## 🧮 Mathematics Features Available

### New Navigation Tab
- Click **"📐 Mathematics"** to access mathematical debate topics

### Mathematical Debate Topics
- **Fundamental Theorem of Calculus** (Level 7)
- **Riemann Hypothesis** (Level 10)
- **Mathematical Infinity & Paradoxes** (Level 8)
- **Proof by Contradiction** (Level 6)
- **Mathematical Beauty vs Truth** (Level 5)

### LaTeX Support
- **Inline math**: `$x^2 + y^2 = z^2$`
- **Display math**: `$$\int_a^b f(x)dx$$`
- **Equation editor** with symbol palette
- **Step-by-step proof builder**

## 🐳 Docker Architecture

### Services Running
1. **Frontend** (Node 20 + React + Vite) - Port 5173
2. **Backend** (Node 18 + Express) - Port 3001
3. **PostgreSQL Database** - Port 5432

### Fixed Issues
- ✅ Backend: Changed to `npm install` (includes nodemon)
- ✅ Frontend: Upgraded to Node 20 (Vite compatibility)
- ✅ Database: Migration adds `topic_type` field for mathematics

## 🔧 Development Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Service Management
```bash
# Stop all services
docker-compose down

# Restart specific service
docker-compose restart backend

# Rebuild specific service
docker-compose up --build frontend
```

### Database Operations
```bash
# Run migrations
docker-compose exec backend npm run migrate

# Reset database (removes all data)
docker-compose down -v
docker-compose up --build
docker-compose exec backend npm run migrate
```

## 🧪 Testing the Platform

### 1. Regular Debates
1. Visit http://localhost:5173
2. Click "Dashboard"
3. Browse topics and select one
4. Click "Prepare" to start debating

### 2. Mathematical Debates
1. Click "📐 Mathematics" tab
2. Filter by category (Analysis, Number Theory, etc.)
3. Filter by complexity level (1-10)
4. Click "Start Debate" on any topic
5. Use LaTeX in your arguments: `$\pi = 3.14159...$`

### 3. Mathematical Tools
- **Equation Editor**: Interactive LaTeX input with preview
- **Symbol Palette**: Common mathematical symbols
- **Proof Builder**: Step-by-step mathematical proofs
- **Math Preview**: Real-time equation rendering

## 🚨 Troubleshooting

### If containers won't start:
```bash
docker-compose down
docker system prune -f
docker-compose up --build
```

### If frontend shows blank page:
```bash
# Check if services are running
docker-compose ps

# Check frontend logs
docker-compose logs frontend

# Restart frontend
docker-compose restart frontend
```

### If backend API errors:
```bash
# Test backend health
curl http://localhost:3001/api/health

# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### If database connection fails:
```bash
# Check database health
docker-compose exec postgres pg_isready -U debaterank

# Reset database
docker-compose down -v
docker-compose up --build
docker-compose exec backend npm run migrate
```

## 📊 Platform Features

### ✅ Working Features
- Cross-browser compatibility (no File System Access API)
- Real file system storage via Docker volumes
- PostgreSQL database for topic metadata
- Hot reloading for development
- Mathematical equation rendering with MathJax
- Interactive equation editor
- Mathematical proof builder
- LaTeX syntax support in markdown
- Topic filtering by category and complexity

### 🎯 Ready for Production
- User authentication endpoints ready
- Database schema supports users and topics
- File storage system scalable
- API endpoints documented
- Docker deployment ready

---

## 🎉 Success Indicators

When everything is working:
1. **Frontend**: Loads at http://localhost:5173
2. **Mathematics tab**: Shows mathematical topics
3. **LaTeX rendering**: Equations display properly
4. **Topic creation**: Creates topics via API
5. **File persistence**: Data survives container restarts

**Your mathematics and debating platform is ready!** 🚀📐