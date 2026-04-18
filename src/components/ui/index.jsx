import { useEffect, useRef } from 'react'
import clsx from 'clsx'

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <svg
      className={clsx('animate-spin text-cobalt-600', sizes[size], className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const Skeleton = ({ className = '' }) => (
  <div className={clsx('shimmer rounded-lg', className)} />
)

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-ink-100 text-ink-600',
    success: 'bg-sage-50 text-sage-700',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-crimson-50 text-crimson-600',
    info: 'bg-cobalt-50 text-cobalt-700',
    purple: 'bg-purple-50 text-purple-700',
  }
  return (
    <span className={clsx('badge', variants[variant], className)}>
      {children}
    </span>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export const ProgressBar = ({ value, max = 100, color = 'cobalt', animated = true, className = '' }) => {
  const pct = Math.round((value / max) * 100)
  const colors = {
    cobalt: 'bg-cobalt-600',
    sage: 'bg-sage-500',
    ember: 'bg-ember-500',
    crimson: 'bg-crimson-500',
    ink: 'bg-ink-400',
  }

  return (
    <div className={clsx('w-full bg-ink-100 rounded-full h-1.5 overflow-hidden', className)}>
      <div
        className={clsx('h-full rounded-full transition-all duration-700 ease-out', colors[color])}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
export const ScoreRing = ({ score, size = 80, strokeWidth = 7 }) => {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const getColor = (s) => {
    if (s >= 75) return '#2d9661'
    if (s >= 50) return '#2748df'
    if (s >= 30) return '#f97316'
    return '#f43f5e'
  }

  const ringRef = useRef(null)
  useEffect(() => {
    if (ringRef.current) {
      ringRef.current.style.strokeDashoffset = offset
    }
  }, [offset])

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="#e8e6df" strokeWidth={strokeWidth}
      />
      <circle
        ref={ringRef}
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke={getColor(score)}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="score-ring-fill"
      />
      <text
        x={size / 2} y={size / 2 + 5}
        textAnchor="middle"
        fontSize={size * 0.22}
        fontWeight="600"
        fontFamily="Syne, sans-serif"
        fill={getColor(score)}
      >
        {score}
      </text>
    </svg>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
    <div className="text-5xl mb-4 opacity-40">{icon}</div>
    <h3 className="text-base font-semibold text-ink-700 mb-1">{title}</h3>
    <p className="text-sm text-ink-400 mb-5 max-w-xs">{description}</p>
    {action}
  </div>
)

// ─── Toast Notification ───────────────────────────────────────────────────────
export const Toast = ({ message, type = 'info', onClose }) => {
  const styles = {
    info: 'bg-cobalt-600 text-white',
    success: 'bg-sage-600 text-white',
    error: 'bg-crimson-600 text-white',
    warning: 'bg-ember-500 text-white',
  }
  return (
    <div className={clsx(
      'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-up',
      styles[type]
    )}>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  )
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
export const Tooltip = ({ children, text }) => (
  <div className="relative group inline-flex">
    {children}
    <span className="tooltip opacity-0 group-hover:opacity-100 -top-8 left-1/2 -translate-x-1/2 transition-opacity duration-150">
      {text}
    </span>
  </div>
)
