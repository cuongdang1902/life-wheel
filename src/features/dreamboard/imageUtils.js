import { supabase } from '../../shared/lib/supabase'

const MAX_SIZE = 800
const WEBP_QUALITY = 0.82

/**
 * Convert a File to a WebP Blob, resized to MAX_SIZE on the longest edge.
 */
export function convertToWebP(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE) / width)
          width = MAX_SIZE
        } else {
          width = Math.round((width * MAX_SIZE) / height)
          height = MAX_SIZE
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        blob => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas toBlob failed'))
        },
        'image/webp',
        WEBP_QUALITY
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image load failed'))
    }
    img.src = url
  })
}

/**
 * Upload a File to Supabase Storage (dream-images bucket).
 * Returns the public URL, or null on error.
 */
export async function uploadDreamImage(file, userId) {
  try {
    const webpBlob = await convertToWebP(file)
    const fileName = `${userId}/${Date.now()}.webp`
    const { error } = await supabase.storage
      .from('dream-images')
      .upload(fileName, webpBlob, { contentType: 'image/webp', upsert: false })
    if (error) {
      console.error('Upload error:', error.message)
      return null
    }
    const { data } = supabase.storage.from('dream-images').getPublicUrl(fileName)
    return data.publicUrl
  } catch (e) {
    console.error('convertToWebP error:', e)
    return null
  }
}

/**
 * Delete an image from Supabase Storage given its public URL.
 */
export async function deleteDreamImage(publicUrl) {
  try {
    // Extract path after "/object/public/dream-images/"
    const marker = '/object/public/dream-images/'
    const idx = publicUrl.indexOf(marker)
    if (idx === -1) return
    const filePath = publicUrl.slice(idx + marker.length)
    await supabase.storage.from('dream-images').remove([filePath])
  } catch (e) {
    console.error('deleteDreamImage error:', e)
  }
}
