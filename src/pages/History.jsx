import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useUserData } from '../hooks'
import { deleteAnalysis } from '../services/db'
import { ScoreRing, Badge, EmptyState, Spinner } from '../components/ui'
import AppLayout from '../components/layout/AppLayout'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

const History = () => {
  const { state, dispatch, notify } = useApp()
  const { loading } = useUserData()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(null)

  const { analyses } = state

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    setDeleting(id)
    try {
      await deleteAnalysis(id)
      dispatch({ type: 'SET_ANALYSES', payload: analyses.filter((a) => a.id !== id) })
      notify('Analysis deleted', 'info')
    } catch {
      notify('Failed to delete', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const verdictMap = {
    hired: { label: 'Strong fit', variant: 'success' },
    strong_candidate: { label: 'Good match', variant: 'info' },
    needs_work: { label: 'Needs work', variant: 'warning' },
    not_a_fit: { label: 'Not a fit', variant: 'danger' },
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-7 animate-fade-up">
          <div>
            <h1 className="font-display text-2xl font-700 text-ink-900">Analysis History</h1>
            <p className="text-sm text-ink-400 mt-1">{analyses.length} saved analyses</p>
          </div>
          <Link to="/analyzer" className="btn-primary">
            + New Analysis
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : analyses.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="📋"
              title="No history yet"
              description="Every analysis you run gets saved here. You can re-open, compare, and delete them."
              action={<Link to="/analyzer" className="btn-primary">Run first analysis →</Link>}
            />
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {analyses.map((a) => {
              const score = a.result?.overallScore || 0
              const verdict = a.result?.verdict || 'needs_work'
              const v = verdictMap[verdict] || verdictMap.needs_work
              const date = a.createdAt?.seconds
                ? new Date(a.createdAt.seconds * 1000).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })
                : 'Recent'

              return (
                <div
                  key={a.id}
                  className="card p-5 cursor-pointer hover:shadow-sm transition-all duration-200 group"
                  onClick={() => navigate('/analyzer', { state: { analysis: a } })}
                >
                  <div className="flex items-center gap-4">
                    <ScoreRing score={score} size={52} strokeWidth={5} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-semibold text-ink-800 truncate">
                          {a.jobTitle || a.result?.jobTitle || 'Untitled'}
                        </h3>
                        <Badge variant={v.variant}>{v.label}</Badge>
                      </div>
                      <p className="text-xs text-ink-400 mb-2 line-clamp-1">{a.result?.summary}</p>
                      <p className="text-xs text-ink-300">{date}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => handleDelete(e, a.id)}
                        disabled={deleting === a.id}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-ink-300 hover:text-crimson-500 hover:bg-crimson-50 transition-all duration-150"
                      >
                        {deleting === a.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 4h10M6 4V3h4v1M5 4l.5 9h5l.5-9"/>
                          </svg>
                        )}
                      </button>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                        className="text-ink-300 group-hover:text-cobalt-500 transition-colors">
                        <path d="M6 3l5 5-5 5"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default History
