import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isValid } from 'date-fns'
import { id } from 'date-fns/locale'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(dateString, formatString = 'dd MMM yyyy HH:mm') {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    if (!isValid(date)) return '-'
    return format(date, formatString, { locale: id })
  } catch (error) {
    console.error('Error formatting date:', error)
    return '-'
  }
}

export function formatDate(dateString) {
  return formatDateTime(dateString, 'dd MMM yyyy')
}

export function formatTime(dateString) {
  return formatDateTime(dateString, 'HH:mm')
}

export function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('id-ID').format(num)
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function getInitials(name) {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function truncateText(text, maxLength = 50) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validatePhone(phone) {
  const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/
  return re.test(phone)
}

export function validateRTRW(rtrw) {
  const re = /^[0-9]{1,3}\/[0-9]{1,3}$/
  return re.test(rtrw)
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
          resolve(compressedFile)
        },
        'image/jpeg',
        quality
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

export function downloadFile(data, filename, type = 'application/octet-stream') {
  const blob = new Blob([data], { type })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err)
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

export function getStatusColor(status) {
  const colors = {
    draft: 'gray',
    submitted: 'blue',
    verified: 'green',
    rejected: 'red',
  }
  return colors[status] || 'gray'
}

export function getDisasterTypeIcon(type) {
  const icons = {
    banjir: '💧',
    longsor: '🏔️',
    kebakaran: '🔥',
    angin_puting_beliung: '💨',
    gempa: '🌍',
    kekeringan: '☀️',
    lainnya: '⚠️',
  }
  return icons[type] || '⚠️'
}

export function getDisasterTypeLabel(type) {
  const labels = {
    banjir: 'Banjir',
    longsor: 'Longsor',
    kebakaran: 'Kebakaran',
    angin_puting_beliung: 'Angin Puting Beliung',
    gempa: 'Gempa',
    kekeringan: 'Kekeringan',
    lainnya: 'Lainnya',
  }
  return labels[type] || 'Lainnya'
}

export function getRoleLabel(role) {
  const labels = {
    desa: 'Desa',
    kecamatan: 'Kecamatan',
    bpbd: 'BPBD',
  }
  return labels[role] || role
}

export function calculateTotalDamage(houses) {
  return {
    total: houses.heavily_damaged + houses.moderately_damaged + houses.lightly_damaged,
    heavily_damaged: houses.heavily_damaged || 0,
    moderately_damaged: houses.moderately_damaged || 0,
    lightly_damaged: houses.lightly_damaged || 0,
  }
}

export function isOnline() {
  return navigator.onLine
}

export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const d = R * c
  return d // Distance in km
}

export function generateFileName(prefix, extension) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${timestamp}_${random}.${extension}`
}

export function parseErrorMessage(error) {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.error_description) return error.error_description
  return 'Terjadi kesalahan yang tidak diketahui'
}

export function validateForm(data, schema) {
  const errors = {}

  Object.keys(schema).forEach(key => {
    const rules = schema[key]
    const value = data[key]

    if (rules.required && (!value || value.toString().trim() === '')) {
      errors[key] = `${rules.label || key} wajib diisi`
      return
    }

    if (value && rules.type === 'email' && !validateEmail(value)) {
      errors[key] = `${rules.label || key} tidak valid`
    }

    if (value && rules.type === 'phone' && !validatePhone(value)) {
      errors[key] = `${rules.label || key} tidak valid`
    }

    if (value && rules.type === 'rtrw' && !validateRTRW(value)) {
      errors[key] = `Format RT/RW tidak valid (contoh: 001/002)`
    }

    if (value && rules.minLength && value.length < rules.minLength) {
      errors[key] = `${rules.label || key} minimal ${rules.minLength} karakter`
    }

    if (value && rules.maxLength && value.length > rules.maxLength) {
      errors[key] = `${rules.label || key} maksimal ${rules.maxLength} karakter`
    }

    if (value !== undefined && value !== null && rules.min !== undefined && Number(value) < rules.min) {
      errors[key] = `${rules.label || key} minimal ${rules.min}`
    }

    if (value !== undefined && value !== null && rules.max !== undefined && Number(value) > rules.max) {
      errors[key] = `${rules.label || key} maksimal ${rules.max}`
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}