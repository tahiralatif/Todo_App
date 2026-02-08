'use client';

import { useState, useEffect } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant for managing tasks. You can ask me to add, list, complete, or delete tasks.',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !isAuthenticated || !user) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the backend API to get AI response
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${user.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          message: inputValue,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error communicating with AI:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
                <a href="/" className="border-b-2 border-blue-500 text-sm font-medium text-blue-600 px-1 pt-1">Home</a>
                <a href="/about" className={`text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}>About</a>
                <a href="/features" className={`text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}>Features</a>
              </div>
            </div>
            <div className="flex items-center">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="relative group">
                    <button className="flex items-center space-x-2 focus:outline-none">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                      </div>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block z-50">
                      <div className="py-1">
                        <a href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</a>
                        <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                        <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                        <button 
                          onClick={() => {
                            localStorage.removeItem('access_token');
                            router.push('/');
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/login')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${darkMode ? 'text-white bg-slate-700 hover:bg-slate-600' : 'text-gray-700 bg-gray-200 hover:bg-gray-300'}`}
                  >
                    Sign In
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/signup')}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-blue-500 to-teal-400 text-white hover:opacity-90"
                  >
                    Sign Up
                  </motion.button>
                </div>
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="ml-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="block">Transform Your Tasks with</span>
              <span className="block bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">AI-Powered Intelligence</span>
            </motion.h1>
            <motion.p 
              className={`mt-3 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Experience the future of task management with our intelligent AI assistant that understands natural language commands.
            </motion.p>
            <motion.div 
              className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {!isAuthenticated ? (
                <div className="rounded-md shadow">
                  <button
                    onClick={() => router.push('/signup')}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-teal-400 hover:opacity-90 md:py-4 md:text-lg md:px-10"
                  >
                    Get started
                  </button>
                </div>
              ) : (
                <div className="rounded-md shadow">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-teal-400 hover:opacity-90 md:py-4 md:text-lg md:px-10"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      {isAuthenticated && (
        <motion.section 
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className={`rounded-2xl shadow-xl overflow-hidden ${darkMode ? 'bg-slate-800/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'}`}>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                AI Task Assistant
              </h2>
              
              {/* Messages Container */}
              <div className="h-96 overflow-y-auto mb-4 space-y-4 pr-2">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-teal-400 text-white'
                          : `${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'} text-white`
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        <span className="text-xs font-semibold mr-2">
                          {message.role === 'user' ? 'You' : 'AI Assistant'}
                        </span>
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p>{message.content}</p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className={`max-w-[80%] rounded-2xl p-4 ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'} text-white`}>
                      <div className="flex items-center mb-1">
                        <span className="text-xs font-semibold mr-2">AI Assistant</span>
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-white animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-white animate-bounce delay-100"></div>
                        <div className="w-2 h-2 rounded-full bg-white animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="mt-auto">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me to manage your tasks (e.g. 'Add a task to buy groceries')..."
                    className={`flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-slate-700/50 text-white placeholder-slate-400' 
                        : 'bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
                <p className={`text-xs mt-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Examples: "Add a task to call mom", "Show my tasks", "Mark task 1 as complete"
                </p>
              </form>
            </div>
          </div>
        </motion.section>
      )}

      {/* Features Section */}
      <motion.section 
        className="relative z-10 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className={`text-base text-indigo-600 font-semibold tracking-wide uppercase ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight sm:text-4xl">
              Everything you need to boost productivity
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {[
                {
                  title: 'AI-Powered Assistance',
                  description: 'Our intelligent AI understands natural language commands to manage your tasks effortlessly.',
                  icon: '🤖'
                },
                {
                  title: 'Smart Organization',
                  description: 'Automatically categorize and prioritize your tasks based on context and importance.',
                  icon: '📊'
                },
                {
                  title: 'Real-time Sync',
                  description: 'Access your tasks from anywhere with seamless synchronization across all devices.',
                  icon: '🔄'
                },
                {
                  title: 'Secure & Private',
                  description: 'Your data is encrypted and stored securely with privacy as our top priority.',
                  icon: '🔒'
                }
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className={`p-6 rounded-xl ${darkMode ? 'bg-slate-800/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'} shadow-lg`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 * index }}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-500 to-teal-400 text-white text-xl">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium">{feature.title}</h3>
                      <p className={`mt-2 ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className={`relative z-10 ${darkMode ? 'bg-slate-800' : 'bg-gray-100'} border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
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