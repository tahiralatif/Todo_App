'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import { GlassCard } from '../ui/GlassCard';
import { useTaskStore } from '@/services/state/store';

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

const KanbanView: React.FC = () => {
  const { tasks, updateTask } = useTaskStore();
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'To Do',
      taskIds: tasks.filter(t => !t.completed).map(t => t.id),
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      taskIds: [],
    },
    {
      id: 'done',
      title: 'Done',
      taskIds: tasks.filter(t => t.completed).map(t => t.id),
    },
  ]);

  // Update columns when tasks change
  React.useEffect(() => {
    setColumns(prev => prev.map(col => {
      if (col.id === 'todo') {
        return {
          ...col,
          taskIds: tasks.filter(t => !t.completed).map(t => t.id),
        };
      } else if (col.id === 'done') {
        return {
          ...col,
          taskIds: tasks.filter(t => t.completed).map(t => t.id),
        };
      }
      return col;
    }));
  }, [tasks]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Update task status based on column
    let newStatus = false; // Default to not completed
    if (destination.droppableId === 'done') {
      newStatus = true;
    } else if (destination.droppableId === 'todo' || destination.droppableId === 'in-progress') {
      newStatus = false;
    }

    updateTask(draggableId, { completed: newStatus });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="w-full">
        <h2 className="text-xl font-semibold mb-4">Kanban Board</h2>

        <div className="flex space-x-4 overflow-x-auto pb-4">
          {columns.map(column => (
            <div key={column.id} className="flex-shrink-0 w-72">
              <div className="mb-3">
                <h3 className="font-medium text-lg">{column.title}</h3>
                <span className="text-sm text-gray-400">
                  {column.taskIds.length} {column.taskIds.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <GlassCard
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[500px] p-4"
                  >
                    <div className="space-y-3">
                      <AnimatePresence>
                        {column.taskIds.map((taskId, index) => (
                          <Draggable key={taskId} draggableId={taskId} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <TaskCard taskId={taskId} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  </GlassCard>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
};

export default KanbanView;