# Mini URL Shortener API

A **backend-only** Mini URL Shortener API built with **Express.js** and **MongoDB** (no Next.js, no frontend).

## 🚀 Features

- ✅ **Pure Express.js Backend** (no Next.js)
- ✅ **Direct MongoDB with Mongoose** (no Supabase)
- ✅ **POST /shorten** - Create shortened URLs with regex validation
- ✅ **GET /:code** - Redirect with click tracking
- ✅ **nanoid** for short code generation
- ✅ **Error Handling** - 400 for invalid URLs, 404 for unknown codes
- ✅ **Docker Setup** - MongoDB + Express.js containers
- ✅ **Postman Collection** - Complete API testing

## 📋 API Endpoints

### POST /shorten
Create a shortened URL.

**Request:**
\`\`\`bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/some/long/path"}'
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "shortUrl": "http://localhost:3000/abc123",
  "originalUrl": "https://example.com/some/long/path",
  "shortCode": "abc123",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "clickCount": 0
}
\`\`\`

**Error (400 Bad Request):**
\`\`\`json
{
  "error": "Invalid URL format",
  "message": "Please provide a valid HTTP or HTTPS URL"
}
\`\`\`

### GET /:code
Redirect to original URL and increment click count.

**Request:**
\`\`\`bash
curl -L http://localhost:3000/abc123
\`\`\`

**Response:** 302 Redirect to original URL

**Error (404 Not Found):**
\`\`\`json
{
  "error": "Short URL not found",
  "message": "The requested short URL does not exist"
}
\`\`\`

## 🛠 Setup Instructions

### Prerequisites
- **Node.js** 16+
- **MongoDB** 4.4+ (local or Docker)

### Option 1: Local Setup

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Start MongoDB:**
   \`\`\`bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Or use Docker for MongoDB only
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   \`\`\`

3. **Set environment variables:**
   \`\`\`bash
   cp .env.example .env
   # Edit .env if needed
   \`\`\`

4. **Run the Express.js server:**
   \`\`\`bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   \`\`\`

The API will be available at `http://localhost:3000`

## 🔁 Running with Docker

\`\`\`bash
docker-compose up --build
\`\`\`

This will start both the Express.js API and MongoDB in containers.

## 📮 Importing Postman Collection

1. Open Postman
2. Import `mini-url-shortener.postman_collection.json`
3. Use POST /shorten and GET /:code

The collection includes:
- **POST /shorten** - Create short URLs
- **GET /:code** - Test redirects

## 🧪 Testing

### Manual Testing

**Health Check:**
\`\`\`bash
curl http://localhost:3000/health
\`\`\`

**Shorten URL:**
\`\`\`bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/some/long/path"}'
\`\`\`

**Access Short URL:**
\`\`\`bash
curl -L http://localhost:3000/abc123
\`\`\`

**Test Invalid URL (should return 400):**
\`\`\`bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "invalid-url"}'
\`\`\`

**Test Non-existent Code (should return 404):**
\`\`\`bash
curl http://localhost:3000/nonexistent
\`\`\`

## 🗄 Database Schema

### URL Model (models/url.js)
\`\`\`javascript
{
  originalUrl: String,    // Original long URL
  shortCode: String,      // Generated short code (unique)
  createdAt: Date,        // Creation timestamp
  expiryDate: Date,       // Optional expiration
  clickCount: Number      // Click counter (default: 0)
}
\`\`\`

## 🐳 Docker Commands

\`\`\`bash
# Start services
docker-compose up --build

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build -d
\`\`\`

## 🔧 Project Structure

\`\`\`
mini-url-shortener-api/
├── server.js                              # Express.js server
├── models/url.js                         # Mongoose URL model
├── routes/url.js                         # Express routes
├── package.json                          # Dependencies
├── .env                                  # Environment variables
├── Dockerfile                            # App container
├── docker-compose.yml                    # Full stack setup
├── mini-url-shortener.postman_collection.json  # API testing
└── README.md                             # This file
\`\`\`

## 🛡 Error Handling

- **400 Bad Request** - Invalid URL format or missing URL
- **404 Not Found** - Short code doesn't exist or expired
- **500 Internal Server Error** - Database or server errors

## 🚀 Production Deployment

1. **Set environment variables:**
   \`\`\`env
   MONGO_URL=mongodb://your-production-mongodb-uri
   PORT=3000
   NODE_ENV=production
   \`\`\`

2. **Deploy options:**
   - Heroku with MongoDB Atlas
   - AWS EC2 with DocumentDB
   - DigitalOcean Droplet with managed MongoDB

## 📝 Technologies Used

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **nanoid** - Short code generation
- **Docker** - Containerization

---

**✅ 100% Backend-only API - No Next.js, No Frontend, Pure Express.js + MongoDB**
