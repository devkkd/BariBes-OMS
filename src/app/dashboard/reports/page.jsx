import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { FileText, Download, Calendar, TrendingUp, Users, DollarSign, Shield, BarChart3 } from 'lucide-react';

export default async function ReportsPage() {
  const user = await getCurrentUser();

  if (user?.role !== 'admin') {
    redirect('/dashboard');
  }

  const reports = [
    { 
      name: 'User Activity Report', 
      description: 'Detailed analysis of user engagement and activity patterns',
      icon: Users, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    { 
      name: 'Revenue Report', 
      description: 'Financial performance and revenue analytics',
      icon: DollarSign, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    { 
      name: 'System Performance', 
      description: 'Application performance metrics and uptime statistics',
      icon: TrendingUp, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    { 
      name: 'Security Audit', 
      description: 'Security events, login attempts, and access logs',
      icon: Shield, 
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    { 
      name: 'Data Export', 
      description: 'Export all system data in various formats',
      icon: Download, 
      color: 'from-[#975a20] to-[#7d4a1a]',
      bgColor: 'bg-orange-50',
      iconColor: 'text-[#975a20]'
    },
    { 
      name: 'Custom Analytics', 
      description: 'Create custom reports with specific parameters',
      icon: BarChart3, 
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reports & Analytics</h2>
        <p className="text-gray-600">Generate and download comprehensive system reports</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#975a20] to-[#7d4a1a] flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Downloads</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => {
          const Icon = report.icon;
          return (
            <div 
              key={index} 
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-200 group"
            >
              <div className={`w-14 h-14 rounded-xl ${report.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`w-7 h-7 ${report.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{report.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{report.description}</p>
              <button className={`w-full px-4 py-2.5 bg-gradient-to-r ${report.color} text-white hover:shadow-lg rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2`}>
                <Download className="w-4 h-4" />
                Generate Report
              </button>
            </div>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-br from-[#975a20] to-[#7d4a1a] rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Automated Report Scheduling</h3>
            <p className="text-sm text-white/90">
              Set up automated report generation and delivery. Reports can be scheduled daily, weekly, or monthly and sent directly to your email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
