import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import argon2 from 'argon2';

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const ok = await argon2.verify(user.passwordHash, password);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role } as any;
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  }
});

