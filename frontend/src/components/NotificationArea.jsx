import { Bell, AlertCircle, CheckCircle, Info } from 'lucide-react'

export function NotificationArea() {
  // Placeholder notifications
  const notifications = [
    {
      id: 1,
      type: 'info',
      title: 'System Update',
      message: 'New features available in patient management.',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Appointment Reminder',
      message: 'You have 3 appointments scheduled for today.',
      time: '4 hours ago'
    },
    {
      id: 3,
      type: 'success',
      title: 'Data Sync Complete',
      message: 'Patient records have been successfully synced.',
      time: '1 day ago'
    }
  ]

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <div 
      className="h-full min-h-[350px] rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-200 p-6 flex flex-col"
      style={{ border: '1px solid #d1d5db' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Bell className="h-6 w-6 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
      </div>

      {/* Notifications List */}
      <div className="flex-1 space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              {getIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {notification.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
                <span className="text-xs text-gray-400 mt-2 block">
                  {notification.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View all notifications
        </button>
      </div>
    </div>
  )
} 