import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Patch Notes — AI-powered release notes from Git',
  description:
    'Turn a messy week of Git commits into human-readable release notes automatically. Powered by Gemini.',
  keywords: ['patch notes', 'release notes', 'git', 'AI', 'developer tools'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} font-mono antialiased bg-[#0a0a0a] text-[#e8e8e8]`}
      >
        {children}
      </body>
    </html>
  );
}
