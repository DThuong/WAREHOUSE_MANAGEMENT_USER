<template>
  <div class="min-h-screen flex flex-col" style="background: linear-gradient(180deg, #f5f5f5 0%, #ffffff 100%);">
    <!-- Header -->
    <header class="sticky top-0 z-50 shadow-md" style="background: linear-gradient(135deg, #0F2854 0%, #1C4D8D 100%);">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div
            class="flex items-center gap-3 shrink-0 cursor-pointer transition-all hover:opacity-80"
            @click="router.push('/user/dashboard')"
          >
            <img
              src="@/assets/images/logo_app_warehouse.png"
              alt="Logo"
              class="h-10 w-auto object-contain"
            />
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
            <!-- Notification Button -->
            <div class="relative">
              <Button
                variant="ghost"
                size="icon"
                class="relative w-10 h-10 rounded-full bg-white/15 text-white transition-all duration-300 hover:bg-white/25 hover:scale-105 cursor-pointer"
                @click="toggleNotifications"
              >
                <Bell class="h-5 w-5" />
                <Badge
                  v-if="notificationStore.unreadCount > 0"
                  variant="destructive"
                  class="absolute -top-1 -right-1 min-w-5 h-5 rounded-full text-xs font-bold border-2 border-white px-1"
                  style="background: #ef4444;"
                >
                  {{ notificationStore.unreadCount }}
                </Badge>
              </Button>

              <!-- Notification Dropdown -->
              <div
                v-if="showNotifications"
                class="fixed md:absolute right-4 md:right-0 top-16 md:top-auto md:mt-2 left-4 md:left-auto md:w-96 w-auto bg-white rounded-xl md:rounded-xl shadow-2xl border md:border border-gray-200 overflow-hidden"
                style="z-index: 100000; max-height: calc(100vh - 4rem);"
                @click.stop
              >
                <!-- Header -->
                <div class="flex items-center justify-between p-4 bg-linear-to-r from-blue-50 to-white">
                  <div class="flex items-center gap-2">
                    <Bell class="h-5 w-5 text-blue-600" />
                    <h3 class="font-semibold text-lg text-gray-900">Thông báo</h3>
                  </div>
                  <Button
                    v-if="notificationStore.unreadCount > 0"
                    variant="ghost"
                    size="sm"
                    class="text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer text-xs"
                    @click="handleMarkAllRead"
                  >
                    <CheckCheck class="h-4 w-4 mr-1" />
                    Đánh dấu đã đọc
                  </Button>
                  <Button
                    v-if="isAllRead"
                    variant="ghost"
                    size="sm"
                    class="text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer text-xs"
                    @click="handleDeleteAllNoti"
                  >Xóa tất cả</Button>
                </div>

                <!-- Notifications List -->
                <div class="overflow-y-auto max-h-100 bg-white custom-scrollbar">
                  <div v-if="notificationStore.loading" class="p-8 bg-white flex justify-center">
                    <AppLoading text="Đang tải thông báo..." size="sm" />
                  </div>

                  <div v-else-if="notificationStore.notifications.length === 0" class="p-8 text-center bg-white">
                    <BellOff class="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p class="text-sm text-gray-500 font-medium">Chưa có thông báo nào</p>
                  </div>

                  <div v-else class="bg-white">
                    <div
                      v-for="notification in notificationStore.recentNotifications"
                      :key="notification.id"
                      class="p-4 hover:bg-blue-50/50 transition-colors cursor-pointer bg-white"
                      :class="{ 'bg-blue-50/30': !notification.isRead }"
                      @click="handleNotificationClick(notification)"
                    >
                      <div class="flex gap-3">
                        <!-- Icon -->
                        <div class="shrink-0">
                          <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Bell class="h-5 w-5 text-blue-600" />
                          </div>
                        </div>

                        <!-- Content -->
                        <div class="flex-1 min-w-0">
                          <div class="flex items-start justify-between gap-2">
                            <h4 class="font-semibold text-sm text-gray-900 line-clamp-1">
                              {{ notification.type === 'OrderStatusUpdated' ? "Cập nhật trạng thái" : notification.type || 'Thông báo' }}
                            </h4>
                            <div
                              v-if="!notification.isRead"
                              class="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1"
                            />
                          </div>

                          <p class="text-sm text-gray-700 mt-1 line-clamp-2">
                            {{ notification.message }}
                          </p>

                          <p class="text-xs text-gray-500 mt-2">
                            {{ formatTime(notification.createdAt) }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Backdrop overlay -->
              <div
                v-if="showNotifications"
                class="fixed inset-0 bg-transparent"
                style="z-index: 99999;"
                @click="showNotifications = false"
              />
            </div>

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
                class="absolute -top-1 -right-1 min-w-5 h-5 rounded-full text-xs font-bold border-2 border-white px-1"
                style="background: #4988C4;"
              >
                {{ cartStore.totalItems }}
              </Badge>
            </Button>

            <!-- User Menu -->
            <DropdownMenu v-model:open="showAvatarDropdown" :modal="false">
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
                <DropdownMenuItem
                  @click="openChangePasswordDialog"
                  class="dropdown-item cursor-pointer py-3 px-4"
                >
                  <Key class="mr-3 h-5 w-5" style="color: #4988C4;" />
                  <span class="font-medium" style="color: #4988C4;">Đổi mật khẩu</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  @click="handleLogout"
                  class="dropdown-item cursor-pointer py-3 px-4"
                >
                  <LogOut class="mr-3 h-5 w-5" style="color: #e05d5d;" />
                  <span class="font-medium" style="color: #e05d5d;">Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <!-- Modal đổi mật khẩu -->
            <Dialog :open="showChangePasswordDialog" @update:open="showChangePasswordDialog = $event">
              <DialogContent class="sm:max-w-[425px] border-none shadow-2xl outline-none" style="z-index: 100000; background: linear-gradient(135deg, #E8F4FA 0%, #ffffff 100%);">
                <DialogHeader>
                  <DialogTitle class="text-[#1C4D8D] font-bold text-xl">Đổi mật khẩu</DialogTitle>
                </DialogHeader>
                <div class="grid gap-4 py-4">
                  <div class="space-y-2">
                    <Label for="currentPassword">Mật khẩu hiện tại</Label>
                    <div class="relative">
                      <Input id="currentPassword" :type="showCurrentPassword ? 'text' : 'password'" v-model="changePasswordForm.currentPassword" class="border border-[#4988C4] focus-visible:ring-0 focus-visible:ring-offset-0 outline-none pr-10" />
                      <button type="button" @click="showCurrentPassword = !showCurrentPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-[#4988C4] hover:text-blue-700 cursor-pointer">
                        <EyeOff v-if="showCurrentPassword" class="h-4 w-4" />
                        <Eye v-else class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <Label for="newPassword">Mật khẩu mới</Label>
                    <div class="relative">
                      <Input id="newPassword" :type="showNewPassword ? 'text' : 'password'" v-model="changePasswordForm.newPassword" class="border border-[#4988C4] focus-visible:ring-0 focus-visible:ring-offset-0 outline-none pr-10" />
                      <button type="button" @click="showNewPassword = !showNewPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-[#4988C4] hover:text-blue-700 cursor-pointer">
                        <EyeOff v-if="showNewPassword" class="h-4 w-4" />
                        <Eye v-else class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <Label for="confirmPassword">Xác nhận mật khẩu mới</Label>
                    <div class="relative">
                      <Input id="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" v-model="changePasswordForm.confirmPassword" class="border border-[#4988C4] focus-visible:ring-0 focus-visible:ring-offset-0 outline-none pr-10" />
                      <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-[#4988C4] hover:text-blue-700 cursor-pointer">
                        <EyeOff v-if="showConfirmPassword" class="h-4 w-4" />
                        <Eye v-else class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" @click="showChangePasswordDialog = false" class="cursor-pointer focus-visible:ring-0 outline-none">Hủy</Button>
                  <Button @click="handleChangePassword" :disabled="isChangingPassword" class="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-0 outline-none">
                    <AppLoading v-if="isChangingPassword" type="inline" size="sm" class="mr-2 text-white" />
                    Xác nhận
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Navigation -->
    <nav class="lg:hidden sticky top-16 z-40 bg-white shadow-sm overflow-hidden">
      <div class="mx-auto max-w-8xl flex items-center justify-center gap-1 overflow-x-auto py-2">
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
    <main class="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="text-center py-8 mt-6" style="background: linear-gradient(135deg, #0F2854 0%, #1C4D8D 100%);">
      <p class="m-0 text-sm text-white/90 font-medium">&copy; Team IT DONGYANG</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'
import { useOrderStore } from '@/stores/orderStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { signalRService } from '@/services/signalrService'
import type { Notification } from '@/types/notification.types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'
import { userAPI } from '@/services/userAPI'
import {
  Home,
  ShoppingBag,
  List,
  ShoppingCart,
  LogOut,
  Bell,
  BellOff,
  CheckCheck,
  Loader2,
  Key,
  Eye,
  EyeOff
} from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()
const cartStore = useCartStore()
const notificationStore = useNotificationStore()
import AppLoading from '@/components/AppLoading.vue'

// State cho đổi mật khẩu
const showChangePasswordDialog = ref(false)
const isChangingPassword = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const changePasswordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const openChangePasswordDialog = () => {
  changePasswordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
  showChangePasswordDialog.value = true
}

const handleChangePassword = async () => {
  if (!changePasswordForm.value.currentPassword || !changePasswordForm.value.newPassword || !changePasswordForm.value.confirmPassword) {
    toast.error('Vui lòng điền đầy đủ thông tin')
    return
  }

  if (changePasswordForm.value.newPassword !== changePasswordForm.value.confirmPassword) {
    toast.error('Mật khẩu mới không khớp')
    return
  }

  try {
    isChangingPassword.value = true
    await userAPI.changePasswordByUser({
      currentPassword: changePasswordForm.value.currentPassword,
      newPassword: changePasswordForm.value.newPassword
    })
    
    toast.success('Đổi mật khẩu thành công')
    showChangePasswordDialog.value = false
  } catch (error: any) {
    toast.error(error.message || 'Có lỗi xảy ra khi đổi mật khẩu')
  } finally {
    isChangingPassword.value = false
  }
}

// Show/hide notifications dropdown
const showNotifications = ref(false)

// Show/hide avatar dropdown
const showAvatarDropdown = ref(false)

// Computed để lấy initial của user từ username
const userInitial = computed(() => {
  return userStore.currentUser?.username?.charAt(0).toUpperCase() || 'U'
})

const navLinks = [
  { path: '/user/dashboard', label: 'Trang Chủ', icon: Home },
  { path: '/user/products', label: 'Vật Tư', icon: ShoppingBag },
  { path: '/user/orders', label: 'Đơn Đặt Hàng', icon: List }
]

// Toggle notifications dropdown
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

// Format time ago
const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / 60000)
  const diffInHours = Math.floor(diffInMs / 3600000)
  const diffInDays = Math.floor(diffInMs / 86400000)

  if (diffInMinutes < 1) return 'Vừa xong'
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
  if (diffInHours < 24) return `${diffInHours} giờ trước`
  if (diffInDays < 7) return `${diffInDays} ngày trước`

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// xử lý click 1 thông báo cụ thể - đánh dấu đã đọc và điều hướng nếu có orderId
const handleNotificationClick = async (notification: Notification) => {
  if (!notification.isRead) {
    notificationStore.markAsRead(notification.id)
  }

  showNotifications.value = false

  if (!notification.orderId) {
    router.push('/user/orders')
    return
  }

  // Chỉ navigate thôi, để OrderDetail tự fetch
  // Nếu order không tồn tại thì OrderDetail sẽ tự xử lý toast + redirect
  router.push(`/user/orders/${notification.orderId}`)
}

// Handle mark all as read
const handleMarkAllRead = async () => {
  await notificationStore.markAllRead()
}

const handleDeleteAllNoti = async() => {
  await notificationStore.deleteAll()
}

// Check nếu đã đọc hết thông báo thì sẽ hiển thị nút gọi api delete all
const isAllRead = computed(() => {
  return notificationStore.notifications.every(notification => notification.isRead)
})

const handleLogout = async () => {
  const result = await userStore.logout()

  if (result.success) {
    // Clear stores khi logout
    orderStore.clearOrders()
    notificationStore.clearAll()

    // Stop SignalR connection
    await signalRService.stop()

    router.push('/user/login')
  } else {
    console.error('Logout failed:', result.error)
  }
}

const handleScroll = () => {
  if (showNotifications.value) {
    showNotifications.value = false
  }
  if (showAvatarDropdown.value) {
    showAvatarDropdown.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Fetch notifications
  await notificationStore.fetchNotifications()

  // Start SignalR connection
  await signalRService.start()
  
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(async () => {
  // Stop SignalR when component unmounts
  await signalRService.stop()
  
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.font-rubik {
  font-family: 'Rubik', sans-serif;
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
.relative:has(.animate-pulse) {
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

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Line clamp utilities */
.line-clamp-1 {
  display: -webkit-box;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
