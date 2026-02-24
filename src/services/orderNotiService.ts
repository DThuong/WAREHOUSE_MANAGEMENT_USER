/* eslint-disable @typescript-eslint/no-explicit-any */
import * as signalR from '@microsoft/signalr'

class SignalRService {
  private connection: signalR.HubConnection | null = null

  async start() {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('[SignalR] Already connected')
      return
    }

    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.warn('[SignalR] No auth token')
      return
    }

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl('http://172.16.162.123:7000/orderHub', {
          accessTokenFactory: () => token,
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Information)
        .build()

      await this.connection.start()
      console.log('[SignalR] Connected successfully')

    } catch (error: any) {
      console.error('[SignalR] Connection error:', error)
    }
  }

  // Đăng ký listener cho event
  on(eventName: string, callback: (...args: any[]) => void) {
    if (this.connection) {
      this.connection.on(eventName, callback)
      console.log(`[SignalR] ✅ Registered listener for: ${eventName}`)
    } else {
      console.error('[SignalR] ❌ No connection to register listener')
    }
  }

  // Hủy đăng ký listener
  off(eventName: string) {
    if (this.connection) {
      this.connection.off(eventName)
      console.log(`[SignalR] ✅ Unregistered listener for: ${eventName}`)
    }
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected
  }

  async stop() {
    await this.connection?.stop()
    this.connection = null
    console.log('[SignalR] Connection stopped')
  }
}

export const signalRService = new SignalRService()