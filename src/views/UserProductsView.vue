<!-- eslint-disable vue/no-v-text-v-html-on-component -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <UserLayout>
    <div class="products-page animate-fade-in mt-6">
      <!-- Page Header -->
      <div class="page-header bg-white rounded-2xl shadow-md p-8 mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-4xl font-bold text-slate-900 mb-2 font-rubik">Kho Dong Yang</h1>
          <p class="text-lg text-slate-500">Order vật tư ở đây nè !!!</p>
        </div>
        <div class="header-actions flex gap-4">
          <div class="w-80">
            <AdvancedSearch
              v-model="searchQuery"
              placeholder="Tìm kiếm vật tư..."
              storageKey="products"
            />
          </div>
        </div>
      </div>

      <!-- Organization Hierarchy Filters -->
      <div class="org-filters bg-white rounded-2xl shadow-sm p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 border border-slate-100">
        <!-- Plant -->
        <div class="filter-group">
          <label class="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            Cơ sở <span class="text-red-500">*</span>
          </label>
          <Multiselect
            v-model="selectedPlantId"
            :options="formattedPlantOptions"
            placeholder="Chọn Plant..."
            :searchable="true"
            class="min-h-[2.65rem]"
          />
        </div>

        <!-- Factory -->
        <div class="filter-group">
          <label class="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            Xưởng <span class="text-red-500">*</span>
          </label>
          <Multiselect
            v-model="selectedFactoryId"
            :options="formattedFactoryOptions"
            placeholder="Chọn Factory..."
            :searchable="true"
            :disabled="!selectedPlantId"
            class="min-h-[2.65rem]"
          />
        </div>

        <!-- Department -->
        <div class="filter-group">
          <label class="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            Bộ phận <span class="text-red-500">*</span>
          </label>
          <Multiselect
            v-model="selectedDepartmentId"
            :options="formattedDepartmentOptions"
            placeholder="Chọn Department..."
            :searchable="true"
            :disabled="!selectedFactoryId"
            class="min-h-[2.65rem]"
          />
        </div>
      </div>

      <!-- Type Filter -->
      <div class="type-filter bg-white rounded-2xl shadow-sm p-4 mb-8 flex flex-wrap items-center gap-3">
        <Button
          :variant="selectedType === 'ALL' ? 'default' : 'outline'"
          :class="[
            'filter-btn cursor-pointer',
            selectedType === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'border-slate-300 text-slate-700 hover:bg-slate-50'
          ]"
          @click="setTypeFilter('ALL')"
        >
          Tất cả
        </Button>

        <Button
          :variant="selectedType === 'COM' ? 'default' : 'outline'"
          :class="[
            'filter-btn cursor-pointer',
            selectedType === 'COM'
              ? 'bg-green-600 text-white border-green-600'
              : 'border-green-300 text-green-700 hover:bg-green-50'
          ]"
          @click="setTypeFilter('COM')"
        >
          Hàng Tiêu Dùng
        </Button>
        <Button
          :variant="selectedType === 'ENG' ? 'default' : 'outline'"
          :class="[
            'filter-btn cursor-pointer',
            selectedType === 'ENG'
              ? 'bg-blue-600 text-white'
              : 'border-blue-300 text-blue-700 hover:bg-blue-50'
          ]"
          @click="setTypeFilter('ENG')"
        >
          Hàng Kỹ Thuật
        </Button>
      </div>

      <!-- Loading State -->
      <div v-if="itemStore.loading && itemStore.items.length === 0" class="min-h-100 flex items-center justify-center">
        <AppLoading text="Đang tải danh sách vật tư..." size="lg" />
      </div>

      <!-- Error State -->
      <div v-else-if="itemStore.error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p class="text-red-600 font-medium">{{ itemStore.error }}</p>
        <Button @click="loadFilteredItems" class="mt-4">Thử lại</Button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!selectedDepartmentId" class="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
        <h3 class="text-xl font-bold text-slate-800 mb-2">Vui lòng chọn khu vực</h3>
        <p class="text-slate-600 font-medium">
          Chọn Cơ sở, Xưởng và Bộ phận để xem danh sách vật tư tương ứng.
        </p>
      </div>
      <div v-else-if="totalCount === 0" class="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
        <ShoppingCart class="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <p class="text-slate-600 font-medium text-lg">
          {{ searchQuery || selectedType !== 'ALL' ? 'Không tìm thấy vật tư phù hợp' : 'Chưa có vật tư nào trong bộ phận này' }}
        </p>
      </div>


      <!-- Top Pagination Section -->
      <div v-if="totalPages > 1 && totalCount > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pt-2">
        <div class="text-sm font-medium" style="color: #6b7280;">
          Hiển thị <span class="font-bold text-blue-800">{{ startIndex + 1 }}-{{ Math.min(endIndex, totalCount) }}</span> trên tổng số <span class="font-bold text-blue-800">{{ totalCount }}</span> vật tư
        </div>

        <div class="flex flex-wrap justify-center items-center gap-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="icon"
            class="h-9 w-9 border-2 cursor-pointer hover:bg-blue-50"
            style="border-color: #BDE8F5;"
            :disabled="currentPage === 1"
            @click="goToPage(1)"
          >
            <ChevronsLeft class="h-4 w-4" style="color: #1C4D8D;" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            class="h-9 w-9 border-2 cursor-pointer hover:bg-blue-50"
            style="border-color: #BDE8F5;"
            :disabled="currentPage === 1"
            @click="prevPage"
          >
            <ChevronLeft class="h-4 w-4" style="color: #1C4D8D;" />
          </Button>

          <div class="flex flex-wrap justify-center items-center gap-1 mx-2">
            <template v-for="(page, index) in visiblePages" :key="index">
              <Button
                v-if="page !== '...'"
                :variant="currentPage === page ? 'default' : 'outline'"
                class="h-9 w-9 p-0 font-bold transition-all duration-200"
                :class="[currentPage === page ? 'shadow-md border-none text-white' : 'border-2 hover:bg-blue-50']"
                :style="currentPage === page ? 'background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%);' : 'border-color: #BDE8F5; color: #1C4D8D; cursor: pointer;'"
                @click="goToPage(page as number)"
              >
                {{ page }}
              </Button>
              <span v-else class="px-1 text-slate-400">...</span>
            </template>
          </div>

          <Button
            variant="outline"
            size="icon"
            class="h-9 w-9 border-2 cursor-pointer hover:bg-blue-50"
            style="border-color: #BDE8F5;"
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            <ChevronRight class="h-4 w-4" style="color: #1C4D8D;" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            class="h-9 w-9 border-2 cursor-pointer hover:bg-blue-50"
            style="border-color: #BDE8F5;"
            :disabled="currentPage === totalPages"
            @click="goToPage(totalPages)"
          >
            <ChevronsRight class="h-4 w-4" style="color: #1C4D8D;" />
          </Button>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-if="paginatedProducts.length > 0" class="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card
          v-for="(product, productIndex) in paginatedProducts"
          :key="product.id"
          :id="`product-${product.id}`"
          :class="[
            'product-card overflow-hidden pt-0 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl cursor-pointer border flex flex-col h-full',
            activeProductId === product.id ? 'ring-2 ring-blue-500 shadow-2xl scale-[1.02] border-blue-500' : 'border-slate-200'
          ]"
          @click="handleProductClick(product.id!)"
        >
          <!-- Product Image -->
          <div class="relative h-72 overflow-hidden bg-slate-100">
            <img
              v-if="product.picture && product.picture.length > 0 && product.picture[0]"
              :src="getItemImageUrl(product.picture[0], 512)"
              :srcset="getImageSrcSet('Item', product.picture[0], PRODUCT_CARD_WIDTHS)"
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              :alt="getProductName(product)"
              width="512"
              height="288"
              :loading="productIndex < 3 ? 'eager' : 'lazy'"
              :fetchpriority="productIndex < 3 ? 'high' : 'auto'"
              decoding="async"
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
              v-else-if="Number(product.stockQty ?? 0) < 10"
              class="absolute top-4 right-4 backdrop-blur-md bg-amber-500"
            >
              Sắp Hết
            </Badge>
          </div>

          <!-- Product Info -->
          <CardHeader class="product-header space-y-2">
            <div class="flex items-center gap-2">
              <Badge
                :class="product.type === 'ENG'
                  ? 'w-fit bg-blue-50 text-blue-700 border border-blue-600'
                  : 'w-fit bg-green-600 text-white border border-green-600'"
                class="uppercase text-xs font-semibold tracking-wider"
              >
                {{ product.type === 'ENG' ? 'Hàng Kỹ Thuật' : 'Hàng Tiêu Dùng' }}
              </Badge>
              <span v-if="product.itemIndentifyId" class="text-xs text-slate-500 font-mono font-medium tracking-wide">
                {{ product.itemIndentifyId }}
              </span>
            </div>
            <CardTitle
              class="product-title text-xl font-rubik"
              v-html="highlightKeyword(getProductName(product), searchQuery)"
            ></CardTitle>
            <CardDescription class="text-base leading-relaxed line-clamp-2" v-html="highlightKeyword(getProductDescription(product), searchQuery)">
            </CardDescription>
          </CardHeader>

          <CardContent class="product-content space-y-4 mt-auto">
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
                <span class="font-bold text-blue-600">{{ formatPrice(product.price) ? formatPrice(product.price) : 'Chưa có' }}</span>
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
                @click.stop="addToCart(product)"
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

      <!-- Pagination Section -->
      <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pb-8">
        <div class="text-sm font-medium" style="color: #6b7280;">
          Hiển thị <span class="font-bold text-blue-800">{{ startIndex + 1 }}-{{ Math.min(endIndex, totalCount) }}</span> trên tổng số <span class="font-bold text-blue-800">{{ totalCount }}</span> vật tư
        </div>

        <div class="flex flex-wrap justify-center items-center gap-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="icon"
            class="h-9 w-9 border-2 cursor-pointer hover:bg-blue-50"
            style="border-color: #BDE8F5;"
            :disabled="currentPage === 1"
            @click="goToPage(1)"
          >
            <ChevronsLeft class="h-4 w-4" style="color: #1C4D8D;" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            class="h-9 w-9 border-2 cursor-pointer hover:bg-blue-50"
            style="border-color: #BDE8F5;"
            :disabled="currentPage === 1"
            @click="prevPage"
          >
            <ChevronLeft class="h-4 w-4" style="color: #1C4D8D;" />
          </Button>

          <div class="flex flex-wrap justify-center items-center gap-1 mx-2">
            <template v-for="(page, index) in visiblePages" :key="index">
              <Button
                v-if="page !== '...'"
                :variant="currentPage === page ? 'default' : 'outline'"
                class="h-9 w-9 p-0 font-bold transition-all duration-200"
                :class="[currentPage === page ? 'shadow-md border-none text-white' : 'border-2 hover:bg-blue-50']"
                :style="currentPage === page ? 'background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%);' : 'border-color: #BDE8F5; color: #1C4D8D; cursor: pointer;'"
                @click="goToPage(page as number)"
              >
                {{ page }}
              </Button>
              <span v-else class="px-1 text-slate-400">...</span>
            </template>
          </div>

          <Button
            variant="outline"
            size="icon"
            class="h-9 w-9 border-2 cursor-pointer hover:bg-blue-50"
            style="border-color: #BDE8F5;"
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            <ChevronRight class="h-4 w-4" style="color: #1C4D8D;" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            class="h-9 w-9 border-2 cursor-pointer hover:bg-blue-50"
            style="border-color: #BDE8F5;"
            :disabled="currentPage === totalPages"
            @click="goToPage(totalPages)"
          >
            <ChevronsRight class="h-4 w-4" style="color: #1C4D8D;" />
          </Button>
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useItemStore } from '@/stores/itemStore'
import { itemAPI, type FilterItemParams } from '@/services/itemAPI'
import { getItemImageUrl, getImageSrcSet, handleImageError } from '@/utils/imageUtils'
import type { Item } from '@/types/item.types'
import UserLayout from '@/components/UserLayout.vue'
import AdvancedSearch from '@/components/AdvancedSearch.vue'
import AppLoading from '@/components/AppLoading.vue'
import { highlightKeyword } from '@/utils/searchUtils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import { useCartStore } from '@/stores/cartStore'
import { toast } from 'vue-sonner'
import { plantAPI } from '@/services/plantAPI'
import { factoryPartAPI } from '@/services/factoryPartAPI'
import { departmentAPI } from '@/services/departmentAPI'
import type { Plant, FactoryPart, Department } from '@/types/organization.types'


