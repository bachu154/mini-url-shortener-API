"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, ExternalLink, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ShortenResponse {
  shortUrl: string
  originalUrl: string
  code: string
}

interface AnalyticsData {
  code: string
  originalUrl: string
  clicks: number
  createdAt: string
}

export default function URLShortener() {
  const [url, setUrl] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([])
  const [showAnalytics, setShowAnalytics] = useState(false)
  const { toast } = useToast()

  const shortenUrl = async () => {
    if (!url) {
      setError("Please enter a URL")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to shorten URL")
      }

      setShortUrl(data.shortUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      toast({
        title: "Copied!",
        description: "Short URL copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const loadAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics")
      const data = await response.json()
      setAnalytics(data.urls || [])
      setShowAnalytics(true)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">URL Shortener</h1>
          <p className="text-gray-600">Transform long URLs into short, shareable links</p>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Shorten Your URL</CardTitle>
            <CardDescription>Enter a long URL below to generate a short, shareable link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL to shorten</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/very/long/url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && shortenUrl()}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={shortenUrl} disabled={loading} className="w-full">
              {loading ? "Shortening..." : "Shorten URL"}
            </Button>

            {shortUrl && (
              <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <Label>Your shortened URL:</Label>
                <div className="flex gap-2">
                  <Input value={shortUrl} readOnly className="bg-white" />
                  <Button onClick={copyToClipboard} size="icon" variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => window.open(shortUrl, "_blank")} size="icon" variant="outline">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Button onClick={loadAnalytics} variant="outline" className="gap-2 bg-transparent">
            <BarChart3 className="h-4 w-4" />
            View Analytics
          </Button>
        </div>

        {showAnalytics && (
          <Card>
            <CardHeader>
              <CardTitle>URL Analytics</CardTitle>
              <CardDescription>Click statistics for all shortened URLs</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No URLs shortened yet</p>
              ) : (
                <div className="space-y-3">
                  {analytics.map((item) => (
                    <div key={item.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.originalUrl}</p>
                        <p className="text-xs text-gray-500">
                          Code: {item.code} • Created: {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-blue-600">{item.clicks}</p>
                        <p className="text-xs text-gray-500">clicks</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
