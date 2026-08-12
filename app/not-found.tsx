'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Link2Off, ArrowLeft, Globe, HelpCircle } from 'lucide-react';

function NotFoundContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const reason = searchParams.get('reason');

  let title = 'Short Link Not Found';
  let message = 'The requested short link does not exist or may have been deleted.';

  if (reason === 'disabled') {
    title = 'Short Link Deactivated';
    message = 'This link has been temporarily disabled by the administrator.';
  } else if (reason === 'expired') {
    title = 'Short Link Expired';
    message = 'This link had an expiration date set and is no longer valid.';
  }

  return (
    <div className="glass-card max-w-lg w-full p-8 text-center space-y-6 border border-white/10 shadow-2xl">
      <div className="w-20 h-20 mx-auto bg-amber-500/10 text-amber-400 rounded-3xl flex items-center justify-center border border-amber-500/20">
        <Link2Off className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white">{title}</h1>
        {slug && (
          <p className="inline-block px-3 py-1 bg-white/5 rounded-full text-indigo-400 font-mono text-sm border border-indigo-500/20">
            go.quickfever.com/{slug}
          </p>
        )}
        <p className="text-gray-400 text-sm max-w-md mx-auto pt-2">{message}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <a
          href="https://quickfever.com"
          target="_blank"
          rel="noreferrer"
          className="btn-cyan py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm"
        >
          <Globe className="w-4 h-4" />
          <span>Visit QuickFever.com</span>
        </a>

        <Link
          href="/"
          className="px-6 py-3 rounded-xl font-semibold text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
      </div>

      <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-1.5 text-xs text-gray-500">
        <HelpCircle className="w-3.5 h-3.5" />
        <span>If you believe this is an error, please contact the site admin.</span>
      </div>
    </div>
  );
}

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="glass-card p-8 text-center text-gray-400">Loading...</div>
      }>
        <NotFoundContent />
      </Suspense>
    </main>
  );
}