const itemStore = useItemStore()
const cartStore = useCartStore()
const searchQuery = ref(sessionStorage.getItem('user_products_search') || '')
const currentPage = ref(parseInt(sessionStorage.getItem('user_products_page') || '1'))
type ProductTypeFilter = 'ALL' | 'ENG' | 'COM'

const selectedType = ref<ProductTypeFilter>(
  (sessionStorage.getItem('user_products_type') as ProductTypeFilter) || 'ALL'
)
const itemsPerPage = ref(9)
const activeProductId = ref<number | null>(parseInt(sessionStorage.getItem('user_products_active_id') || '0'))

// Organization State
const plantOptions = ref<Plant[]>([])
const factoryOptions = ref<FactoryPart[]>([])
const departmentOptions = ref<Department[]>([])

const selectedPlantId = ref<number | null>(parseInt(sessionStorage.getItem('user_products_plant_id') || '0') || null)
const selectedFactoryId = ref<number | null>(parseInt(sessionStorage.getItem('user_products_factory_id') || '0') || null)
const selectedDepartmentId = ref<number | null>(parseInt(sessionStorage.getItem('user_products_department_id') || '0') || null)

// Watchers for cascading deletes
watch(selectedPlantId, (newVal) => {
  sessionStorage.setItem('user_products_plant_id', newVal ? newVal.toString() : '0')
  selectedFactoryId.value = null
  selectedDepartmentId.value = null
})
watch(selectedFactoryId, (newVal) => {
  sessionStorage.setItem('user_products_factory_id', newVal ? newVal.toString() : '0')
  selectedDepartmentId.value = null
})
watch(selectedDepartmentId, (newVal) => {
  sessionStorage.setItem('user_products_department_id', newVal ? newVal.toString() : '0')
})

