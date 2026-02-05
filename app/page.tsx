'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { setTheme } from '@/lib/redux/slices/uiSlice';
import { localStorageService } from '@/lib/services/localStorage';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ChatLayout from '@/components/layout/ChatLayout';

export default function Home() {
  const dispatch = useAppDispatch();
  const { theme, sidebarCollapsed } = useAppSelector(state => state.ui);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorageService.getTheme();
    dispatch(setTheme(savedTheme));
  }, [dispatch]);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorageService.saveTheme(theme);
  }, [theme]);

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <ChatLayout />
        </main>
      </div>
    </div>
  );
}