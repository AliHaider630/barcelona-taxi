# 🚗 Barcelona Premium Transfers

A full-stack premium transfer booking website built with Next.js 14, Prisma, and NextAuth.

## 🌟 Features

- **Public Website** – Animated premium landing page with SEO, fleet showcase, famous routes
- **Booking System** – Airport, city, intercity, hourly transfers with live price calculator
- **User Panel** – Register, login, book transfers, view bookings & notifications
- **Admin Panel** – Manage all bookings, assign drivers, approve drivers, view stats
- **Driver Panel** – View assigned rides, passenger info, earnings
- **Email Notifications** – Auto emails on booking, driver assignment, approval
- **Full SEO** – Sitemap, robots.txt, schema.org, geo meta tags, keywords

---

## 🚀 Quick Setup (Local)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 3. Set up database
```bash
npx prisma generate
npx prisma db push
```

### 4. Seed admin & test driver accounts
```bash
# Start dev server first, then visit:
# POST http://localhost:3000/api/admin/seed
# Or use curl:
curl -X POST http://localhost:3000/api/admin/seed
```

**Test accounts after seed:**
- Admin: `admin@barcelonatransfers.com` / `admin123`
- Driver: `driver@barcelonatransfers.com` / `driver123`

### 5. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🌍 Deploy to Vercel + GitHub

### Step 1 – Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - Barcelona Transfers"
git remote add origin https://github.com/YOUR_USERNAME/barcelona-transfers.git
git push -u origin main
```

### Step 2 – Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → Import your GitHub repo
2. Add these environment variables in Vercel dashboard:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Use [Neon.tech](https://neon.tech) free Postgres: `postgresql://...` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` to generate |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASS` | Gmail App Password (not your real password) |
| `SMTP_FROM` | `Barcelona Transfers <your@gmail.com>` |

### Step 3 – Switch to Postgres for production
In `prisma/schema.prisma`, change:
```
provider = "sqlite"
url      = env("DATABASE_URL")
```
To:
```
provider = "postgresql"
url      = env("DATABASE_URL")
```

### Step 4 – After deploy
```bash
# Run this once to create tables:
npx prisma db push
# Seed admin account:
curl -X POST https://your-app.vercel.app/api/admin/seed
```

---

## 📧 Gmail Setup for Emails

1. Go to Google Account → Security → 2-Step Verification (enable it)
2. Go to App Passwords → Generate one for "Mail"
3. Use that 16-character password as `SMTP_PASS`

---

## 🗂️ Project Structure

```
src/
  app/
    page.tsx              # Landing page
    booking/page.tsx      # Booking form with price calculator
    login/page.tsx        # User login
    register/page.tsx     # User registration
    user/bookings/        # User dashboard
    admin/page.tsx        # Admin dashboard
    driver/
      login/              # Driver login
      register/           # Driver application
      dashboard/          # Driver panel
    api/
      auth/               # NextAuth + register endpoints
      bookings/           # Create & get bookings
      admin/              # Admin management APIs
      driver/             # Driver APIs
      notifications/      # Notification system
  components/
    Navbar.tsx
    Providers.tsx
  lib/
    prisma.ts             # Database client
    email.ts              # Email functions
    pricing.ts            # Price calculator
prisma/
  schema.prisma           # Database models
```

---

## 💳 Pages & URLs

| URL | Description |
|-----|-------------|
| `/` | Homepage |
| `/booking` | Book a transfer |
| `/login` | Customer login |
| `/register` | Customer registration |
| `/user/bookings` | Customer dashboard |
| `/admin` | Admin panel (role: ADMIN) |
| `/driver/login` | Driver login |
| `/driver/register` | Driver application |
| `/driver/dashboard` | Driver panel (role: DRIVER) |

---

## 🔑 Make Someone Admin

After registering a user, run in your database:
```sql
UPDATE User SET role = 'ADMIN' WHERE email = 'your@email.com';
```
Or via Prisma Studio:
```bash
npx prisma studio
```
