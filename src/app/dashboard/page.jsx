'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Activity, 
  ClipboardList,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Package,
  Factory,
  Truck,
  Scissors,
  Loader2
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    inProduction: 0,
    readyForDelivery: 0,
    deliveredToday: 0,
    totalTailors: 0,
    activeTailors: 0,
    totalStaff: 0
  });

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      
      if (!data.success) {
        router.push('/login');
        return;
      }
      
      setUser(data.user);
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [ordersRes, productionRes, deliveryRes, tailorsRes, usersRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/production'),
        fetch('/api/delivery/delivered'),
        fetch('/api/tailors'),
        fetch('/api/users')
      ]);

      const ordersData = await ordersRes.json();
      const productionData = await productionRes.json();
      const deliveryData = await deliveryRes.json();
      const tailorsData = await tailorsRes.json();
      const usersData = await usersRes.json();

      if (ordersData.success) {
        const orders = ordersData.orders || [];
        setStats(prev => ({
          ...prev,
          totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.status === 'Pending').length,
          inProduction: orders.filter(o => o.status === 'In Production').length,
          readyForDelivery: orders.filter(o => o.status === 'Ready').length
        }));
      }

      if (deliveryData.success) {
        const today = new Date().toDateString();
        const deliveredToday = (deliveryData.orders || []).filter(o => 
          o.deliveryInfo?.deliveredDate && 
          new Date(o.deliveryInfo.deliveredDate).toDateString() === today
        ).length;
        setStats(prev => ({ ...prev, deliveredToday }));
      }

      if (tailorsData.success) {
        const tailors = tailorsData.tailors || [];
        setStats(prev => ({
          ...prev,
          totalTailors: tailors.length,
          activeTailors: tailors.filter(t => t.status === 'active').length
        }));
      }

      if (usersData.success) {
        setStats(prev => ({
          ...prev,
          totalStaff: (usersData.users || []).length
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { 
      label: 'Total Orders', 
      value: stats.totalOrders, 
      icon: Package, 
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      link: '/dashboard/orders'
    },
    { 
      label: 'Pending Orders', 
      value: stats.pendingOrders, 
      icon: Clock, 
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      link: '/dashboard/orders'
    },
    { 
      label: 'In Production', 
      value: stats.inProduction, 
      icon: Factory, 
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      link: '/dashboard/production'
    },
    { 
      label: 'Ready for Delivery', 
      value: stats.readyForDelivery, 
      icon: Truck, 
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      link: '/dashboard/delivery'
    },
    { 
      label: 'Delivered Today', 
      value: stats.deliveredToday, 
      icon: CheckCircle2, 
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      link: '/dashboard/delivery'
    },
    { 
      label: 'Total Tailors', 
      value: stats.totalTailors, 
      icon: Scissors, 
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      link: '/dashboard/tailors'
    },
    { 
      label: 'Active Tailors', 
      value: stats.activeTailors, 
      icon: Scissors, 
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      link: '/dashboard/tailors'
    },
    { 
      label: 'Total Staff', 
      value: stats.totalStaff, 
      icon: Users, 
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      link: '/dashboard/users'
    },
  ];

  const quickActions = [
    { name: 'New Order', icon: Package, link: '/dashboard/orders', color: 'from-blue-500 to-blue-600' },
    { name: 'Production', icon: Factory, link: '/dashboard/production', color: 'from-purple-500 to-purple-600' },
    { name: 'Delivery', icon: Truck, link: '/dashboard/delivery', color: 'from-green-500 to-green-600' },
    { name: 'Tailors', icon: Scissors, link: '/dashboard/tailors', color: 'from-[#975a20] to-[#7d4a1a]' },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#975a20] mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-sm sm:text-base text-gray-600">Monitor your business metrics in real-time</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <button
              key={index}
              onClick={() => router.push(stat.link)}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${stat.bgColor} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <h3 className="text-gray-600 text-xs sm:text-sm font-medium mb-1 truncate">{stat.label}</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {loading ? '...' : stat.value}
              </p>
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-200">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button 
                key={index}
                onClick={() => router.push(action.link)}
                className="group p-4 sm:p-5 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-[#975a20] transition-all duration-200 hover:shadow-md"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-200 shadow-lg mx-auto`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#975a20] transition-colors text-center">
                  {action.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Admin Badge */}
      {user?.role === 'admin' && (
        <div className="bg-gradient-to-r from-[#975a20] to-[#7d4a1a] rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-white">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">Administrator Access</h3>
              <p className="text-xs sm:text-sm text-white/90">
                You have full administrative privileges to manage all aspects of the system.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
