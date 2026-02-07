// src/utils/checkToken.ts

export const isTokenExpired = (expiresAt: string): boolean => {
  return new Date(expiresAt) < new Date()
}

export const getMillisecondsUntilExpiry = (expiresAt: string): number => {
  return new Date(expiresAt).getTime() - Date.now()
}

export const getWarningTime = (expiresAt: string): number => {
  // Cảnh báo trước 5 phút (300,000ms)
  const msUntilExpiry = getMillisecondsUntilExpiry(expiresAt)
  return Math.max(0, msUntilExpiry - 5 * 60 * 1000)
}

export const formatTimeRemaining = (expiresAt: string): string => {
  const ms = getMillisecondsUntilExpiry(expiresAt)
  
  if (ms <= 0) return 'Đã hết hạn'
  
  const minutes = Math.floor(ms / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days} ngày`
  if (hours > 0) return `${hours} giờ`
  return `${minutes} phút`
}