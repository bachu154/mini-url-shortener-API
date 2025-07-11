const validator = require("validator")

// Comprehensive URL validation regex
const URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/

// List of blocked domains (optional security feature)
const BLOCKED_DOMAINS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "10.",
  "192.168.",
  "172.16.",
  "172.17.",
  "172.18.",
  "172.19.",
  "172.20.",
  "172.21.",
  "172.22.",
  "172.23.",
  "172.24.",
  "172.25.",
  "172.26.",
  "172.27.",
  "172.28.",
  "172.29.",
  "172.30.",
  "172.31.",
]

/**
 * Validate URL format and security
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateUrl(url) {
  if (!url || typeof url !== "string") {
    return false
  }

  // Basic validation using validator.js
  const isValidFormat = validator.isURL(url, {
    protocols: ["http", "https"],
    require_protocol: true,
    require_valid_protocol: true,
    allow_underscores: false,
    allow_trailing_dot: false,
    allow_protocol_relative_urls: false,
    validate_length: true,
  })

  if (!isValidFormat) {
    return false
  }

  // Additional regex validation
  if (!URL_REGEX.test(url)) {
    return false
  }

  // Security check - block private/local addresses
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()

    // Check against blocked domains
    for (const blocked of BLOCKED_DOMAINS) {
      if (hostname.includes(blocked)) {
        return false
      }
    }

    // Additional security checks
    if (hostname === "localhost" || hostname.startsWith("127.") || hostname.startsWith("0.") || hostname === "::1") {
      return false
    }
  } catch (error) {
    return false
  }

  return true
}

/**
 * Sanitize URL by trimming and normalizing
 * @param {string} url - URL to sanitize
 * @returns {string} - Sanitized URL
 */
function sanitizeUrl(url) {
  if (!url || typeof url !== "string") {
    return ""
  }

  // Trim whitespace
  let sanitized = url.trim()

  // Add protocol if missing
  if (!/^https?:\/\//i.test(sanitized)) {
    sanitized = "https://" + sanitized
  }

  // Normalize protocol to lowercase
  sanitized = sanitized.replace(/^HTTP/i, "http").replace(/^HTTPS/i, "https")

  return sanitized
}

/**
 * Validate short code format
 * @param {string} code - Short code to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateShortCode(code) {
  if (!code || typeof code !== "string") {
    return false
  }

  // Must be 4-10 characters, alphanumeric plus hyphens and underscores
  return /^[a-zA-Z0-9_-]{4,10}$/.test(code)
}

/**
 * Check if URL is potentially malicious
 * @param {string} url - URL to check
 * @returns {boolean} - True if suspicious, false otherwise
 */
function isSuspiciousUrl(url) {
  const suspiciousPatterns = [/bit\.ly/i, /tinyurl/i, /t\.co/i, /goo\.gl/i, /ow\.ly/i, /short\.link/i, /tiny\.cc/i]

  return suspiciousPatterns.some((pattern) => pattern.test(url))
}

module.exports = {
  validateUrl,
  sanitizeUrl,
  validateShortCode,
  isSuspiciousUrl,
  BLOCKED_DOMAINS,
}
