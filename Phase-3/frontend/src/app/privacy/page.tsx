'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      {/* Navigation */}
      <nav className={`${darkMode ? 'bg-slate-800/70' : 'bg-white/70'} backdrop-blur-md border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div 
                className="flex-shrink-0 flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                  AI TaskBot
                </span>
              </motion.div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <a href="/" className={`text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}>Home</a>
                <a href="/about" className={`text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}>About</a>
                <a href="/privacy" className="border-b-2 border-blue-500 text-sm font-medium text-blue-600 px-1 pt-1">Privacy</a>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
            <span className="block bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">Privacy Policy</span>
          </h1>
          <p className={`mt-4 text-xl max-w-2xl mx-auto ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>
            How we collect, use, and protect your information
          </p>
        </motion.div>

        <div className={`rounded-2xl p-8 ${darkMode ? 'bg-slate-800/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'} shadow-xl`}>
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
            <p className={`mb-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              We collect information you provide directly to us, such as when you create an account, use our services, or communicate with us.
            </p>
            
            <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
            <p className={`mb-4 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              When you register for an account, we may collect your name, email address, and other identifying information.
            </p>
            
            <h3 className="text-xl font-semibold mb-2">Usage Information</h3>
            <p className={`mb-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              We collect information about how you use our services, including your interactions with our AI assistant and task management features.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">How We Use Your Information</h2>
            <p className={`mb-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              We use the information we collect to provide, maintain, and improve our services, including:
            </p>
            <ul className={`list-disc pl-6 mb-6 space-y-2 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              <li>Providing and improving our AI-powered task management services</li>
              <li>Communicating with you about your account and our services</li>
              <li>Protecting the security and integrity of our services</li>
              <li>Complying with legal obligations</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Data Security</h2>
            <p className={`mb-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Your Rights</h2>
            <p className={`mb-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              You have the right to access, update, or delete your personal information at any time. You can do this by visiting your account settings or contacting us directly.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Contact Us</h2>
            <p className={`mb-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              If you have questions about this privacy policy, please contact us at privacy@aitaskbot.com.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`relative z-10 ${darkMode ? 'bg-slate-800' : 'bg-gray-100'} border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'} mt-20`}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start space-x-6">
              <a href="/about" className={`text-base ${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-600'}`}>
                About
              </a>
              <a href="/privacy" className="text-base text-blue-600 font-medium">Privacy</a>
              <a href="/terms" className={`text-base ${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-600'}`}>
                Terms
              </a>
            </div>
            <div className="mt-8 md:mt-0 flex justify-center md:justify-end">
              <p className={`${darkMode ? 'text-slate-400' : 'text-gray-500'} text-base`}>
                &copy; 2026 AI TaskBot. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}