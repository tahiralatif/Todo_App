'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainCanvas from '@/components/layout/MainCanvas';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import CalendarView from '@/components/tasks/CalendarView';
import { GlassCard } from '@/components/ui/GlassCard';
import { apiClient } from '@/services/api-client';

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  tags?: string[];
}

const CalendarPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Tasks', href: '/tasks' },
    { label: 'Calendar', href: '/calendar' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Settings', href: '/settings' },
  ];

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      // Load tasks with due dates
      const response = await apiClient.getTasks({
        include_deleted: false,
        limit: 1000 // Load more tasks for calendar view
      });
      setTasks(response.tasks || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId: number, updates: any) => {
    try {
      await apiClient.patchTask(String(taskId), updates);
      await loadTasks(); // Reload tasks after update
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Filter tasks that have due dates
  const tasksWithDueDates = tasks.filter(task => task.due_date);

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
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                  Calendar
                </h1>
                <p className="text-gray-400 mt-1">
                  Schedule and manage your tasks by date
                </p>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-400">
                  Tasks with due dates: {tasksWithDueDates.length}
                </div>
                <div className="text-sm text-gray-400">
                  Total tasks: {tasks.length}
                </div>
              </div>
            </motion.div>

            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-gray-400 mt-4">Loading calendar...</p>
                    </div>
                  </div>
                ) : (
                  <CalendarView
                    tasks={tasksWithDueDates}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    onTaskUpdate={handleTaskUpdate}
                  />
                )}
              </GlassCard>
            </motion.div>

            {/* Selected Date Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Tasks for {selectedDate.toDateString()}
                </h3>

                <div className="space-y-3">
                  {tasks
                    .filter(task => {
                      if (!task.due_date) return false;
                      const taskDate = new Date(task.due_date);
                      return taskDate.toDateString() === selectedDate.toDateString();
                    })
                    .map(task => (
                      <div
                        key={task.id}
                        className={`p-4 rounded-lg border ${
                          task.completed
                            ? 'bg-green-500/10 border-green-500/20'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={(e) => handleTaskUpdate(task.id, { completed: e.target.checked })}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div>
                              <h4 className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                              )}
                              <div className="flex items-center space-x-2 mt-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                  task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {task.priority}
                                </span>
                                {task.category && (
                                  <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                                    {task.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                  {tasks.filter(task => {
                    if (!task.due_date) return false;
                    const taskDate = new Date(task.due_date);
                    return taskDate.toDateString() === selectedDate.toDateString();
                  }).length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-4xl mb-2">📅</div>
                      <p>No tasks scheduled for this date</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </MainCanvas>
    </ProtectedRoute>
  );
};

export default CalendarPage;