'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false
    });
    if (res?.error) {
      setError('Invalid credentials');
    } else {
      const next = search.get('next') || '/dashboard';
      router.replace(next);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-lg border p-6">
        <h1 className="text-xl font-semibold">Sign in</h1>
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <div className="space-y-1">
          <label className="text-sm">Email</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="w-full rounded-md bg-black text-white py-2">Sign in</button>
      </form>
    </main>
  );
}

