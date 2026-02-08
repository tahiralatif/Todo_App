'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';

interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  title?: string;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ items, title = 'Menu', className = '' }) => {
  return (
    <GlassCard className={`w-64 p-4 h-full flex flex-col ${className}`}>
      {title && (
        <h2 className="text-xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
          {title}
        </h2>
      )}

      <nav className="flex-1">
        <ul className="space-y-2">
          {items.map((item, index) => (
            <motion.li
              key={item.href}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={item.href} passHref legacyBehavior>
                <a className="w-full flex items-center justify-start gap-2 px-4 py-2 rounded-md hover:bg-white/10 transition-colors">
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </a>
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto pt-4 border-t border-white/10">
        <p className="text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} Todo App
        </p>
      </div>
    </GlassCard>
  );
};

export default Sidebar;