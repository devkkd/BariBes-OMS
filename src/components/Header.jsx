'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Bell, LogOut, Calendar, Shield } from 'lucide-react';

export default function Header({ user }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      setLoading(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Logo (Mobile) + Welcome Message */}
          <div className="min-w-0 flex-1 flex items-center gap-3">
            {/* Logo - Only visible on mobile when sidebar is hidden */}
            <div className="lg:hidden relative w-12 h-12 shrink-0">
              <Image
                src="/BB-logo.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 truncate">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}!
              </h1>
              <div className="hidden sm:flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-xs sm:text-sm text-gray-500 truncate">{currentDate}</p>
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Role Badge - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
              <Shield className="w-4 h-4 text-[#975a20]" />
              <span className="text-sm font-medium text-gray-700 hidden lg:inline">Role:</span>
              <span className="px-2.5 py-1 bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white text-xs font-semibold rounded-lg shadow-sm uppercase">
                {user?.role}
              </span>
            </div>


            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-[#975a20] to-[#7d4a1a] hover:from-[#7d4a1a] hover:to-[#6b4117] text-white rounded-xl transition-all duration-200 disabled:opacity-50 font-medium shadow-lg shadow-[#975a20]/20 text-sm"
              aria-label="Logout"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
