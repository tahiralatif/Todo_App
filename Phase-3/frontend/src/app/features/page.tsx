'use client';

import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { useState } from 'react';

export default function FeaturesPage() {
  const [darkMode, setDarkMode] = useState(true);

  // Initialize particles
  const particlesInit = async (main: any) => {
    await loadFull(main);
  };

  const particlesLoaded = (container: any) => {};

  // Particle options
  const particlesOptions = {
    preset: "stars",
    background: {
      color: {
        value: darkMode ? "#0f172a" : "#f1f5f9",
      },
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: ["#ff5555", "#55ff55", "#5555ff", "#ffff55", "#ff55ff"],
      },
      move: {
        enable: true,
        speed: 0.5,
        direction: "none",
        random: true,
        straight: false,
        outModes: {
          default: "out",
        },
      },
      number: {
        density: {
          enable: true,
          area: 1000,
        },
        value: 50,
      },
      opacity: {
        value: 0.5,
        random: true,
      },
      size: {
        value: { min: 1, max: 3 },
        random: true,
      },
    },
    detectRetina: true,
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      {/* Background Particles */}
      <div className="fixed inset-0 z-0">
        <Particles
          id="tsparticles"
          init={particlesInit}
          loaded={particlesLoaded}
          options={particlesOptions}
        />
      </div>

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
                <a href="/features" className="border-b-2 border-blue-500 text-sm font-medium text-blue-600 px-1 pt-1">Features</a>
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
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
            <span className="block bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">Powerful Features</span>
          </h1>
          <p className={`mt-4 text-xl max-w-2xl mx-auto ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>
            Everything you need to boost your productivity with AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "AI-Powered Assistance",
              description: "Our intelligent AI understands natural language commands to manage your tasks effortlessly.",
              icon: "🤖",
              features: [
                "Natural language processing",
                "Context-aware task management",
                "Smart suggestions",
                "Voice command support"
              ]
            },
            {
              title: "Smart Organization",
              description: "Automatically categorize and prioritize your tasks based on context and importance.",
              icon: "📊",
              features: [
                "Automatic prioritization",
                "Smart categorization",
                "Deadline detection",
                "Dependency mapping"
              ]
            },
            {
              title: "Real-time Sync",
              description: "Access your tasks from anywhere with seamless synchronization across all devices.",
              icon: "🔄",
              features: [
                "Cross-platform sync",
                "Offline access",
                "Instant updates",
                "Multi-device support"
              ]
            },
            {
              title: "Secure & Private",
              description: "Your data is encrypted and stored securely with privacy as our top priority.",
              icon: "🔒",
              features: [
                "End-to-end encryption",
                "Privacy by design",
                "GDPR compliant",
                "Regular security audits"
              ]
            },
            {
              title: "Collaboration Tools",
              description: "Share tasks and collaborate with your team seamlessly.",
              icon: "👥",
              features: [
                "Team task sharing",
                "Real-time collaboration",
                "Permission controls",
                "Activity tracking"
              ]
            },
            {
              title: "Advanced Analytics",
              description: "Gain insights into your productivity patterns and optimize your workflow.",
              icon: "📈",
              features: [
                "Productivity reports",
                "Time tracking",
                "Pattern analysis",
                "Performance metrics"
              ]
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'} shadow-xl`}
            >
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-500 to-teal-400 text-white text-2xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold ml-4">{feature.title}</h3>
              </div>
              <p className={`mb-4 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.features.map((item, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span>
                    <span className={`${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Productivity?</h2>
          <p className={`text-lg max-w-2xl mx-auto mb-8 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
            Join thousands of users who have revolutionized their task management with AI TaskBot.
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="/signup" 
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Started Free
            </a>
            <a 
              href="/demo" 
              className={`px-6 py-3 rounded-lg border ${darkMode ? 'border-slate-600 text-white hover:bg-slate-700/50' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            >
              Watch Demo
            </a>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className={`relative z-10 ${darkMode ? 'bg-slate-800' : 'bg-gray-100'} border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'} mt-20`}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start space-x-6">
              <a href="/about" className={`text-base ${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-600'}`}>
                About
              </a>
              <a href="/privacy" className={`text-base ${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-600'}`}>
                Privacy
              </a>
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