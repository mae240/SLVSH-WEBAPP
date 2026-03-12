import { useState, useEffect } from 'react'

interface CountdownProps {
  deadline: string
}

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return 'Abgelaufen'
  const s = Math.floor(ms / 1000)
  const days = Math.floor(s / 86400)
  const hours = Math.floor((s % 86400) / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  parts.push(`${seconds}s`)
  return parts.join(' ')
}

export function Countdown({ deadline }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(() => new Date(deadline).getTime() - Date.now())

  useEffect(() => {
    if (timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft(new Date(deadline).getTime() - Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [deadline, timeLeft <= 0])

  const isUrgent = timeLeft > 0 && timeLeft < 3600_000 // < 1 hour

  return (
    <span className={`text-sm font-medium ${
      timeLeft <= 0
        ? 'text-red-400'
        : isUrgent
          ? 'text-yellow-400'
          : 'text-gray-400'
    }`}>
      Deadline: {formatTimeLeft(timeLeft)}
    </span>
  )
}
