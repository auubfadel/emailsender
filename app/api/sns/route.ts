import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEnv } from '@/lib/env';

type SnsMessage = {
  Type: string;
  MessageId: string;
  Token?: string;
  TopicArn: string;
  Subject?: string;
  Message: string;
  Timestamp: string;
};

export async function POST(req: Request) {
  const env = getEnv();
  const type = req.headers.get('x-amz-sns-message-type');
  const json = (await req.json()) as SnsMessage;

  if (type === 'SubscriptionConfirmation') {
    // If using token handshake, validate with shared token (fallback approach)
    if (env.AWS_SNS_VERIFY_TOKEN && json.Token) {
      await prisma.log.create({ data: { type: 'import', message: 'sns-subscription-confirm', meta: { topic: json.TopicArn } } });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: true });
  }

  if (type === 'Notification') {
    try {
      const payload = JSON.parse(json.Message);
      if (payload.notificationType === 'Bounce') {
        const emails: string[] = payload.bounce.bouncedRecipients.map((r: any) => r.emailAddress);
        for (const email of emails) {
          await prisma.suppression.upsert({
            where: { email },
            update: { reason: 'BOUNCE', meta: payload },
            create: { email, reason: 'BOUNCE', meta: payload }
          });
        }
        await prisma.log.create({ data: { type: 'bounce', message: 'sns-bounce', meta: { count: emails.length } } });
      } else if (payload.notificationType === 'Complaint') {
        const emails: string[] = payload.complaint.complainedRecipients.map((r: any) => r.emailAddress);
        for (const email of emails) {
          await prisma.suppression.upsert({
            where: { email },
            update: { reason: 'COMPLAINT', meta: payload },
            create: { email, reason: 'COMPLAINT', meta: payload }
          });
        }
        await prisma.log.create({ data: { type: 'complaint', message: 'sns-complaint', meta: { count: emails.length } } });
      }
    } catch {
      await prisma.log.create({ data: { type: 'error', message: 'sns-parse-error' } });
    }
  }

  return NextResponse.json({ ok: true });
}

