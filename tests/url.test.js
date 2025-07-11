const request = require("supertest")
const mongoose = require("mongoose")
const app = require("../server")
const Url = require("../models/url")

// Test database
const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/urlshortener_test"

describe("URL Shortener API", () => {
  beforeAll(async () => {
    await mongoose.connect(MONGODB_TEST_URI)
  })

  beforeEach(async () => {
    await Url.deleteMany({})
  })

  afterAll(async () => {
    await Url.deleteMany({})
    await mongoose.connection.close()
  })

  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health").expect(200)

      expect(response.body.status).toBe("OK")
    })
  })

  describe("POST /shorten", () => {
    it("should create a short URL for valid input", async () => {
      const response = await request(app).post("/shorten").send({ url: "https://example.com/test" }).expect(201)

      expect(response.body).toHaveProperty("shortUrl")
      expect(response.body).toHaveProperty("shortCode")
      expect(response.body.originalUrl).toBe("https://example.com/test")
      expect(response.body.clicks).toBe(0)
    })

    it("should return 400 for invalid URL", async () => {
      const response = await request(app).post("/shorten").send({ url: "invalid-url" }).expect(400)

      expect(response.body.error).toBe("Invalid URL format")
    })

    it("should return 400 for missing URL", async () => {
      const response = await request(app).post("/shorten").send({}).expect(400)

      expect(response.body.error).toBe("URL is required")
    })

    it("should return existing URL for duplicate", async () => {
      // Create first URL
      const firstResponse = await request(app).post("/shorten").send({ url: "https://example.com/test" }).expect(201)

      // Try same URL again
      const secondResponse = await request(app).post("/shorten").send({ url: "https://example.com/test" }).expect(200)

      expect(secondResponse.body.shortCode).toBe(firstResponse.body.shortCode)
    })
  })

  describe("GET /:code", () => {
    let shortCode

    beforeEach(async () => {
      const response = await request(app).post("/shorten").send({ url: "https://example.com/test" })

      shortCode = response.body.shortCode
    })

    it("should redirect to original URL", async () => {
      const response = await request(app).get(`/${shortCode}`).expect(302)

      expect(response.headers.location).toBe("https://example.com/test")
    })

    it("should increment click count", async () => {
      // Access URL
      await request(app).get(`/${shortCode}`).expect(302)

      // Check click count in database
      const urlDoc = await Url.findOne({ shortCode })
      expect(urlDoc.clicks).toBe(1)
    })

    it("should return 404 for non-existent code", async () => {
      const response = await request(app).get("/nonexistent").expect(404)

      expect(response.body.error).toBe("Short URL not found")
    })
  })
})
