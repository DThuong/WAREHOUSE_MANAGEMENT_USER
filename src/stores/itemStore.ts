import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Item } from '@/types/item.types'

export const useItemStore = defineStore('item', () => {
  // State
  const items = ref<Item[]>([])
  const currentItem = ref<Item | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // State for image operations
  const uploadingImages = ref(false)
  const deletingImage = ref(false)

  // Getters
  const totalItems = computed(() => items.value.length)
  
  const engineerItems = computed(() => 
    items.value.filter(item => item.eng !== null && item.eng !== undefined)
  )
  
  const consumerItems = computed(() => 
    items.value.filter(item => item.com !== null && item.com !== undefined)
  )

  const lowStockItems = computed(() => 
    items.value.filter(item => item.stockQty < 10)
  )

  // Actions
  const setItems = (newItems: Item[]) => {
    items.value = [...newItems] 
  }

  const setCurrentItem = (item: Item | null) => {
    currentItem.value = item
  }

  const addItem = (item: Item) => {
    items.value = [...items.value, item]
  }

  const updateItemInStore = (id: number, updatedItem: Item) => {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updatedItem }
      items.value = [...items.value]
    }
  }

  const removeItem = (id: number) => {
    items.value = items.value.filter(item => item.id !== id)
  }

  // ===================== IMAGE Actions =====================

  const setUploadingImages = (value: boolean) => {
    uploadingImages.value = value
  }

  const setDeletingImage = (value: boolean) => {
    deletingImage.value = value
  }

  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (message: string | null) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  const clearItems = () => {
    items.value = []
    currentItem.value = null
  }

  return {
    // State
    items,
    currentItem,
    loading,
    error,
    uploadingImages,
    deletingImage,
    
    // Getters
    totalItems,
    engineerItems,
    consumerItems,
    lowStockItems,
    
    // Actions
    setItems,
    setCurrentItem,
    addItem,
    updateItemInStore,
    removeItem,
    setUploadingImages,
    setDeletingImage,
    setLoading,
    setError,
    clearError,
    clearItems
  }
})