import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QuickFever URL Shortener | go.quickfever.com',
  description: 'Fast, powerful, branded URL shortener & redirect manager for QuickFever. Create custom short links, track clicks, generate QR codes, and edit destination links effortlessly on Vercel.',
  keywords: ['URL Shortener', 'QuickFever', 'go.quickfever.com', 'Link Management', 'Vercel Shortener', 'Custom Domain'],
  authors: [{ name: 'QuickFever' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#090c15" />
      </head>
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        <div className="bg-mesh" />
        {children}
      </body>
    </html>
  );
}
