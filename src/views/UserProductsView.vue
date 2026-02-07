<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <UserLayout>
    <div class="products-page animate-fade-in">
      <!-- Page Header -->
      <div class="page-header bg-white rounded-2xl shadow-md p-8 mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-4xl font-bold text-slate-900 mb-2 font-rubik">Kho Dong Yang</h1>
          <p class="text-lg text-slate-500">Order vật tư ở đây nè !!!</p>
        </div>
        
        <div class="header-actions flex gap-4">
          <div class="relative w-80">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              v-model="searchQuery"
              placeholder="Search products..."
              class="pl-10 h-12 rounded-xl border-2"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="itemStore.loading" class="flex justify-center items-center min-h-100">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-slate-600">Đang tải vật tư...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="itemStore.error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p class="text-red-600 font-medium">{{ itemStore.error }}</p>
        <Button @click="fetchItems" class="mt-4">Thử lại</Button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredProducts.length === 0" class="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
        <ShoppingCart class="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <p class="text-slate-600 font-medium text-lg">
          {{ searchQuery ? 'Không tìm thấy vật tư phù hợp' : 'Chưa có vật tư nào' }}
        </p>
      </div>

      <!-- Products Grid -->
      <div v-else class="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="overflow-hidden pt-0 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl cursor-pointer border border-slate-200"
        >
          <!-- Product Image -->
          <div class="relative h-72 overflow-hidden bg-slate-100">
            <img 
              v-if="product.picture && product.picture.length > 0 && product.picture[0]"
              :src="getImageUrl(product.picture[0])" 
              :alt="getProductName(product)"
              class="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
              @error="handleImageError"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <ShoppingCart class="h-20 w-20 text-slate-300" />
            </div>
            <Badge 
              v-if="product.stockQty === 0" 
              variant="destructive"
              class="absolute top-4 right-4 backdrop-blur-md"
            >
              Hết Hàng
            </Badge>
            <Badge 
              v-else-if="product.stockQty < 10"
              class="absolute top-4 right-4 backdrop-blur-md bg-amber-500"
            >
              Sắp Hết
            </Badge>
          </div>

          <!-- Product Info -->
          <CardHeader class="space-y-2">
            <Badge 
              variant="outline" 
              :class="product.type === 'ENGINEER' 
                ? 'w-fit text-blue-600 border-blue-600' 
                : 'w-fit text-amber-600 border-amber-600'"
              class="uppercase text-xs font-semibold tracking-wider"
            >
              {{ product.type === 'ENGINEER' ? 'Hàng Kỹ Thuật' : 'Hàng Tiêu Dùng' }}
            </Badge>
            <CardTitle class="text-xl font-rubik">{{ getProductName(product) }}</CardTitle>
            <CardDescription class="text-base leading-relaxed line-clamp-2">
              {{ getProductDescription(product) }}
            </CardDescription>
          </CardHeader>

          <CardContent class="space-y-4">
            <!-- Stock & Price Info -->
            <div class="flex justify-between items-center text-sm">
              <div class="flex items-center gap-2">
                <span class="text-slate-600">Tồn kho:</span>
                <span class="font-semibold" :class="getStockColorClass(product.stockQty)">
                  {{ product.stockQty }} {{ product.unit }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-600">Giá:</span>
                <span class="font-bold text-blue-600">{{ formatPrice(product.price) }}</span>
              </div>
            </div>

            <!-- Price & Button -->
            <div class="flex justify-between items-center pt-4 border-t">
              <Button 
                :variant="isInCart(product.id!) ? 'default' : 'default'"
                :disabled="product.stockQty === 0"
                :class="[
                  isInCart(product.id!) 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 text-white cursor-pointer',
                  product.stockQty === 0 ? 'opacity-50 cursor-not-allowed' : ''
                ]"
                @click="addToCart(product)"
                class="w-full"
              >
                <Check v-if="isInCart(product.id!)" class="h-4 w-4 mr-2" />
                <ShoppingCart v-else class="h-4 w-4 mr-2" />
                {{ getCartButtonLabel(product.id!) }}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </UserLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useItemStore } from '@/stores/itemStore'
import { itemAPI } from '@/services/itemAPI'
import type { Item } from '@/types/item.types'
import UserLayout from '@/components/UserLayout.vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, ShoppingCart, Check } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cartStore'
import { toast } from 'sonner'

const itemStore = useItemStore()
const cartStore = useCartStore()
const searchQuery = ref('')

// Computed for filtered products
const filteredProducts = computed(() => {
  if (!searchQuery.value) return itemStore.items
  
  const query = searchQuery.value.toLowerCase()
  return itemStore.items.filter(item => {
    const name = getProductName(item).toLowerCase()
    const description = getProductDescription(item).toLowerCase()
    const type = item.type.toLowerCase()
    
    return name.includes(query) || 
           description.includes(query) || 
           type.includes(query)
  })
})

// Fetch items from API
const fetchItems = async () => {
  itemStore.setLoading(true)
  itemStore.setError(null)
  
  try {
    const items = await itemAPI.getAll()
    itemStore.setItems(items)
  } finally {
    itemStore.setLoading(false)
  }
}

// Helper functions
const getProductName = (item: Item): string => {
  if (item.eng) return item.eng.partname
  if (item.com) return item.com.name
  return 'Unknown Product'
}

const getProductDescription = (item: Item): string => {
  if (item.eng) return item.eng.description
  if (item.com) return item.com.specifications
  return 'No description available'
}

const getImageUrl = (imagePath: string): string => {
  // Adjust this based on your API base URL
  if (imagePath.startsWith('http')) return imagePath
  return `${import.meta.env.VITE_API_BASE_URL}/api/Item/image/${imagePath}`
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop'
}

const formatPrice = (price: string): string => {
  const numPrice = parseFloat(price)
  if (isNaN(numPrice)) return price
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(numPrice)
}

const getStockColorClass = (stockQty: number): string => {
  if (stockQty === 0) return 'text-red-600'
  if (stockQty < 10) return 'text-amber-600'
  return 'text-green-600'
}

// Cart functions (replace with your actual cart store logic)
const isInCart = (productId: number): boolean => {
  return cartStore.isInCart(productId)
}

const getCartButtonLabel = (productId: number): string => {
  return isInCart(productId) ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ'
}

const addToCart = (product: Item) => {
  if (product.stockQty === 0) return
  
  if (!product.id) return
  
  if (!isInCart(product.id)) {
    cartStore.addToCart(product, 1) 
    toast.success('Đã thêm vật tư vào giỏ hàng', { duration: 3000 })
  }
}

onMounted(() => {
  fetchItems()
})
</script>

<style scoped>
.products-page {
  max-width: 100%;
}

.font-rubik {
  font-family: 'Rubik', sans-serif;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .relative {
    width: 100%;
  }
}
</style>