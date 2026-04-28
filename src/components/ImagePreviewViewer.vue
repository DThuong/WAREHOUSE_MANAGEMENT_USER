<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="open" 
        class="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center overflow-hidden"
        @click.self="close"
      >
        <!-- Header Toolbar -->
        <div class="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-[100] bg-gradient-to-b from-black/60 to-transparent">
          <div class="text-white text-sm font-medium opacity-80 select-none">
            {{ currentIndex + 1 }} / {{ images.length }}
          </div>
          
          <div class="flex items-center gap-4">
            <!-- Controls -->
            <button @click="zoomIn" class="text-white/70 hover:text-white transition-colors" title="Phóng to">
              <ZoomIn class="w-6 h-6" />
            </button>
            <button @click="zoomOut" class="text-white/70 hover:text-white transition-colors" title="Thu nhỏ">
              <ZoomOut class="w-6 h-6" />
            </button>
            <button @click="rotateLeft" class="text-white/70 hover:text-white transition-colors" title="Xoay trái">
              <RotateCcw class="w-6 h-6" />
            </button>
            <button @click="rotateRight" class="text-white/70 hover:text-white transition-colors" title="Xoay phải">
              <RotateCw class="w-6 h-6" />
            </button>
            <button @click="reset" class="text-white/70 hover:text-white transition-colors" title="Đặt lại">
              <RefreshCcw class="w-5 h-5" />
            </button>
            
            <div class="w-px h-6 bg-white/20 mx-2"></div>
            
            <!-- Close -->
            <button @click="close" class="text-white/70 hover:text-red-500 transition-colors" title="Đóng (Esc)">
              <X class="w-8 h-8" />
            </button>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <button 
          v-if="currentIndex > 0" 
          @click="prev" 
          class="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all z-[100]"
        >
          <ChevronLeft class="w-10 h-10" />
        </button>
        <button 
          v-if="currentIndex < images.length - 1" 
          @click="next" 
          class="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all z-[100]"
        >
          <ChevronRight class="w-10 h-10" />
        </button>

        <!-- Image Wrapper (Draggable Area) -->
        <div 
          class="w-full h-full flex items-center justify-center select-none"
          :class="{ 'cursor-grab': scale > 1 && !isDragging, 'cursor-grabbing': isDragging, 'cursor-default': scale <= 1 }"
          @wheel.prevent="handleWheel"
          @mousedown="startDrag"
          @mousemove="onDrag"
          @mouseup="endDrag"
          @mouseleave="endDrag"
        >
          <img 
            :src="images[currentIndex]" 
            alt="Preview" 
            class="max-w-[90vw] max-h-[90vh] object-contain transition-transform"
            :class="{ 'duration-200': !isDragging, 'duration-0': isDragging }"
            :style="{ 
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotation}deg)` 
            }"
            draggable="false"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  RefreshCcw 
} from 'lucide-vue-next'

const props = defineProps<{
  images: string[]
  open: boolean
  initialIndex?: number
}>()

const emit = defineEmits(['update:open'])

// State
const currentIndex = ref(0)
const scale = ref(1)
const rotation = ref(0)
const translateX = ref(0)
const translateY = ref(0)

// Drag State
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)

// Watchers
watch(() => props.open, (newVal) => {
  if (newVal) {
    currentIndex.value = props.initialIndex || 0
    reset()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeydown)
  } else {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', handleKeydown)
  }
})

watch(currentIndex, () => {
  reset()
})

// Actions
const close = () => {
  emit('update:open', false)
}

const next = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  }
}

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const zoomIn = () => {
  if (scale.value < 5) scale.value += 0.25
}

const zoomOut = () => {
  if (scale.value > 0.25) scale.value -= 0.25
  if (scale.value <= 1) {
    translateX.value = 0
    translateY.value = 0
  }
}

const rotateLeft = () => {
  rotation.value -= 90
}

const rotateRight = () => {
  rotation.value += 90
}

const reset = () => {
  scale.value = 1
  rotation.value = 0
  translateX.value = 0
  translateY.value = 0
}

// Wheel Event (Zoom)
const handleWheel = (e: WheelEvent) => {
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

// Drag Events (Pan)
const startDrag = (e: MouseEvent) => {
  if (scale.value <= 1) return // Chỉ cho kéo khi đã phóng to
  e.preventDefault()
  isDragging.value = true
  startX.value = e.clientX - translateX.value
  startY.value = e.clientY - translateY.value
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  translateX.value = e.clientX - startX.value
  translateY.value = e.clientY - startY.value
}

const endDrag = () => {
  isDragging.value = false
}

// Keyboard shortcuts
const handleKeydown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'Escape':
      close()
      break
    case 'ArrowRight':
      next()
      break
    case 'ArrowLeft':
      prev()
      break
    case '+':
    case '=':
      zoomIn()
      break
    case '-':
      zoomOut()
      break
  }
}

// Cleanup
onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
