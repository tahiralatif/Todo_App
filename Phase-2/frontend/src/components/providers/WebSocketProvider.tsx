'use client';

import React from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

// This provider initializes the WebSocket connection
// The actual hook is used in components that need WebSocket data
export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize WebSocket connection
  useWebSocket();

  return <>{children}</>;
};