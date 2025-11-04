# emailsender

Production-ready email campaign app using Next.js (App Router), TypeScript, Prisma + Postgres, NextAuth (credentials), and Amazon SES via SMTP.

## Features
- Auth with credentials (argon2) and JWT sessions
- Dashboard with overview cards
- Templates CRUD
- Lists & Subscribers CRUD and CSV import (Papaparse)
- Campaigns: test send and full send with throttling
- SNS webhook for bounces/complaints → suppression list
- Unsubscribe route `/u/[token]`
- Logs browser
- Cron jobs via Vercel `vercel.json`

## Tech
- Next.js 14 App Router, TypeScript
- Tailwind CSS (+ minimal shadcn-like primitives)
- Prisma + Vercel Postgres
- NextAuth v5
- Nodemailer (SES SMTP)

## Env Setup
Copy `.env.local.example` to `.env.local` and fill values.

Required vars:
- DATABASE_URL
- NEXTAUTH_URL, NEXTAUTH_SECRET
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE
- DEFAULT_FROM_NAME, DEFAULT_FROM_EMAIL, DEFAULT_REPLY_TO
- SEND_RATE_PER_SEC, MAX_CONCURRENCY
- AWS_SNS_VERIFY_TOKEN
- PUBLIC_SIGNUP_ENABLED

## Local Development
```bash
npm i
npm run dev
```

Run Prisma:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

## Deploy to Vercel
- Push to GitHub `auubfadel/emailsender`
- Import repo in Vercel, add env vars
- `vercel.json` provides cron schedules
- Create SES SMTP credentials, verify domain, set SPF/DKIM
- Create SNS subscription (HTTPS) pointing at `/api/sns`

## DKIM/SPF
- Set SPF `v=spf1 include:amazonses.com ~all`
- Add DKIM CNAMEs from SES

## Using the App
1. Register first user, set role to ADMIN (manually via DB or a seed) if needed
2. Create a template
3. Create a list and import subscribers via CSV
4. Create a campaign, send test, then queue for send
5. Monitor logs; SNS will auto-suppress on bounce/complaint

## Cron Endpoints
- `/api/cron/send-queue` every minute
- `/api/cron/retry-failed` every 15 minutes

## Notes
- Logs redact secrets by design; avoid logging SMTP creds
- Rate limiting uses in-process token bucket
- Add Redis for distributed rate limit if needed
# Email Sender Web App

A minimal web application to send emails via SMTP using Node.js, Express (for local dev), and a Vercel Serverless Function in production.

## Features
- Simple UI to compose emails (To, Subject, Plain text or HTML)
- Email endpoint at `/api/send` (serverless on Vercel)
- Configurable via environment variables

## Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy and edit env file:
   ```bash
   cp env.example .env
   # Fill SMTP_* and MAIL_FROM
   ```
3. Start local server for the static UI (served by Express in `server.js`):
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`.

## API
- POST `/api/send`
  - Request JSON body:
    ```json
    {
      "to": "recipient@example.com, other@domain.com",
      "subject": "Hello",
      "text": "Plain text message (optional if html provided)",
      "html": "<p>HTML message (optional if text provided)</p>",
      "fromName": "Your Name (optional)",
      "replyTo": "reply@domain.com (optional)"
    }
    ```
  - Response 200:
    ```json
    { "messageId": "...", "accepted": ["..."], "rejected": [] }
    ```
  - Response 400/500 with `{ error, details }` on failure.

## Environment Variables
Set these locally in `.env` and on Vercel Project Settings → Environment Variables:
- `SMTP_HOST`
- `SMTP_PORT` (e.g. 465 or 587)
- `SMTP_SECURE` (`true` for 465, `false` for 587)
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM` (optional; defaults to `SMTP_USER`)
- `PORT` (local only; default 3000)

## Deploy to Vercel
This repo includes `api/send.js` (serverless function) and `vercel.json`.

Steps:
1. Push this project to a Git repository (GitHub, GitLab, Bitbucket).
2. In Vercel, import the repository as a new Project.
3. Configure Environment Variables listed above.
4. Deploy. The UI will be served from `public/` and the API is at `/api/send`.

## Notes
- Gmail usually requires an App Password and SMTP over port 465 (secure=true).
- If CORS is needed for external clients, configure it at the edge (Vercel) or add logic in the serverless function.

## License
MIT
