import { type NextRequest, NextResponse } from "next/server"

// Access the same in-memory storage
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

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params

    if (!code) {
      return NextResponse.json({ error: "Short code is required" }, { status: 400 })
    }

    const urlData = urlDatabase.get(code)

    if (!urlData) {
      return NextResponse.json({ error: "Short URL not found" }, { status: 404 })
    }

    // Check if URL has expired
    if (urlData.expiresAt && new Date() > urlData.expiresAt) {
      urlDatabase.delete(code)
      return NextResponse.json({ error: "Short URL has expired" }, { status: 410 })
    }

    // Increment click count
    urlData.clicks++

    // Redirect to original URL
    return NextResponse.redirect(urlData.originalUrl, 302)
  } catch (error) {
    console.error("Error in redirect:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
