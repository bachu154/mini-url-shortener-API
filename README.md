# 🔗 Mini URL Shortener API

A backend REST API built with **Node.js**, **Express**, and **MongoDB** that shortens long URLs and returns a unique short code. When accessed, this code redirects to the original URL.

---

## 📌 Objective

- Accept a long URL and return a shortened version (`POST /shorten`)
- Redirect a short code to the original URL (`GET /:code`)
- Fully RESTful API with MongoDB integration, validation, and optional analytics

---

## 🧰 Tech Stack

- **Language:** JavaScript / TypeScript
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Tools:** Vercel / Replit, Postman, nanoid, dotenv

---

## 🔌 API Endpoints

### ➤ `POST /shorten`

Shortens a long URL.

#### Request Body
```json
{
  "url": "https://example.com/very/long/link"
}
