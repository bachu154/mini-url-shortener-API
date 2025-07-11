const mongoose = require("mongoose")
const dotenv = require("dotenv")
const Url = require("../models/Url")

// Load environment variables
dotenv.config()

async function cleanExpiredUrls() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Find and delete expired URLs
    const result = await Url.deleteMany({
      expiryDate: { $lt: new Date() },
    })

    console.log(`Cleaned up ${result.deletedCount} expired URLs`)

    // Get statistics
    const totalUrls = await Url.countDocuments()
    const expiredUrls = await Url.countDocuments({
      expiryDate: { $lt: new Date() },
    })

    console.log(`Total URLs: ${totalUrls}`)
    console.log(`Remaining expired URLs: ${expiredUrls}`)
  } catch (error) {
    console.error("Error cleaning expired URLs:", error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log("Database connection closed")
    process.exit(0)
  }
}

// Run the cleanup
cleanExpiredUrls()
