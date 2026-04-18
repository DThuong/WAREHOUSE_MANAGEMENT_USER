/**
 * Utility to handle image URLs consistently across the application.
 * Ensures images are requested via the Nginx proxy path.
 */
export const getItemImageUrl = (imagePath: string | string[] | undefined): string => {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop'
  }

  // Handle if it's an array (sometimes picture is string[])
  const path = Array.isArray(imagePath) ? imagePath[0] : imagePath

  if (!path) {
    return 'https://images.unsplash.com/photo-1553062407-98eeb64c6;a62?w=400&h=300&fit=crop'
  }

  // If already a full URL, return it
  if (path.startsWith('http')) {
    return path
  }

  // Use relative path to hit Nginx proxy at port 8082 (current origin)
  // Ensure we don't have double slashes if VITE_API_BASE_URL is /
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  
  return `${cleanBaseUrl}/api/Item/image/${path}`
}
