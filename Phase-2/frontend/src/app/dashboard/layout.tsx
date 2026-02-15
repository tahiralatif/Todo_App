'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Bell, 
  User, 
  BarChart3, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import type { Profile } from '@/types';
import NotificationPermissionPrompt from '@/components/NotificationPermissionPrompt';
import NotificationBlockedAlert from '@/components/NotificationBlockedAlert';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadUnreadCount();
      // Refresh unread count every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      loadProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  // Listen for notification updates
  useEffect(() => {
    const handleNotificationUpdate = () => {
      loadUnreadCount();
    };

    window.addEventListener('notificationsUpdated', handleNotificationUpdate);
    return () => window.removeEventListener('notificationsUpdated', handleNotificationUpdate);
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data as Profile);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data: any = await api.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      {/* Notification Permission Prompt */}
      <NotificationPermissionPrompt />
      
      {/* Notification Blocked Alert */}
      <NotificationBlockedAlert />
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <Link href="/" className="text-2xl font-bold">
              Execute<span className="text-teal-500">.</span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Profile Card - Enhanced */}
          <Link href="/dashboard/profile" className="block p-6 border-b border-slate-700/50 hover:bg-slate-800/30 transition-all group">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 group-hover:border-teal-500/30 transition-all">
              <div className="flex items-center gap-4">
                {profile?.profile_photo_url ? (
                  <img
                    src={profile.profile_photo_url}
                    alt={user.name}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-teal-500/30 group-hover:border-teal-500/50 transition-all"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-teal-500/20 flex items-center justify-center border-2 border-teal-500/30 group-hover:border-teal-500/50 transition-all">
                    <User className="w-8 h-8 text-teal-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold truncate text-white">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              {profile?.bio && (
                <p className="text-xs text-slate-400 mt-4 line-clamp-3 leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const isNotifications = item.name === 'Notifications';
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                    isActive
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {isNotifications && unreadCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-700/50">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:flex-none">
              <h1 className="text-xl font-bold">
                {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
              </h1>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
