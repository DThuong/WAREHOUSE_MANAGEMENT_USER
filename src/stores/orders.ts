import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CartItem } from './carts'

export interface Order {
  id: number
  orderNumber: string
  date: string
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected'
  items: CartItem[]
  totalAmount: number
  notes: string
}

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>([])

  const createOrder = async (items: CartItem[], notes: string = ''): Promise<Order> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    const newOrder: Order = {
      id: orders.value.length + 1,
      orderNumber: `ORD-${Date.now()}`,
      date: new Date().toISOString().split('T')[0] || '',
      status: 'pending',
      items: [...items],
      totalAmount,
      notes
    }
    
    orders.value.unshift(newOrder)
    saveOrders()
    
    return newOrder
  }

  const getOrderById = (id: number): Order | undefined => {
    return orders.value.find(order => order.id === id)
  }

  const cancelOrder = (id: number): boolean => {
    const order = getOrderById(id)
    if (order && order.status === 'pending') {
      order.status = 'rejected'
      saveOrders()
      return true
    }
    return false
  }

  const saveOrders = () => {
    localStorage.setItem('orders', JSON.stringify(orders.value))
  }

  const loadOrders = () => {
    const savedOrders = localStorage.getItem('orders')
    if (savedOrders) {
      orders.value = JSON.parse(savedOrders)
    } else {
      // Mock data for demonstration
      orders.value = [
        {
          id: 1,
          orderNumber: 'ORD-001',
          date: '2026-01-15',
          status: 'pending',
          items: [],
          totalAmount: 1500,
          notes: 'Urgent request'
        },
        {
          id: 2,
          orderNumber: 'ORD-002',
          date: '2026-01-14',
          status: 'approved',
          items: [],
          totalAmount: 2300,
          notes: ''
        },
        {
          id: 3,
          orderNumber: 'ORD-003',
          date: '2026-01-13',
          status: 'completed',
          items: [],
          totalAmount: 890,
          notes: ''
        }
      ]
    }
  }

  return {
    orders,
    createOrder,
    getOrderById,
    cancelOrder,
    loadOrders
  }
})
