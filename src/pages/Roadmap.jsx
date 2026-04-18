import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { useUserData } from '../hooks'
import { updateRoadmapItem } from '../services/db'
import { EmptyState, Badge, Spinner } from '../components/ui'
import AppLayout from '../components/layout/AppLayout'
import clsx from 'clsx'

const RESOURCE_ICONS = { video: '▶', article: '📰', course: '🎓', book: '📚' }

const RoadmapPhase = ({ phase, items, onToggle }) => {
  const [expanded, setExpanded] = useState(phase === 1)
  const completed = items.filter((i) => i.completed).length
  const total = items.length
  const allDone = completed === total

  return (
    <div className={clsx('card overflow-hidden transition-all duration-200', allDone && 'opacity-80')}>
      {/* Phase header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 p-5 hover:bg-ink-50/50 transition-colors text-left"
      >
        <div className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 font-display',
          allDone ? 'bg-sage-100 text-sage-700' : 'bg-cobalt-100 text-cobalt-700'
        )}>
          {allDone ? '✓' : phase}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-sm font-semibold text-ink-800">{items[0]?.phaseTitle || `Phase ${phase}`}</h3>
            <span className="text-xs text-ink-400">{items[0]?.duration}</span>
            {allDone && <Badge variant="success">Complete</Badge>}
          </div>
          <p className="text-xs text-ink-400 mt-0.5">{completed}/{total} skills done</p>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
          className={clsx('text-ink-400 transition-transform duration-200', expanded ? 'rotate-90' : '')}
        >
          <path d="M6 3l5 5-5 5"/>
        </svg>
      </button>

      {/* Phase items */}
      {expanded && (
        <div className="border-t border-ink-100">
          {items.map((item) => (
            <div key={item.id} className="p-5 border-b border-ink-50 last:border-none">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggle(item)}
                  className={clsx(
                    'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                    item.completed
                      ? 'border-sage-500 bg-sage-500 text-white'
                      : 'border-ink-200 hover:border-cobalt-400'
                  )}
                >
                  {item.completed && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M2 6l3 3 5-5"/>
                    </svg>
                  )}
                </button>
                <div className="flex-1">
                  <p className={clsx(
                    'text-sm font-medium mb-2',
                    item.completed ? 'line-through text-ink-400' : 'text-ink-800'
                  )}>
                    {item.skill}
                  </p>

                  {item.milestones?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-ink-500 mb-1.5">Milestones</p>
                      <ul className="space-y-1">
                        {item.milestones.map((m, i) => (
                          <li key={i} className="text-xs text-ink-400 flex gap-1.5">
                            <span className="text-cobalt-400 flex-shrink-0">→</span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.resources?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.resources.map((r, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-ink-50 text-ink-500 rounded-lg">
                          <span>{RESOURCE_ICONS[r.type] || '🔗'}</span>
                          {r.url ? (
                            <a href={r.url} target="_blank" rel="noreferrer" className="hover:text-cobalt-600 underline underline-offset-2">
                              {r.title}
                            </a>
                          ) : r.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const Roadmap = () => {
  const { user } = useAuth()
  const { state, dispatch, notify } = useApp()
  const { loading } = useUserData()
  const [saving, setSaving] = useState(false)

  const roadmap = state.roadmap

  const handleToggle = useCallback(async (item) => {
    if (!roadmap?.id) return
    const updated = roadmap.items.map((i) =>
      i.id === item.id ? { ...i, completed: !i.completed } : i
    )
    dispatch({ type: 'SET_ROADMAP', payload: { ...roadmap, items: updated } })
    setSaving(true)
    try {
      await updateRoadmapItem(roadmap.id, updated)
    } catch {
      notify('Failed to save progress', 'error')
    } finally {
      setSaving(false)
    }
  }, [roadmap, dispatch, notify])

  // Group by phase
  const phases = roadmap?.items
    ? Object.entries(
        roadmap.items.reduce((acc, item) => {
          const p = item.phase || 1
          if (!acc[p]) acc[p] = []
          acc[p].push(item)
          return acc
        }, {})
      ).sort(([a], [b]) => Number(a) - Number(b))
    : []

  const totalDone = roadmap?.items?.filter((i) => i.completed).length || 0
  const totalItems = roadmap?.items?.length || 0
  const pct = totalItems ? Math.round((totalDone / totalItems) * 100) : 0

  return (
    <AppLayout>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-7 animate-fade-up">
          <div>
            <h1 className="font-display text-2xl font-700 text-ink-900">Skill Roadmap</h1>
            <p className="text-sm text-ink-400 mt-1">Your personalized path to landing the role.</p>
          </div>
          {saving && (
            <div className="flex items-center gap-2 text-xs text-ink-400">
              <Spinner size="sm" />
              Saving...
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : !roadmap || totalItems === 0 ? (
          <div className="card">
            <EmptyState
              icon="🗺️"
              title="No roadmap yet"
              description="Run an analysis first. We'll automatically generate a skill roadmap based on your gaps."
              action={<Link to="/analyzer" className="btn-primary">Analyze my resume →</Link>}
            />
          </div>
        ) : (
          <>
            {/* Progress summary */}
            <div className="card p-5 mb-6 animate-fade-up">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-ink-400 font-medium uppercase tracking-wider mb-1">Overall progress</p>
                  <p className="font-display text-2xl font-700 text-cobalt-700">{pct}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink-700">{totalDone} / {totalItems}</p>
                  <p className="text-xs text-ink-400">skills done</p>
                </div>
              </div>
              <div className="w-full bg-ink-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-cobalt-600 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {roadmap.raw?.estimatedWeeks && (
                <p className="text-xs text-ink-400 mt-2">
                  Estimated total: {roadmap.raw.estimatedWeeks} weeks at normal pace
                </p>
              )}
            </div>

            {/* Phases */}
            <div className="space-y-4 stagger-children">
              {phases.map(([phase, items]) => (
                <RoadmapPhase
                  key={phase}
                  phase={Number(phase)}
                  items={items}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}

export default Roadmap
