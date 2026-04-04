import type { AxiosError } from 'axios'
import { toast } from '@/components/ui/use-toast'

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
    toast({ description: 'Server error: ' + message, variant: 'destructive', duration: 6000 })
  } else if (status && status >= 400) {
    toast({ description: 'Request error: ' + message, variant: 'destructive', duration: 6000 })
  } else if (!status) {
    toast({ description: 'Network error: ' + message, variant: 'destructive', duration: 6000 })
  }
}
