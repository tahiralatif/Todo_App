'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import { useTaskStore } from '@/services/state/store';
import { useVirtualizedList } from '../hooks/useVirtualizedList';

interface ListViewProps {
  className?: string;
  selectedTasks?: number[];
  onTaskSelect?: (taskId: number, selected: boolean) => void;
  onSelectAll?: (taskIds: number[]) => void;
}

const ListView: React.FC<ListViewProps> = ({
  className = '',
  selectedTasks = [],
  onTaskSelect,
  onSelectAll
}) => {
  const { getFilteredTasks } = useTaskStore();
  const tasks = getFilteredTasks();

  const allSelected = tasks.length > 0 && tasks.every(task => selectedTasks.includes(Number(task.id)));
  const someSelected = tasks.some(task => selectedTasks.includes(Number(task.id)));

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectAll?.([]);
    } else {
      onSelectAll?.(tasks.map(task => Number(task.id)));
    }
  };

  const handleTaskSelect = (taskId: number, selected: boolean) => {
    onTaskSelect?.(taskId, selected);
  };

  // Using virtualized list for performance with many tasks
  const { VirtualizedListComponent } = useVirtualizedList({
    items: tasks,
    itemHeight: 120,
    containerHeight: 600,
  });

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Task List</h2>

        {/* Select All Checkbox */}
        {onSelectAll && tasks.length > 0 && (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected && !allSelected;
              }}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">
              {allSelected ? 'Deselect All' : 'Select All'}
            </span>
          </label>
        )}
      </div>

      {tasks.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`relative ${
                  selectedTasks.includes(Number(task.id)) ? 'ring-2 ring-blue-500 rounded-lg' : ''
                }`}
              >
                {onTaskSelect && (
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(Number(task.id))}
                      onChange={(e) => handleTaskSelect(Number(task.id), e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                )}
                <TaskCard taskId={task.id} hasCheckbox={!!onTaskSelect} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p>No tasks found. Create your first task!</p>
        </div>
      )}
    </div>
  );
};

export default ListView;