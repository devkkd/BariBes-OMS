import { Settings, Bell, Lock, User, Globe, Palette, Save } from 'lucide-react';

export default function SettingsPage() {
  const settingsSections = [
    {
      title: 'General Settings',
      icon: Settings,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      fields: [
        { label: 'Application Name', type: 'text', value: 'Dashboard App', placeholder: 'Enter app name' },
        { label: 'Time Zone', type: 'select', value: 'UTC', options: ['UTC', 'IST', 'EST', 'PST'] },
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      fields: [
        { label: 'Email Notifications', type: 'checkbox', checked: true },
        { label: 'Push Notifications', type: 'checkbox', checked: false },
        { label: 'SMS Alerts', type: 'checkbox', checked: true },
      ]
    },
    {
      title: 'Security',
      icon: Lock,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      fields: [
        { label: 'Two-Factor Authentication', type: 'checkbox', checked: false },
        { label: 'Session Timeout (minutes)', type: 'number', value: '30' },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">Manage your application preferences and configurations</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Section Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${section.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${section.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                </div>
              </div>

              {/* Section Content */}
              <div className="p-6 space-y-5">
                {section.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    {field.type === 'text' && (
                      <input
                        type="text"
                        defaultValue={field.value}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] focus:border-transparent outline-none transition"
                      />
                    )}
                    {field.type === 'number' && (
                      <input
                        type="number"
                        defaultValue={field.value}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] focus:border-transparent outline-none transition"
                      />
                    )}
                    {field.type === 'select' && (
                      <select className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] focus:border-transparent outline-none transition">
                        {field.options?.map((option, optIndex) => (
                          <option key={optIndex} value={option} selected={option === field.value}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    {field.type === 'checkbox' && (
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={field.checked}
                          className="w-5 h-5 text-[#975a20] border-gray-300 rounded focus:ring-[#975a20]"
                        />
                        <span className="text-sm text-gray-700">Enable {field.label.toLowerCase()}</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        <button className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
          Cancel
        </button>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#975a20] to-[#7d4a1a] hover:from-[#7d4a1a] hover:to-[#6b4117] text-white rounded-xl transition-all duration-200 font-medium shadow-lg shadow-[#975a20]/20">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Info Banner */}
      {/* <div className="bg-gradient-to-br from-[#975a20] to-[#7d4a1a] rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Settings Auto-Save</h3>
            <p className="text-sm text-white/90">
              All changes are automatically saved and applied immediately. You can revert to previous settings from the history panel.
            </p>
          </div>
        </div>
      </div> */}
    </div>
  );
}
