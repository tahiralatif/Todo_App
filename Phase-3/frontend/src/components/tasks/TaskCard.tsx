'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { useTaskStore } from '@/services/state/store';

interface TaskCardProps {
  taskId: string;
  className?: string;
  showActions?: boolean;
  onClick?: () => void;
  hasCheckbox?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  taskId,
  className = '',
  showActions = true,
  onClick,
  hasCheckbox = false,
}) => {
  const { tasks, toggleTaskCompletion, deleteTask } = useTaskStore();
  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return null;
  }

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskCompletion(taskId);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(taskId);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer group ${className}`}
    >
      <GlassCard className={`p-4 transition-all duration-300 ${
        task.completed ? 'opacity-70 border-green-500/30' : 'border-white/20'
      } hover:border-white/40 relative overflow-hidden`}>
        {/* Neon accent line */}
        <div className={`absolute top-0 left-0 h-1 w-full ${
          task.priority === 'high' ? 'bg-red-500' :
          task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
        } neon-accent`}
        style={{
          boxShadow: task.completed
            ? '0 0 10px rgba(72, 187, 120, 0.5)'
            : `0 0 10px currentColor`
        }}></div>
        <div className="flex items-start justify-between">
          <div className={`flex items-start space-x-3 flex-1 min-w-0 ${hasCheckbox ? 'pl-8' : ''}`}>
            <button
              onClick={handleToggleComplete}
              className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                task.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-400 hover:border-gray-300'
              }`}
            >
              {task.completed && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium truncate ${
                task.completed ? 'line-through text-gray-400' : 'text-white'
              }`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-300 mt-1 truncate">
                  {task.description}
                </p>
              )}
              <div className="flex items-center mt-2 space-x-2">
                {task.dueDate && (
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded ${
                  task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                  task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-green-500/20 text-green-300'
                }`}>
                  {task.priority}
                </span>
              </div>
            </div>
          </div>

          {showActions && (
            <div className="flex space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-400 rounded-full hover:bg-red-500/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

export default TaskCard;