'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package,
  Scissors,
  Store,
  Box,
  Factory,
  Truck,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      roles: ['admin', 'staff'] 
    },
    { 
      name: 'Orders', 
      path: '/dashboard/orders', 
      icon: Package, 
      roles: ['admin', 'staff'] 
    },
    { 
      name: 'Production', 
      path: '/dashboard/production', 
      icon: Factory, 
      roles: ['admin', 'staff'] 
    },
    { 
      name: 'Storage', 
      path: '/dashboard/storage', 
      icon: Box, 
      roles: ['admin', 'staff'] 
    },
    { 
      name: 'Delivery', 
      path: '/dashboard/delivery', 
      icon: Truck, 
      roles: ['admin', 'staff'] 
    },
    { 
      name: 'Karigars', 
      path: '/dashboard/karigars', 
      icon: Users, 
      roles: ['admin'] 
    },
    { 
      name: 'Tailors', 
      path: '/dashboard/tailors', 
      icon: Scissors, 
      roles: ['admin'] 
    },
    { 
      name: 'Stores', 
      path: '/dashboard/stores', 
      icon: Store, 
      roles: ['admin'] 
    },
    { 
      name: 'Boxes', 
      path: '/dashboard/boxes', 
      icon: Box, 
      roles: ['admin'] 
    },
    { 
      name: 'Staff Management', 
      path: '/dashboard/users', 
      icon: Users, 
      roles: ['admin'] 
    },
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile Menu Button - Only show when sidebar is closed */}
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen
        w-72 bg-white border-r border-gray-200 
        flex flex-col z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section with Close Button */}
        <div className="p-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between mb-2 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          <div className="flex items-center justify-center px-4">
            <img
              src="/logo.png"
              alt="BariBes Logo"
              className="h-14 w-auto object-contain"
            />
            <div style={{ display: 'none' }} className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#975a20] to-[#7d4a1a] bg-clip-text text-transparent">
                BariBes
              </h1>
              <p className="text-xs text-gray-600 mt-1">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu - Scrollable */}
        <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="space-y-1">
            {filteredMenu.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white shadow-lg shadow-[#975a20]/20'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#975a20]'}`} />
                    <span className="font-medium truncate">{item.name}</span>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-white shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200 shrink-0">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#975a20] to-[#7d4a1a] flex items-center justify-center shrink-0 shadow-md">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
