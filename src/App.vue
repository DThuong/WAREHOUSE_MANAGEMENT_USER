<template>
  <div id="app">
    <router-view v-if="!isInitializing" />
    
    <!-- Update Popup -->
    <Transition name="slide-down">
      <div v-if="isUpdateAvailable" class="update-popup">
        <div class="update-content">
          <p class="update-text">
            Hi m.n, Hệ thống đã có phiên bản mới! Reload để cập nhật nhé 😊!
          </p>
          <p class="update-subtext">
            Vui lòng tải lại trang để áp dụng các thay đổi và tính năng mới nhất.
          </p>
          <div class="update-actions">
            <button @click="reloadPage" class="btn-reload">
              Tải lại trang ngay
            </button>
          </div>
        </div>
      </div>
    </Transition>

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

    <Toaster position="top-center" richColors :duration="2000" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
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

// Check update state
const isUpdateAvailable = ref(false)
let updateCheckInterval: number | null = null

let warningTimeout: number | null = null
let expiryTimeout: number | null = null

const checkForUpdate = async () => {
  if (isUpdateAvailable.value) return
  
  try {
    const res = await fetch(`/?t=${new Date().getTime()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
    
    if (!res.ok) return
    const html = await res.text()
    
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const newScripts = Array.from(doc.querySelectorAll('script[src]')).map(s => s.getAttribute('src'))
    const currentScripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.getAttribute('src'))
    
    // Find the main index hash from Vite build
    const appScriptNew = newScripts.find(src => src?.match(/\/assets\/index-.*\.js$/))
    const appScriptCurrent = currentScripts.find(src => src?.match(/\/assets\/index-.*\.js$/))
    
    if (appScriptNew && appScriptCurrent && appScriptNew !== appScriptCurrent) {
      isUpdateAvailable.value = true
    }
  } catch (error) {
    console.warn('Không thể kiểm tra phiên bản mới:', error)
  }
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    checkForUpdate()
  }
}

const reloadPage = () => {
  window.location.reload()
}

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
  
  // Register update checker
  updateCheckInterval = window.setInterval(checkForUpdate, 60000) // check every minute
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  isInitializing.value = false
})

onUnmounted(() => {
  clearTokenTimeouts()
  if (updateCheckInterval) clearInterval(updateCheckInterval)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
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

/* Update Popup */
.update-popup {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
  padding: 20px 24px;
  min-width: 360px;
  max-width: 90vw;
  animation: pulse-border 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
}

@keyframes pulse-border {
  0%, 100% { border: 1px solid rgba(59, 130, 246, 0.3); }
  50% { border: 1px solid rgba(59, 130, 246, 1); }
}

.update-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.update-text {
  margin: 0;
  color: #111827;
  font-weight: 700;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.update-subtext {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.update-actions {
  margin-top: 8px;
  width: 100%;
}

.btn-reload {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.btn-reload:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
}

.btn-reload:active {
  transform: translateY(0);
}

/* Update Transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-down-enter-from {
  transform: translate(-50%, -100px);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translate(-50%, -100px);
  opacity: 0;
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