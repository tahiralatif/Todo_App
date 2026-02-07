'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainCanvas from '@/components/layout/MainCanvas';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload';
import { GlassCard } from '@/components/ui/GlassCard';
import { usePreferences } from '@/services/utils/preferences';

const SettingsPage = () => {
  const [preferences, updatePreferences] = usePreferences();

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Tasks', href: '/tasks' },
    { label: 'Calendar', href: '/calendar' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Settings', href: '/settings' },
  ];

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    updatePreferences({ theme });
  };

  const handleViewModeChange = (mode: 'list' | 'kanban' | 'timeline') => {
    updatePreferences({ viewMode: mode });
  };

  const handleFontSizeChange = (size: 'small' | 'normal' | 'large') => {
    updatePreferences({ fontSize: size });
  };

  const handleReducedMotionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePreferences({ reducedMotion: e.target.checked });
  };

  const handleNotificationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePreferences({ notificationsEnabled: e.target.checked });
  };

  return (
    <ProtectedRoute>
      <MainCanvas>
        <Navbar />
        <div className="flex h-full pt-16">
          {/* Sidebar */}
          <div className="hidden md:block w-64 mr-4">
            <Sidebar items={sidebarItems} title="Todo App" />
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center"
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                Settings
              </h1>
            </motion.div>

          {/* Profile Photo Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-2 mb-6"
          >
            <ProfilePhotoUpload />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appearance Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Appearance</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Theme</label>
                    <div className="flex space-x-4">
                      {(['light', 'dark', 'auto'] as const).map((theme) => (
                        <button
                          key={theme}
                          onClick={() => handleThemeChange(theme)}
                          className={`px-4 py-2 rounded-lg capitalize ${
                            preferences.theme === theme
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Font Size</label>
                    <div className="flex space-x-4">
                      {(['small', 'normal', 'large'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => handleFontSizeChange(size)}
                          className={`px-4 py-2 rounded-lg capitalize ${
                            preferences.fontSize === size
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Default View</label>
                    <div className="flex space-x-4">
                      {(['list', 'kanban', 'timeline'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => handleViewModeChange(mode)}
                          className={`px-4 py-2 rounded-lg capitalize ${
                            preferences.viewMode === mode
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Accessibility & Behavior */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Accessibility & Behavior</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium">Reduced Motion</label>
                      <p className="text-xs text-gray-400">Minimize animations</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.reducedMotion}
                        onChange={handleReducedMotionChange}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium">Notifications</label>
                      <p className="text-xs text-gray-400">Enable desktop notifications</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.notificationsEnabled}
                        onChange={handleNotificationsChange}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-lg font-medium mb-2">Language</h3>
                    <select className="w-full p-2 bg-white/10 rounded-lg border border-white/20">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Account Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Account Settings</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <input
                      type="text"
                      defaultValue="john_doe"
                      className="w-full p-2 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="john@example.com"
                      className="w-full p-2 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full p-2 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full p-2 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity">
                    Save Changes
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </MainCanvas>
    </ProtectedRoute>
  );
};

export default SettingsPage;