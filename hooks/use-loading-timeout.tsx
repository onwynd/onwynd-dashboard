"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseLoadingTimeoutOptions {
  timeout?: number
  onTimeout?: () => void
}

interface UseLoadingTimeoutReturn {
  isLoading: boolean
  isTimedOut: boolean
  startLoading: () => void
  stopLoading: () => void
  resetTimeout: () => void
}

export function useLoadingTimeout(options: UseLoadingTimeoutOptions = {}): UseLoadingTimeoutReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [isTimedOut, setIsTimedOut] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  // Keep latest options in refs so callbacks are always stable (never recreated)
  const optionsRef = useRef(options)
  optionsRef.current = options

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const startLoading = useCallback(() => {
    clearTimer()
    setIsLoading(true)
    setIsTimedOut(false)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      setIsLoading(false)
      setIsTimedOut(true)
      optionsRef.current.onTimeout?.()
    }, optionsRef.current.timeout ?? 30000)
  }, []) // stable — all values read from refs at call time

  const stopLoading = useCallback(() => {
    clearTimer()
    setIsLoading(false)
    setIsTimedOut(false)
  }, []) // stable

  const resetTimeout = useCallback(() => {
    // Only restart the timer if currently loading — read live state via ref trick
    if (timerRef.current !== null) {
      clearTimer()
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        setIsLoading(false)
        setIsTimedOut(true)
        optionsRef.current.onTimeout?.()
      }, optionsRef.current.timeout ?? 30000)
    }
  }, []) // stable

  // Cleanup only on unmount — no deps that can change
  useEffect(() => {
    return () => { clearTimer() }
  }, [])

  return { isLoading, isTimedOut, startLoading, stopLoading, resetTimeout }
}
