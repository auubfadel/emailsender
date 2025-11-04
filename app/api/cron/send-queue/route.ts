import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEnv } from '@/lib/env';
import { createBucket, tryRemoveToken } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function GET() {
  const env = getEnv();
  createBucket('send', env.SEND_RATE_PER_SEC, env.SEND_RATE_PER_SEC);

  const queued = await prisma.sendJob.findMany({
    where: { status: 'QUEUED' },
    take: env.SEND_RATE_PER_SEC * 2,
    orderBy: { createdAt: 'asc' },
    include: { campaign: { include: { template: true } }, subscriber: true }
  });

  let sent = 0;
  for (const job of queued) {
    if (!tryRemoveToken('send')) break;

    // suppression check
    const suppressed = await prisma.suppression.findUnique({ where: { email: job.subscriber.email } });
    if (suppressed) {
      await prisma.sendJob.update({ where: { id: job.id }, data: { status: 'SUPPRESSED' } });
      continue;
    }

    try {
      const html = job.campaign.template.html.replaceAll('{{firstName}}', job.subscriber.firstName ?? '');
      const text = job.campaign.template.text ?? undefined;
      const messageId = await sendEmail({
        to: job.subscriber.email,
        subject: job.campaign.subject,
        html,
        text,
        fromName: job.campaign.fromName,
        fromEmail: job.campaign.fromEmail,
        replyTo: job.campaign.replyTo ?? undefined
      });
      await prisma.sendJob.update({ where: { id: job.id }, data: { status: 'SENT', messageId: messageId ?? undefined } });
      sent += 1;
    } catch (err) {
      await prisma.sendJob.update({ where: { id: job.id }, data: { status: 'FAILED', error: 'SEND_ERROR' } });
      await prisma.log.create({ data: { type: 'error', message: 'send-failed', meta: { jobId: job.id } } });
    }
  }

  return NextResponse.json({ processed: queued.length, sent });
}

