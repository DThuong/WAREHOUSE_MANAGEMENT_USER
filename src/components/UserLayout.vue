<template>
  <div class="min-h-screen flex flex-col" style="background: linear-gradient(180deg, #f5f5f5 0%, #ffffff 100%);">
    <!-- Header -->
    <header class="sticky top-0 z-50 shadow-md" style="background: linear-gradient(135deg, #0F2854 0%, #1C4D8D 100%);">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center gap-3 shrink-0">
            <div>
              <h2 class="font-rubik text-xl sm:text-2xl font-bold text-white tracking-[3px] m-0">
                DONGYANG
              </h2>
              <p class="text-xs text-white/90 m-0 font-medium hidden sm:block">Kho Dong Yang</p>
            </div>
          </div>

          <!-- Navigation - Hidden on mobile -->
          <nav class="hidden lg:flex gap-2">
            <router-link 
              v-for="link in navLinks" 
              :key="link.path"
              :to="link.path"
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-white/90 no-underline font-medium transition-all duration-300 hover:bg-white/15"
              :class="{ 
                'bg-white shadow-lg font-semibold': $route.path === link.path 
              }"
              :style="$route.path === link.path ? 'color: #1C4D8D;' : ''"
            >
              <component :is="link.icon" class="h-4 w-4" />
              <span>{{ link.label }}</span>
            </router-link>
          </nav>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <!-- Cart Button -->
            <Button
              variant="ghost"
              size="icon"
              class="relative w-10 h-10 rounded-full bg-white/15 text-white transition-all duration-300 hover:bg-white/25 hover:scale-105 cursor-pointer"
              @click="router.push('/user/cart')"
            >
              <ShoppingCart class="h-5 w-5" />
              <Badge 
                v-if="cartStore.totalItems > 0" 
                variant="destructive"
                class="absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full text-xs font-bold border-2 border-white px-1"
                style="background: #4988C4;"
              >
                {{ cartStore.totalItems }}
              </Badge>
            </Button>

            <!-- User Menu -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  class="rounded-full hover:bg-white/15 w-10 h-10 transition-all duration-300"
                >
                  <Avatar class="h-9 w-9 border-2 border-white/30 cursor-pointer">
                    <AvatarFallback class="text-white font-bold text-sm" style="background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%);">
                      {{ userInitial }}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                class="w-64 dropdown-animate border-2 shadow-2xl"
                style="z-index: 9999; background: linear-gradient(135deg, #E8F4FA 0%, #ffffff 100%); border-color: #BDE8F5;"
              >
                <DropdownMenuLabel class="text-base font-semibold" style="color: #0F2854;">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator style="background: #BDE8F5; height: 2px;" />
                <DropdownMenuItem 
                  @click="console.log('Profile')"
                  class="dropdown-item cursor-pointer py-3 px-4"
                >
                  <User class="mr-3 h-5 w-5" style="color: #4988C4;" />
                  <span class="font-medium" style="color: #1C4D8D;">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  @click="console.log('Settings')"
                  class="dropdown-item cursor-pointer py-3 px-4"
                >
                  <Settings class="mr-3 h-5 w-5" style="color: #4988C4;" />
                  <span class="font-medium" style="color: #1C4D8D;">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator style="background: #BDE8F5; height: 2px;" />
                <DropdownMenuItem 
                  @click="handleLogout"
                  class="dropdown-item cursor-pointer py-3 px-4"
                >
                  <LogOut class="mr-3 h-5 w-5" style="color: #e05d5d;" />
                  <span class="font-medium" style="color: #e05d5d;">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Navigation -->
    <nav class="lg:hidden sticky top-16 z-40 bg-white border-b shadow-sm">
      <div class="container mx-auto px-4 max-w-8xl flex gap-1 overflow-x-auto py-2">
        <router-link 
          v-for="link in navLinks" 
          :key="link.path"
          :to="link.path"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 no-underline font-medium text-sm whitespace-nowrap transition-all duration-300"
          :class="{ 
            'text-white shadow-md font-semibold': $route.path === link.path 
          }"
          :style="$route.path === link.path ? 'background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%);' : ''"
        >
          <component :is="link.icon" class="h-4 w-4" />
          <span>{{ link.label }}</span>
        </router-link>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl py-6">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="text-center py-8 mt-auto" style="background: linear-gradient(135deg, #0F2854 0%, #1C4D8D 100%);">
      <p class="m-0 text-sm text-white/90 font-medium">&copy; Team IT DONGYANG</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserAuthStore } from '@/stores/userAuth'
import { useCartStore } from '@/stores/carts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Home,
  ShoppingBag,
  List,
  ShoppingCart,
  User,
  Settings,
  LogOut
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useUserAuthStore()
const cartStore = useCartStore()

authStore.checkAuth()
cartStore.loadCart()

const userInitial = computed(() => {
  return authStore.user?.name?.charAt(0).toUpperCase() || 'U'
})

const navLinks = [
  { path: '/user/dashboard', label: 'Trang Chủ', icon: Home },
  { path: '/user/products', label: 'Vật Tư', icon: ShoppingBag },
  { path: '/user/orders', label: 'Đơn Đặt Hàng', icon: List }
]

const handleLogout = () => {
  authStore.logout()
  router.push('/user/login')
}
</script>

<style scoped>
.font-rubik {
  font-family: 'Rubik', sans-serif;
}


@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dropdown Item Hover Effects */
:deep(.dropdown-item) {
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 4px 8px;
}

:deep(.dropdown-item:hover) {
  background: linear-gradient(135deg, #BDE8F5 0%, #E8F4FA 100%) !important;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(73, 136, 196, 0.15);
}

/* Navigation Link Animations */
nav a {
  position: relative;
  overflow: hidden;
}

nav a::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

nav a:hover::before {
  left: 100%;
}

/* Mobile Navigation Animations */
.lg\:hidden nav a {
  animation: navItemSlideIn 0.3s ease-out backwards;
}

.lg\:hidden nav a:nth-child(1) {
  animation-delay: 0.05s;
}

.lg\:hidden nav a:nth-child(2) {
  animation-delay: 0.1s;
}

.lg\:hidden nav a:nth-child(3) {
  animation-delay: 0.15s;
}

@keyframes navItemSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Cart Button Pulse Animation */
.relative:has(.badge) {
  animation: cartPulse 2s ease-in-out infinite;
}

@keyframes cartPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Avatar Hover Effect */
.rounded-full:has(.border-2) {
  transition: all 0.3s ease;
}

.rounded-full:has(.border-2):hover {
  transform: rotate(5deg) scale(1.1);
}

/* Enhanced Z-index for dropdown */
:deep([data-radix-popper-content-wrapper]) {
  z-index: 9999 !important;
}
</style>