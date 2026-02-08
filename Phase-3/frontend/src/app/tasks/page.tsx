'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainCanvas from '@/components/layout/MainCanvas';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import ListView from '@/components/tasks/ListView';
import KanbanView from '@/components/tasks/KanbanView';
import TimelineView from '@/components/tasks/TimelineView';
import BulkOperations from '@/components/tasks/BulkOperations';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTaskStore } from '@/services/state/store';

const TasksPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const { currentView, setCurrentView, setSearchTerm: setGlobalSearchTerm } = useTaskStore();

  // Define sidebar items
  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Tasks', href: '/tasks' },
    { label: 'Calendar', href: '/calendar' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Settings', href: '/settings' },
  ];

  // Update global search term when local search term changes
  React.useEffect(() => {
    setGlobalSearchTerm(searchTerm);
  }, [searchTerm, setGlobalSearchTerm]);

  // Handle task selection
  const handleTaskSelect = (taskId: number, selected: boolean) => {
    setSelectedTasks(prev =>
      selected
        ? [...prev, taskId]
        : prev.filter(id => id !== taskId)
    );
  };

  const handleSelectAll = (taskIds: number[]) => {
    setSelectedTasks(taskIds);
  };

  const handleClearSelection = () => {
    setSelectedTasks([]);
  };

  const handleBulkUpdate = () => {
    // This will trigger a re-render and update the task list
    // The actual update is handled by the BulkOperations component
    // We just need to clear selection after successful operations
    setSelectedTasks([]);
  };

  // Component mapping for views
  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return <ListView selectedTasks={selectedTasks} onTaskSelect={handleTaskSelect} onSelectAll={handleSelectAll} />;
      case 'kanban':
        return <KanbanView />;
      case 'timeline':
        return <TimelineView />;
      default:
        return <ListView selectedTasks={selectedTasks} onTaskSelect={handleTaskSelect} onSelectAll={handleSelectAll} />;
    }
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
            {/* Bulk Operations */}
            <BulkOperations
              selectedTasks={selectedTasks}
              onClearSelection={handleClearSelection}
              onTasksUpdate={handleBulkUpdate}
            />

            {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Tasks
            </h1>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* View Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentView('list')}
                  className={`px-4 py-2 rounded-lg ${
                    currentView === 'list'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setCurrentView('kanban')}
                  className={`px-4 py-2 rounded-lg ${
                    currentView === 'kanban'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  Kanban
                </button>
                <button
                  onClick={() => setCurrentView('timeline')}
                  className={`px-4 py-2 rounded-lg ${
                    currentView === 'timeline'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  Timeline
                </button>
              </div>
            </div>
          </motion.div>

          {/* Task Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-4"
          >
            <GlassCard className="p-4 flex-1 min-w-[200px]">
              <h3 className="font-medium mb-2">Filters</h3>
              <div className="flex gap-2">
                <button className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded">
                  All
                </button>
                <button className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded">
                  Active
                </button>
                <button className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded">
                  Completed
                </button>
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex-1 min-w-[200px]">
              <h3 className="font-medium mb-2">Sort By</h3>
              <div className="flex gap-2">
                <button className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded">
                  Newest
                </button>
                <button className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded">
                  Due Date
                </button>
                <button className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded">
                  Priority
                </button>
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex-1 min-w-[200px]">
              <h3 className="font-medium mb-2">Actions</h3>
              <button className="w-full text-sm bg-gradient-to-r from-blue-500 to-teal-500 text-white px-3 py-1 rounded hover:opacity-90">
                Add Task
              </button>
            </GlassCard>
          </motion.div>

          {/* Task View */}
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentView()}
          </motion.div>
        </div>
      </div>
    </MainCanvas>
    </ProtectedRoute>
  );
};

export default TasksPage;