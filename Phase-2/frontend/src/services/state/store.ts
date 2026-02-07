import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define types for our tasks
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  category?: string;
  is_deleted?: boolean;
  deleted_at?: Date;
}

export interface TaskState {
  tasks: Task[];
  filter: 'all' | 'active' | 'completed';
  searchTerm: string;
  currentView: 'list' | 'kanban' | 'timeline';
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  setFilter: (filter: 'all' | 'active' | 'completed') => void;
  setSearchTerm: (term: string) => void;
  setCurrentView: (view: 'list' | 'kanban' | 'timeline') => void;
  getFilteredTasks: () => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      filter: 'all',
      searchTerm: '',
      currentView: 'list',

      addTask: (taskData) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...taskData,
              id: crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map(task =>
            task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter(task => task.id !== id),
        })),

      toggleTaskCompletion: (id) =>
        set((state) => ({
          tasks: state.tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed, updatedAt: new Date() } : task
          ),
        })),

      setFilter: (filter) => set({ filter }),

      setSearchTerm: (searchTerm) => set({ searchTerm }),

      setCurrentView: (currentView) => set({ currentView }),

      getFilteredTasks: () => {
        const { tasks, filter, searchTerm } = get();

        let filteredTasks = [...tasks];

        // Apply status filter
        if (filter === 'active') {
          filteredTasks = filteredTasks.filter(task => !task.completed);
        } else if (filter === 'completed') {
          filteredTasks = filteredTasks.filter(task => task.completed);
        }

        // Apply search filter
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filteredTasks = filteredTasks.filter(
            task =>
              task.title.toLowerCase().includes(term) ||
              task.description?.toLowerCase().includes(term) ||
              task.tags?.some(tag => tag.toLowerCase().includes(term))
          );
        }

        return filteredTasks;
      },
    }),
    {
      name: 'task-storage',
    }
  )
);