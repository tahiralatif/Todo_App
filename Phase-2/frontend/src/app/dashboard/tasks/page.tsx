'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  RotateCcw, 
  Edit2,
  X,
  Search,
  Filter,
  AlertCircle,
  AlertTriangle,
  Flag,
  Clock
} from 'lucide-react';
import api from '@/lib/api';
import type { Task } from '@/types';
import { useToast } from '@/contexts/ToastContext';

export default function TasksPage() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'deleted'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'LOW' | 'MEDIUM' | 'HIGH' | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    due_date: ''
  });

  useEffect(() => {
    loadTasks();
  }, [filter, priorityFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks({ 
        status: filter,
        priority: priorityFilter || undefined,
        include_deleted: filter === 'deleted'
      });
      setTasks(data as Task[]);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const due_date = newTask.due_date ? new Date(newTask.due_date).toISOString() : undefined;
      await api.createTask(newTask.title, newTask.description, newTask.priority, due_date);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', due_date: '' });
      setShowCreateModal(false);
      showToast('Task created successfully', 'success');
      loadTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
      showToast('Failed to create task', 'error');
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await api.toggleTaskComplete(task.id);
      showToast(
        task.completed ? 'Task marked as pending' : 'Task completed',
        'success'
      );
      loadTasks();
    } catch (error) {
      console.error('Failed to toggle task:', error);
      showToast('Failed to update task', 'error');
    }
  };

  const handleDeleteTask = async (taskId: number, permanent: boolean = false) => {
    try {
      await api.deleteTask(taskId);
      showToast(permanent ? 'Task permanently deleted' : 'Task moved to trash', 'success');
      setDeletingTask(null);
      loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      showToast('Failed to delete task', 'error');
    }
  };

  const handleRestoreTask = async (taskId: number) => {
    try {
      await api.restoreTask(taskId);
      showToast('Task restored successfully', 'success');
      loadTasks();
    } catch (error) {
      console.error('Failed to restore task:', error);
      showToast('Failed to restore task', 'error');
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;

    try {
      const due_date = editingTask.due_date ? new Date(editingTask.due_date).toISOString() : undefined;
      await api.updateTask(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        due_date,
      });
      setEditingTask(null);
      showToast('Task updated successfully', 'success');
      loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      showToast('Failed to update task', 'error');
    }
  };

  const filterButtons = [
    { value: 'all' as const, label: 'All Tasks', icon: Filter },
    { value: 'pending' as const, label: 'Pending', icon: Circle },
    { value: 'completed' as const, label: 'Completed', icon: CheckCircle2 },
    { value: 'deleted' as const, label: 'Deleted', icon: Trash2 },
  ];

  const priorityButtons = [
    { value: null, label: 'All Priorities', icon: Filter },
    { value: 'HIGH' as const, label: 'High', icon: AlertCircle, color: 'text-red-400' },
    { value: 'MEDIUM' as const, label: 'Medium', icon: AlertTriangle, color: 'text-yellow-400' },
    { value: 'LOW' as const, label: 'Low', icon: Flag, color: 'text-blue-400' },
  ];

  const getPriorityBadge = (priority: string) => {
    const badges = {
      HIGH: { color: 'bg-red-500/20 border-red-500/30 text-red-400', icon: AlertCircle },
      MEDIUM: { color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400', icon: AlertTriangle },
      LOW: { color: 'bg-blue-500/20 border-blue-500/30 text-blue-400', icon: Flag },
    };
    return badges[priority as keyof typeof badges] || badges.MEDIUM;
  };

  const isOverdue = (due_date?: string, completed?: boolean) => {
    if (!due_date || completed) return false;
    return new Date(due_date) < new Date();
  };

  const formatDueDate = (due_date?: string) => {
    if (!due_date) return null;
    const date = new Date(due_date);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      return { text: 'Overdue', color: 'text-red-400' };
    } else if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return { text: `Due in ${diffMins}m`, color: 'text-red-400' };
    } else if (diffHours < 24) {
      return { text: `Due in ${diffHours}h`, color: 'text-orange-400' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'text-yellow-400' };
    } else if (diffDays < 7) {
      return { text: `Due in ${diffDays}d`, color: 'text-teal-400' };
    } else {
      return { text: date.toLocaleDateString(), color: 'text-slate-400' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
          <p className="text-slate-400">Manage your tasks and stay organized</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 rounded-xl font-semibold transition-all"
        >
          <Plus className="w-5 h-5" />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Status Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                filter === btn.value
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <btn.icon className="w-4 h-4" />
              {btn.label}
            </button>
          ))}
        </div>

        {/* Priority Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {priorityButtons.map((btn) => (
            <button
              key={btn.value || 'all'}
              onClick={() => setPriorityFilter(btn.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                priorityFilter === btn.value
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <btn.icon className={`w-4 h-4 ${priorityFilter === btn.value ? '' : btn.color || ''}`} />
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/80 rounded-2xl border border-slate-700/50">
          <CheckCircle2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">No tasks found</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-500 rounded-xl font-semibold transition-all"
          >
            Create Your First Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 hover:border-teal-500/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  {!task.is_deleted && (
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="mt-1"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-teal-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-600 hover:text-teal-500 transition-colors" />
                      )}
                    </button>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className={`font-medium ${
                        task.completed ? 'line-through text-slate-500' : 'text-white'
                      } ${task.is_deleted ? 'text-red-400' : ''}`}>
                        {task.title}
                      </h3>
                      {task.is_deleted && (
                        <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-400">
                          Deleted
                        </span>
                      )}
                      {task.completed && !task.is_deleted && (
                        <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400">
                          Completed
                        </span>
                      )}
                      {!task.completed && !task.is_deleted && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs text-yellow-400">
                          Pending
                        </span>
                      )}
                      {/* Priority Badge */}
                      {(() => {
                        const badge = getPriorityBadge(task.priority);
                        const Icon = badge.icon;
                        return (
                          <span className={`flex items-center gap-1 px-2 py-0.5 border rounded text-xs ${badge.color}`}>
                            <Icon className="w-3 h-3" />
                            {task.priority}
                          </span>
                        );
                      })()}
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-400">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-slate-500">
                        {new Date(task.created_at).toLocaleString()}
                      </span>
                      {task.due_date && !task.is_deleted && (
                        <>
                          <span className="text-slate-600">•</span>
                          {(() => {
                            const dueInfo = formatDueDate(task.due_date);
                            const overdue = isOverdue(task.due_date, task.completed);
                            return (
                              <span className={`flex items-center gap-1 ${dueInfo?.color || 'text-slate-400'}`}>
                                <Clock className="w-3 h-3" />
                                {overdue ? '⚠️ Overdue' : dueInfo?.text}
                              </span>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {task.is_deleted ? (
                      <button
                        onClick={() => handleRestoreTask(task.id)}
                        className="flex items-center gap-2 px-3 py-2 text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg transition-all"
                        title="Restore"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span className="text-sm font-medium">Restore</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeletingTask(task)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Create New Task</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                    required
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Enter task description (optional)"
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['LOW', 'MEDIUM', 'HIGH'] as const).map((priority) => {
                      const badge = getPriorityBadge(priority);
                      const Icon = badge.icon;
                      return (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => setNewTask({ ...newTask, priority })}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                            newTask.priority === priority
                              ? badge.color.replace('/20', '/30').replace('/30', '/40') + ' border-2'
                              : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {priority}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Due Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-colors"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Set a deadline to get reminders
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-teal-600 hover:bg-teal-500 rounded-xl font-semibold transition-all"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setEditingTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Edit Task</h3>
                <button
                  onClick={() => setEditingTask(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    placeholder="Enter task title"
                    required
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    placeholder="Enter task description (optional)"
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['LOW', 'MEDIUM', 'HIGH'] as const).map((priority) => {
                      const badge = getPriorityBadge(priority);
                      const Icon = badge.icon;
                      return (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => setEditingTask({ ...editingTask, priority })}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                            editingTask.priority === priority
                              ? badge.color.replace('/20', '/30').replace('/30', '/40') + ' border-2'
                              : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {priority}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Due Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={editingTask.due_date ? new Date(editingTask.due_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-colors"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Set a deadline to get reminders
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-teal-600 hover:bg-teal-500 rounded-xl font-semibold transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeletingTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-red-400">Delete Task</h3>
                <button
                  onClick={() => setDeletingTask(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-slate-300 mb-2">
                  Are you sure you want to delete this task?
                </p>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="font-medium text-white">{deletingTask.title}</p>
                  {deletingTask.description && (
                    <p className="text-sm text-slate-400 mt-1">{deletingTask.description}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleDeleteTask(deletingTask.id, false)}
                  className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Move to Trash (Can restore later)
                </button>
                
                <button
                  onClick={() => setDeletingTask(null)}
                  className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-slate-500 text-center mt-4">
                Deleted tasks can be restored from the "Deleted" filter
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
