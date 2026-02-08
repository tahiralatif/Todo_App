'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteAccount = async () => {
    if (password !== confirmPassword) {
      setDeleteError('Passwords do not match');
      return;
    }

    try {
      // In a real app, you would call your backend API to delete the account
      // For now, we'll just clear the local storage and redirect
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Log out the user
      logout();
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      setDeleteError('Failed to delete account. Please try again.');
    }
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
                <a href="/profile" className={`text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}>Profile</a>
                <a href="/settings" className="border-b-2 border-blue-500 text-sm font-medium text-blue-600 px-1 pt-1">Settings</a>
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
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className={`mt-2 ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>
            Manage your account preferences and security settings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Settings Menu */}
          <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'} shadow-lg`}>
            <h2 className="text-xl font-bold mb-6">Settings</h2>
            <ul className="space-y-2">
              <li><a href="/profile" className={`block py-2 px-4 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>Profile</a></li>
              <li><a href="/settings" className="block py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-teal-400 text-white">Account Settings</a></li>
              <li><a href="#" className={`block py-2 px-4 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>Security</a></li>
              <li><a href="#" className={`block py-2 px-4 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>Notifications</a></li>
              <li><a href="#" className={`block py-2 px-4 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>Billing</a></li>
            </ul>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-2">
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'} shadow-lg mb-8`}>
              <h2 className="text-xl font-bold mb-6">General Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Theme
                  </label>
                  <div className="flex items-center">
                    <span className={`mr-3 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Light</span>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${darkMode ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`ml-3 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Dark</span>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Language
                  </label>
                  <select
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-slate-700/50 text-white' 
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Timezone
                  </label>
                  <select
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-slate-700/50 text-white' 
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    <option>(GMT-05:00) Eastern Time</option>
                    <option>(GMT-08:00) Pacific Time</option>
                    <option>(GMT+00:00) London</option>
                    <option>(GMT+09:00) Tokyo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Deletion Section */}
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-red-900/20 backdrop-blur-md' : 'bg-red-50 backdrop-blur-md'} shadow-lg`}>
              <h2 className="text-xl font-bold mb-2 text-red-500">Danger Zone</h2>
              <p className={`mb-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl p-6 w-full max-w-md ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-xl`}
          >
            <h3 className="text-xl font-bold mb-4">Confirm Account Deletion</h3>
            <p className={`mb-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              Are you sure you want to delete your account? This will permanently remove all your data including tasks, conversations, and settings. This action cannot be undone.
            </p>
            
            {deleteError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {deleteError}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-slate-700/50 text-white' 
                      : 'bg-white text-gray-900'
                  }`}
                  placeholder="Your password"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-slate-700/50 text-white' 
                      : 'bg-white text-gray-900'
                  }`}
                  placeholder="Confirm your password"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`px-4 py-2 rounded-lg ${
                  darkMode 
                    ? 'bg-slate-600 text-white hover:bg-slate-500' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </motion.div>
        </div>
      )}

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