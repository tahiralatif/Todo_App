'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

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

interface CalendarViewProps {
  tasks: Task[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onTaskUpdate: (taskId: number, updates: any) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  selectedDate,
  onDateSelect,
  onTaskUpdate
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    onDateSelect(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={() => navigateMonth('prev')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          <h2 className="text-xl font-semibold">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>

          <motion.button
            onClick={() => navigateMonth('next')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>

        <motion.button
          onClick={goToToday}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Today
        </motion.button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-400">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((date, index) => {
          const dayTasks = getTasksForDate(date);
          const hasTasks = dayTasks.length > 0;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              className={`
                min-h-[100px] p-2 border border-white/10 rounded-lg cursor-pointer
                hover:bg-white/5 transition-colors relative
                ${isCurrentMonth(date) ? 'bg-white/5' : 'bg-white/2'}
                ${isToday(date) ? 'ring-2 ring-blue-500' : ''}
                ${isSelected(date) ? 'bg-blue-500/20 border-blue-500' : ''}
              `}
              onClick={() => onDateSelect(date)}
            >
              {/* Day number */}
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonth(date) ? 'text-white' : 'text-gray-500'
              }`}>
                {date.getDate()}
              </div>

              {/* Task indicators */}
              {hasTasks && (
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className={`h-1 rounded-full ${getPriorityColor(task.priority)} ${
                        task.completed ? 'opacity-50' : 'opacity-100'
                      }`}
                      title={task.title}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{dayTasks.length - 3}
                    </div>
                  )}
                </div>
              )}

              {/* Today indicator */}
              {isToday(date) && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>High Priority</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Low Priority</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full opacity-50"></div>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;