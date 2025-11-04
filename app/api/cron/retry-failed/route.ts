import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const failed = await prisma.sendJob.findMany({
    where: { status: 'FAILED' },
    take: 100,
    orderBy: { updatedAt: 'asc' }
  });

  for (const job of failed) {
    // Simple backoff: ensure at least 5 minutes since last attempt
    const minutes = (Date.now() - new Date(job.updatedAt).getTime()) / 60000;
    if (minutes < 5) continue;
    await prisma.sendJob.update({ where: { id: job.id }, data: { status: 'QUEUED', error: null } });
  }

  return NextResponse.json({ retried: failed.length });
}

