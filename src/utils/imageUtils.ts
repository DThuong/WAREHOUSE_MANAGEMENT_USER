/**
 * Helper tạo URL ảnh cho các API:
 *   GET /api/Item/image/{fileName}?w=
 *   GET /api/Order/image/{fileName}?w=
 *   GET /api/StockIn/image/{fileName}?w=
 *
 * Backend resize theo `w` và trả ETag + Cache-Control, nên phía UI cần:
 *  1. Luôn xin đúng cỡ ảnh đang hiển thị (không tải ảnh gốc vài MB cho thumbnail 120px).
 *  2. Làm tròn `w` lên một tập cỡ CỐ ĐỊNH → URL ổn định giữa các màn hình,
 *     tận dụng tối đa cache trình duyệt/ETag (cùng ảnh, cùng URL = cache hit).
 *  3. Dùng srcset/sizes để màn hình Retina lấy ảnh 2x, mobile lấy ảnh nhỏ hơn.
 *  4. Không thêm query chống cache (?t=...) vì sẽ phá ETag.
 */

export type ImageSource = 'Item' | 'Order' | 'StockIn'

/** Các cỡ ảnh cho phép xin backend. Giữ ít bậc để tối đa cache hit. */
export const IMAGE_WIDTHS = [64, 128, 256, 384, 512, 768, 1024, 1280, 1920] as const
const MAX_IMAGE_WIDTH = 1920

/** Cỡ dùng cho trình xem ảnh phóng to (đủ nét khi zoom, nhẹ hơn nhiều so với ảnh gốc). */
export const PREVIEW_IMAGE_WIDTH = 1920

/** Placeholder nội tuyến (SVG data URI) — không phát sinh request ra ngoài như ảnh Unsplash trước đây. */
export const IMAGE_PLACEHOLDER =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">` +
      `<rect width="400" height="300" fill="#f1f5f9"/>` +
      `<g fill="none" stroke="#cbd5e1" stroke-width="10" stroke-linejoin="round">` +
      `<rect x="140" y="95" width="120" height="100" rx="10"/>` +
      `<path d="M150 180l35-40 25 25 15-15 25 30"/>` +
      `</g><circle cx="230" cy="125" r="10" fill="#cbd5e1"/></svg>`
  )

/** Làm tròn lên bậc cỡ gần nhất (vượt bậc lớn nhất thì dùng bậc lớn nhất). */
export const snapImageWidth = (width: number): number => {
  const w = Math.ceil(width)
  return IMAGE_WIDTHS.find((b) => b >= w) ?? MAX_IMAGE_WIDTH
}

const getBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

const pickPath = (imagePath: string | string[] | null | undefined): string => {
  const path = Array.isArray(imagePath) ? imagePath[0] : imagePath
  return (path ?? '').trim()
}

/** Encode từng đoạn của tên file (khoảng trắng, ký tự tiếng Việt, #, ?...) nhưng giữ dấu "/". */
const encodePath = (path: string) => path.split('/').map(encodeURIComponent).join('/')

/**
 * URL ảnh theo nguồn. `width` = số pixel THỰC cần (đã nhân devicePixelRatio nếu muốn);
 * bỏ trống → ảnh gốc.
 */
export const getImageUrl = (
  source: ImageSource,
  imagePath: string | string[] | null | undefined,
  width?: number
): string => {
  const path = pickPath(imagePath)
  if (!path) return IMAGE_PLACEHOLDER

  // URL đầy đủ / data URI / blob → dùng nguyên
  if (/^(https?:|data:|blob:)/i.test(path)) return path

  const url = `${getBaseUrl()}/api/${source}/image/${encodePath(path)}`
  return width && width > 0 ? `${url}?w=${snapImageWidth(width)}` : url
}

/**
 * srcset theo width descriptor (vd "…?w=256 256w, …?w=512 512w").
 * Dùng cùng thuộc tính `sizes` để trình duyệt tự chọn cỡ hợp lý theo layout + DPR.
 */
export const getImageSrcSet = (
  source: ImageSource,
  imagePath: string | string[] | null | undefined,
  widths: readonly number[]
): string | undefined => {
  const path = pickPath(imagePath)
  if (!path || /^(https?:|data:|blob:)/i.test(path)) return undefined
  const unique = [...new Set(widths.map(snapImageWidth))].sort((a, b) => a - b)
  return unique.map((w) => `${getImageUrl(source, path, w)} ${w}w`).join(', ')
}

// ===== Shortcut theo từng API =====
export const getItemImageUrl = (imagePath: string | string[] | null | undefined, width?: number) =>
  getImageUrl('Item', imagePath, width)

export const getOrderImageUrl = (imagePath: string | string[] | null | undefined, width?: number) =>
  getImageUrl('Order', imagePath, width)

export const getStockInImageUrl = (imagePath: string | string[] | null | undefined, width?: number) =>
  getImageUrl('StockIn', imagePath, width)

/**
 * @error handler dùng chung: chuyển sang placeholder.
 * Phải xoá srcset, nếu không trình duyệt vẫn ưu tiên srcset và tiếp tục tải ảnh lỗi.
 */
export const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement | null
  if (!img || img.dataset.fallback === '1') return // tránh vòng lặp lỗi
  img.dataset.fallback = '1'
  img.removeAttribute('srcset')
  img.removeAttribute('sizes')
  img.src = IMAGE_PLACEHOLDER
}

/** Tải trước ảnh (vd ảnh kế tiếp trong trình xem) để chuyển ảnh tức thì; nhờ ETag/Cache-Control sẽ dùng lại cache. */
export const preloadImage = (url: string | undefined) => {
  if (!url || url.startsWith('data:')) return
  const img = new Image()
  img.decoding = 'async'
  img.src = url
}
