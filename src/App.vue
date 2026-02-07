<template>
  <div id="app">
    <router-view v-if="!isInitializing" />
    
    <!-- Token Expiry Warning -->
    <Transition name="slide">
      <div v-if="showExpiryWarning" class="expiry-warning">
        <div class="warning-content">
          <p class="warning-text">
            ⚠️ Phiên đăng nhập sắp hết hạn trong {{ timeRemaining }}
          </p>
          <div class="warning-actions">
            <button @click="dismissWarning" class="btn-dismiss">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { 
  isTokenExpired, 
  getWarningTime, 
  getMillisecondsUntilExpiry,
  formatTimeRemaining 
} from '@/utils/checkToken'

const router = useRouter()
const userStore = useUserStore()
const isInitializing = ref(true)
const showExpiryWarning = ref(false)
const timeRemaining = ref('')

let warningTimeout: number | null = null
let expiryTimeout: number | null = null

onMounted(async () => {
  const token = localStorage.getItem('auth_token')
  const userInfo = localStorage.getItem('user_info')
  
  if (token && userInfo) {
    try {
      const user = JSON.parse(userInfo)
      
      // Check nếu là Admin → block ngay
      if (user.role === 'Admin') {
        await handleLogout('blocked_admin')
        isInitializing.value = false
        return
      }
      
      if (user.expiresAt) {
        if (isTokenExpired(user.expiresAt)) {
          await handleLogout('expired')
        } else {
          // Khởi động token monitoring
          scheduleTokenChecks(user.expiresAt)
        }
      }
    } catch (error) {
      console.error('❌ Lỗi parse user info:', error)
      userStore.resetStore()
    }
  }
  
  isInitializing.value = false
})

onUnmounted(() => {
  clearTokenTimeouts()
})

/**
 * Lên lịch 2 timeout:
 * 1. Warning timeout - cảnh báo trước 5 phút
 * 2. Expiry timeout - logout khi hết hạn
 */
const scheduleTokenChecks = (expiresAt: string) => {
  clearTokenTimeouts()
  
  const warningMs = getWarningTime(expiresAt)
  const expiryMs = getMillisecondsUntilExpiry(expiresAt)
  
  // Timeout 1: Hiện cảnh báo trước 5 phút
  if (warningMs > 0) {
    warningTimeout = window.setTimeout(() => {
      showExpiryWarning.value = true
      timeRemaining.value = formatTimeRemaining(expiresAt)
    }, warningMs)
  }
  
  // Timeout 2: Logout khi hết hạn
  if (expiryMs > 0) {
    expiryTimeout = window.setTimeout(() => {
      handleLogout('expired')
    }, expiryMs)
  }
}

const clearTokenTimeouts = () => {
  if (warningTimeout) {
    clearTimeout(warningTimeout)
    warningTimeout = null
  }
  if (expiryTimeout) {
    clearTimeout(expiryTimeout)
    expiryTimeout = null
  }
}

const handleLogout = async (reason?: string) => {
  clearTokenTimeouts()
  await userStore.logout()
  
  const messages: Record<string, string> = {
    expired: 'Phiên đăng nhập đã hết hạn',
    blocked_admin: 'Tài khoản Admin không được phép truy cập hệ thống này',
  }
  
  router.push({ 
    path: '/signin', 
    query: { 
      reason,
      message: messages[reason || ''] 
    } 
  })
}

const dismissWarning = () => {
  showExpiryWarning.value = false
}
</script>

<style scoped>
#app {
  width: 100%;
  min-height: 100vh;
}

/* Expiry Warning Toast */
.expiry-warning {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 16px 20px;
  min-width: 320px;
}

.warning-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.warning-text {
  margin: 0;
  color: #d97706;
  font-weight: 600;
  font-size: 14px;
}

.warning-actions {
  display: flex;
  gap: 8px;
}

.btn-dismiss {
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f3f4f6;
  color: #6b7280;
}

.btn-dismiss:hover {
  background: #e5e7eb;
}

/* Transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(400px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(400px);
  opacity: 0;
}

@media (max-width: 640px) {
  .expiry-warning {
    top: 10px;
    right: 10px;
    left: 10px;
    min-width: auto;
  }
}
</style>