const formattedPlantOptions = computed(() => {
  return plantOptions.value.map(p => ({ value: p.id, label: p.plantName }))
})

const formattedFactoryOptions = computed(() => {
  if (!selectedPlantId.value) return []
  return factoryOptions.value
    .filter(f => f.plantId === selectedPlantId.value)
    .map(f => ({ value: f.id, label: f.factoryPartName }))
})

const formattedDepartmentOptions = computed(() => {
  if (!selectedFactoryId.value) return []
  return departmentOptions.value
    .filter(d => d.factoryPartId === selectedFactoryId.value)
    .map(d => ({ value: d.id, label: d.departmentName.toUpperCase() }))
})

watch(currentPage, (newVal) => {
  sessionStorage.setItem('user_products_page', newVal.toString())
})

const setTypeFilter = (type: ProductTypeFilter) => {
  selectedType.value = type
  sessionStorage.setItem('user_products_type', type)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleProductClick = (productId: number) => {
  sessionStorage.setItem('user_products_active_id', productId.toString())
  activeProductId.value = productId

  // Tự động tắt highlight sau 3s
  setTimeout(() => {
    if (activeProductId.value === productId) {
      activeProductId.value = null
      sessionStorage.removeItem('user_products_active_id')
    }
  }, 3000)
}

// ===== Server-side pagination state =====
// API /api/Item/filter đã hỗ trợ pageNumber/pageSize → chỉ tải đúng 1 trang thay vì toàn bộ vật tư.
const totalCount = ref(0)
const serverTotalPages = ref(0)
// Fallback: nếu backend vẫn trả mảng thuần (chưa phân trang) thì FE tự cắt trang
const isServerPaged = ref(true)

const totalPages = computed(() => serverTotalPages.value)

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => startIndex.value + itemsPerPage.value)

