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
                  :src="getItemImageUrl(item.picture?.[0])"
                  :alt="getItemName(item)"
                  class="item-image"
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

                  <!-- Location / Line -->
                  <div class="usage-field usage-field-location">
                    <label class="usage-field-label">
                      <MapPin class="h-3.5 w-3.5 text-blue-500" />
                      Vị trí <span class="text-red-500">*</span>
                    </label>

                    <select
                      class="machine-select"
                      :class="{
                        'field-error': showUsageError && !getSelectedLineId(item),
                      }"
                      :value="getSelectedLineId(item) || ''"
                      :disabled="machineLoading || lineOptions.length === 0"
                      @change="
                        onLineChange(item, Number(($event.target as HTMLSelectElement).value))
                      "
                    >
                      <option value="" disabled>
                        {{
                          machineLoading ? 'Đang tải vị trí...' : 'Chọn vị trí sử dụng'
                        }}
                      </option>

                      <option
                        v-for="line in lineOptions"
                        :key="line.id"
                        :value="line.id"
                      >
                        {{ getLineLabel(line) }}
                      </option>
                    </select>

                    <p class="field-hint">
                      Chọn vị trí trước, hệ thống sẽ lọc máy phù hợp bên dưới.
                    </p>
                  </div>

                  <!-- Machine -->
                  <div class="usage-field usage-field-machine">
                    <label class="usage-field-label">
                      <Cpu class="h-3.5 w-3.5 text-blue-500" />
                      Máy tương thích
                      <span v-if="shouldRequireMachine(item)" class="text-red-500">*</span>
                      <span v-else class="optional-badge">Không bắt buộc</span>
                    </label>

                    <select
                      class="machine-select"
                      :class="{
                        'field-error': showUsageError && shouldRequireMachine(item) && !getSelectedMachineId(item),
                        'machine-select-optional': !shouldRequireMachine(item),
                      }"
                      :value="getSelectedMachineId(item) || ''"
                      :disabled="
                        machineLoading ||
                        !getSelectedLineId(item) ||
                        !shouldRequireMachine(item) ||
                        getMachinesByLineId(getSelectedLineId(item)).length === 0
                      "
                      @change="
                        onMachineChange(item, Number(($event.target as HTMLSelectElement).value))
                      "
                    >
                      <option value="" disabled>
                        {{ getMachinePlaceholder(item) }}
                      </option>

                      <option
                        v-for="machine in getMachinesByLineId(getSelectedLineId(item))"
                        :key="machine.id"
                        :value="machine.id"
                      >
                        {{ getMachineOnlyLabel(machine) }}
                      </option>
                    </select>

                    <p v-if="machineLoadError" class="field-hint text-red-500">
                      Không tải được danh sách vị trí / máy. Vui lòng thử lại.
                    </p>

                    <p
                      v-else-if="
                        getSelectedLineId(item) &&
                        getMachinesByLineId(getSelectedLineId(item)).length === 0
                      "
                      class="field-hint field-hint-info"
                    >
                      Vị trí này không có máy tương thích nên không cần chọn máy.
                    </p>

                    <p
                      v-else-if="
                        getSelectedLineId(item) &&
                        getMachinesByLineId(getSelectedLineId(item)).length === 1 &&
                        getSelectedMachineId(item)
                      "
                      class="field-hint field-hint-success"
                    >
                      Đã tự chọn máy duy nhất của vị trí này.
                    </p>

                    <p v-else class="field-hint">
                      Chỉ hiển thị máy thuộc vị trí đã chọn.
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
              :disabled="orderStore.loading || machineLoading"
              @click="placeOrder"
            >
              <Check v-if="!orderStore.loading" class="mr-2 h-4 w-4" />
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

import { getItemImageUrl } from '@/utils/imageUtils'
import { orderAPI } from '@/services/orderAPI'
import { lineMachineAPI } from '@/services/lineMachineAPI'

import type { Line, Machine } from '@/types/line_machine.types'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
  machineId?: number | null
  picture?: string[]
  type: string
  unit: string
  stockQty?: number
  eng?: {
    partname?: string
    description?: string
  }
  com?: {
    name?: string
    specifications?: string
  }
}

interface TimeLocal {
  amount: number
  unit: string
}

// ========================
// Stores & Router
// ========================
const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()
const userStore = useUserStore()

// Khu vực (areaPart) của tài khoản đang đăng nhập: 'SMD' | 'MAINLINE' | ...
// Chuẩn hoá về chữ HOA + trim để so sánh an toàn.
const userAreaPart = computed(() => {
  const user = userStore.currentUser as any
  if (!user) return ''
  const area = user.areaPart || user.AreaPart || user.department || user.Department || ''
  const normalized = String(area).trim().toUpperCase()
  if (normalized.includes('MAINLINE') || normalized.includes('MAIN LINE')) return 'MAINLINE'
  if (normalized.includes('SMD')) return 'SMD'
  return normalized
})

