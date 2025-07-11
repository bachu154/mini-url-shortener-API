import { type NextRequest, NextResponse } from "next/server"
import { nanoid } from "nanoid"

// In-memory storage for demo purposes
// In production, use MongoDB, PostgreSQL, or Redis
const urlDatabase = new Map<
  string,
  {
    originalUrl: string
    code: string
    createdAt: Date
    expiresAt?: Date
    clicks: number
  }
>()

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// URL validation regex
const URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return URL_REGEX.test(url)
  } catch {
    return false
  }
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)

  if (!limit || now > limit.resetTime) {
    // Reset or create new limit (10 requests per minute)
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 })
    return true
  }

  if (limit.count >= 10) {
    return false
  }

  limit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    // Validate input
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required and must be a string" }, { status: 400 })
    }

    // Validate URL format
    if (!isValidUrl(url)) {
      return NextResponse.json({ error: "Invalid URL format. Please provide a valid HTTP/HTTPS URL" }, { status: 400 })
    }

    // Rate limiting
    const clientIP = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    // Check if URL already exists
    for (const [code, data] of urlDatabase.entries()) {
      if (data.originalUrl === url) {
        const baseUrl = request.nextUrl.origin
        return NextResponse.json({
          shortUrl: `${baseUrl}/${code}`,
          originalUrl: url,
          code: code,
        })
      }
    }

    // Generate unique short code
    let code: string
    do {
      code = nanoid(6)
    } while (urlDatabase.has(code))

    // Store in database with expiration (30 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    urlDatabase.set(code, {
      originalUrl: url,
      code,
      createdAt: new Date(),
      expiresAt,
      clicks: 0,
    })

    const baseUrl = request.nextUrl.origin
    const shortUrl = `${baseUrl}/${code}`

    return NextResponse.json({
      shortUrl,
      originalUrl: url,
      code,
    })
  } catch (error) {
    console.error("Error in /api/shorten:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
