'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/50 bg-[#0B0F14]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold mb-4 inline-block">
            Execute<span className="text-teal-500">.</span>
          </Link>
          <p className="text-slate-400 mb-6">
            Structured execution system for focused builders and modern teams.
          </p>
          <p className="text-slate-400 text-sm">
            © 2026 Execute. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
