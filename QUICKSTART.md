Get your Uber Clone running in minutes!

Prerequisites Checklist
Before you begin, make sure you have:

 Node.js (v18+) installed - node --version
 MongoDB running - mongod --version
 Redis running - redis-cli ping (should return "PONG")
 PostgreSQL installed (optional) - psql --version
5-Minute Setup
Step 1: Install Dependencies (2 minutes)
# Install backend dependencies
npm install

# Install frontend dependencies
cd ride-booking-frontend
npm install
cd ..
Step 2: Configure Environment (1 minute)
# Copy environment template
cp .env.example .env

# Quick minimal setup for development
cat > .env << EOF
ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/uberclone
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
JWT_SECRET=SUPERSECRET123
EOF
Step 3: Start Services (1 minute)
Terminal 1 - Backend
npm run dev
Terminal 2 - Frontend
cd ride-booking-frontend
npm run dev
Step 4: Verify (30 seconds)
Open your browser:

Frontend: http://localhost:5173
Backend Health: http://localhost:4000/health
If you see the frontend and health check returns {"status":"OK"}, you're good to go! 🎉

Common Issues & Solutions
Issue 1: MongoDB Connection Failed
Error: MongooseServerSelectionError

Solution:

# Make sure MongoDB is running
sudo systemctl start mongodb
# OR
mongod --dbpath /path/to/data
Issue 2: Redis Connection Failed
Error: Error: Redis connection failed

Solution:

# Start Redis
sudo systemctl start redis
# OR
redis-server
Issue 3: Port Already in Use
Error: EADDRINUSE: address already in use :::4000

Solution:

# Find and kill the process using port 4000
lsof -ti:4000 | xargs kill -9

# Or use a different port in .env
echo "PORT=4001" >> .env
Issue 4: Module Not Found
Error: Error: Cannot find module 'xyz'

Solution:

# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install

# For frontend
cd ride-booking-frontend
rm -rf node_modules package-lock.json
npm install
Optional Services
Kafka (for Real-time Location Updates)
Only needed for production-grade real-time features.

# Using Docker Compose
docker-compose up -d

# Verify Kafka is running
docker ps | grep kafka
PostgreSQL (for Additional Features)
Only needed if you're using Sequelize features.

# Create database
createdb testdb

# Update .env
echo "DB_DATABASE=testdb" >> .env
echo "DB_USERNAME=postgres" >> .env
echo "DB_PASSWORD=yourpassword" >> .env
Development Workflow
Creating a Test User
Use the signup page or make an API call:

curl -X POST http://localhost:4000/api/v1/user \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "Test@123",
    "userType": "customer"
  }'
Testing Login
curl -X POST http://localhost:4000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
Monitoring Logs
# Backend logs
npm run dev

# Frontend logs
cd ride-booking-frontend
npm run dev
Production Deployment Checklist
 Set ENV=production in .env
 Use strong JWT_SECRET (32+ characters)
 Configure AWS S3 for file uploads
 Set up SSL/TLS certificates
 Enable Kafka for scalability
 Configure email service (SMTP/SES)
 Set up monitoring (PM2, New Relic, etc.)
 Enable database backups
 Configure Redis persistence
 Set up reverse proxy (Nginx)
 Enable rate limiting
 Configure CORS properly
Useful Commands
# Backend
npm start          # Production mode
npm run dev        # Development mode with nodemon
npm test           # Run tests (when available)

# Frontend
npm run dev        # Development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Check code quality

# Database
mongosh            # MongoDB shell
redis-cli          # Redis shell
psql -U postgres   # PostgreSQL shell

# Docker
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose logs -f kafka      # View Kafka logs
Next Steps
Read the full README.md for detailed documentation
Check ENHANCEMENTS.md for list of fixes and improvements
Explore the codebase - Start with app.js and routes/v1/route.js
Set up your IDE - Install ESLint and Prettier plugins
Join the development - Check open issues or create feature branches
Getting Help
Documentation: See README.md
Issues: Check existing issues or create a new one
Email: nadgesachin@gmail.com