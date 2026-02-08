'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this to your backend
    console.log('Updated profile:', formData);
    setEditing(false);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      {/* Navigation */}
      <nav className={`${darkMode ? 'bg-slate-800/70' : 'bg-white/70'} backdrop-blur-md border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                  AI TaskBot
                </span>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <a href="/dashboard" className={`text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}>Dashboard</a>
                <a href="/profile" className="border-b-2 border-blue-500 text-sm font-medium text-blue-600 px-1 pt-1">Profile</a>
                <a href="/settings" className={`text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}>Settings</a>
              </div>
            </div>
            <div className="flex items-center">
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
                        logout();
                        router.push('/');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 border-2 border-white">
                ✏️
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-bold">{user?.name || 'User'}</h1>
          <p className={`mt-2 ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>{user?.email}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Menu */}
          <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'} shadow-lg`}>
            <h2 className="text-xl font-bold mb-6">Profile</h2>
            <ul className="space-y-2">
              <li><a href="/profile" className="block py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-teal-400 text-white">Profile</a></li>
              <li><a href="/settings" className={`block py-2 px-4 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>Account Settings</a></li>
              <li><a href="#" className={`block py-2 px-4 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>Security</a></li>
              <li><a href="#" className={`block py-2 px-4 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>Notifications</a></li>
            </ul>
          </div>

          {/* Profile Content */}
          <div className="md:col-span-2">
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'} shadow-lg`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Profile Information</h2>
                <button
                  onClick={() => editing ? handleSubmit(new Event('submit') as unknown as React.FormEvent) : setEditing(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editing ? 'Save' : 'Edit'}
                </button>
              </div>
              
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-slate-700/50 text-white' 
                          : 'bg-white text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-slate-700/50 text-white' 
                          : 'bg-white text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-slate-700/50 text-white' 
                          : 'bg-white text-gray-900'
                      }`}
                    />
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Full Name</h3>
                    <p className={`text-lg ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>{user?.name || formData.name}</p>
                  </div>
                  
                  <div>
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Email Address</h3>
                    <p className={`text-lg ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>{user?.email || formData.email}</p>
                  </div>
                  
                  <div>
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Bio</h3>
                    <p className={`text-lg ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>{user?.bio || formData.bio || 'No bio provided'}</p>
                  </div>
                  
                  <div>
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Member Since</h3>
                    <p className={`text-lg ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Section */}
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'} shadow-lg mt-8`}>
              <h2 className="text-xl font-bold mb-6">Your Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`text-center p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                  <div className="text-3xl font-bold text-blue-500">24</div>
                  <div className={`mt-2 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Total Tasks</div>
                </div>
                <div className={`text-center p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                  <div className="text-3xl font-bold text-green-500">18</div>
                  <div className={`mt-2 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Completed</div>
                </div>
                <div className={`text-center p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                  <div className="text-3xl font-bold text-yellow-500">4</div>
                  <div className={`mt-2 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Pending</div>
                </div>
              </div>
            </div>
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