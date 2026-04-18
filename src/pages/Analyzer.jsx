import { useState, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { analyzeResumeVsJD, generateRoadmap } from '../services/gemini'
import { saveAnalysis, saveRoadmap } from '../services/db'
import { extractTextFromPDF, isValidPDF, formatFileSize } from '../utils/pdfParser'
import { getUserErrorMessage } from '../utils/userErrorMessage'
import { ScoreRing, ProgressBar, Badge, Spinner } from '../components/ui'
import AppLayout from '../components/layout/AppLayout'
import clsx from 'clsx'

// ─── Sub-components ───────────────────────────────────────────────────────────

const UploadZone = ({ file, onFile, onClear }) => {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }

  return (
    <div>
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={clsx(
            'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200',
            dragging
              ? 'border-cobalt-400 bg-cobalt-50'
              : 'border-ink-200 hover:border-cobalt-300 hover:bg-cobalt-50/40'
          )}
        >
          <div className="text-4xl mb-3">📄</div>
          <p className="text-sm font-medium text-ink-700 mb-1">Drop your resume PDF here</p>
          <p className="text-xs text-ink-400">or click to browse · max 5MB</p>
          <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => onFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-sage-50 border border-sage-200 rounded-2xl">
          <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">📄</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sage-800 truncate">{file.name}</p>
            <p className="text-xs text-sage-600">{formatFileSize(file.size)} · PDF</p>
          </div>
          <button onClick={onClear} className="text-sage-500 hover:text-crimson-500 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

const CategoryBar = ({ label, value }) => {
  const getColor = (v) => {
    if (v >= 75) return 'sage'
    if (v >= 50) return 'cobalt'
    if (v >= 30) return 'ember'
    return 'crimson'
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-ink-500">{label}</span>
        <span className="text-xs font-semibold text-ink-700">{value}%</span>
      </div>
      <ProgressBar value={value} color={getColor(value)} />
    </div>
  )
}

const SkillPill = ({ skill, type }) => {
  const styles = {
    present: 'bg-sage-50 text-sage-700 border border-sage-200',
    missing: 'bg-crimson-50 text-crimson-600 border border-crimson-200',
    partial: 'bg-amber-50 text-amber-600 border border-amber-200',
  }
  const icons = { present: '✓', missing: '✗', partial: '~' }
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', styles[type])}>
      <span className="text-[10px]">{icons[type]}</span>
      {skill}
    </span>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const Analyzer = () => {
  const { user } = useAuth()
  const { dispatch, notify } = useApp()
  const location = useLocation()

  // Pre-fill from history navigation
  const prefill = location.state?.analysis

  const [file, setFile] = useState(null)
  const [jdText, setJdText] = useState('')
  const [jobTitle, setJobTitle] = useState(prefill?.jobTitle || '')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('idle') // idle | parsing | analyzing | saving | done
  const [result, setResult] = useState(prefill?.result || null)
  const [error, setError] = useState('')
  const [failureCount, setFailureCount] = useState(0)

  const handleFile = useCallback((f) => {
    if (!isValidPDF(f)) {
      setError('Please upload a valid PDF under 5MB.')
      return
    }
    setError('')
    setFile(f)
  }, [])

  const handleAnalyze = async () => {
    if (!file && !prefill) { setError('Please upload your resume PDF.'); return }
    if (!jdText.trim()) { setError('Please paste the job description.'); return }
    setError('')
    setLoading(true)

    try {
      let resumeText = prefill?.resumeText || ''

      if (file) {
        setStep('parsing')
        resumeText = await extractTextFromPDF(file)
      }

      setStep('analyzing')
      const analysisResult = await analyzeResumeVsJD(resumeText, jdText, jobTitle)

      setStep('saving')
      const docId = await saveAnalysis(user.uid, {
        jobTitle: analysisResult.jobTitle || jobTitle,
        resumeText,
        jdText,
        result: analysisResult,
      })

      // Generate roadmap in background
      if (analysisResult.skillsMissing?.length > 0) {
        generateRoadmap(
          analysisResult.skillsMissing,
          analysisResult.skillsPresent || [],
          analysisResult.jobTitle
        ).then(async (roadmapData) => {
          const items = roadmapData.phases?.flatMap((p) =>
            p.skills.map((s, i) => ({
              id: `${p.phase}-${i}`,
              skill: s,
              phase: p.phase,
              phaseTitle: p.title,
              duration: p.duration,
              completed: false,
              milestones: p.milestones,
              resources: p.resources,
            }))
          ) || []
          const roadmapId = await saveRoadmap(user.uid, docId, items)
          dispatch({ type: 'SET_ROADMAP', payload: { id: roadmapId, items, raw: roadmapData } })
        }).catch(console.error)
      }

      dispatch({ type: 'ADD_ANALYSIS', payload: { id: docId, jobTitle: analysisResult.jobTitle, resumeText, jdText, result: analysisResult } })
      setResult(analysisResult)
      setFailureCount(0)
      setStep('done')
      notify('Analysis complete!', 'success')
    } catch (err) {
      console.error(err)
      setFailureCount((prev) => {
        const next = prev + 1
        setError(getUserErrorMessage(next))
        return next
      })
      setStep('idle')
    } finally {
      setLoading(false)
    }
  }

  const stepLabel = {
    parsing: 'Reading your PDF...',
    analyzing: 'AI is analyzing your match...',
    saving: 'Saving results...',
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-7 animate-fade-up">
          <h1 className="font-display text-2xl font-700 text-ink-900">Resume Analyzer</h1>
          <p className="text-sm text-ink-400 mt-1">Upload your resume, paste a JD — get an honest match report.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input side */}
          <div className="space-y-5 animate-fade-up">
            <div className="card p-6">
              <h2 className="text-sm font-semibold text-ink-700 mb-4">1. Your Resume</h2>
              <UploadZone file={file} onFile={handleFile} onClear={() => setFile(null)} />
              {prefill && !file && (
                <p className="mt-2 text-xs text-ink-400">Using resume from previous analysis. Upload new file to override.</p>
              )}
            </div>

            <div className="card p-6">
              <h2 className="text-sm font-semibold text-ink-700 mb-4">2. Job Description</h2>
              <div className="mb-3">
                <label className="block text-xs font-medium text-ink-500 mb-1.5">Job Title (optional)</label>
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Software Engineer Intern"
                  className="input-base"
                />
              </div>
              <label className="block text-xs font-medium text-ink-500 mb-1.5">Paste JD here</label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the full job description from LinkedIn, Internshala, company site..."
                rows={8}
                className="input-base resize-none font-mono text-xs leading-relaxed"
              />
            </div>

            {error && (
              <div className="px-4 py-3 bg-crimson-50 border border-crimson-200 rounded-xl text-sm text-crimson-600">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base"
            >
              {loading ? (
                <><Spinner size="sm" /> {stepLabel[step] || 'Analyzing...'}</>
              ) : (
                'Analyze my match →'
              )}
            </button>
          </div>

          {/* Results side */}
          <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            {!result ? (
              <div className="card h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center p-8">
                  <div className="text-5xl mb-4 opacity-30">🎯</div>
                  <p className="text-sm font-medium text-ink-500 mb-1">Your analysis will appear here</p>
                  <p className="text-xs text-ink-400">Fill in the form and click Analyze</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 stagger-children">
                {/* Score */}
                <div className="card p-6">
                  <div className="flex items-center gap-5 mb-5">
                    <ScoreRing score={result.overallScore} size={72} strokeWidth={6} />
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-display text-lg font-700 text-ink-900">{result.jobTitle}</h3>
                        <Badge variant={
                          result.verdict === 'hired' ? 'success' :
                          result.verdict === 'strong_candidate' ? 'info' :
                          result.verdict === 'needs_work' ? 'warning' : 'danger'
                        }>
                          {result.verdict?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-ink-500 leading-relaxed">{result.summary}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(result.categoryScores || {}).map(([k, v]) => (
                      <CategoryBar
                        key={k}
                        label={k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                        value={v}
                      />
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-ink-700 mb-3">Skill Gap</h3>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {result.skillsPresent?.map((s) => <SkillPill key={s} skill={s} type="present" />)}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {result.skillsPartial?.map((s) => <SkillPill key={s} skill={s} type="partial" />)}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.skillsMissing?.map((s) => <SkillPill key={s} skill={s} type="missing" />)}
                  </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="card p-4">
                    <h4 className="text-xs font-semibold text-sage-700 mb-2.5">✓ Strengths</h4>
                    <ul className="space-y-1.5">
                      {result.strengths?.map((s, i) => (
                        <li key={i} className="text-xs text-ink-600 leading-relaxed">• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="card p-4">
                    <h4 className="text-xs font-semibold text-crimson-600 mb-2.5">↑ Improve</h4>
                    <ul className="space-y-1.5">
                      {result.improvements?.map((s, i) => (
                        <li key={i} className="text-xs text-ink-600 leading-relaxed">• {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bullet suggestions */}
                {result.resumeBulletSuggestions?.length > 0 && (
                  <div className="card p-5">
                    <h3 className="text-sm font-semibold text-ink-700 mb-3">Resume Bullet Rewrites</h3>
                    <div className="space-y-4">
                      {result.resumeBulletSuggestions.map((s, i) => (
                        <div key={i} className="space-y-2">
                          <div className="px-3 py-2 bg-crimson-50 border border-crimson-100 rounded-lg">
                            <p className="text-xs text-ink-400 font-medium mb-1">Before</p>
                            <p className="text-xs text-ink-600 leading-relaxed">{s.original}</p>
                          </div>
                          <div className="px-3 py-2 bg-sage-50 border border-sage-100 rounded-lg">
                            <p className="text-xs text-sage-600 font-medium mb-1">After</p>
                            <p className="text-xs text-ink-700 leading-relaxed">{s.improved}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default Analyzer
