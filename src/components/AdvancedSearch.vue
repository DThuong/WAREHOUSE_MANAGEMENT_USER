<template>
  <div class="relative w-full" ref="containerRef">
    <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
    <Input
      v-model="localQuery"
      :placeholder="placeholder"
      :class="['pl-10 w-full rounded-xl border-2 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#4988C4] transition shadow-sm', inputClass || 'h-12']"
      style="border-color: #BDE8F5;"
      @focus="showDropdown = true"
      @keydown.enter="handleEnter"
    />
    <button
      v-if="localQuery"
      @click="clearSearch"
      class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10 cursor-pointer"
    >
      <X class="h-4 w-4" />
    </button>

    <!-- Dropdown (Recent & Suggestions) -->
    <div
      v-if="showDropdown && (recentSearches.length > 0 || (localQuery && filteredSuggestions.length > 0))"
      class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-60 overflow-y-auto text-left"
    >
      <!-- Lịch sử tìm kiếm -->
      <div v-if="!localQuery && recentSearches.length > 0" class="py-2">
        <div class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase flex justify-between items-center bg-slate-50">
          <span>Lịch sử tìm kiếm</span>
          <button @click.stop="clearHistory" class="text-[#e05d5d] hover:underline cursor-pointer">Xóa</button>
        </div>
        <ul>
          <li
            v-for="(history, index) in recentSearches"
            :key="index"
            class="px-4 py-2 hover:bg-[#E8F4FA] cursor-pointer flex items-center gap-3 text-slate-700 transition-colors text-sm"
            @click="selectSuggestion(history)"
          >
            <History class="h-4 w-4 text-slate-400 shrink-0" />
            <span class="flex-1">{{ history }}</span>
          </li>
        </ul>
      </div>

      <!-- Gợi ý tìm kiếm -->
      <div v-if="localQuery && filteredSuggestions.length > 0" class="py-2">
        <ul>
          <li
            v-for="(suggest, index) in filteredSuggestions"
            :key="index"
            class="px-4 py-2 hover:bg-[#E8F4FA] cursor-pointer flex items-start gap-3 text-slate-700 transition-colors text-sm"
            @click="selectSuggestion(suggest)"
          >
            <Search class="h-4 w-4 text-[#4988C4] shrink-0 mt-0.5" />
            <span class="flex-1 leading-relaxed" v-html="highlightKeyword(suggest, localQuery)"></span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Search, X, History } from 'lucide-vue-next'
import { useDebounceFn } from '@vueuse/core'
import { highlightKeyword, fuzzyMatch } from '@/utils/searchUtils'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  storageKey: string
  suggestItems?: string[]
  inputClass?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const localQuery = ref(props.modelValue)
const showDropdown = ref(false)
const recentSearches = ref<string[]>([])
const containerRef = ref<HTMLElement | null>(null)

// Computed Suggestions
const filteredSuggestions = computed(() => {
  if (!localQuery.value || !props.suggestItems) return []
  return props.suggestItems
    .filter(item => fuzzyMatch(localQuery.value, item) && item.toLowerCase() !== localQuery.value.toLowerCase())
    .slice(0, 5) // Lấy top 5
})

// Load history
onMounted(() => {
  const stored = sessionStorage.getItem(`history_${props.storageKey}`)
  if (stored) {
    try {
      recentSearches.value = JSON.parse(stored)
    } catch (e) {}
  }
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
})

const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    showDropdown.value = false
  }
}

const handleScroll = () => {
  if (showDropdown.value) {
    showDropdown.value = false
    // Blur input if needed to hide mobile keyboard
    const inputEl = containerRef.value?.querySelector('input')
    if (inputEl) inputEl.blur()
  }
}

// Debounce emit để tối ưu hiệu suất gõ
const debouncedEmit = useDebounceFn((val: string) => {
  emit('update:modelValue', val)
}, 300)

watch(localQuery, (newVal) => {
  debouncedEmit(newVal)
})

watch(() => props.modelValue, (newVal) => {
  if (newVal !== localQuery.value) {
    localQuery.value = newVal
  }
})

const saveToHistory = (query: string) => {
  const q = query.trim()
  if (!q) return
  let history = [...recentSearches.value]
  history = history.filter(item => item.toLowerCase() !== q.toLowerCase())
  history.unshift(q)
  if (history.length > 5) history.pop() // Giữ 5 lịch sử gần nhất
  
  recentSearches.value = history
  sessionStorage.setItem(`history_${props.storageKey}`, JSON.stringify(history))
}

const handleEnter = () => {
  saveToHistory(localQuery.value)
  showDropdown.value = false
}

const selectSuggestion = (query: string) => {
  localQuery.value = query
  saveToHistory(query)
  showDropdown.value = false
}

const clearSearch = () => {
  localQuery.value = ''
  emit('update:modelValue', '')
  showDropdown.value = true
}

const clearHistory = () => {
  recentSearches.value = []
  sessionStorage.removeItem(`history_${props.storageKey}`)
}
</script>