// ========================
// Form State
// ========================
const nameWorker = ref('')
const showNameError = ref(false)
const showUsageError = ref(false)

// ========================
// Machine State
// ========================
const machineOptions = ref<Machine[]>([])
const allLines = ref<Line[]>([])
const machineLoading = ref(false)
const machineLoadError = ref(false)
const selectedLineIds = ref<Record<number, number>>({})

const sortedMachineOptions = computed(() => {
  return [...machineOptions.value].sort(compareMachines)
})

const lineOptions = computed<Line[]>(() => {
  const area = userAreaPart.value

  // Ưu tiên dùng dữ liệu từ /api/Lines (hiển thị được cả line chưa có máy nào).
  let lines: Line[] = allLines.value
    .filter((line) => line?.id)
    .map(
      (line: any) =>
        ({
          id: Number(line.id),
          lineName: line.lineName || line.LineName || `Vị trí ${line.id}`,
          areaPart: line.areaPart || line.AreaPart || '',
        }) as Line,
    )

  // Fallback: nếu /api/Lines không trả gì, suy ra line từ danh sách máy.
  if (lines.length === 0) {
    const map = new Map<number, Line>()

    for (const machine of sortedMachineOptions.value) {
      if (!machine.lineId) continue

      const line = machine.line

      map.set(Number(machine.lineId), {
        id: Number(machine.lineId),
        lineName: line?.lineName || machine.lineName || `Vị trí ${machine.lineId}`,
        areaPart: line?.areaPart || '',
      } as Line)
    }

    lines = [...map.values()]
  }

  // Lọc theo areaPart của user: SMD chỉ thấy line SMD, MAINLINE chỉ thấy line MAINLINE.
  if (area) {
    lines = lines.filter((line) => (line.areaPart || '').trim().toUpperCase() === area)
  }

  return lines.sort((a, b) => {
    const areaA = a.areaPart || ''
    const areaB = b.areaPart || ''
    const lineA = a.lineName || ''
    const lineB = b.lineName || ''

    return `${areaA}-${lineA}`.localeCompare(`${areaB}-${lineB}`)
  })
})

const machinesByLineId = computed(() => {
  const map = new Map<number, Machine[]>()

  for (const machine of sortedMachineOptions.value) {
    const lineId = Number(machine.lineId)
    const current = map.get(lineId) ?? []
    current.push(machine)
    map.set(lineId, current)
  }

  return map
})

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
    // Lấy song song danh sách Line (có areaPart đáng tin cậy) và Machine.
    const [linesResponse, machinesResponse] = await Promise.all([
      lineMachineAPI.getAllLines().catch(() => [] as Line[]),
      lineMachineAPI.getAllMachines(),
    ])

    allLines.value = Array.isArray(linesResponse) ? linesResponse : []

    // Map lineId -> areaPart để lọc máy ngay cả khi machine.line bị null.
    const areaByLineId = new Map<number, string>()
    for (const line of allLines.value as any[]) {
      if (line?.id) {
        areaByLineId.set(Number(line.id), (line.areaPart || line.AreaPart || '').trim().toUpperCase())
      }
    }

    const area = userAreaPart.value

    machineOptions.value = Array.isArray(machinesResponse)
      ? machinesResponse
          .filter((machine) => machine?.id)
          .map((machine) => ({
            ...machine,
            id: Number(machine.id),
            lineId: Number(machine.lineId),
          }))
          // Chỉ giữ máy thuộc đúng khu vực (areaPart) của user.
          .filter((machine: any) => {
            if (!area) return true
            const machineArea = (
              machine.line?.areaPart ||
              machine.line?.AreaPart ||
              areaByLineId.get(Number(machine.lineId)) ||
              ''
            )
              .trim()
              .toUpperCase()
            return machineArea === area
          })
      : []

    syncSelectedLinesFromMachines()
  } catch (error) {
    machineLoadError.value = true
    machineOptions.value = []

    toast.error('Không tải được danh sách máy', {
      description: error instanceof Error ? error.message : 'Vui lòng thử lại sau',
    })
  } finally {
    machineLoading.value = false
  }
}

const compareMachines = (a: Machine, b: Machine) => {
  const areaA = a.line?.areaPart || ''
  const areaB = b.line?.areaPart || ''

  const lineA = a.line?.lineName || a.lineName || ''
  const lineB = b.line?.lineName || b.lineName || ''

  const machineA = a.machineName || ''
  const machineB = b.machineName || ''

  return `${areaA}-${lineA}-${machineA}`.localeCompare(`${areaB}-${lineB}-${machineB}`)
}

const getLineLabel = (line: Line): string => {
  const areaPart = line.areaPart?.trim()
  const lineName = line.lineName?.trim() || `Vị trí ${line.id}`

  return areaPart ? `${areaPart} - ${lineName}` : lineName
}

const getMachineOnlyLabel = (machine: Machine): string => {
  return machine.machineName?.trim() || `Máy ID ${machine.id}`
}

const getMachinesByLineId = (lineId?: number | null): Machine[] => {
  if (!lineId) return []
  return machinesByLineId.value.get(Number(lineId)) ?? []
}

