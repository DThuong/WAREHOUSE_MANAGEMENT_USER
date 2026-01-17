<template>
  <div class="min-h-screen flex items-center justify-center px-4 login-background">
    <div class="login-container bg-white rounded-2xl shadow-2xl p-8 sm:p-12 w-full max-w-md animate-fade-in">
      <!-- Logo -->
      <div class="flex items-center justify-center gap-3 mb-4">
        <div class="logo-wrapper">
          <img :src="logoImg" alt="DongYang Logo" class="w-14 h-14 object-contain" />
        </div>
        <div>
          <h2 class="text-2xl sm:text-3xl font-bold font-rubik logo-text">DONGYANG</h2>
          <p class="text-sm text-gray-500 font-medium">Kho Dong Yang</p>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSignIn" class="flex flex-col space-y-5">
        <!-- Username Field -->
        <div class="space-y-2">
          <Label for="username" class="text-sm font-semibold" style="color: #1C4D8D;">Username</Label>
          <div class="relative input-wrapper">
            <Input 
              id="username"
              v-model="username"
              type="text"
              placeholder="Enter your username"
              class="h-12 pl-4 pr-12 rounded-xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-0 border-2"
              :class="{
                'border-gray-300': username.length === 0,
                'border-green-500 focus-visible:ring-green-500': username.length >= 1
              }"
            />
            <CheckCircle2 
              v-if="username.length >= 1" 
              class="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 animate-check"
            />
          </div>
          <p v-if="usernameError" class="text-sm text-red-500 flex items-center gap-1">
            <XCircle class="h-4 w-4" />
            {{ usernameError }}
          </p>
        </div>

        <!-- Password Field -->
        <div class="space-y-2">
          <Label for="password" class="text-sm font-semibold" style="color: #1C4D8D;">Password</Label>
          <div class="relative input-wrapper">
            <Input 
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter your password"
              class="h-12 pl-4 pr-12 rounded-xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-0 border-2"
              :class="{
                'border-gray-300': password.length === 0,
                'border-red-500 focus-visible:ring-red-500': password.length > 0 && password.length < 3,
                'border-green-500 focus-visible:ring-green-500': password.length >= 3
              }"
            />
            <CheckCircle2 
              v-if="password.length >= 3" 
              class="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 animate-check"
            />
            <XCircle 
              v-if="password.length > 0 && password.length < 3" 
              class="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500 animate-shake"
            />
          </div>
          <p v-if="passwordError" class="text-sm text-red-500 flex items-center gap-1">
            <XCircle class="h-4 w-4" />
            {{ passwordError }}
          </p>
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between pt-2">
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="remember" 
              v-model:checked="rememberMe"
              class="border-2 data-[state=checked]:bg-[#4988C4] data-[state=checked]:border-[#4988C4]"
            />
            <Label 
              for="remember" 
              class="text-sm font-medium cursor-pointer"
              style="color: #6b7280;"
            >
              Remember me
            </Label>
          </div>
          <a href="#" class="text-sm font-semibold hover:underline" style="color: #4988C4;">
            Forgot Password?
          </a>
        </div>

        <!-- Sign In Button -->
        <Button 
          type="submit"
          :disabled="loading"
          class="w-full h-12 text-base font-semibold rounded-xl shadow-lg border-none transition-all duration-300 hover:scale-[1.02] hover:shadow-xl text-white mt-6"
          style="background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%);"
        >
          <Loader2 v-if="loading" class="mr-2 h-5 w-5 animate-spin" />
          {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </Button>

        <!-- Sign Up Link -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Don't have an account? 
            <strong class="font-semibold ml-1" style="color: #1C4D8D;">Contact IT</strong> 
            <span class="text-gray-400"> for support</span>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-vue-next'
import logoImg from '../assets/images/newLogo.jpg'
import { useUserAuthStore } from '@/stores/userAuth'

const router = useRouter()

// Form state
const username = ref<string>('')
const usernameError = ref<string>('')
const password = ref<string>('')
const rememberMe = ref<boolean>(false)
const loading = ref<boolean>(false)

// Error state
const passwordError = ref<string>('')

const authStore = useUserAuthStore()

// Validation
const validateForm = (): boolean => {
  let isValid = true
  
  usernameError.value = ''
  passwordError.value = ''

  // Validate username
  if (!username.value) {
    usernameError.value = 'Username is required'
    isValid = false
  } else if (username.value.length < 1) {
    usernameError.value = 'Username must be at least 1 character'
    isValid = false
  }

  // Validate password
  if (!password.value) {
    passwordError.value = 'Password is required'
    isValid = false
  } else if (password.value.length < 3) {
    passwordError.value = 'Password must be at least 3 characters'
    isValid = false
  }

  return isValid
}

// Handle sign in
const handleSignIn = async (): Promise<void> => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    // Gọi login từ store thay vì fake
    const success = await authStore.login(username.value, password.value)
    
    if (success) {
      // Login thành công, chuyển hướng
      router.push('/user/dashboard')
    } else {
      // Login thất bại
      passwordError.value = 'Invalid username or password'
    }
  } catch (error) {
    console.error('Sign in error:', error)
    passwordError.value = 'Invalid username or password'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.font-rubik {
  font-family: 'Rubik', sans-serif;
}

/* Background Gradient */
.login-background {
  background: linear-gradient(135deg, #0F2854 0%, #1C4D8D 50%, #4988C4 100%);
  position: relative;
  overflow: hidden;
}

.login-background::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(189, 232, 245, 0.1) 0%, transparent 70%);
  animation: backgroundPulse 15s ease-in-out infinite;
}

@keyframes backgroundPulse {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-10%, -10%);
  }
}

/* Container Animation */
.login-container {
  position: relative;
  border: 2px solid rgba(189, 232, 245, 0.3);
}

.animate-fade-in {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Logo Animation */
.logo-wrapper {
  position: relative;
  padding: 8px;
  /* background: linear-gradient(135deg, #E8F4FA 0%, #BDE8F5 100%); */
  border-radius: 16px;
  /* box-shadow: 0 4px 12px rgba(28, 77, 141, 0.2); */
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.logo-text {
  background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Input Wrapper Animations */
.input-wrapper {
  animation: inputSlideIn 0.4s ease-out backwards;
}

.space-y-2:nth-child(1) .input-wrapper {
  animation-delay: 0.1s;
}

.space-y-2:nth-child(2) .input-wrapper {
  animation-delay: 0.2s;
}

@keyframes inputSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Input Focus Effect */
.input-wrapper input:focus {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(73, 136, 196, 0.2);
}

/* Check Icon Animation */
.animate-check {
  animation: checkScale 0.3s ease-out;
}

@keyframes checkScale {
  0% {
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Shake Animation for Error */
.animate-shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: translate(-50%, -50%) translateX(0);
  }
  25% {
    transform: translate(-50%, -50%) translateX(-5px);
  }
  75% {
    transform: translate(-50%, -50%) translateX(5px);
  }
}

/* Button Hover Effect */
button[type="submit"]:not(:disabled):hover {
  box-shadow: 0 8px 24px rgba(28, 77, 141, 0.4);
}

button[type="submit"]:active {
  transform: scale(0.98);
}

/* Loading State */
button[type="submit"]:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Checkbox Custom Styling */
:deep([data-state=checked]) {
  animation: checkboxPop 0.2s ease-out;
}

@keyframes checkboxPop {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .login-container {
    padding: 1.5rem;
  }
  
  .logo-text {
    font-size: 1.5rem;
  }
}
</style>