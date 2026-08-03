"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"

interface Notification {
  _id: string
  title: string
  message: string
  read: boolean
  createdAt: string
  type: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" })
      setNotifications(notifications.filter(n => n._id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-[var(--text-primary)] hover:text-[var(--accent-dark)] transition-colors"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-[#ddd8cf] rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="p-3 bg-[#F5F2EC] border-b border-[#ddd8cf]">
            <h3 className="font-serif text-lg text-[var(--text-primary)]">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-[var(--text-muted)]">
                No new notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif._id} className="p-4 border-b border-[#ddd8cf] hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => markAsRead(notif._id)}>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{notif.title}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{notif.message}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-2">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
