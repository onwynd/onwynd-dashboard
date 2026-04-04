"use client"

import { useState, useEffect, useCallback } from "react"

interface UseLoadingTimeoutOptions {
  timeout?: number // timeout in milliseconds (default: 30000ms = 30s)
  onTimeout?: () => void // callback when timeout occurs
}

interface UseLoadingTimeoutReturn {
  isLoading: boolean
  isTimedOut: boolean
  startLoading: () => void
  stopLoading: () => void
  resetTimeout: () => void
}

export function useLoadingTimeout(options: UseLoadingTimeoutOptions = {}): UseLoadingTimeoutReturn {
  const { timeout = 30000, onTimeout } = options
  const [isLoading, setIsLoading] = useState(false)
  const [isTimedOut, setIsTimedOut] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const clearExistingTimeout = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
  }, [timeoutId])

  const startLoading = useCallback(() => {
    clearExistingTimeout()
    setIsLoading(true)
    setIsTimedOut(false)
    
    const id = setTimeout(() => {
      setIsLoading(false)
      setIsTimedOut(true)
      onTimeout?.()
    }, timeout)
    
    setTimeoutId(id)
  }, [clearExistingTimeout, timeout, onTimeout])

  const stopLoading = useCallback(() => {
    clearExistingTimeout()
    setIsLoading(false)
    setIsTimedOut(false)
  }, [clearExistingTimeout])

  const resetTimeout = useCallback(() => {
    if (isLoading) {
      startLoading()
    }
  }, [isLoading, startLoading])

  useEffect(() => {
    return () => {
      clearExistingTimeout()
    }
  }, [clearExistingTimeout])

  return {
    isLoading,
    isTimedOut,
    startLoading,
    stopLoading,
    resetTimeout,
  }
}