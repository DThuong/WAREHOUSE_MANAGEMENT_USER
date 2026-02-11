/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification } from '@/types/notification.types'
import { notificationAPI } from '@/services/notificationAPI'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.isRead).length
  })

  const sortedNotifications = computed(() => {
    return [...notifications.value].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  })

  const recentNotifications = computed(() => {
    return sortedNotifications.value
  })

  // Actions
  const fetchNotifications = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await notificationAPI.getAll()
      notifications.value = data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch notifications'
      console.error('Error fetching notifications:', err)
    } finally {
      loading.value = false
    }
  }

  const addNotification = (notification: Notification) => {
    const exists = notifications.value.some(n => n.id === notification.id)
    if (!exists) {
      notifications.value = [notification, ...notifications.value]
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      // Gọi API để đánh dấu đã đọc
      await notificationAPI.markasRead(notificationId)
      
      // Cập nhật local state
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.isRead = true
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllRead = async () => {
    try {
      // Gọi API để đánh dấu tồn tại đọc
      await notificationAPI.markAllRead()
      
      // Cập nhật local state
      notifications.value.forEach(n => {
        n.isRead = true
      })
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  const deleteAll = async () => {
    try {
      // Gọi API để xoa tat ca
      await notificationAPI.deleteAll()
      
      // Cập nhật local state
      notifications.value = []
    } catch (err) {
      console.error('Error deleting all notifications:', err)
    }
  }


  const clearAll = () => {
    notifications.value = []
  }

  return {
    // State
    notifications,
    loading,
    error,
    
    // Computed
    unreadCount,
    sortedNotifications,
    recentNotifications,
    
    // Actions
    fetchNotifications,
    deleteAll,
    addNotification,
    markAsRead,
    markAllRead,
    clearAll
  }
})