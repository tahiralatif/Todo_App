'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/services/api-client';
import { GlassCard } from '@/components/ui/GlassCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface BulkOperationsProps {
  selectedTasks: number[];
  onClearSelection: () => void;
  onTasksUpdate: () => void;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedTasks,
  onClearSelection,
  onTasksUpdate
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedData, setAdvancedData] = useState({
    category: '',
    priority: '',
    tags: ''
  });

  const handleBulkOperation = async (operation: string, params?: any) => {
    if (selectedTasks.length === 0) return;

    try {
      setIsProcessing(true);
      const result = await apiClient.bulkTaskOperations(operation, selectedTasks, params);

      if (result.success_count > 0) {
        onTasksUpdate();
        onClearSelection();
      }

      // Show result message
      alert(`Operation completed: ${result.success_count} successful, ${result.failure_count} failed`);

    } catch (error: any) {
      alert(`Operation failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdvancedOperation = async (operation: string) => {
    const params: any = {};

    if (operation === 'update_category' && advancedData.category) {
      params.category = advancedData.category;
    } else if (operation === 'update_priority' && advancedData.priority) {
      params.priority = advancedData.priority;
    } else if ((operation === 'add_tags' || operation === 'remove_tags') && advancedData.tags) {
      params.tags = advancedData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    if (Object.keys(params).length === 0) {
      alert('Please fill in the required fields');
      return;
    }

    await handleBulkOperation(operation, params);
    setAdvancedData({ category: '', priority: '', tags: '' });
    setShowAdvanced(false);
  };

  if (selectedTasks.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <GlassCard className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
            </span>

            <motion.button
              onClick={onClearSelection}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear Selection
            </motion.button>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-2">
            {/* Basic Operations */}
            <motion.button
              onClick={() => handleBulkOperation('complete')}
              disabled={isProcessing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
            >
              {isProcessing ? <LoadingSpinner size="sm" /> : 'Complete'}
            </motion.button>

            <motion.button
              onClick={() => handleBulkOperation('uncomplete')}
              disabled={isProcessing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
            >
              Uncomplete
            </motion.button>

            <motion.button
              onClick={() => handleBulkOperation('delete')}
              disabled={isProcessing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              Delete
            </motion.button>

            {/* Advanced Operations Toggle */}
            <motion.button
              onClick={() => setShowAdvanced(!showAdvanced)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              Advanced
            </motion.button>
          </div>
        </div>

        {/* Advanced Operations */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Set Category</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={advancedData.category}
                      onChange={(e) => setAdvancedData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., work, personal"
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleAdvancedOperation('update_category')}
                      disabled={isProcessing || !advancedData.category}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      Set
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Set Priority</label>
                  <div className="flex space-x-2">
                    <select
                      value={advancedData.priority}
                      onChange={(e) => setAdvancedData(prev => ({ ...prev, priority: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <button
                      onClick={() => handleAdvancedOperation('update_priority')}
                      disabled={isProcessing || !advancedData.priority}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      Set
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={advancedData.tags}
                      onChange={(e) => setAdvancedData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="tag1, tag2, tag3"
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleAdvancedOperation('add_tags')}
                      disabled={isProcessing || !advancedData.tags}
                      className="px-2 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => handleAdvancedOperation('remove_tags')}
                      disabled={isProcessing || !advancedData.tags}
                      className="px-2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
};

export default BulkOperations;