const mongoose = require("mongoose")

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: [true, "Original URL is required"],
      trim: true,
      maxlength: [2048, "URL cannot exceed 2048 characters"],
    },
    shortCode: {
      type: String,
      required: [true, "Short code is required"],
      unique: true,
      trim: true,
      minlength: [4, "Short code must be at least 4 characters"],
      maxlength: [10, "Short code cannot exceed 10 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    clickCount: {
      type: Number,
      default: 0,
      min: [0, "Click count cannot be negative"],
    },
    createdBy: {
      type: String,
      default: "anonymous",
    },
    lastAccessed: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for better performance
urlSchema.index({ shortCode: 1 }, { unique: true })
urlSchema.index({ createdAt: -1 })
urlSchema.index({ expiryDate: 1 })
urlSchema.index({ originalUrl: 1 })

// Virtual for checking if URL is expired
urlSchema.virtual("isExpired").get(function () {
  if (!this.expiryDate) return false
  return new Date() > this.expiryDate
})

// Instance method to check if URL is expired
urlSchema.methods.checkExpired = function () {
  if (!this.expiryDate) return false
  return new Date() > this.expiryDate
}

// Instance method to increment click count
urlSchema.methods.incrementClick = async function () {
  this.clickCount += 1
  this.lastAccessed = new Date()
  return await this.save()
}

// Static method to find non-expired URL
urlSchema.statics.findActiveByCode = function (shortCode) {
  return this.findOne({
    shortCode,
    $or: [{ expiryDate: null }, { expiryDate: { $gt: new Date() } }],
  })
}

// Pre-save middleware to validate expiry date
urlSchema.pre("save", function (next) {
  if (this.expiryDate && this.expiryDate <= new Date()) {
    return next(new Error("Expiry date cannot be in the past"))
  }
  next()
})

// Static method to clean expired URLs
urlSchema.statics.cleanExpired = function () {
  return this.deleteMany({
    expiryDate: { $lt: new Date() },
  })
}

module.exports = mongoose.model("Url", urlSchema)
