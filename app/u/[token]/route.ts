import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const token = params.token;
  // Token is expected to be a base64 of subscriber id with HMAC in a production app.
  // For initial version: treat token as subscriberId directly.
  try {
    await prisma.subscriber.update({ where: { id: token }, data: { status: 'UNSUBSCRIBED' } });
    await prisma.log.create({ data: { type: 'import', message: 'unsubscribe', meta: { subscriberId: token } } });
  } catch {
    // ignore
  }
  return NextResponse.redirect(new URL('/unsubscribed', 'https://placeholder.local').toString(), { status: 302 });
}

