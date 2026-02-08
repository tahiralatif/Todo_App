'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import { GlassCard } from '../ui/GlassCard';
import { useTaskStore } from '@/services/state/store';

interface TimelineViewProps {
  className?: string;
}

const TimelineView: React.FC<TimelineViewProps> = ({ className = '' }) => {
  const { getFilteredTasks } = useTaskStore();
  const tasks = getFilteredTasks();

  // Group tasks by date
  const groupedTasks = tasks.reduce((acc: Record<string, typeof tasks>, task) => {
    if (!task.dueDate) {
      const noDateKey = 'No Due Date';
      acc[noDateKey] = acc[noDateKey] || [];
      acc[noDateKey].push(task);
    } else {
      const date = new Date(task.dueDate).toDateString();
      acc[date] = acc[date] || [];
      acc[date].push(task);
    }
    return acc;
  }, {});

  // Sort dates chronologically
  const sortedDates = Object.keys(groupedTasks).sort((a, b) => {
    if (a === 'No Due Date') return 1;
    if (b === 'No Due Date') return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <div className={`w-full ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Timeline View</h2>

      {sortedDates.length > 0 ? (
        <div className="space-y-8">
          {sortedDates.map((date, dateIndex) => (
            <div key={date} className="relative pl-8">
              {/* Timeline line */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/30 to-transparent"></div>

              {/* Date marker */}
              <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-gray-800 transform -translate-x-1/2"></div>

              <div className="mb-4">
                <h3 className="text-lg font-medium bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                  {date === 'No Due Date' ? date : new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
              </div>

              <div className="space-y-4 ml-4">
                <AnimatePresence>
                  {groupedTasks[date].map((task, taskIndex) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: (dateIndex * 0.1) + (taskIndex * 0.05) }}
                    >
                      <TaskCard taskId={task.id} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p>No tasks with due dates. Add due dates to see them in timeline view!</p>
        </div>
      )}
    </div>
  );
};

export default TimelineView;