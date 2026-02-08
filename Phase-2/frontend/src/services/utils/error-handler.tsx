// Global error handling utilities

export interface ErrorInfo {
  message: string;
  code?: string;
  stack?: string;
  timestamp: Date;
  componentStack?: string;
}

export class ErrorHandler {
  static logError(error: Error, errorInfo?: React.ErrorInfo): void {
    // Log error to console in development
    console.error('Error caught:', error);
    if (errorInfo) {
      console.error('Component stack:', errorInfo.componentStack);
    }

    // In production, send error to logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToService(error, errorInfo);
    }
  }

  static formatError(error: any): ErrorInfo {
    return {
      message: error.message || 'An unknown error occurred',
      code: error.code || 'UNKNOWN_ERROR',
      stack: error.stack,
      timestamp: new Date(),
      componentStack: (error as any).componentStack,
    };
  }

  static sendErrorToService(error: Error, errorInfo?: React.ErrorInfo): void {
    // Send error to logging service (e.g., Sentry, LogRocket, etc.)
    // This is a placeholder implementation
    console.group('Sending error to service...');
    console.log('Error:', error);
    console.log('Error Info:', errorInfo);
    console.groupEnd();
  }

  static handleError(error: any, context?: string): void {
    const errorInfo = this.formatError(error);

    console.error(`[${context || 'Global'}] Error:`, errorInfo);

    // Optionally show user-friendly error message
    this.showUserFriendlyError(errorInfo);
  }

  static showUserFriendlyError(errorInfo: ErrorInfo): void {
    // Show a user-friendly error message
    // This could be implemented with a toast notification or modal
    console.warn('User-friendly error message:', errorInfo.message);
  }

  static async safeExecute<T>(
    fn: () => Promise<T> | T,
    onError?: (error: any) => void
  ): Promise<T | null> {
    try {
      return await Promise.resolve(fn());
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        this.handleError(error);
      }
      return null;
    }
  }
}

// Error boundary component
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    ErrorHandler.logError(error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h2>
          <p className="text-gray-400 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}