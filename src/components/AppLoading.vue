<template>
  <!-- Dạng Section: Dùng cho khối lớn, full trang -->
  <div v-if="type === 'section'" class="flex flex-col justify-center items-center w-full py-12 animate-fade-in">
    <div class="relative flex justify-center items-center" :class="sectionSizeClass">
      <!-- Vòng ngoài -->
      <div class="absolute inset-0 border-[3px] border-blue-100 rounded-full"></div>
      <!-- Vòng xoay xanh đậm -->
      <div class="absolute inset-0 border-[3px] border-[#1C4D8D] rounded-full border-t-transparent animate-spin"></div>
      <!-- Vòng xoay xanh nhạt ngược chiều -->
      <div class="absolute inset-1.5 border-[3px] border-[#BDE8F5] rounded-full border-b-transparent animate-spin-reverse"></div>
      
      <!-- Icon ở giữa (tùy chọn) -->
      <div v-if="icon" class="absolute text-[#4988C4] flex items-center justify-center">
        <component :is="icon" class="w-5 h-5 opacity-80" />
      </div>
    </div>
    <p v-if="text" class="mt-4 text-[#1C4D8D] font-medium tracking-wide animate-pulse">{{ text }}</p>
  </div>

  <!-- Dạng Inline: Dùng cho nút bấm, text nhỏ -->
  <Loader2 
    v-else-if="type === 'inline'" 
    class="animate-spin shrink-0" 
    :class="[inlineSizeClass, colorClass]" 
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import type { Component } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'section', // 'section' | 'inline'
  },
  text: {
    type: String,
    default: 'Đang tải dữ liệu...',
  },
  size: {
    type: String,
    default: 'md', // 'sm' | 'md' | 'lg'
  },
  color: {
    type: String,
    default: 'current', // 'current' | 'white' | 'blue'
  },
  icon: {
    type: [Object, Function] as unknown as () => Component,
    default: undefined
  }
})

// Tính toán kích thước cho dạng Section
const sectionSizeClass = computed(() => {
  if (props.size === 'sm') return 'w-10 h-10'
  if (props.size === 'lg') return 'w-20 h-20'
  return 'w-14 h-14' // md default
})

// Tính toán kích thước cho dạng Inline
const inlineSizeClass = computed(() => {
  if (props.size === 'sm') return 'w-4 h-4'
  if (props.size === 'lg') return 'w-6 h-6'
  return 'w-5 h-5' // md default
})

// Tính toán màu sắc cho dạng Inline
const colorClass = computed(() => {
  if (props.color === 'blue') return 'text-[#1C4D8D]'
  if (props.color === 'white') return 'text-white'
  return 'text-current'
})
</script>

<style scoped>
.animate-spin-reverse {
  animation: spin-reverse 1.2s linear infinite;
}

@keyframes spin-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
