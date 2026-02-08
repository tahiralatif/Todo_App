'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import MainCanvas from '@/components/layout/MainCanvas';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push('/login');
      } else if (!requireAuth && isAuthenticated) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <MainCanvas>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-400 mt-4">Loading...</p>
          </div>
        </div>
      </MainCanvas>
    );
  }

  // If protecting a route and user is not authenticated, don't render anything
  // (the useEffect will handle the redirect)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If this is a public-only route (like login/signup) and user is authenticated,
  // don't render anything (the useEffect will handle the redirect)
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  // User is in the correct state, render the children
  return <>{children}</>;
};

export default ProtectedRoute;