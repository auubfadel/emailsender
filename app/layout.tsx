import '@/app/globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'EmailSender',
  description: 'Email campaigns with SES'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

