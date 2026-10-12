<template>
  <UserLayout>
    <div class="cart-page animate-fade-in">
      <!-- Header -->
      <div class="page-header">
        <Button
          variant="ghost"
          class="cursor-pointer bg-blue-200 hover:bg-blue-400"
          @click="router.push('/user/products')"
        >
          <ArrowLeft class="mr-2 h-4 w-4" />
          Tiếp Tục Chọn Vật Tư
        </Button>
      </div>

      <!-- Empty cart -->
      <Card v-if="cartStore.isEmpty" class="empty-cart-card border-none">
        <CardContent class="text-center">
          <ShoppingCart class="empty-icon h-20 w-20 mx-auto mb-6 text-muted-foreground" />
          <h2 class="text-2xl font-semibold mb-2">Chưa có vật tư nào trong giỏ hàng!</h2>
          <p class="text-muted-foreground mb-8">Hãy thêm vật tư vào giỏ hàng để tiếp tục</p>

          <Button
            class="btn-secondary bg-blue-300 cursor-pointer hover:bg-blue-400"
            @click="router.push('/user/products')"
          >
            <ShoppingBag class="mr-2 h-4 w-4" />
            Chọn Vật Tư
          </Button>
        </CardContent>
      </Card>

      <!-- Cart content -->
      <div v-else class="cart-content">
        <!-- Cart items -->
        <div class="cart-items">
          <Card
            v-for="item in cartStore.items"
            :key="item.id"
            class="cart-item border-none shadow-md"
          >
            <CardContent class="cart-item-body">
              <!-- Image -->
              <div class="item-image-wrap">
                <img
                  :src="getItemImageUrl(item.picture?.[0], 256)"
                  :srcset="getImageSrcSet('Item', item.picture?.[0], [128, 256, 512, 768])"
                  sizes="(max-width: 640px) 100vw, 132px"
                  :alt="getItemName(item)"
                  width="132"
                  height="132"
                  loading="lazy"
                  decoding="async"
                  class="item-image"
                  @error="handleImageError"
                />
              </div>

              <!-- Info -->
              <div class="item-main">
                <div class="item-info">
                  <div class="item-title-row">
                    <div class="item-title-content">
                      <h3 class="item-name">{{ getItemName(item) }}</h3>
                      <p class="item-description">{{ getItemDescription(item) }}</p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      class="remove-btn text-destructive hover:text-destructive cursor-pointer hover:bg-red-100"
                      @click="removeItem(item.id!)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>

                  <div class="item-badges">
                    <Badge variant="secondary" class="item-category">{{ item.type }}</Badge>
                    <Badge variant="outline">{{ item.unit }}</Badge>
                    <Badge variant="outline" v-if="item.stockQty">
                      Tồn kho: {{ item.stockQty }}
                    </Badge>
                  </div>
                </div>

                <!-- Item order form -->
                <div class="item-order-box">
                  <!-- Note -->
                  <div class="usage-field usage-field-full">
                    <label class="usage-field-label">
                      <Target class="h-3.5 w-3.5 text-blue-500" />
                      Mục đích sử dụng <span class="text-red-500">*</span>
                    </label>

                    <Input
                      v-model="item.note"
                      placeholder="Nhập mục đích sử dụng..."
                      class="usage-input border-blue-200 focus:border-blue-400 focus:ring-0 focus:outline-none"
                      :class="{
                        'field-error': showUsageError && !item.note?.trim(),
                      }"
                    />
                  </div>

                  <!-- AreaPart -->
                  <div class="usage-field usage-field-full">
                    <label class="usage-field-label">
                      <MapPin class="h-3.5 w-3.5 text-blue-500" />
                      Khu vực <span class="text-red-500">*</span>
                    </label>

                    <Multiselect
                      v-model="selectedAreaPartIds[item.id!]"
                      :options="formattedAreaPartOptions"
                      mode="tags"
                      :close-on-select="false"
                      :searchable="true"
                      placeholder="Chọn một hoặc nhiều khu vực..."
                      class="min-h-[2.65rem]"
                      :class="{
                        'border-red-500': showUsageError && getSelectedAreaPartIds(item).length === 0
                      }"
                      :disabled="machineLoading"
                    >
                      <template #option="{ option }">
                        <div class="flex items-center gap-2 cursor-pointer w-full">
                          <input 
                            type="checkbox" 
                            :checked="selectedAreaPartIds[item.id!]?.includes(option.value)"
                            class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer pointer-events-none"
                          />
                          <span>{{ option.label }}</span>
                        </div>
                      </template>
                    </Multiselect>

                    <p v-if="machineLoadError" class="field-hint text-red-500">
                      Không tải được danh sách khu vực. Vui lòng thử lại.
                    </p>
                  </div>

                  <!-- Machine -->
                  <div class="usage-field usage-field-full">
                    <label class="usage-field-label">
                      <Cpu class="h-3.5 w-3.5 text-blue-500" />
                      Máy tương thích <span class="text-gray-400 font-normal ml-1">(Tùy chọn)</span>
                    </label>

                    <Multiselect
                      v-model="selectedMachineIds[item.id!]"
                      :options="getFormattedMachineOptions(item.id!)"
                      mode="tags"
                      :close-on-select="false"
                      :searchable="true"
                      placeholder="Chọn máy hoặc gõ tên máy mới..."
                      class="min-h-[2.65rem]"
                      :create-option="true"
                      :append-new-option="false"
                      :on-create="(option: MultiselectCreatedOption) => handleCreateMachine(item.id!, option)"
                      :disabled="machineLoading || getSelectedAreaPartIds(item).length === 0"
                    >
                      <template #option="{ option }">
                        <div class="flex items-center gap-2 cursor-pointer w-full">
                          <input 
                            v-if="!option.__CREATE__"
                            type="checkbox" 
                            :checked="selectedMachineIds[item.id!]?.includes(option.value)"
                            class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer pointer-events-none"
                          />
                          <Plus v-else class="h-4 w-4 text-emerald-600" />
                          <span v-if="option.__CREATE__">
                            Thêm máy mới: <strong>{{ option.label }}</strong>
                          </span>
                          <span v-else>{{ option.label }}</span>
                          <span v-if="option.isNew" class="new-machine-badge">Mới</span>
                        </div>
                      </template>
                    </Multiselect>

                    <!-- Máy nhập tay: chỉ được tạo trên hệ thống khi bấm Đặt hàng -->
                    <div
                      v-if="getPendingMachines(item.id!).length > 0"
                      class="pending-machines"
                    >
                      <div
                        v-for="pm in getPendingMachines(item.id!)"
                        :key="pm.tempId"
                        class="pending-machine-row"
                      >
                        <span class="new-machine-badge">Mới</span>
                        <span class="pending-machine-name">{{ pm.machineName }}</span>

                        <select
                          v-if="getSelectedAreaPartIds(item).length > 1"
                          v-model="pm.areaPartId"
                          class="pending-area-select"
                          :class="{ 'field-error': showUsageError && !pm.areaPartId }"
                        >
                          <option :value="null" disabled>Máy này thuộc khu vực nào?</option>
                          <option
                            v-for="areaId in getSelectedAreaPartIds(item)"
                            :key="areaId"
                            :value="areaId"
                          >
                            {{ getAreaPartName(areaId) }}
                          </option>
                        </select>
                        <span v-else class="pending-area-label">
                          → {{ getAreaPartName(pm.areaPartId) }}
                        </span>
                      </div>
                    </div>

                    <p class="field-hint">
                      Tìm theo tên máy. Không có máy cần tìm? Gõ tên rồi nhấn Enter để thêm —
                      máy mới sẽ được lưu vào hệ thống khi bạn bấm Đặt hàng.
                    </p>
                  </div>

                  <!-- Time -->
                  <div class="usage-field">
                    <label class="usage-field-label">
                      <Timer class="h-3.5 w-3.5 text-blue-500" />
                      Thời gian sử dụng <span class="text-red-500">*</span>
                    </label>

                    <div
                      class="time-input-row"
                      :class="{
                        'field-error-soft': showUsageError && !item.timeUsed?.trim(),
                      }"
                    >
                      <input
                        type="number"
                        min="1"
                        max="999"
                        placeholder="Số"
                        :value="getTimeAmount(item.id!)"
                        class="time-number-input"
                        @input="
                          onTimeAmountInput(
                            item.id!,
                            Number(($event.target as HTMLInputElement).value),
                          )
                        "
                      />

                      <div class="time-unit-tabs">
                        <button
                          v-for="opt in timeUnitOptions"
                          :key="opt.value"
                          type="button"
                          class="time-unit-btn"
                          :class="{ active: getTimeUnit(item.id!) === opt.value }"
                          @click="onTimeUnitClick(item.id!, opt.value)"
                        >
                          {{ opt.label }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Quantity -->
                  <div class="usage-field">
                    <label class="usage-field-label">
                      <PackageCheck class="h-3.5 w-3.5 text-blue-500" />
                      Số lượng order <span class="text-red-500">*</span>
                    </label>

                    <div class="quantity-control">
                      <Button
                        variant="ghost"
                        size="icon"
                        class="cursor-pointer h-8 w-8 hover:bg-blue-50"
                        @click="updateQuantity(item.id!, -1)"
                      >
                        <Minus class="h-4 w-4" />
                      </Button>

                      <input
                        type="number"
                        min="1"
                        :value="getLocalQuantity(item.id!)"
                        class="quantity-input"
                        @input="
                          handleQuantityInput(
                            item.id!,
                            Number(($event.target as HTMLInputElement).value),
                          )
                        "
                        @blur="commitQuantityChange(item.id!)"
                        @keyup.enter="($event.target as HTMLInputElement).blur()"
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        class="cursor-pointer h-8 w-8 hover:bg-blue-50"
                        @click="updateQuantity(item.id!, 1)"
                      >
                        <Plus class="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Summary -->
        <Card class="cart-summary border-none shadow-xl">
          <CardHeader>
            <CardTitle class="summary-title">Thông Tin Đơn Hàng</CardTitle>
          </CardHeader>

          <CardContent class="summary-content">
            <div class="summary-rows">
              <div class="summary-row">
                <span>Tổng số vật tư</span>
                <span class="summary-value">{{ cartStore.totalItems }}</span>
              </div>

              <div class="summary-row">
                <span>Số loại vật tư</span>
                <span class="summary-value">{{ cartStore.items.length }}</span>
              </div>

              <Separator />
            </div>

            <div class="form-group">
              <Label for="nameWorker" class="form-label">
                Tên người order <span class="text-red-500">*</span>
              </Label>

              <Input
                id="nameWorker"
                v-model="nameWorker"
                placeholder="Nhập tên người order vật tư..."
                class="border-none shadow-md"
                :class="{ 'field-error': showNameError }"
              />

              <p v-if="showNameError" class="text-sm text-red-500">Vui lòng nhập tên người order</p>
            </div>

            <Button
              class="btn-checkout w-full cursor-pointer"
              :disabled="isSubmitting || orderStore.loading || machineLoading"
              @click="placeOrder"
            >
              <Check v-if="!isSubmitting && !orderStore.loading" class="mr-2 h-4 w-4" />
              <AppLoading v-else type="inline" size="sm" class="mr-2 text-white" />
              Tạo Đơn Hàng
            </Button>

            <Alert class="border-none shadow-md">
              <Info class="h-4 w-4" />
              <AlertDescription>
                Đơn hàng sẽ được gửi đi chờ phê duyệt từ quản lý.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  </UserLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import UserLayout from '@/components/UserLayout.vue'
import AppLoading from '@/components/AppLoading.vue'

import { useCartStore } from '@/stores/cartStore'
import { useOrderStore } from '@/stores/orderStore'
import { useUserStore } from '@/stores/userStore'

import { getItemImageUrl, getImageSrcSet, handleImageError } from '@/utils/imageUtils'
import { orderAPI } from '@/services/orderAPI'
import { areaPartAPI } from '@/services/areaPartAPI'
import { machineAPI } from '@/services/machineAPI'

import type { AreaPart, Machine } from '@/types/organization.types'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

import {
  ArrowLeft,
  ShoppingCart,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Check,
  Info,
  Target,
  Timer,
  Cpu,
  MapPin,
  PackageCheck,
} from 'lucide-vue-next'

// ========================
// Local Types
// ========================
interface CartItemLocal {
  id?: number
  quantity: number
  note?: string
  timeUsed?: string
  areaPartIds?: number[]
  machineId?: number[]
  // Theo ReadItemDto trong swagger, các field này đều nullable
  picture?: string[] | null
  type: string
  unit: string | null
  stockQty?: number | null
  eng?: {
    partname?: string
    description?: string
  } | null
  com?: {
    name?: string
    specifications?: string
  } | null
}

interface TimeLocal {
  amount: number
  unit: string
}

/**
 * Máy người dùng gõ tay trong giỏ. Chưa tồn tại trên hệ thống:
 * chỉ được POST /api/Machine khi bấm Đặt hàng. `tempId` là số âm để
 * không bao giờ trùng id thật và nằm chung được trong selectedMachineIds.
 */
interface PendingMachine {
  tempId: number
  machineName: string
  areaPartId: number | null
}

/** Option mà @vueform/multiselect truyền vào onCreate. */
interface MultiselectCreatedOption {
  value?: unknown
  label?: unknown
}

// ========================
// Stores & Router
// ========================
const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()
const userStore = useUserStore()

/**
 * Bộ phận của tài khoản đang đăng nhập, theo cấu trúc tổ chức MỚI.
 *
 * Trước đây chỗ này so khớp chuỗi "SMD"/"MAINLINE" lấy từ `user.areaPart` —
 * một field không còn tồn tại — và kết quả computed KHÔNG được dùng ở đâu cả,
 * nên danh sách khu vực/máy hiển thị TOÀN BỘ nhà máy cho mọi tài khoản.
 * Giờ dùng departmentId, cùng khoá mà AreaPart và Machine đều mang theo.
 */
const userDepartmentId = computed<number | null>(() => {
  const raw = userStore.currentUser?.departmentId
  const id = Number(raw)
  return Number.isFinite(id) && id > 0 ? id : null
})

// ========================
// Form State
// ========================
const nameWorker = ref('')
const showNameError = ref(false)
const showUsageError = ref(false)
const isSubmitting = ref(false)

// ========================
// Machine & AreaPart State
// ========================
const areaPartOptions = ref<AreaPart[]>([])
const machineOptions = ref<Machine[]>([])
const machineLoading = ref(false)
const machineLoadError = ref(false)
const selectedAreaPartIds = ref<Record<number, number[]>>({})
const selectedMachineIds = ref<Record<number, number[]>>({})

/** Chỉ những khu vực thuộc bộ phận của tài khoản. */
const visibleAreaParts = computed<AreaPart[]>(() => {
  const deptId = userDepartmentId.value
  if (deptId === null) return areaPartOptions.value
  return areaPartOptions.value.filter(a => Number(a.departmentId) === deptId)
})

const formattedAreaPartOptions = computed(() => {
  return visibleAreaParts.value.map(area => ({
    value: area.id,
    label: area.areaPartName || `Khu vực ID ${area.id}`
  }))
})

/** Máy thuộc bộ phận của tài khoản (chặn cả trường hợp BE trả dư). */
const visibleMachines = computed<Machine[]>(() => {
  const deptId = userDepartmentId.value
  if (deptId === null) return machineOptions.value
  const allowedAreaIds = new Set(visibleAreaParts.value.map(a => a.id))
  return machineOptions.value.filter(
    m => Number(m.departmentId) === deptId || allowedAreaIds.has(m.areaPartId),
  )
})

const getFormattedMachineOptions = (itemId: number) => {
  const selectedAreas = selectedAreaPartIds.value[itemId] || []
  if (selectedAreas.length === 0) return []

  const existing = visibleMachines.value
    .filter(m => selectedAreas.includes(m.areaPartId))
    .map(m => ({
      value: m.id,
      label: m.machineName || `Máy ID ${m.id}`,
      isNew: false,
    }))

  // Máy gõ tay phải nằm trong options thì tag mới hiển thị được
  const pending = getPendingMachines(itemId).map(p => ({
    value: p.tempId,
    label: p.machineName,
    isNew: true,
  }))

  return [...existing, ...pending]
}

// ========================
// Máy nhập tay (pending)
// ========================
const pendingMachines = ref<Record<number, PendingMachine[]>>({})
let nextTempMachineId = -1

const cleanMachineName = (name: string): string => name.trim().replace(/\s+/g, ' ')
const normalizeMachineName = (name: string): string => cleanMachineName(name).toLowerCase()

const getPendingMachines = (itemId: number): PendingMachine[] => {
  return pendingMachines.value[itemId] || []
}

const getAreaPartName = (areaPartId: number | null): string => {
  if (areaPartId === null) return '—'
  const area = areaPartOptions.value.find(a => a.id === areaPartId)
  return area?.areaPartName || `Khu vực ID ${areaPartId}`
}

/**
 * Gọi khi người dùng gõ tên máy không có trong danh sách rồi Enter.
 * Trả về option để multiselect chọn, hoặc false để bỏ qua.
 */
const handleCreateMachine = (itemId: number, option: MultiselectCreatedOption) => {
  const name = cleanMachineName(String(option.label ?? option.value ?? ''))
  if (!name) return false

  const areas = selectedAreaPartIds.value[itemId] || []
  if (areas.length === 0) {
    toast.warning('Vui lòng chọn khu vực trước khi thêm máy')
    return false
  }

  const key = normalizeMachineName(name)
  const selected = selectedMachineIds.value[itemId] || []

  // Đã có máy trùng tên (không phân biệt hoa/thường) trong khu vực đang chọn → dùng máy đó
  const existing = visibleMachines.value.find(
    m => areas.includes(m.areaPartId) && normalizeMachineName(m.machineName || '') === key,
  )
  if (existing) {
    if (selected.includes(existing.id)) {
      toast.info(`Máy "${existing.machineName}" đã được chọn`)
      return false
    }
    toast.info(`Máy "${existing.machineName}" đã có sẵn — đã chọn máy này`)
    return { value: existing.id, label: existing.machineName, isNew: false }
  }

  // Đã gõ tay tên này cho vật tư này rồi
  const list = pendingMachines.value[itemId] || []
  if (list.some(p => normalizeMachineName(p.machineName) === key)) {
    toast.info(`Máy "${name}" đã được thêm`)
    return false
  }

  const pending: PendingMachine = {
    tempId: nextTempMachineId--,
    machineName: name,
    // 1 khu vực → gắn luôn; nhiều khu vực → để người dùng chọn
    areaPartId: areas.length === 1 ? (areas[0] ?? null) : null,
  }
  pendingMachines.value[itemId] = [...list, pending]

  return { value: pending.tempId, label: pending.machineName, isNew: true }
}

/**
 * Tạo các máy nhập tay trên hệ thống (POST /api/Machine) rồi thay tempId
 * bằng id thật trong lựa chọn. Máy trùng tên + khu vực ở nhiều vật tư chỉ tạo 1 lần.
 * Máy nào tạo thành công thì được giữ lại kể cả khi máy khác lỗi, để bấm
 * Đặt hàng lại không bị tạo trùng.
 */
const createPendingMachines = async (): Promise<void> => {
  const groups = new Map<
    string,
    { machineName: string; areaPartId: number; refs: { itemId: number; tempId: number }[] }
  >()

  Object.entries(pendingMachines.value).forEach(([itemKey, list]) => {
    const itemId = Number(itemKey)
    list.forEach(p => {
      if (p.areaPartId === null) return
      const key = `${p.areaPartId}|${normalizeMachineName(p.machineName)}`
      const group = groups.get(key) ?? {
        machineName: p.machineName,
        areaPartId: p.areaPartId,
        refs: [],
      }
      group.refs.push({ itemId, tempId: p.tempId })
      groups.set(key, group)
    })
  })

  if (groups.size === 0) return

  const entries = [...groups.values()]

  const results = await Promise.allSettled(
    entries.map(async (g): Promise<Machine> => {
      const existing = machineOptions.value.find(
        m =>
          m.areaPartId === g.areaPartId &&
          normalizeMachineName(m.machineName || '') === normalizeMachineName(g.machineName),
      )
      if (existing) return existing

      const created = await machineAPI.create({
        machineName: g.machineName,
        areaPartId: g.areaPartId,
      })
      if (!created?.id) {
        throw new Error(`Server không trả về máy "${g.machineName}"`)
      }
      return created
    }),
  )

  const failed: string[] = []

  results.forEach((result, index) => {
    const group = entries[index]
    if (!group) return

    if (result.status === 'rejected') {
      failed.push(group.machineName)
      return
    }

    const machine: Machine = {
      ...result.value,
      machineName: result.value.machineName || group.machineName,
      areaPartId: result.value.areaPartId ?? group.areaPartId,
    }

    if (!machineOptions.value.some(m => m.id === machine.id)) {
      machineOptions.value.push(machine)
    }

    group.refs.forEach(({ itemId, tempId }) => {
      pendingMachines.value[itemId] = getPendingMachines(itemId).filter(p => p.tempId !== tempId)
      const ids = (selectedMachineIds.value[itemId] || []).map(id => (id === tempId ? machine.id : id))
      selectedMachineIds.value[itemId] = [...new Set(ids)]
    })
  })

  if (failed.length > 0) {
    throw new Error(`Không tạo được máy: ${failed.join(', ')}`)
  }
}

// Bỏ chọn tag máy mới → bỏ luôn khỏi danh sách chờ tạo
watch(
  selectedMachineIds,
  (selection) => {
    Object.keys(pendingMachines.value).forEach((key) => {
      const itemId = Number(key)
      const ids = selection[itemId] || []
      const list = pendingMachines.value[itemId] || []
      const kept = list.filter(p => ids.includes(p.tempId))
      if (kept.length !== list.length) pendingMachines.value[itemId] = kept
    })
  },
  { deep: true },
)

// Đổi khu vực → giữ máy mới hợp lệ, bỏ chọn máy có sẵn không còn thuộc khu vực đã chọn
watch(
  selectedAreaPartIds,
  (selection) => {
    Object.entries(selection).forEach(([key, areas]) => {
      const itemId = Number(key)

      getPendingMachines(itemId).forEach((p) => {
        if (areas.length === 1) {
          p.areaPartId = areas[0] ?? null
        } else if (p.areaPartId !== null && !areas.includes(p.areaPartId)) {
          p.areaPartId = null
        }
      })

      const selectedIds = selectedMachineIds.value[itemId]
      if (!selectedIds?.length || machineOptions.value.length === 0) return

      const kept = selectedIds.filter((id) => {
        if (id < 0) return true
        const machine = machineOptions.value.find(m => m.id === id)
        return !machine || areas.includes(machine.areaPartId)
      })
      if (kept.length !== selectedIds.length) selectedMachineIds.value[itemId] = kept
    })
  },
  { deep: true },
)

// ========================
// Time Options
// ========================
const timeUnitOptions = [
  { label: 'Ngày', value: 'day' },
  { label: 'Tuần', value: 'week' },
  { label: 'Tháng', value: 'month' },
]

// ========================
// Local State Per Item
// ========================
const timeUsedLocal = ref<Record<number, TimeLocal>>({})
const localQuantities = ref<Record<number, number>>({})

// ========================
// Machine API
// ========================
const fetchMachines = async () => {
  machineLoading.value = true
  machineLoadError.value = false

  try {
    const [areasResponse, machinesResponse] = await Promise.all([
      areaPartAPI.getAll().catch(() => [] as AreaPart[]),
      machineAPI.getAll().catch(() => [] as Machine[]),
    ])

    areaPartOptions.value = Array.isArray(areasResponse) ? areasResponse : []
    machineOptions.value = Array.isArray(machinesResponse) ? machinesResponse : []

  } catch (error) {
    machineLoadError.value = true
    areaPartOptions.value = []
    machineOptions.value = []

    toast.error('Không tải được danh sách khu vực và máy', {
      description: error instanceof Error ? error.message : 'Vui lòng thử lại sau',
    })
  } finally {
    machineLoading.value = false
  }
}

const getSelectedAreaPartIds = (item: CartItemLocal): number[] => {
  if (!item.id) return []
  return selectedAreaPartIds.value[item.id] || []
}

const getSelectedMachineIds = (item: CartItemLocal): number[] => {
  if (!item.id) return []
  return selectedMachineIds.value[item.id] || []
}

// ========================
// Item Helpers
// ========================
const getItemName = (item: CartItemLocal): string => {
  return item.eng?.partname || item.com?.name || 'N/A'
}

const getItemDescription = (item: CartItemLocal): string => {
  return item.eng?.description || item.com?.specifications || 'No description'
}

// ========================
// Time Helpers
// ========================
const parseTimeUsed = (timeUsed?: string): TimeLocal => {
  if (!timeUsed?.trim()) return { amount: 1, unit: 'day' }

  const parts = timeUsed.trim().split(' ')
  const amount = Number.parseInt(parts[0] ?? '1', 10) || 1

  const labelMap: Record<string, string> = {
    Ngày: 'day',
    Tuần: 'week',
    Tháng: 'month',
  }

  const unit = labelMap[parts[1] ?? 'Ngày'] || 'day'

  return { amount, unit }
}

const getTimeAmount = (itemId: number): number => {
  return timeUsedLocal.value[itemId]?.amount ?? 1
}

const getTimeUnit = (itemId: number): string => {
  return timeUsedLocal.value[itemId]?.unit ?? 'day'
}

const syncTimeUsed = (itemId: number) => {
  const local = timeUsedLocal.value[itemId]
  if (!local) return

  const unitLabel = timeUnitOptions.find((unit) => unit.value === local.unit)?.label || 'Ngày'

  const item = cartStore.items.find((item) => item.id === itemId) as CartItemLocal | undefined

  if (item) {
    item.timeUsed = `${local.amount} ${unitLabel}`
  }
}

const onTimeAmountInput = (itemId: number, value: number) => {
  if (!timeUsedLocal.value[itemId]) {
    timeUsedLocal.value[itemId] = {
      amount: 1,
      unit: 'day',
    }
  }

  timeUsedLocal.value[itemId].amount = value > 0 ? value : 1
  syncTimeUsed(itemId)
}

const onTimeUnitClick = (itemId: number, unit: string) => {
  if (!timeUsedLocal.value[itemId]) {
    timeUsedLocal.value[itemId] = {
      amount: 1,
      unit,
    }
  }

  timeUsedLocal.value[itemId].unit = unit
  syncTimeUsed(itemId)
}

// ========================
// Quantity Helpers
// ========================
const getLocalQuantity = (itemId: number): number => {
  const item = cartStore.items.find((item) => item.id === itemId) as CartItemLocal | undefined
  return localQuantities.value[itemId] ?? item?.quantity ?? 1
}

const handleQuantityInput = (itemId: number, newQuantity: number) => {
  localQuantities.value[itemId] = newQuantity
}

const commitQuantityChange = (itemId: number) => {
  const newQuantity = localQuantities.value[itemId]

  if (!newQuantity || newQuantity < 1) {
    localQuantities.value[itemId] = 1
    cartStore.updateQuantity(itemId, 1)
    toast.warning('Số lượng tối thiểu là 1')
    return
  }

  const item = cartStore.items.find((item) => item.id === itemId) as CartItemLocal | undefined

  if (item?.stockQty && newQuantity > item.stockQty) {
    localQuantities.value[itemId] = item.stockQty
    cartStore.updateQuantity(itemId, item.stockQty)

    toast.warning(`Số lượng tối đa là ${item.stockQty} vì tồn kho chỉ còn ${item.stockQty}`)
    return
  }

  cartStore.updateQuantity(itemId, newQuantity)
}

const updateQuantity = (itemId: number, delta: number) => {
  const currentQuantity = getLocalQuantity(itemId)
  const newQuantity = currentQuantity + delta

  if (newQuantity < 1) return

  const item = cartStore.items.find((item) => item.id === itemId) as CartItemLocal | undefined

  if (item?.stockQty && newQuantity > item.stockQty) {
    toast.warning(`Số lượng tối đa là ${item.stockQty} vì tồn kho chỉ còn ${item.stockQty}`)
    return
  }

  localQuantities.value[itemId] = newQuantity
  cartStore.updateQuantity(itemId, newQuantity)
}

const removeItem = (itemId: number) => {
  cartStore.removeFromCart(itemId)

  delete localQuantities.value[itemId]
  delete timeUsedLocal.value[itemId]
  delete selectedAreaPartIds.value[itemId]
  delete selectedMachineIds.value[itemId]
  delete pendingMachines.value[itemId]
}

// ========================
// Validation
// ========================
const getItemLabel = (item: CartItemLocal): string => {
  return item.eng?.partname || item.com?.name || `ID ${item.id}`
}

const validateBeforeSubmit = (): boolean => {
  if (!nameWorker.value.trim()) {
    showNameError.value = true

    toast.error('Thiếu tên người order', {
      description: 'Vui lòng nhập tên người order vật tư',
    })

    return false
  }

  showNameError.value = false

  const items = cartStore.items as CartItemLocal[]

  const missingNote = items.filter((item) => !item.note?.trim())
  const missingTime = items.filter((item) => !item.timeUsed?.trim())
  const missingAreaPart = items.filter((item) => getSelectedAreaPartIds(item).length === 0)
  const missingNewMachineArea = items.filter((item) => {
    if (!item.id) return false
    const areas = getSelectedAreaPartIds(item)
    return getPendingMachines(item.id).some(
      (p) => p.areaPartId === null || !areas.includes(p.areaPartId),
    )
  })

  const hasError =
    missingNote.length > 0 ||
    missingTime.length > 0 ||
    missingAreaPart.length > 0 ||
    missingNewMachineArea.length > 0

  if (!hasError) {
    showUsageError.value = false
    return true
  }

  showUsageError.value = true

  if (missingNote.length > 0) {
    toast.error('Thiếu mục đích sử dụng', {
      description: missingNote.map(getItemLabel).join(', '),
    })
  }

  if (missingTime.length > 0) {
    toast.error('Thiếu thời gian sử dụng', {
      description: missingTime.map(getItemLabel).join(', '),
    })
  }

  if (missingAreaPart.length > 0) {
    toast.error('Thiếu khu vực', {
      description: missingAreaPart.map(getItemLabel).join(', '),
    })
  }

  if (missingNewMachineArea.length > 0) {
    toast.error('Chưa chọn khu vực cho máy mới', {
      description: missingNewMachineArea.map(getItemLabel).join(', '),
    })
  }

  return false
}

// ========================
// Submit
// ========================
const placeOrder = async () => {
  if (isSubmitting.value || orderStore.loading) return
  if (cartStore.isEmpty) return

  isSubmitting.value = true

  if (!validateBeforeSubmit()) {
    isSubmitting.value = false
    return
  }

  orderStore.setLoading(true)

  try {
    // Tạo máy nhập tay trước, để đơn hàng gửi được id máy thật
    await createPendingMachines()

    const orderData = {
      nameWorker: nameWorker.value.trim(),
      itemIds: (cartStore.items as CartItemLocal[]).map((item) => {
        return {
          itemId: Number(item.id),
          orderQty: getLocalQuantity(Number(item.id)),
          note: item.note?.trim() || '',
          timeUsed: item.timeUsed?.trim() || '',
          machineId: getSelectedMachineIds(item).filter((id) => id > 0),
          areaPartId: getSelectedAreaPartIds(item)
        }
      }),
    }

    const newOrder = await orderAPI.create(orderData)

    if (!newOrder?.id) {
      toast.error('Lỗi', {
        description: 'Server không trả về đơn hàng hợp lệ',
      })
      return
    }

    orderStore.addOrder(newOrder)
    cartStore.clearCart()

    nameWorker.value = ''
    showNameError.value = false
    showUsageError.value = false
    timeUsedLocal.value = {}
    localQuantities.value = {}
    selectedAreaPartIds.value = {}
    selectedMachineIds.value = {}
    pendingMachines.value = {}

    toast.success('Đặt hàng thành công!')

    setTimeout(() => {
      router.push('/user/orders')
    }, 800)
  } catch (error) {
    toast.error('Đặt hàng thất bại', {
      description: error instanceof Error ? error.message : 'Có lỗi xảy ra',
    })
  } finally {
    orderStore.setLoading(false)
    isSubmitting.value = false
  }
}

// ========================
// Watch Cart
// ========================
watch(
  () => cartStore.items,
  (newItems) => {
    const currentIds = new Set(
      newItems.map((item) => item.id).filter((id): id is number => Boolean(id)),
    )

    Object.keys(timeUsedLocal.value).forEach((key) => {
      if (!currentIds.has(Number(key))) {
        delete timeUsedLocal.value[Number(key)]
      }
    })

    Object.keys(localQuantities.value).forEach((key) => {
      if (!currentIds.has(Number(key))) {
        delete localQuantities.value[Number(key)]
      }
    })

    Object.keys(selectedAreaPartIds.value).forEach((key) => {
      if (!currentIds.has(Number(key))) {
        delete selectedAreaPartIds.value[Number(key)]
      }
    })

    Object.keys(selectedMachineIds.value).forEach((key) => {
      if (!currentIds.has(Number(key))) {
        delete selectedMachineIds.value[Number(key)]
      }
    })

    Object.keys(pendingMachines.value).forEach((key) => {
      if (!currentIds.has(Number(key))) {
        delete pendingMachines.value[Number(key)]
      }
    })

    newItems.forEach((rawItem) => {
      const item = rawItem as CartItemLocal
      if (!item.id) return

      if (!timeUsedLocal.value[item.id]) {
        const parsed = parseTimeUsed(item.timeUsed)
        timeUsedLocal.value[item.id] = parsed

        if (!item.timeUsed?.trim()) {
          const unitLabel =
            timeUnitOptions.find((unit) => unit.value === parsed.unit)?.label || 'Ngày'

          item.timeUsed = `${parsed.amount} ${unitLabel}`
        }
      } else {
        const local = timeUsedLocal.value[item.id]

        if (!local) return

        const unitLabel = timeUnitOptions.find((unit) => unit.value === local.unit)?.label || 'Ngày'

        const expectedString = `${local.amount} ${unitLabel}`

        if (item.timeUsed && item.timeUsed !== expectedString) {
          timeUsedLocal.value[item.id] = parseTimeUsed(item.timeUsed)
        }
      }

      if (!localQuantities.value[item.id]) {
        localQuantities.value[item.id] = item.quantity || 1
      }

      if (!selectedAreaPartIds.value[item.id]) {
        selectedAreaPartIds.value[item.id] = item.areaPartIds || []
      }
      
      if (!selectedMachineIds.value[item.id]) {
        selectedMachineIds.value[item.id] = item.machineId || []
      }
    })
  },
  {
    immediate: true,
    deep: true,
  },
)

onMounted(() => {
  fetchMachines()
})
</script>

<style scoped>
:deep(.multiselect-tag) {
  background: #4988C4;
}
:deep(.multiselect.is-active) {
  box-shadow: 0 0 0 2px rgba(73, 136, 196, 0.2);
}
:deep(.multiselect-option.is-selected) {
  background: #4988C4;
}
:deep(.multiselect-option.is-selected.is-pointed) {
  background: #3b74a8;
}
</style>

<style scoped>
input:focus,
select:focus,
.usage-input:focus {
  outline: none !important;
  box-shadow: none !important;
}

.cart-page {
  max-width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
}

.empty-cart-card {
  padding: 2rem 1rem;
}

.cart-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400px;
  gap: 2rem;
  align-items: start;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.cart-item {
  overflow: hidden;
  background: #ffffff;
}

.cart-item-body {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  gap: 1.25rem;
  padding: 1.25rem;
  align-items: start;
}

.item-image-wrap {
  width: 132px;
  height: 132px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  background: #f8fafc;
  flex-shrink: 0;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-title-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.item-title-content {
  min-width: 0;
}

.item-name {
  font-family: 'Rubik', sans-serif;
  font-size: 1.125rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  margin: 0 0 0.35rem 0;
  line-height: 1.35;
}

.item-description {
  font-size: 0.9375rem;
  color: hsl(var(--muted-foreground));
  margin: 0;
  line-height: 1.45;
}

.item-badges {
  width: 100%;
  display: flex;
  gap: 0.5rem;
  margin-top: 0.625rem;
  align-items: center;
  flex-wrap: wrap;
}

.item-category {
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.75rem;
}

.remove-btn {
  flex-shrink: 0;
}

.item-order-box {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(220px, 0.92fr);
  gap: 0.875rem;
  padding: 1rem;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.usage-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}

.usage-field-full {
  grid-column: 1 / -1;
}

.usage-field-location,
.usage-field-machine {
  grid-column: auto;
}

.usage-field-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #1c4d8d;
}

.usage-input,
.machine-select {
  width: 100%;
  height: 2.65rem;
  font-size: 0.875rem;
  font-weight: 600;
  background: white;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
}

.usage-input {
  padding: 0 0.75rem;
}

.machine-select {
  padding: 0 2.5rem 0 0.85rem;
  color: #0f172a;
  cursor: pointer;

  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  background-color: #ffffff;
  background-image:
    linear-gradient(45deg, transparent 50%, #2563eb 50%),
    linear-gradient(135deg, #2563eb 50%, transparent 50%);
  background-position:
    calc(100% - 18px) 50%,
    calc(100% - 12px) 50%;
  background-size:
    6px 6px,
    6px 6px;
  background-repeat: no-repeat;
}

.machine-select:disabled {
  opacity: 1;
  cursor: not-allowed;
  color: #94a3b8;
  background-color: #f8fafc;
  border-color: #e2e8f0;
  background-image:
    linear-gradient(45deg, transparent 50%, #94a3b8 50%),
    linear-gradient(135deg, #94a3b8 50%, transparent 50%);
}

.field-hint {
  margin: 0.125rem 0 0;
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.35;
}

.machine-select option {
  color: #0f172a;
  background: #ffffff;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.625rem;
}

.machine-select option:checked {
  color: #ffffff;
  background: #2563eb;
}

.machine-select-optional {
  border-color: #dbeafe !important;
  background-color: #f8fbff !important;
  color: #64748b !important;
}

.optional-badge {
  margin-left: 0.25rem;
  border-radius: 999px;
  background: #eff6ff;
  padding: 0.125rem 0.5rem;
  color: #2563eb;
  font-size: 0.6875rem;
  font-weight: 800;
}

.new-machine-badge {
  flex-shrink: 0;
  padding: 0.05rem 0.4rem;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #047857;
  background: #d1fae5;
  border-radius: 999px;
}

.pending-machines {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-top: 0.375rem;
}

.pending-machine-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  font-size: 0.8125rem;
  background: #f0fdf4;
  border: 1px dashed #6ee7b7;
  border-radius: 10px;
}

.pending-machine-name {
  font-weight: 700;
  color: #0f172a;
}

.pending-area-label {
  color: #475569;
}

.pending-area-select {
  margin-left: auto;
  min-width: 12rem;
  height: 2rem;
  padding: 0 0.5rem;
  font-size: 0.8125rem;
  background: white;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
}

@media (max-width: 640px) {
  .pending-area-select {
    width: 100%;
    margin-left: 0;
  }
}

.field-hint-success {
  color: #047857;
  font-weight: 700;
}

.field-hint-info {
  color: #2563eb;
  font-weight: 700;
}

.machine-select {
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    box-shadow 0.18s ease;
}

.machine-select:not(:disabled):hover {
  border-color: #60a5fa;
}

.machine-select:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.14) !important;
}

.usage-field-location .machine-select {
  border-color: #bfdbfe;
  background: #ffffff;
}

.usage-field-machine .machine-select {
  border-color: #bde8f5;
  background: #ffffff;
}

.usage-field-machine .machine-select:disabled {
  color: #94a3b8;
}

.time-input-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  border-radius: 10px;
}

.time-number-input {
  width: 72px;
  height: 2.45rem;
  border: 1px solid #bde8f5;
  border-radius: 10px;
  padding: 0 0.625rem;
  font-size: 0.875rem;
  font-weight: 700;
  text-align: center;
  background: white;
  outline: none;
  transition: border-color 0.2s;
}

.time-number-input:focus {
  border-color: #4988c4;
}

.time-unit-tabs {
  display: flex;
  gap: 0.25rem;
  background: white;
  border: 1px solid #bde8f5;
  border-radius: 10px;
  padding: 0.2rem;
  min-height: 2.45rem;
}

.time-unit-btn {
  padding: 0.25rem 0.625rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.time-unit-btn.active {
  background: linear-gradient(135deg, #1c4d8d 0%, #4988c4 100%);
  color: white;
  box-shadow: 0 2px 6px rgba(28, 77, 141, 0.3);
}

.time-unit-btn:hover:not(.active) {
  background: #eff6ff;
  color: #1c4d8d;
}

.quantity-control {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 0.25rem;
}

.quantity-input {
  width: 72px;
  height: 2rem;
  text-align: center;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
  outline: none;
  background: white;
  font-weight: 700;
  color: #0f172a;
}

.quantity-input:focus {
  border-color: #60a5fa;
}

.cart-summary {
  position: sticky;
  top: 100px;
  background: #f0f7ff;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.summary-title {
  font-family: 'Rubik', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1c4d8d;
}

.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  color: hsl(var(--muted-foreground));
}

.summary-value {
  font-weight: 700;
  color: hsl(var(--foreground));
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: hsl(var(--foreground));
}

.btn-checkout {
  background: #3c48f0;
  color: white;
  border: none;
  padding: 1rem;
  font-size: 1.0625rem;
  font-weight: 700;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(60, 72, 240, 0.4);
  transition: all 0.3s ease;
}

.btn-checkout:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(60, 72, 240, 0.5);
}

.btn-checkout:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field-error {
  border-color: #f87171 !important;
  background: #fff7f7 !important;
}

.field-error-soft {
  padding: 0.25rem;
  border: 1px solid #f87171;
  background: #fff7f7;
}

/* Hide number spinners */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  appearance: textfield;
  -moz-appearance: textfield;
}

/* Tablet */
@media (max-width: 1024px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }
}

/* Mobile */
@media (max-width: 640px) {
  .page-header {
    padding-top: 0.5rem;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .cart-item-body {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .item-image-wrap {
    width: 100%;
    height: 185px;
  }

  .item-title-row {
    gap: 0.75rem;
  }

  .item-order-box {
    grid-template-columns: 1fr;
    padding: 0.875rem;
  }

  .usage-field-full,
  .usage-field-location,
  .usage-field-machine {
    grid-column: auto;
  }

  .item-badges {
    justify-content: flex-start;
  }

  .time-input-row {
    flex-wrap: wrap;
  }

  .time-number-input {
    width: 82px;
  }

  .time-unit-tabs {
    flex: 1;
    justify-content: space-between;
  }

  .time-unit-btn {
    flex: 1;
    text-align: center;
  }

  .quantity-control {
    width: 100%;
    justify-content: space-between;
  }

  .quantity-input {
    flex: 1;
    max-width: 120px;
  }
}
</style>
