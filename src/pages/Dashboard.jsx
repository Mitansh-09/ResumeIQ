import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUserData } from '../hooks'
import { ScoreRing, Badge, Skeleton, EmptyState } from '../components/ui'
import AppLayout from '../components/layout/AppLayout'

const StatCard = ({ label, value, sub, color = 'default' }) => {
  const colors = {
    default: 'text-ink-900',
    blue: 'text-cobalt-700',
    green: 'text-sage-600',
    orange: 'text-ember-500',
  }
  return (
    <div className="card p-5">
      <p className="text-xs text-ink-400 mb-2 font-medium uppercase tracking-wider">{label}</p>
      <p className={`font-display text-3xl font-700 ${colors[color]} mb-1`}>{value}</p>
      {sub && <p className="text-xs text-ink-400">{sub}</p>}
    </div>
  )
}

const AnalysisCard = ({ analysis }) => {
  const navigate = useNavigate()
  const score = analysis.result?.overallScore || 0
  const verdict = analysis.result?.verdict || 'needs_work'

  const verdictMap = {
    hired: { label: 'Strong fit', variant: 'success' },
    strong_candidate: { label: 'Good match', variant: 'info' },
    needs_work: { label: 'Needs work', variant: 'warning' },
    not_a_fit: { label: 'Not a fit', variant: 'danger' },
  }

  const v = verdictMap[verdict] || verdictMap.needs_work

  return (
    <div
      className="card p-5 hover:shadow-sm transition-all duration-200 cursor-pointer group"
      onClick={() => navigate('/analyzer', { state: { analysis } })}
    >
      <div className="flex items-start gap-4">
        <ScoreRing score={score} size={56} strokeWidth={5} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-ink-800 truncate">
              {analysis.jobTitle || analysis.result?.jobTitle || 'Analysis'}
            </h3>
            <Badge variant={v.variant}>{v.label}</Badge>
          </div>
          <p className="text-xs text-ink-400 mb-2.5 line-clamp-2">{analysis.result?.summary}</p>
          <div className="flex flex-wrap gap-1.5">
            {analysis.result?.skillsMissing?.slice(0, 3).map((s) => (
              <span key={s} className="badge bg-crimson-50 text-crimson-500 text-xs">{s}</span>
            ))}
            {(analysis.result?.skillsMissing?.length || 0) > 3 && (
              <span className="badge bg-ink-100 text-ink-400 text-xs">
                +{analysis.result.skillsMissing.length - 3} more
              </span>
            )}
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
          className="text-ink-300 group-hover:text-cobalt-500 transition-colors flex-shrink-0 mt-1">
          <path d="M6 3l5 5-5 5"/>
        </svg>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const { user } = useAuth()
  const { analyses, roadmap, prepSessions, loading } = useUserData()

  const stats = useMemo(() => {
    if (!analyses.length) return null
    const scores = analyses.map((a) => a.result?.overallScore || 0).filter(Boolean)
    return {
      best: Math.max(...scores),
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      total: analyses.length,
    }
  }, [analyses])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = user?.displayName?.split(' ')[0] || 'there'

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="font-display text-2xl font-700 text-ink-900">
            {greeting()}, {firstName} 👋
          </h1>
          <p className="text-sm text-ink-400 mt-1">
            {analyses.length === 0
              ? 'Upload your first resume to get started.'
              : `You have ${analyses.length} analysis${analyses.length > 1 ? 'es' : ''}. Keep improving.`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          ) : (
            <>
              <StatCard label="Best Match" value={stats ? `${stats.best}%` : '—'} sub="highest score" color="blue" />
              <StatCard label="Avg Match" value={stats ? `${stats.avg}%` : '—'} sub="across all analyses" />
              <StatCard
                label="Roadmap Steps"
                value={roadmap?.items?.length || '—'}
                sub={`${roadmap?.items?.filter((i) => i.completed)?.length || 0} completed`}
                color="green"
              />
              <StatCard label="Prep Sessions" value={prepSessions.length || '—'} sub="interviews practiced" />
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Analyses */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-ink-700">Recent Analyses</h2>
              <Link to="/history" className="text-xs text-cobalt-600 hover:text-cobalt-700">
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
              </div>
            ) : analyses.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon="📄"
                  title="No analyses yet"
                  description="Upload your resume and paste a job description to get your first match score."
                  action={
                    <Link to="/analyzer" className="btn-primary">
                      Analyze my resume →
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="space-y-3 stagger-children">
                {analyses.slice(0, 4).map((a) => (
                  <AnalysisCard key={a.id} analysis={a} />
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-ink-700">Quick actions</h2>

            {[
              {
                to: '/analyzer',
                icon: '🔍',
                title: 'New Analysis',
                desc: 'Upload resume + JD',
                bg: 'bg-cobalt-50 hover:bg-cobalt-100',
                titleColor: 'text-cobalt-800',
              },
              {
                to: '/roadmap',
                icon: '🗺️',
                title: 'View Roadmap',
                desc: 'Your skill plan',
                bg: 'bg-sage-50 hover:bg-sage-100',
                titleColor: 'text-sage-800',
              },
              {
                to: '/prep',
                icon: '🎤',
                title: 'Practice Prep',
                desc: 'Interview questions',
                bg: 'bg-amber-50 hover:bg-amber-100',
                titleColor: 'text-amber-800',
              },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 p-4 rounded-2xl transition-all duration-150 ${item.bg}`}
              >
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className={`text-sm font-semibold ${item.titleColor}`}>{item.title}</p>
                  <p className="text-xs text-ink-400">{item.desc}</p>
                </div>
              </Link>
            ))}

            {/* Tip card */}
            <div className="card p-4 border-cobalt-100 bg-cobalt-50 mt-2">
              <p className="text-xs font-semibold text-cobalt-700 mb-1">💡 Pro tip</p>
              <p className="text-xs text-cobalt-600 leading-relaxed">
                Tailor your resume for each JD. A 10% score improvement can double your callback rate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default Dashboard
