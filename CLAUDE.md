# CLAUDE.md — Warehouse Users (Kho Dong Yang)

Bộ nhớ ngữ cảnh cho Claude. Đọc file này trước khi làm việc để hiểu nhanh dự án.

## 1. Dự án là gì

Frontend cho **người dùng (worker)** đặt order vật tư từ kho Dong Yang. Đây là app phía
user; tài khoản **Admin bị chặn** truy cập (có app/quản lý riêng). Luồng chính:
duyệt vật tư → thêm vào giỏ → khai báo mục đích/vị trí (line)/máy/thời gian/số lượng →
tạo đơn → chờ quản lý duyệt → nhận cập nhật realtime.

## 2. Tech stack

- **Vue 3** (`<script setup>`, Composition API) + **TypeScript** + **Vite 7**
- **Pinia** (state) + `pinia-plugin-persistedstate` (chỉ `cartStore` đang `persist: true`)
- **Vue Router 4** (history mode)
- **Tailwind CSS v4** + **reka-ui** (shadcn-vue style) cho UI primitives (`src/components/ui/*`)
- **axios** (`src/services/api.ts` — interceptor trả thẳng `response.data`)
- **@microsoft/signalr** cho realtime (thông báo + cập nhật trạng thái đơn)
- **vue-sonner** cho toast, **lucide-vue-next** cho icon
- Deploy: **Docker + Nginx** (`nginx.conf`) proxy API và SignalR hub (đường dẫn tương đối).

## 3. Cấu trúc thư mục (`src/`)

- `views/` — trang chính: `UserDashboardView`, `UserProductsView`, `UserCartView`,
  `UserOrdersView`, `UserOrderDetailView`, `UserLoginView`, `ReorderDialog`.
- `components/` — `UserLayout` (header/nav/footer + dropdown thông báo & đổi mật khẩu),
  `AdvancedSearch` (search có lịch sử + gợi ý + debounce 300ms), `AppLoading`,
  `ImagePreviewViewer`, và `components/ui/*` (UI primitives).
- `stores/` — `userStore` (Options API + localStorage), `cartStore` (persisted),
  `itemStore`, `orderStore`, `notificationStore`.
- `services/` — wrapper API theo domain + 2 service SignalR (xem mục 6).
- `types/` — `user`, `item`, `order`, `line_machine`, `notification`, `stockin`.
- `utils/` — `imageUtils` (URL ảnh qua Nginx), `searchUtils` (fuzzy + bỏ dấu tiếng Việt +
  highlight), `checkToken` (hết hạn token).
- `router/` — `index.ts` (route + guard inline). ⚠️ `guards.ts` là **code chết** (xem mục 7).

## 4. Khái niệm nghiệp vụ quan trọng

- **areaPart**: khu vực sản xuất của tài khoản, giá trị `"SMD"` hoặc `"MAINLINE"`
  (`User.areaPart`). **Mỗi Line cũng có `areaPart`.** Quy tắc: user SMD chỉ được chọn
  **Line + Máy thuộc SMD**; user MAINLINE chỉ chọn của MAINLINE. (Đã implement ở giỏ hàng —
  xem mục 5.)
- **Line (Vị trí)** ↔ **Machine (Máy)**: 1 Line có nhiều Máy (`Machine.lineId`). Trong giỏ,
  chọn Line trước → lọc Máy theo Line. Nếu Line không có máy ⇒ không bắt buộc chọn máy;
  nếu Line chỉ có 1 máy ⇒ tự chọn.
- **Item**: 2 loại — `ENG` (hàng kỹ thuật, dùng `item.eng`) và `COM` (hàng tiêu dùng,
  dùng `item.com`). Tên/mô tả lấy từ `eng.partname/description` hoặc `com.name/specifications`.
- **OrderStatus**: `Pending` → `Approved`/`Rejected` → `Completed`.

## 5. Tính năng giỏ hàng & lọc theo areaPart (TRỌNG TÂM)

File: `src/views/UserCartView.vue`.

- Khi vào giỏ, `fetchMachines()` gọi **song song** `lineMachineAPI.getAllLines()` và
  `getAllMachines()`.
- Lọc theo `userAreaPart` (lấy từ `userStore.currentUser.areaPart`, chuẩn hoá `trim().toUpperCase()`):
  - `machineOptions` chỉ giữ máy có areaPart trùng user (so theo `machine.line.areaPart`,
    fallback map `lineId → areaPart` từ `/api/Lines` để xử lý khi `machine.line` null).
  - `lineOptions` (computed) ưu tiên dữ liệu `/api/Lines` (hiện được cả line chưa có máy),
    fallback suy từ machines, rồi **lọc theo areaPart** của user.
