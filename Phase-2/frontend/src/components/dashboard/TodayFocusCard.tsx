'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '../ui/GlassCard';
import { ProgressRing } from './ProgressRing';
import { useTaskStore } from '@/services/state/store';

interface TodayFocusCardProps {
  className?: string;
}

const TodayFocusCard: React.FC<TodayFocusCardProps> = ({ className = '' }) => {
  const { tasks } = useTaskStore();

  // Calculate stats for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDueDate = new Date(task.dueDate);
    taskDueDate.setHours(0, 0, 0, 0);
    return taskDueDate.getTime() === today.getTime();
  });

  const completedTodayTasks = todayTasks.filter(task => task.completed);
  const pendingTodayTasks = todayTasks.filter(task => !task.completed);

  const completionPercentage = todayTasks.length > 0
    ? Math.round((completedTodayTasks.length / todayTasks.length) * 100)
    : 0;

  return (
    <GlassCard className={`p-6 ${className}`}>
      <GlassCardHeader>
        <div className="flex items-center justify-between">
          <GlassCardTitle>Today's Focus</GlassCardTitle>
          <div className="relative w-16 h-16">
            <ProgressRing
              percentage={completionPercentage}
              size={64}
              strokeWidth={5}
            />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
              {completionPercentage}%
            </div>
          </div>
        </div>
      </GlassCardHeader>

      <GlassCardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="text-2xl font-bold text-center">{todayTasks.length}</div>
              <div className="text-center text-sm text-gray-400">Total</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="text-2xl font-bold text-center text-green-400">{completedTodayTasks.length}</div>
              <div className="text-center text-sm text-gray-400">Completed</div>
            </div>
          </div>

          {pendingTodayTasks.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Pending Tasks</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {pendingTodayTasks.slice(0, 5).map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-white/5 rounded-lg flex items-center"
                  >
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="truncate">{task.title}</span>
                  </motion.div>
                ))}
                {pendingTodayTasks.length > 5 && (
                  <div className="text-center text-sm text-gray-400 mt-2">
                    +{pendingTodayTasks.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}

          {completedTodayTasks.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <h4 className="font-medium mb-2">Completed Today</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {completedTodayTasks.slice(0, 3).map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 bg-white/5 rounded-lg flex items-center text-green-300"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="truncate">{task.title}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
};

export default TodayFocusCard;