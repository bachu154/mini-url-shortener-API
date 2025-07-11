import { NextResponse } from "next/server"

// Access the same in-memory storage
declare global {
  var urlDatabase: Map<
    string,
    {
      originalUrl: string
      code: string
      createdAt: Date
      expiresAt?: Date
      clicks: number
    }
  >
}

export async function GET() {
  try {
    const urls = Array.from(global.urlDatabase.values()).map((item) => ({
      code: item.code,
      originalUrl: item.originalUrl,
      clicks: item.clicks,
      createdAt: item.createdAt.toISOString(),
    }))

    return NextResponse.json({ urls })
  } catch (error) {
    console.error("Error in /api/analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
