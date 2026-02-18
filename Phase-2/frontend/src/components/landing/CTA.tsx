'use client';

import Link from 'next/link';

export default function CTA() {
  return (
    <section className="py-32">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-6xl lg:text-7xl font-bold mb-6">
          Execute with
          <br />
          <span className="text-teal-500">Clarity</span>
        </h2>
        
        <p className="text-xl text-slate-400 mb-12">
          Join thousands of builders who've transformed their productivity.
        </p>

        <Link
          href="/signup"
          className="inline-block px-10 py-5 bg-teal-600 hover:bg-teal-500 rounded-xl font-semibold text-lg transition-all shadow-2xl shadow-teal-500/30"
        >
          Get Started Free
        </Link>
      </div>
    </section>
  );
}
