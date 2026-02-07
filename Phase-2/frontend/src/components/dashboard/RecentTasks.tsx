'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '../ui/GlassCard';
import { useTaskStore } from '@/services/state/store';

interface RecentTasksProps {
  limit?: number;
  className?: string;
}

const RecentTasks: React.FC<RecentTasksProps> = ({ limit = 5, className = '' }) => {
  const { tasks } = useTaskStore();

  // Sort tasks by creation date (most recent first) and take the limit
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  return (
    <GlassCard className={`p-6 ${className}`}>
      <GlassCardHeader>
        <GlassCardTitle>Recent Tasks</GlassCardTitle>
      </GlassCardHeader>

      <GlassCardContent>
        {recentTasks.length > 0 ? (
          <div className="space-y-3">
            {recentTasks.map((task, index) => {
              const timeDiff = Math.floor(
                (Date.now() - new Date(task.createdAt).getTime()) / (1000 * 60)
              );

              let timeLabel = '';
              if (timeDiff < 60) {
                timeLabel = `${timeDiff}m ago`;
              } else if (timeDiff < 1440) { // Less than a day
                timeLabel = `${Math.floor(timeDiff / 60)}h ago`;
              } else {
                timeLabel = `${Math.floor(timeDiff / 1440)}d ago`;
              }

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    task.completed
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <span className={`${task.completed ? 'line-through text-gray-400' : ''}`}>
                      {task.title}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{timeLabel}</span>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No recent tasks. Create your first task!
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  );
};

export default RecentTasks;