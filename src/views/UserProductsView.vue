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

      <!-- Products Grid -->
      <div class="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl cursor-pointer border border-slate-200"
        >
          <!-- Product Image -->
          <div class="relative h-72 overflow-hidden">
            <img 
              :src="product.image" 
              :alt="product.name" 
              class="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
            />
            <Badge 
              v-if="!product.inStock" 
              variant="destructive"
              class="absolute top-4 right-4 backdrop-blur-md"
            >
              Out of Stock
            </Badge>
          </div>

          <!-- Product Info -->
          <CardHeader class="space-y-2">
            <Badge variant="outline" class="w-fit text-amber-600 border-amber-600 uppercase text-xs font-semibold tracking-wider">
              {{ product.category }}
            </Badge>
            <CardTitle class="text-xl font-rubik">{{ product.name }}</CardTitle>
            <CardDescription class="text-base leading-relaxed">
              {{ product.description }}
            </CardDescription>
          </CardHeader>

          <CardContent class="space-y-4">
            <!-- Rating -->
            <div class="flex items-center gap-2">
              <div class="flex gap-1">
                <Star 
                  v-for="i in 5" 
                  :key="i"
                  :class="[
                    'h-4 w-4',
                    i <= Math.round(product.rating) 
                      ? 'fill-amber-500 text-amber-500' 
                      : 'fill-slate-200 text-slate-200'
                  ]"
                />
              </div>
              <span class="text-sm font-semibold text-slate-600">{{ product.rating }}/5</span>
            </div>

            <!-- Price & Button -->
            <div class="flex justify-between items-center pt-4 border-t">
              <div class="text-3xl font-bold text-amber-600">
                ${{ product.price.toFixed(2) }}
              </div>
              <Button 
                :variant="isInCart(product.id) ? 'default' : 'default'"
                :disabled="!product.inStock"
                :class="[
                  isInCart(product.id) 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-200 hover:bg-blue-400'
                ]"
                @click="addToCart(product)"
              >
                <Check v-if="isInCart(product.id)" class="mr-2 h-4 w-4" />
                <ShoppingCart v-else class="mr-2 h-4 w-4" />
                {{ getCartButtonLabel(product.id) }}
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
import { useCartStore } from '@/stores/carts'
import type { Product } from '@/stores/carts'
import UserLayout from '@/components/UserLayout.vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Star, ShoppingCart, Check } from 'lucide-vue-next'

const cartStore = useCartStore()

const searchQuery = ref('')

const products = ref<Product[]>([
  {
    id: 1,
    name: 'Premium Leather Wallet',
    description: 'Handcrafted Italian leather wallet with RFID protection',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop',
    category: 'Accessories',
    inStock: true,
    rating: 4.8
  },
  {
    id: 2,
    name: 'Luxury Watch Collection',
    description: 'Swiss-made automatic watch with sapphire crystal',
    price: 2499.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    category: 'Watches',
    inStock: true,
    rating: 4.9
  },
  {
    id: 3,
    name: 'Designer Sunglasses',
    description: 'Polarized lenses with titanium frame',
    price: 399.99,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=300&fit=crop',
    category: 'Eyewear',
    inStock: true,
    rating: 4.7
  },
  {
    id: 4,
    name: 'Premium Briefcase',
    description: 'Full-grain leather professional briefcase',
    price: 599.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
    category: 'Bags',
    inStock: false,
    rating: 4.6
  },
  {
    id: 5,
    name: 'Silk Tie Collection',
    description: 'Hand-rolled 100% silk ties',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
    category: 'Accessories',
    inStock: true,
    rating: 4.5
  },
  {
    id: 6,
    name: 'Gold Cufflinks',
    description: '18K gold-plated stainless steel cufflinks',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=300&fit=crop',
    category: 'Jewelry',
    inStock: true,
    rating: 4.8
  }
])

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  
  const query = searchQuery.value.toLowerCase()
  return products.value.filter(product => 
    product.name.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query)
  )
})

const isInCart = (productId: number): boolean => {
  return cartStore.items.some(item => item.id === productId)
}

const getCartButtonLabel = (productId: number): string => {
  return isInCart(productId) ? 'In Cart' : 'Add to Cart'
}

const addToCart = (product: Product) => {
  if (!product.inStock) return
  
  cartStore.addToCart(product, 1)
}

onMounted(() => {
  cartStore.loadCart()
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