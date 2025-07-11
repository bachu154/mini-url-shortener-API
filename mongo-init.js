// MongoDB initialization script for Docker
const db = db.getSiblingDB("urlshortener")

// Create collections
db.createCollection("urls")

// Create indexes
db.urls.createIndex({ shortCode: 1 }, { unique: true })
db.urls.createIndex({ createdAt: -1 })
db.urls.createIndex({ expiryDate: 1 })
db.urls.createIndex({ originalUrl: 1 })

// Insert sample data (optional)
db.urls.insertMany([
  {
    originalUrl: "https://example.com/sample-long-url",
    shortCode: "sample1",
    createdAt: new Date(),
    expiryDate: null,
    clickCount: 0,
    createdBy: "system",
    lastAccessed: null,
  },
])

print("Database initialized successfully")
