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
  AlertCircle,
  AlertTriangle,
  Flag,
  Clock,
  Calendar,
  Sparkles,
  Bell
} from 'lucide-react';
import api from '@/lib/api';
import type { Task } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import { 
  requestNotificationPermission,
  subscribeToPushNotifications,
  hasNotificationPermission 
} from '@/lib/pushNotifications';

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
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadTasks();
    checkNotificationStatus();
  }, [filter, priorityFilter]);

  const checkNotificationStatus = () => {
    setNotificationsEnabled(hasNotificationPermission());
  };

  const handleEnableNotifications = async () => {
    try {
      const permission = await requestNotificationPermission();
      
      if (permission === 'granted') {
        const subscription = await subscribeToPushNotifications();
        
        if (subscription) {
          try {
            await api.subscribeToPush(subscription);
            setNotificationsEnabled(true);
            showToast('Notifications enabled successfully!', 'success');
          } catch (error) {
            console.error('Failed to save subscription:', error);
            showToast('Failed to save notification settings', 'error');
          }
        }
      } else {
        showToast('Please allow notifications in browser settings', 'error');
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      showToast('Failed to enable notifications', 'error');
    }
  };

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
      
      // Auto-request notification permission if due date is set
      if (due_date) {
        console.log('🔔 Checking notification permission...');
        console.log('Current permission:', Notification.permission);
        console.log('Notifications enabled state:', notificationsEnabled);
        
        if (!notificationsEnabled || Notification.permission !== 'granted') {
          try {
            console.log('📢 Requesting notification permission...');
            const permission = await requestNotificationPermission();
            console.log('Permission result:', permission);
            
            if (permission === 'granted') {
              console.log('✅ Permission granted, subscribing to push...');
              const subscription = await subscribeToPushNotifications();
              console.log('Subscription:', subscription);
              
              if (subscription) {
                console.log('💾 Saving subscription to backend...');
                await api.subscribeToPush(subscription);
                setNotificationsEnabled(true);
                showToast('✅ Notifications enabled! You will receive reminders for this task.', 'success');
              } else {
                showToast('Could not create push subscription', 'error');
              }
            } else if (permission === 'denied') {
              showToast('Notifications blocked. Enable them in browser settings to get reminders.', 'error');
            } else if (permission === 'default') {
              showToast('Notification permission not granted', 'error');
            }
          } catch (error) {
            console.error('❌ Failed to enable notifications:', error);
            showToast('Could not enable notifications. Task will still be created.', 'error');
          }
        } else {
          console.log('✅ Notifications already enabled');
        }
      }
      
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

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.deleteTask(taskId);
      showToast('Task moved to trash', 'success');
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

  const getPriorityConfig = (priority: string) => {
    const configs = {
      HIGH: { 
        color: 'from-red-500 to-rose-600', 
        bg: 'bg-red-500/10', 
        border: 'border-red-500/30',
        text: 'text-red-400',
        icon: AlertCircle 
      },
      MEDIUM: { 
        color: 'from-yellow-500 to-amber-600', 
        bg: 'bg-yellow-500/10', 
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        icon: AlertTriangle 
      },
      LOW: { 
        color: 'from-blue-500 to-cyan-600', 
        bg: 'bg-blue-500/10', 
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        icon: Flag 
      },
    };
    return configs[priority as keyof typeof configs] || configs.MEDIUM;
  };

  const getTimeInfo = (date: string) => {
    const now = new Date();
    const taskDate = new Date(date);
    const diffMs = now.getTime() - taskDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return taskDate.toLocaleDateString();
  };

  const getDueTimeInfo = (due_date?: string, completed?: boolean) => {
    if (!due_date) return null;
    const now = new Date();
    const dueDate = new Date(due_date);
    const diffMs = dueDate.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (completed) {
      return { 
        text: 'Completed', 
        fullDate: dueDate.toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        color: 'text-emerald-400', 
        urgent: false 
      };
    }

    let text = '';
    let urgent = false;
    let color = 'text-slate-400';

    if (diffMs < 0) {
      const overdueMins = Math.abs(diffMins);
      const overdueHours = Math.abs(diffHours);
      const overdueDays = Math.abs(diffDays);
      
      if (overdueMins < 60) {
        text = `${overdueMins}m overdue`;
      } else if (overdueHours < 24) {
        text = `${overdueHours}h overdue`;
      } else {
        text = `${overdueDays}d overdue`;
      }
      color = 'text-red-400';
      urgent = true;
    } else if (diffMins < 60) {
      text = `Due in ${diffMins}m`;
      color = 'text-red-400';
      urgent = true;
    } else if (diffHours < 24) {
      text = `Due in ${diffHours}h`;
      color = 'text-orange-400';
      urgent = true;
    } else if (diffDays === 1) {
      text = 'Due tomorrow';
      color = 'text-yellow-400';
    } else if (diffDays < 7) {
      text = `Due in ${diffDays}d`;
      color = 'text-teal-400';
    } else {
      text = `Due ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      color = 'text-slate-400';
    }

    return { 
      text, 
      fullDate: dueDate.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      color, 
      urgent 
    };
  };

  const filterButtons = [
    { value: 'all' as const, label: 'All Tasks', count: tasks.length },
    { value: 'pending' as const, label: 'Pending', count: tasks.filter(t => !t.completed && !t.is_deleted).length },
    { value: 'completed' as const, label: 'Completed', count: tasks.filter(t => t.completed).length },
    { value: 'deleted' as const, label: 'Deleted', count: tasks.filter(t => t.is_deleted).length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0E13] via-[#0B0F14] to-[#0D1117] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-slate-800 rounded-full" />
          <div className="w-16 h-16 border-2 border-teal-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E13] via-[#0B0F14] to-[#0D1117] p-8 relative overflow-hidden">
      {/* Premium Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(20,184,166,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(20,184,166,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
        
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-teal-500/10 via-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-[1400px] mx-auto space-y-8 relative z-10">
        {/* Premium Header */}
        <div className="flex items-center justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-3"
            >
              <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl shadow-lg shadow-teal-500/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-teal-100 to-blue-100 bg-clip-text text-transparent tracking-tight">
                Tasks
              </h1>
            </motion.div>
            <p className="text-slate-400 text-lg">Manage your tasks with style and efficiency</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 rounded-xl font-semibold transition-all shadow-lg shadow-teal-500/25"
            >
              <Plus className="w-5 h-5" />
              New Task
            </motion.button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {filterButtons.map((btn) => (
            <motion.button
              key={btn.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilter(btn.value)}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filter === btn.value
                  ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg shadow-teal-500/25'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {btn.label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                filter === btn.value ? 'bg-white/20' : 'bg-white/10'
              }`}>
                {btn.count}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Priority Filters */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPriorityFilter(null)}
            className={`px-5 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              priorityFilter === null
                ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg shadow-teal-500/25'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            All Priorities
          </motion.button>
          {(['HIGH', 'MEDIUM', 'LOW'] as const).map((priority) => {
            const config = getPriorityConfig(priority);
            const Icon = config.icon;
            return (
              <motion.button
                key={priority}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPriorityFilter(priority)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  priorityFilter === priority
                    ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                    : `bg-white/5 ${config.text} hover:bg-white/10 border border-white/10`
                }`}
              >
                <Icon className="w-4 h-4" />
                {priority}
              </motion.button>
            );
          })}
        </div>

        {/* Tasks Grid */}
        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl"
          >
            <CheckCircle2 className="w-20 h-20 text-slate-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">No tasks found</h3>
            <p className="text-slate-400 mb-6">Create your first task to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 rounded-xl font-semibold transition-all shadow-lg shadow-teal-500/25"
            >
              Create Task
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {tasks.map((task, index) => {
                const priorityConfig = getPriorityConfig(task.priority);
                const PriorityIcon = priorityConfig.icon;
                const dueInfo = getDueTimeInfo(task.due_date, task.completed);

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -2 }}
                    className="group relative bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-2xl p-6 hover:border-teal-500/50 transition-all duration-300"
                  >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-teal-500/0 group-hover:from-teal-500/5 group-hover:to-transparent rounded-2xl transition-all duration-300" />
                    
                    <div className="relative z-10 flex items-start gap-4">
                      {/* Checkbox */}
                      {!task.is_deleted && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleToggleComplete(task)}
                          className="mt-1"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-slate-600 hover:text-teal-500 transition-colors" />
                          )}
                        </motion.button>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className={`text-lg font-semibold mb-2 ${
                              task.completed ? 'line-through text-slate-500' : 'text-white'
                            } ${task.is_deleted ? 'text-red-400' : ''}`}>
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-sm text-slate-400 leading-relaxed">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {task.is_deleted ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleRestoreTask(task.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg transition-all"
                              >
                                <RotateCcw className="w-4 h-4 text-teal-400" />
                                <span className="text-sm font-medium text-teal-400">Restore</span>
                              </motion.button>
                            ) : (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setEditingTask(task)}
                                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                >
                                  <Edit2 className="w-5 h-5" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setDeletingTask(task)}
                                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </motion.button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Priority Badge */}
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 ${priorityConfig.bg} border ${priorityConfig.border} rounded-lg`}>
                            <PriorityIcon className={`w-3.5 h-3.5 ${priorityConfig.text}`} />
                            <span className={`text-xs font-semibold ${priorityConfig.text}`}>
                              {task.priority}
                            </span>
                          </div>

                          {/* Status Badge */}
                          {task.is_deleted ? (
                            <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg">
                              <span className="text-xs font-semibold text-red-400">Deleted</span>
                            </div>
                          ) : task.completed ? (
                            <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                              <span className="text-xs font-semibold text-emerald-400">Completed</span>
                            </div>
                          ) : (
                            <div className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                              <span className="text-xs font-semibold text-yellow-400">Pending</span>
                            </div>
                          )}

                          {/* Due Date with Full DateTime */}
                          {dueInfo && (
                            <div 
                              className={`flex items-center gap-1.5 px-3 py-1.5 ${
                                dueInfo.urgent ? 'bg-red-500/10 border-red-500/30 animate-pulse' : 'bg-teal-500/10 border-teal-500/30'
                              } border rounded-lg group relative`}
                            >
                              <Clock className={`w-3.5 h-3.5 ${dueInfo.color}`} />
                              <span className={`text-xs font-semibold ${dueInfo.color}`}>
                                Due: {dueInfo.fullDate}
                              </span>
                              {/* Tooltip with urgency info */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                {dueInfo.text}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                              </div>
                            </div>
                          )}

                          {/* Created Time */}
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg group relative">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-medium text-slate-400">
                              Created: {new Date(task.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric'
                              })}
                            </span>
                            {/* Tooltip with full timestamp */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              {new Date(task.created_at).toLocaleString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric',
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Modal - Premium Style */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Create New Task
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Enter task description (optional)"
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Priority
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['LOW', 'MEDIUM', 'HIGH'] as const).map((priority) => {
                      const config = getPriorityConfig(priority);
                      const Icon = config.icon;
                      return (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => setNewTask({ ...newTask, priority })}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                            newTask.priority === priority
                              ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                              : `bg-white/5 ${config.text} hover:bg-white/10 border border-white/10`
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
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Due Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                {/* Auto Notification Info */}
                {newTask.due_date && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-gradient-to-br from-teal-900/20 to-blue-900/20 border border-teal-500/30 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-500/20 rounded-lg">
                        <Bell className="w-4 h-4 text-teal-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-teal-300">
                          📬 Reminder Notification
                        </p>
                        <p className="text-xs text-teal-200 mt-1">
                          You'll automatically receive a browser notification when this task is due
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 rounded-xl font-semibold transition-all shadow-lg shadow-teal-500/25"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEditingTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Edit Task
                </h3>
                <button
                  onClick={() => setEditingTask(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateTask} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Priority
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['LOW', 'MEDIUM', 'HIGH'] as const).map((priority) => {
                      const config = getPriorityConfig(priority);
                      const Icon = config.icon;
                      return (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => setEditingTask({ ...editingTask, priority })}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                            editingTask.priority === priority
                              ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                              : `bg-white/5 ${config.text} hover:bg-white/10 border border-white/10`
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
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Due Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editingTask.due_date ? new Date(editingTask.due_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 rounded-xl font-semibold transition-all shadow-lg shadow-teal-500/25"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDeletingTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-red-500/30 rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-red-400">Delete Task</h3>
                <button
                  onClick={() => setDeletingTask(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-slate-300 mb-4">
                  Are you sure you want to delete this task?
                </p>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="font-semibold text-white mb-1">{deletingTask.title}</p>
                  {deletingTask.description && (
                    <p className="text-sm text-slate-400">{deletingTask.description}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleDeleteTask(deletingTask.id)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/25"
                >
                  <Trash2 className="w-5 h-5" />
                  Move to Trash
                </button>
                
                <button
                  onClick={() => setDeletingTask(null)}
                  className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all"
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
