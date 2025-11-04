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
