import type { AxiosError } from 'axios'
import { toast } from '@/components/ui/use-toast'

// Deduplication: stored on window to survive HMR module re-evaluation
// Network errors are suppressed for 60s; other errors for 8s
const NETWORK_DEDUP_MS = 60_000
const DEFAULT_DEDUP_MS = 8_000

function getDedup(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  if (!(window as Window & { __toastDedup?: Record<string, number> }).__toastDedup) {
    (window as Window & { __toastDedup?: Record<string, number> }).__toastDedup = {}
  }
  return (window as Window & { __toastDedup?: Record<string, number> }).__toastDedup!
}

function showToast(description: string) {
  const now = Date.now()
  const dedup = getDedup()
  const isNetworkError = description.startsWith('Network error')
  const dedupMs = isNetworkError ? NETWORK_DEDUP_MS : DEFAULT_DEDUP_MS
  if (dedup[description] && now - dedup[description] < dedupMs) return
  dedup[description] = now
  toast({ description, variant: 'destructive', duration: 6000 })
}

export function handleAxiosError(error: unknown) {
  const e = error as AxiosError<unknown>
  const status = e?.response?.status
  let messageFromServer: string | undefined
  const data = e?.response?.data as unknown
  if (typeof data === 'object' && data !== null) {
    const obj = data as { message?: unknown; error?: unknown }
    messageFromServer = typeof obj.message === 'string' ? obj.message : (typeof obj.error === 'string' ? obj.error : undefined)
  }
  const message = messageFromServer || e?.message || 'Request failed'
  if (status && status >= 500) {
    showToast('Server error: ' + message)
  } else if (status && status >= 400) {
    showToast('Request error: ' + message)
  } else if (!status) {
    showToast('Network error: ' + message)
  }
}
