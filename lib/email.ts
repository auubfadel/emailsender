import nodemailer, { type Transporter } from 'nodemailer';
import { getEnv } from '@/lib/env';

let cachedTransporter: Transporter | null = null;

export function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;
  const env = getEnv();

  const secure = Boolean(env.SMTP_SECURE);
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });

  cachedTransporter = transporter;
  return transporter;
}

export type SendEmailParams = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
};

export async function sendEmail(params: SendEmailParams): Promise<string | null> {
  const env = getEnv();
  const transporter = getTransporter();
  const fromName = params.fromName ?? env.DEFAULT_FROM_NAME;
  const fromEmail = params.fromEmail ?? env.DEFAULT_FROM_EMAIL;
  const replyTo = params.replyTo ?? env.DEFAULT_REPLY_TO;

  const result = await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    replyTo
  });

  return result.messageId ?? null;
}