const getSelectedMachineId = (item: CartItemLocal): number | null => {
  return item.machineId ? Number(item.machineId) : null
}

const getSelectedLineId = (item: CartItemLocal): number | null => {
  if (!item.id) return null

  const localLineId = selectedLineIds.value[item.id]
  if (localLineId) return Number(localLineId)

  const machineId = getSelectedMachineId(item)
  if (!machineId) return null

  const machine = machineOptions.value.find((machine) => Number(machine.id) === machineId)
  return machine?.lineId ? Number(machine.lineId) : null
}

const shouldRequireMachine = (item: CartItemLocal): boolean => {
  const lineId = getSelectedLineId(item)
  if (!lineId) return true

  return getMachinesByLineId(lineId).length > 0
}

const getMachinePlaceholder = (item: CartItemLocal): string => {
  if (machineLoading.value) return 'Đang tải danh sách máy...'

  const lineId = getSelectedLineId(item)
  if (!lineId) return 'Chọn vị trí trước'

  const machines = getMachinesByLineId(lineId)

  if (machines.length === 0) return 'Không cần chọn máy cho vị trí này'

  if (machines.length === 1) {
    const onlyMachine = machines[0]
    return onlyMachine ? getMachineOnlyLabel(onlyMachine) : 'Chọn máy tương thích'
  }

  return 'Chọn máy tương thích'
}

const autoSelectMachineIfOnlyOne = (item: CartItemLocal, lineId?: number | null) => {
  if (!lineId) {
    item.machineId = null
    return
  }

  const machines = getMachinesByLineId(lineId)

  if (machines.length === 1) {
    const onlyMachine = machines[0]

    if (onlyMachine?.id) {
      item.machineId = Number(onlyMachine.id)
      return
    }
  }

  item.machineId = null
}

const onLineChange = (item: CartItemLocal, lineId: number) => {
  if (!item.id) return

  selectedLineIds.value[item.id] = lineId || 0
  autoSelectMachineIfOnlyOne(item, lineId)
}

const onMachineChange = (item: CartItemLocal, machineId: number) => {
  item.machineId = machineId || null

  if (!item.id || !machineId) return

  const machine = machineOptions.value.find((machine) => Number(machine.id) === Number(machineId))

  if (machine?.lineId) {
    selectedLineIds.value[item.id] = Number(machine.lineId)
  }
}


const syncSelectedLinesFromMachines = () => {
  ;(cartStore.items as CartItemLocal[]).forEach((item) => {
    if (!item.id || !item.machineId) return

    const selectedMachine = machineOptions.value.find(
      (machine) => Number(machine.id) === Number(item.machineId),
    )

    if (selectedMachine?.lineId) {
      selectedLineIds.value[item.id] = Number(selectedMachine.lineId)
    }
  })
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
  delete selectedLineIds.value[itemId]
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
  const missingLine = items.filter((item) => !getSelectedLineId(item))
  const missingMachine = items.filter((item) => shouldRequireMachine(item) && !item.machineId)

  const hasError =
    missingNote.length > 0 ||
    missingTime.length > 0 ||
    missingLine.length > 0 ||
    missingMachine.length > 0

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

  if (missingLine.length > 0) {
    toast.error('Thiếu vị trí sử dụng', {
      description: missingLine.map(getItemLabel).join(', '),
    })
  }

  if (missingMachine.length > 0) {
    toast.error('Thiếu máy tương thích', {
      description: missingMachine.map(getItemLabel).join(', '),
    })
  }

  return false
}

// ========================
// Submit
// ========================
const placeOrder = async () => {
  if (orderStore.loading) return
  if (cartStore.isEmpty) return

  if (!validateBeforeSubmit()) return

  orderStore.setLoading(true)

  try {
    const orderData = {
      nameWorker: nameWorker.value.trim(),
      itemIds: (cartStore.items as CartItemLocal[]).map((item) => ({
        itemId: Number(item.id),
        orderQty: getLocalQuantity(Number(item.id)),
        note: item.note?.trim() || '',
        timeUsed: item.timeUsed?.trim() || '',
        lineId: Number(getSelectedLineId(item)),
        machineId: shouldRequireMachine(item) ? Number(item.machineId) : null,
      })),
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
    selectedLineIds.value = {}

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

    Object.keys(selectedLineIds.value).forEach((key) => {
      if (!currentIds.has(Number(key))) {
        delete selectedLineIds.value[Number(key)]
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

      if (!selectedLineIds.value[item.id] && item.machineId) {
        const selectedMachine = machineOptions.value.find(
          (machine) => Number(machine.id) === Number(item.machineId),
        )

        if (selectedMachine?.lineId) {
          selectedLineIds.value[item.id] = Number(selectedMachine.lineId)
        }
      }

      if (selectedLineIds.value[item.id] && !item.machineId) {
        autoSelectMachineIfOnlyOne(item, selectedLineIds.value[item.id])
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
