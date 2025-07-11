const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/urlshortener"
mongoose
  .connect(mongoUrl)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

// Import routes
const urlRoutes = require("./routes/url")

// Use routes
app.use("/", urlRoutes)

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Mini URL Shortener API is running",
    timestamp: new Date().toISOString(),
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack)
  res.status(500).json({
    error: "Internal server error",
    message: "Something went wrong!",
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Express.js server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

module.exports = app
