'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import MainCanvas from '@/components/layout/MainCanvas';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <MainCanvas>
      <div className="min-h-screen flex flex-col">
        {/* Navigation Header */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="flex justify-between items-center p-6"
        >
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Todo App
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </motion.header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-teal-500 to-purple-400 bg-clip-text text-transparent">
                Master Your Tasks
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Experience premium task management with cinematic depth design,
                smooth animations, and intuitive productivity tools.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              {!isAuthenticated && (
                <>
                  <Link
                    href="/signup"
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white text-lg font-medium rounded-xl hover:opacity-90 transition-opacity transform hover:scale-105"
                  >
                    Start Free Trial
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-lg font-medium rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white text-lg font-medium rounded-xl hover:opacity-90 transition-opacity transform hover:scale-105"
                >
                  Go to Dashboard
                </Link>
              )}
            </motion.div>

            {/* Feature Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2">Smart Organization</h3>
                <p className="text-gray-400">
                  Organize tasks with multiple views: list, kanban, timeline, and calendar.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">Productivity Analytics</h3>
                <p className="text-gray-400">
                  Track your productivity with detailed analytics and progress insights.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                <div className="text-3xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold mb-2">Beautiful Design</h3>
                <p className="text-gray-400">
                  Experience premium UI with glassmorphism effects and smooth animations.
                </p>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-gray-500 border-t border-white/10">
          <p>© 2026 Todo App. Premium task management for modern professionals.</p>
        </footer>
      </div>
    </MainCanvas>
  );
}