'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { useTaskStore } from '@/services/state/store';

interface CommandOption {
  id: string;
  title: string;
  description: string;
  category: string;
  shortcut?: string;
  action: () => void;
}

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandBar: React.FC<CommandBarProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getFilteredTasks, setCurrentView } = useTaskStore();

  // Get all tasks for search
  const tasks = getFilteredTasks();

  // Define command options
  const commandOptions: CommandOption[] = [
    {
      id: 'view-list',
      title: 'Switch to List View',
      description: 'Change to list view for tasks',
      category: 'View',
      action: () => setCurrentView('list'),
    },
    {
      id: 'view-kanban',
      title: 'Switch to Kanban View',
      description: 'Change to kanban board for tasks',
      category: 'View',
      action: () => setCurrentView('kanban'),
    },
    {
      id: 'view-timeline',
      title: 'Switch to Timeline View',
      description: 'Change to timeline view for tasks',
      category: 'View',
      action: () => setCurrentView('timeline'),
    },
    {
      id: 'new-task',
      title: 'Create New Task',
      description: 'Add a new task to your list',
      category: 'Task',
      action: () => {
        // This would typically open a modal or navigate to a form
        console.log('Create new task');
      },
    },
    {
      id: 'today-focus',
      title: 'Focus on Today',
      description: 'See tasks due today',
      category: 'Focus',
      action: () => {
        // Filter for today's tasks
        console.log('Focus on today');
      },
    },
    {
      id: 'settings',
      title: 'Open Settings',
      description: 'Adjust app preferences',
      category: 'Settings',
      action: () => {
        console.log('Open settings');
      },
    },
  ];

  // Filter options based on search term
  const filteredOptions = commandOptions.filter(option =>
    option.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add tasks to options if searching for tasks
  if (searchTerm) {
    const taskOptions: CommandOption[] = tasks
      .filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5) // Limit to 5 task results
      .map(task => ({
        id: `task-${task.id}`,
        title: task.title,
        description: task.description || 'Task',
        category: 'Task',
        action: () => {
          // Navigate to task or highlight it
          console.log(`Navigate to task ${task.id}`);
        },
      }));

    filteredOptions.push(...taskOptions);
  }

  // Handle keyboard navigation
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredOptions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredOptions[selectedIndex]) {
          filteredOptions[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredOptions, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard className="p-0 overflow-hidden">
              {/* Search Input */}
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type a command or search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setSelectedIndex(0); // Reset selection when typing
                    }}
                    className="w-full bg-transparent border-none outline-none text-lg placeholder:text-gray-400"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    ESC to close
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 cursor-pointer transition-colors ${
                        index === selectedIndex ? 'bg-white/10' : 'hover:bg-white/5'
                      }`}
                      onClick={() => {
                        option.action();
                        onClose();
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{option.title}</div>
                          <div className="text-sm text-gray-400 mt-1">{option.description}</div>
                        </div>
                        <div className="text-xs bg-white/10 px-2 py-1 rounded">
                          {option.category}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    No results found for "{searchTerm}"
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-white/5 text-xs text-gray-400 flex justify-between">
                <div>Navigate with ↑ ↓ arrows</div>
                <div>Press Enter to select</div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandBar;