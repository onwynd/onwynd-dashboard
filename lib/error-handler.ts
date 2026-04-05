import type { AxiosError } from 'axios'
import { toast } from '@/components/ui/use-toast'

// Deduplication: track last-shown message + timestamp to prevent toast floods
const _lastToast: { key: string; at: number } = { key: '', at: 0 }
const DEDUP_MS = 4000

function showToast(description: string) {
  const now = Date.now()
  if (description === _lastToast.key && now - _lastToast.at < DEDUP_MS) return
  _lastToast.key = description
  _lastToast.at = now
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
