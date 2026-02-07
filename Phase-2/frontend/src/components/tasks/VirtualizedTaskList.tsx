'use client';

import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { useTaskStore } from '@/services/state/store';
import TaskCard from './TaskCard';

interface VirtualizedTaskListProps {
  className?: string;
  itemHeight?: number;
  containerHeight?: number;
}

const VirtualizedTaskList: React.FC<VirtualizedTaskListProps> = ({
  className = '',
  itemHeight = 120,
  containerHeight = 600,
}) => {
  const { getFilteredTasks } = useTaskStore();
  const tasks = getFilteredTasks();

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const task = tasks[index];

    return (
      <div style={style}>
        <TaskCard taskId={task.id} className="mb-3" />
      </div>
    );
  };

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>

      {tasks.length > 0 ? (
        <List
          height={containerHeight}
          itemCount={tasks.length}
          itemSize={itemHeight}
          overscanCount={5}
        >
          {Row}
        </List>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p>No tasks found. Create your first task!</p>
        </div>
      )}
    </div>
  );
};

export default VirtualizedTaskList;