const paginatedProducts = computed(() => {
  const items = itemStore.items
  return isServerPaged.value ? items : items.slice(startIndex.value, endIndex.value)
})

const hasScrolled = ref(false)
watch(paginatedProducts, async (products) => {
  if (!hasScrolled.value && activeProductId.value && products.some(p => p.id === activeProductId.value)) {
    await nextTick()
    const el = document.getElementById(`product-${activeProductId.value}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      hasScrolled.value = true
    }
  }
}, { immediate: true })

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value

  // Nếu tổng số trang <= 7, hiển thị tất cả
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
    return pages
  }

  // Luôn hiển thị trang đầu
  pages.push(1)

  // Logic hiển thị các trang giữa
  if (current <= 3) {
    // Gần đầu: 1 2 3 4 ... 29
    pages.push(2, 3, 4, '...', total)
  } else if (current >= total - 2) {
    // Gần cuối: 1 ... 26 27 28 29
    pages.push('...', total - 3, total - 2, total - 1, total)
  } else {
    // Ở giữa: 1 ... 5 6 7 ... 29
    pages.push('...', current - 1, current, current + 1, '...', total)
  }

  return pages
})

// Pagination functions
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
// Fetch organizations on mount
const fetchOrganizations = async () => {
  try {
    const [plants, factories, departments] = await Promise.all([
      plantAPI.getAll().catch(() => []),
      factoryPartAPI.getAll().catch(() => []),
      departmentAPI.getAll().catch(() => [])
    ])
    plantOptions.value = Array.isArray(plants) ? plants : []
    factoryOptions.value = Array.isArray(factories) ? factories : []
    departmentOptions.value = Array.isArray(departments) ? departments : []
  } catch (error) {
    console.error('Error fetching organizations:', error)
  }
}

// Fetch items based on server-side filters + pagination
let filterAbort: AbortController | null = null
let requestSeq = 0

const resetPaging = () => {
  totalCount.value = 0
  serverTotalPages.value = 0
}

const loadFilteredItems = async () => {
  // Huỷ request cũ còn đang chạy (đổi trang/gõ tìm kiếm liên tục)
  filterAbort?.abort()

  if (!selectedDepartmentId.value) {
    itemStore.setItems([])
    resetPaging()
    itemStore.setLoading(false)
    return
  }

  const controller = new AbortController()
  filterAbort = controller
  const seq = ++requestSeq

  itemStore.setLoading(true)
  itemStore.setError(null)

  try {
    const params: FilterItemParams = {
      departmentId: selectedDepartmentId.value,
      pageNumber: currentPage.value,
      pageSize: itemsPerPage.value,
    }

    if (selectedType.value !== 'ALL') {
      params.type = selectedType.value
    }

    const keyword = searchQuery.value.trim()
    if (keyword) {
      params.keyword = keyword
    }

    const result = await itemAPI.filter(params, { signal: controller.signal })
    if (seq !== requestSeq) return // đã có request mới hơn

    isServerPaged.value = result.serverPaged
    totalCount.value = result.totalCount
    serverTotalPages.value = result.totalCount > 0 ? result.totalPages : 0
    itemStore.setItems(result.items)

    // Trang lưu trong sessionStorage có thể vượt quá số trang hiện tại → kéo về trang cuối
    if (result.serverPaged && serverTotalPages.value > 0 && currentPage.value > serverTotalPages.value) {
      currentPage.value = serverTotalPages.value // watcher currentPage sẽ tải lại
    }
  } catch (error: unknown) {
    const err = error as { name?: string; code?: string } | null
    if (controller.signal.aborted || err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return
    if (seq !== requestSeq) return
    console.error('Error fetching filtered items:', error)
    itemStore.setItems([])
    resetPaging()
    itemStore.setError('Không thể tải dữ liệu vật tư. Vui lòng thử lại.')
  } finally {
    if (seq === requestSeq) itemStore.setLoading(false)
  }
}

// Đổi bộ lọc → về trang 1. Nếu đang ở trang 1 thì tải luôn,
// ngược lại để watcher currentPage tải (tránh gọi API 2 lần).
const onFiltersChanged = () => {
  if (currentPage.value !== 1) {
    currentPage.value = 1
  } else {
    loadFilteredItems()
  }
}

watch([selectedDepartmentId, selectedType], onFiltersChanged)

// Đổi trang → gọi API lấy đúng trang đó
watch(currentPage, () => {
  if (isServerPaged.value) loadFilteredItems()
})

// Helper functions
function getProductName(item: Item): string {
  if (item.eng) return item.eng.partname
  if (item.com) return item.com.name
  return 'Unknown Product'
}

function getProductDescription(item: Item): string {
  if (item.eng) return item.eng.description
  if (item.com) return item.com.specifications
  return 'No description available'
}



// Cỡ ảnh card sản phẩm (trình duyệt tự chọn theo layout + DPR qua sizes)
const PRODUCT_CARD_WIDTHS = [384, 512, 768, 1024] as const

const formatPrice = (price?: string | null): string => {
  if (price === null || price === undefined || price === '') return ''
  const numPrice = parseFloat(price)
  if (isNaN(numPrice)) return price
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(numPrice)
}

const getStockColorClass = (stockQty?: number | null): string => {
  const qty = Number(stockQty ?? 0)
  if (qty === 0) return 'text-red-600'
  if (qty < 10) return 'text-amber-600'
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

watch(searchQuery, (newVal) => {
  sessionStorage.setItem('user_products_search', newVal)
  onFiltersChanged()
})

onMounted(async () => {
  await fetchOrganizations()
  if (selectedDepartmentId.value) {
    loadFilteredItems()
  }

  // Nếu có highlight từ trước (do quay lại trang), cũng chỉ để 3s rồi xóa
  if (activeProductId.value) {
    setTimeout(() => {
      activeProductId.value = null
      sessionStorage.removeItem('user_products_active_id')
    }, 3000)
  }
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
  line-clamp: 2;
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

  .pagination-wrapper {
    gap: 0.25rem;
  }

  .pagination-wrapper button,
  .pagination-wrapper span {
    height: 2rem;
    width: 2rem;
    font-size: 0.875rem;
  }
}
.type-filter {
  border: 1px solid #e5e7eb;
}

.filter-btn {
  min-width: 130px;
  height: 40px;
  border-radius: 999px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .type-filter {
    justify-content: center;
  }

  .filter-btn {
    flex: 1;
    min-width: 100%;
  }
}
.product-card {
  min-height: 100%;
}

.product-header {
  flex: 0 0 auto;
}

.product-title {
  min-height: 3.5rem;
  line-height: 1.35;
  word-break: break-word;
}

.product-content {
  flex: 0 0 auto;
}

.products-grid {
  align-items: stretch;
}
</style>
