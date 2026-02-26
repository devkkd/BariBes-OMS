import { TrendingUp, Users, Activity, BarChart3, PieChart, LineChart } from 'lucide-react';

export default function AnalyticsPage() {
  const metrics = [
    { label: 'Page Views', value: '45.2K', change: '+12.5%', icon: Activity },
    { label: 'Unique Visitors', value: '12.8K', change: '+8.2%', icon: Users },
    { label: 'Bounce Rate', value: '32.4%', change: '-3.1%', icon: TrendingUp },
    { label: 'Avg. Session', value: '4m 32s', change: '+15.3%', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600">View detailed analytics and insights about your application</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#975a20] to-[#7d4a1a] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                  metric.change.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {metric.change}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <LineChart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Traffic Overview</h3>
              <p className="text-sm text-gray-500">Last 30 days performance</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Chart visualization area</p>
              <p className="text-gray-400 text-xs mt-1">Integrate Chart.js or Recharts</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">User Growth</h3>
              <p className="text-sm text-gray-500">Monthly user acquisition</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="text-center">
              <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Chart visualization area</p>
              <p className="text-gray-400 text-xs mt-1">Integrate Chart.js or Recharts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-gradient-to-br from-[#975a20] to-[#7d4a1a] rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="w-6 h-6" />
          <h3 className="text-lg font-bold">Performance Insights</h3>
        </div>
        <p className="text-sm text-white/90">
          Your application is performing well with consistent growth across all metrics. User engagement is up 15% compared to last month.
        </p>
      </div>
    </div>
  );
}
