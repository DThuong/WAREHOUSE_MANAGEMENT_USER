/* eslint-disable @typescript-eslint/no-explicit-any */
import * as signalR from '@microsoft/signalr'
import { useNotificationStore } from '@/stores/notificationStore'

class SignalRService {
  private connection: signalR.HubConnection | null = null

  async start() {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return
    }

    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.warn('No token')
      return
    }

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl('http://172.16.162.103:5002/notificationHub', {
          accessTokenFactory: () => token,
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Information)
        .build()

      this.setupEventHandlers()

      await this.connection.start()
      console.log('Connected:', this.connection.connectionId)

    } catch (error: any) {
      console.error('SignalR error:', error.message)
    }
  }

  private setupEventHandlers() {
    if (!this.connection) return

    const store = useNotificationStore()

    this.connection.on('ReceiveNotification', (notification: any) => {
      console.log('Notification:', notification)
      store.addNotification(notification)
    })
  }

  async stop() {
    await this.connection?.stop()
    this.connection = null
  }

  isConnected() {
    return this.connection?.state === signalR.HubConnectionState.Connected
  }
}

export const signalRService = new SignalRService()