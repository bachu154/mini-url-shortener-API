const express = require("express")
const { nanoid } = require("nanoid")
const Url = require("../models/url")

const router = express.Router()

// URL validation regex
const URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/

// Validate URL function
function isValidUrl(url) {
  return URL_REGEX.test(url)
}

// POST /shorten - Create short URL
router.post("/shorten", async (req, res) => {
  try {
    const { url } = req.body

    // Validate input
    if (!url) {
      return res.status(400).json({
        error: "URL is required",
        message: "Please provide a URL to shorten",
      })
    }

    // Validate URL format using regex
    if (!isValidUrl(url.trim())) {
      return res.status(400).json({
        error: "Invalid URL format",
        message: "Please provide a valid HTTP or HTTPS URL",
      })
    }

    const originalUrl = url.trim()

    // Check if URL already exists
    const existingUrl = await Url.findOne({ originalUrl })
    if (existingUrl && !existingUrl.isExpired()) {
      const baseUrl = `${req.protocol}://${req.get("host")}`
      return res.json({
        shortUrl: `${baseUrl}/${existingUrl.shortCode}`,
        originalUrl: existingUrl.originalUrl,
        shortCode: existingUrl.shortCode,
        createdAt: existingUrl.createdAt,
        clickCount: existingUrl.clickCount,
      })
    }

    // Generate unique short code using nanoid
    let shortCode
    let isUnique = false

    while (!isUnique) {
      shortCode = nanoid(6)
      const existing = await Url.findOne({ shortCode })
      if (!existing) {
        isUnique = true
      }
    }

    // Create new URL document
    const newUrl = new Url({
      originalUrl,
      shortCode,
    })

    await newUrl.save()

    // Return response
    const baseUrl = `${req.protocol}://${req.get("host")}`
    res.status(201).json({
      shortUrl: `${baseUrl}/${shortCode}`,
      originalUrl: newUrl.originalUrl,
      shortCode: newUrl.shortCode,
      createdAt: newUrl.createdAt,
      clickCount: newUrl.clickCount,
    })
  } catch (error) {
    console.error("Error in /shorten:", error)

    if (error.code === 11000) {
      return res.status(500).json({
        error: "Short code generation failed",
        message: "Please try again",
      })
    }

    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create short URL",
    })
  }
})

// GET /:code - Redirect to original URL
router.get("/:code", async (req, res) => {
  try {
    const { code } = req.params

    // Validate code format
    if (!code || code.length < 4) {
      return res.status(404).json({
        error: "Short URL not found",
        message: "Invalid short code format",
      })
    }

    // Find URL by short code
    const urlDoc = await Url.findOne({ shortCode: code })

    if (!urlDoc) {
      return res.status(404).json({
        error: "Short URL not found",
        message: "The requested short URL does not exist",
      })
    }

    // Check if URL is expired
    if (urlDoc.isExpired()) {
      return res.status(404).json({
        error: "Short URL expired",
        message: "This short URL has expired",
      })
    }

    // Increment click count
    try {
      await urlDoc.incrementClicks()
    } catch (clickError) {
      console.error("Error incrementing clicks:", clickError)
      // Don't fail the redirect if click tracking fails
    }

    // Redirect to original URL
    res.redirect(302, urlDoc.originalUrl)
  } catch (error) {
    console.error("Error in redirect:", error)
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to process redirect",
    })
  }
})

module.exports = router
