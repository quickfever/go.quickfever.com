# QuickFever Custom URL Shortener (`go.quickfever.com`)

A fast, modern, custom-branded URL shortener designed for **`go.quickfever.com`**, built with Next.js App Router and optimized for zero-hassle deployment on **Vercel**.

![QuickFever Shortener UI](https://raw.githubusercontent.com/quickfever/brand/main/preview.png)

## ✨ Key Features

- **⚡ Fast 307 Redirection**: Changes to your short URL destination take effect instantly across all browsers.
- **📱 Responsive Luxury UI**: Glassmorphic dark theme built for desktop and mobile link management.
- **✏️ On-the-Fly Editing**: Easily edit destination URLs, titles, descriptions, and tags without changing the short link.
- **📊 Real-time Click Tracking**: Track total clicks and performance analytics per link.
- **🏁 QR Code Generator**: Generate high-res QR codes for every short link.
- **🔒 Security & Controls**: Optional password protection and auto-expiration dates.
- **☁️ Zero-Config Storage**: Works locally out of the box with file/memory storage, and seamlessly connects to **Upstash Redis / Vercel KV** when deployed to production.

---

## 🚀 How to Run Locally

1. Open terminal in project directory:
   ```bash
   cd C:\Users\quick\.gemini\antigravity\scratch\quickfever-url-shortener
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

4. Open your browser at [http://localhost:3000](http://localhost:3000).

---

## 🌐 How to Deploy to Vercel

### Option 1: Vercel GitHub Integration (Recommended)
1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for QuickFever URL Shortener"
   git remote add origin https://github.com/your-username/quickfever-url-shortener.git
   git push -u origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Select your repository and click **Deploy**.

---

### Option 2: Deploy directly via Vercel CLI
```bash
npx vercel
```

---

## 🔗 Connecting your Custom Subdomain `go.quickfever.com`

1. In your **Vercel Project**, go to **Settings > Domains**.
2. Type `go.quickfever.com` and click **Add**.
3. In your Domain DNS Provider (e.g. Cloudflare, Namecheap, GoDaddy, Google Domains):
   - **Type**: `CNAME`
   - **Name / Host**: `go`
   - **Target / Value**: `cname.vercel-dns.com`
   - **TTL**: Auto or 3600

Vercel will automatically provision a free SSL certificate within seconds!

---

## 🗄️ Production Database (Vercel KV / Upstash Redis)

For persistent data storage across serverless regions on Vercel:

1. In Vercel Project Dashboard, click **Storage > Create Database > KV (Powered by Upstash)**.
2. Connect it to your project.
3. Vercel automatically populates the environment variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

The app automatically detects these keys and activates cloud storage!

---

## 🛠️ Environment Variables (`.env.local`)

```env
# Optional for production persistent storage
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...=
```
