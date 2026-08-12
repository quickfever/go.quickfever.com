'use client';

import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';

export default function PasswordProtectedPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the password');
      return;
    }

    // Redirect to slug with password param
    window.location.href = `/${slug}?pwd=${encodeURIComponent(password)}`;
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 text-center space-y-6 border border-white/10 shadow-2xl">
        <div className="w-16 h-16 mx-auto bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/30">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Password Protected Link</h1>
          <p className="text-gray-400 text-sm">
            The link <span className="text-indigo-400 font-mono font-semibold">go.quickfever.com/{slug}</span> requires a password to access.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Enter link password..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full glass-input px-4 py-3 rounded-xl text-center text-lg placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 transition-all"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-rose-400 text-sm bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              <ShieldAlert className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full btn-gradient py-3.5 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 group transition-all"
          >
            <span>Unlock Link</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="pt-4 border-t border-white/5">
          <p className="text-xs text-gray-500">
            Powered by <span className="text-gray-400 font-medium">QuickFever URL Shortener</span>
          </p>
        </div>
      </div>
    </main>
  );
}
