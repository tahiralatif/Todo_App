'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState('list');

  // Mock data for tasks
  const tasks = [
    { id: 1, title: 'Buy groceries', description: 'Milk, eggs, bread', completed: false, priority: 'high', dueDate: '2026-02-10' },
    { id: 2, title: 'Call mom', description: 'Schedule doctor appointment', completed: true, priority: 'medium', dueDate: '2026-02-05' },
    { id: 3, title: 'Finish project', description: 'Complete the AI chatbot implementation', completed: false, priority: 'high', dueDate: '2026-02-15' },
    { id: 4, title: 'Team meeting', description: 'Weekly sync with the team', completed: false, priority: 'medium', dueDate: '2026-02-09' },
  ];

  const stats = {
    totalTasks: 24,
    completed: 18,
    pending: 4,
    productivity: 92
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
                <a href="/dashboard" className="border-b-2 border-blue-500 text-sm font-medium text-blue-600 px-1 pt-1">Dashboard</a>
                <a href="/profile" className={`text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}>Profile</a>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className={`mt-2 ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>
              Welcome back, {user?.name || user?.email?.split('@')[0]}! Here's what's happening today.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button
              onClick={() => setCurrentView('list')}
              className={`px-4 py-2 rounded-lg ${
                currentView === 'list'
                  ? 'bg-gradient-to-r from-blue-500 to-teal-400 text-white'
                  : darkMode 
                    ? 'bg-slate-700 text-white hover:bg-slate-600' 
                    : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setCurrentView('kanban')}
              className={`px-4 py-2 rounded-lg ${
                currentView === 'kanban'
                  ? 'bg-gradient-to-r from-blue-500 to-teal-400 text-white'
                  : darkMode 
                    ? 'bg-slate-700 text-white hover:bg-slate-600' 
                    : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setCurrentView('timeline')}
              className={`px-4 py-2 rounded-lg ${
                currentView === 'timeline'
                  ? 'bg-gradient-to-r from-blue-500 to-teal-400 text-white'
                  : darkMode 
                    ? 'bg-slate-700 text-white hover:bg-slate-600' 
                    : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'} shadow-lg`}>
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-blue-500">{stats.totalTasks}</h3>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Tasks</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'} shadow-lg`}>
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500/10 text-green-500">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-green-500">{stats.completed}</h3>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Completed</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'} shadow-lg`}>
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-500">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-yellow-500">{stats.pending}</h3>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Pending</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'} shadow-lg`}>
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-purple-500">{stats.productivity}%</h3>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Productivity</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Task Views */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'} shadow-lg mb-8`}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Your Tasks</h2>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-lg hover:opacity-90 transition-opacity">
              Add Task
            </button>
          </div>
          
          {/* Task List View */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>Task</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>Priority</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>Due Date</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>Status</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 dark:divide-slate-700 ${darkMode ? 'bg-slate-800/50' : 'bg-white/50'}`}>
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={task.completed}
                          className="h-4 w-4 text-blue-500 rounded focus:ring-blue-500"
                        />
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : darkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                            {task.title}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            {task.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.priority === 'high' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200' 
                          : task.priority === 'medium' 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-200' 
                            : 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200'
                      }`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.completed 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-200'
                      }`}>
                        {task.completed ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mr-3">Edit</button>
                      <button className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'} shadow-lg`}
        >
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className={`p-4 rounded-lg flex flex-col items-center justify-center ${
              darkMode 
                ? 'bg-slate-700/50 hover:bg-slate-600/50' 
                : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors`}>
              <span className="text-2xl mb-2">➕</span>
              <span>Add Task</span>
            </button>
            <button className={`p-4 rounded-lg flex flex-col items-center justify-center ${
              darkMode 
                ? 'bg-slate-700/50 hover:bg-slate-600/50' 
                : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors`}>
              <span className="text-2xl mb-2">📅</span>
              <span>Schedule</span>
            </button>
            <button className={`p-4 rounded-lg flex flex-col items-center justify-center ${
              darkMode 
                ? 'bg-slate-700/50 hover:bg-slate-600/50' 
                : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors`}>
              <span className="text-2xl mb-2">🔔</span>
              <span>Reminders</span>
            </button>
            <button className={`p-4 rounded-lg flex flex-col items-center justify-center ${
              darkMode 
                ? 'bg-slate-700/50 hover:bg-slate-600/50' 
                : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors`}>
              <span className="text-2xl mb-2">📊</span>
              <span>Reports</span>
            </button>
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