- Submit `placeOrder()` gửi `{ itemId, orderQty, note, timeUsed, lineId, machineId }` cho mỗi item.
  `CreateOrderRequest.itemIds` đã có `lineId` (`types/order.types.ts`).
- Nếu sau này cần lọc areaPart ở chỗ khác (vd thêm vào giỏ từ Products), tái dùng quy tắc
  so sánh `trim().toUpperCase()` này.

## 6. Realtime (SignalR) — có 2 service riêng

- `services/signalrService.ts` → hub **thông báo** (`ReceiveNotification`) → `notificationStore`.
  Khởi động trong `UserLayout` (mount/unmount).
- `services/orderNotiService.ts` → hub **đơn hàng** (`OrderStatusUpdated`). Dùng trong
  Dashboard / Orders / OrderDetail để cập nhật trạng thái realtime.
- ⚠️ Cùng tên class `SignalRService` ở 2 file khác nhau — dễ nhầm.

## 7. Vấn đề đã biết (perf & logic) — chưa sửa, cần lưu ý

**Logic / bug:**
1. **`signalrService.ts` hardcode IP LAN** `http://172.16.162.123:7000/notificationHub`
   trong khi phần còn lại đi qua Nginx bằng đường dẫn tương đối (`/orderHub`). Sẽ **hỏng ở
   production / ngoài mạng nội bộ**. Nên đổi sang `/notificationHub`.
2. **Redirect sai route**: `App.vue > handleLogout` và toàn bộ `router/guards.ts` đẩy về
   `/signin` — route này **không tồn tại** (router chỉ có `/user/login`). Hiện bị catch-all
   `/:pathMatch(.*)*` cứu về `/user/login` nhưng **mất query `reason/message`**.
3. **`router/guards.ts` là code chết** (không import ở đâu). Router thật dùng guard inline
   trong `index.ts`; logic auth thật (chặn Admin, hẹn giờ hết hạn token) nằm ở `App.vue`.
   → Nên xoá `guards.ts` hoặc hợp nhất để tránh hiểu nhầm.
4. Bất nhất kiểu dữ liệu: `Item.AreaPart` (viết hoa A) khác `areaPart` ở chỗ khác.
5. (Đã sửa) URL ảnh fallback trong `imageUtils.ts` có dấu `;` lạc → ảnh vỡ khi `picture` rỗng.
6. (Đã sửa) `CreateOrderRequest.itemIds` thiếu `lineId` dù `placeOrder` đang gửi.

**Performance:**
1. **`UserLayout` bị lồng trong từng view** (mỗi trang tự bọc `<UserLayout>`) thay vì là
   layout cố định ở cấp router. ⇒ Mỗi lần điều hướng, layout **unmount/remount**: gọi lại
   `notificationStore.fetchNotifications()` và **ngắt/kết nối lại socket thông báo** mỗi lần
   chuyển trang. Nên nâng `UserLayout` thành layout cố định (mount 1 lần).
2. `UserCartView` có `watch(cartStore.items, ..., { deep: true, immediate: true })` vừa theo
   dõi vừa ghi ngược vào chính item được theo dõi → có thể recompute thừa (chấp nhận được với
   giỏ nhỏ).
3. **`console.log` nhiều ở hot path production**: `api.ts` log mọi response (kèm payload),
   `router/index.ts` log mọi điều hướng, một số store/service. Nên gỡ trước khi build prod
   (perf + rò rỉ dữ liệu).

## 8. Quy ước & mẹo khi sửa code

- Comment trong code chủ yếu bằng **tiếng Việt** — giữ nhất quán.
- API qua `src/services/api.ts`: các hàm trả thẳng `data` (không phải `AxiosResponse`).
  Interceptor tự gắn `Authorization: Bearer <auth_token>` và xử lý 401 (logout + redirect).
- Token & user lưu ở `localStorage` (`auth_token`, `user_info`); `cartStore` persist riêng.
- State sessionStorage cho UX: trang/tìm kiếm/filter/active-id ở Products, active-id ở
  Dashboard/Orders, lịch sử tìm kiếm (`history_<storageKey>`) ở AdvancedSearch.
- Lệnh: `npm run dev`, `npm run build` (chạy `type-check` + `build-only`),
  `npm run type-check` (`vue-tsc --build`), `npm run lint`, `npm run format`.
- Env: `VITE_WAREHOUSE_URL` (baseURL axios, mặc định `/`), `VITE_API_BASE_URL` (prefix ảnh).
- Khi cần lọc theo khu vực, luôn so sánh areaPart bằng `(x || '').trim().toUpperCase()`.
