import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { generateInterviewQuestions, evaluateAnswer } from '../services/gemini'
import { savePrepSession, updatePrepAnswer } from '../services/db'
import { getUserErrorMessage } from '../utils/userErrorMessage'
import { EmptyState, Badge, Spinner } from '../components/ui'
import AppLayout from '../components/layout/AppLayout'
import clsx from 'clsx'

const CATEGORY_COLORS = {
  technical: 'info',
  behavioral: 'purple',
  system_design: 'warning',
  hr: 'default',
}

const DIFFICULTY_COLORS = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
}

const QuestionCard = ({ question, index, onEvaluate }) => {
  const [expanded, setExpanded] = useState(false)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showSample, setShowSample] = useState(false)

  const handleEvaluate = async () => {
    if (!answer.trim()) return
    setLoading(true)
    try {
      const result = await evaluateAnswer(question.question, answer, question.sampleAnswer)
      setFeedback(result)
      onEvaluate?.(question.id, answer, result)
    } catch {
      setFeedback({ score: null, error: 'An error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-4 p-5 hover:bg-ink-50/50 transition-colors text-left"
      >
        <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-cobalt-50 text-cobalt-700 text-xs font-semibold flex-shrink-0 mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink-800 leading-relaxed mb-2">{question.question}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={CATEGORY_COLORS[question.category]}>{question.category?.replace('_', ' ')}</Badge>
            <Badge variant={DIFFICULTY_COLORS[question.difficulty]}>{question.difficulty}</Badge>
            {feedback && (
              <span className={clsx(
                'badge text-xs',
                feedback.score >= 7 ? 'bg-sage-50 text-sage-700' :
                feedback.score >= 5 ? 'bg-amber-50 text-amber-700' : 'bg-crimson-50 text-crimson-600'
              )}>
                {feedback.score}/10
              </span>
            )}
          </div>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
          className={clsx('text-ink-400 transition-transform flex-shrink-0 mt-1', expanded ? 'rotate-90' : '')}
        >
          <path d="M6 3l5 5-5 5"/>
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-ink-100 p-5 space-y-4">
          {question.hint && (
            <div className="px-3 py-2.5 bg-cobalt-50 border border-cobalt-100 rounded-xl">
              <p className="text-xs font-medium text-cobalt-700 mb-0.5">Hint</p>
              <p className="text-xs text-cobalt-600">{question.hint}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-ink-600 mb-1.5">Your Answer</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here... be thorough, use the STAR method for behavioral questions."
              rows={5}
              className="input-base resize-none text-sm leading-relaxed"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleEvaluate}
              disabled={loading || !answer.trim()}
              className="btn-primary"
            >
              {loading ? <><Spinner size="sm" /> Evaluating...</> : 'Get AI Feedback'}
            </button>
            <button
              onClick={() => setShowSample((v) => !v)}
              className="btn-secondary"
            >
              {showSample ? 'Hide' : 'Sample Answer'}
            </button>
          </div>

          {showSample && (
            <div className="px-4 py-3 bg-ink-50 border border-ink-100 rounded-xl">
              <p className="text-xs font-medium text-ink-600 mb-1">Sample Answer</p>
              <p className="text-xs text-ink-600 leading-relaxed">{question.sampleAnswer}</p>
            </div>
          )}

          {feedback && (
            <div className="border border-ink-100 rounded-xl overflow-hidden">
              <div className={clsx(
                'px-4 py-3 flex items-center justify-between',
                feedback.score >= 7 ? 'bg-sage-50' : feedback.score >= 5 ? 'bg-amber-50' : 'bg-crimson-50'
              )}>
                <p className={clsx(
                  'text-sm font-semibold',
                  feedback.score >= 7 ? 'text-sage-700' : feedback.score >= 5 ? 'text-amber-700' : 'text-crimson-700'
                )}>
                  AI Feedback
                </p>
                <span className={clsx(
                  'font-display text-lg font-700',
                  feedback.score >= 7 ? 'text-sage-600' : feedback.score >= 5 ? 'text-amber-600' : 'text-crimson-600'
                )}>
                  {feedback.score}/10
                </span>
              </div>
              <div className="p-4 space-y-3">
                {feedback.strengths?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-sage-700 mb-1">What you did well</p>
                    <ul className="space-y-1">
                      {feedback.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-ink-600">✓ {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {feedback.improvements?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-crimson-600 mb-1">Improve this</p>
                    <ul className="space-y-1">
                      {feedback.improvements.map((s, i) => (
                        <li key={i} className="text-xs text-ink-600">↑ {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {feedback.betterAnswer && (
                  <div>
                    <p className="text-xs font-semibold text-cobalt-700 mb-1">Stronger version</p>
                    <p className="text-xs text-ink-600 leading-relaxed bg-cobalt-50 px-3 py-2 rounded-lg">
                      {feedback.betterAnswer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const Prep = () => {
  const { user } = useAuth()
  const { state, notify } = useApp()
  const [questions, setQuestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [answers, setAnswers] = useState({})
  const [failureCount, setFailureCount] = useState(0)

  const activeAnalysis = state.activeAnalysis || state.analyses?.[0]

  const handleGenerate = async () => {
    if (!activeAnalysis) return
    setLoading(true)
    try {
      const result = await generateInterviewQuestions(
        activeAnalysis.jdText,
        activeAnalysis.resumeText,
        activeAnalysis.jobTitle
      )
      setQuestions(result.questions)
      try {
        const id = await savePrepSession(user.uid, {
          analysisId: activeAnalysis.id,
          jobTitle: activeAnalysis.jobTitle,
          questions: result.questions,
          answers: {},
        })
        setSessionId(id)
      } catch (saveErr) {
        console.error('Prep session save failed:', saveErr)
        notify('Questions generated, but session could not be saved.', 'warning')
      }
      setFailureCount(0)
      notify('Questions generated!', 'success')
    } catch {
      setFailureCount((prev) => {
        const next = prev + 1
        notify(getUserErrorMessage(next), 'error')
        return next
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEvaluate = async (qId, answer, feedback) => {
    const updated = { ...answers, [qId]: { answer, feedback } }
    setAnswers(updated)
    if (sessionId) {
      try {
        await updatePrepAnswer(sessionId, updated)
      } catch (e) {
        console.error(e)
      }
    }
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="mb-7 animate-fade-up">
          <h1 className="font-display text-2xl font-700 text-ink-900">Interview Prep</h1>
          <p className="text-sm text-ink-400 mt-1">
            AI-generated questions based on your resume and the JD. Practice, get scored, improve.
          </p>
        </div>

        {!activeAnalysis ? (
          <div className="card">
            <EmptyState
              icon="🎤"
              title="No analysis found"
              description="Run a resume analysis first. We'll generate questions tailored to that specific role."
              action={<Link to="/analyzer" className="btn-primary">Analyze my resume →</Link>}
            />
          </div>
        ) : !questions ? (
          <div className="card p-8 text-center animate-fade-up">
            <div className="text-4xl mb-4">🎤</div>
            <h2 className="font-display text-lg font-700 text-ink-900 mb-2">Ready to practice?</h2>
            <p className="text-sm text-ink-400 mb-1 max-w-xs mx-auto">
              We'll generate interview questions based on your{' '}
              <span className="font-medium text-cobalt-600">{activeAnalysis.jobTitle}</span> analysis.
            </p>
            <p className="text-xs text-ink-300 mb-6">Technical · Behavioral · System Design · HR</p>
            <button onClick={handleGenerate} disabled={loading} className="btn-primary mx-auto">
              {loading ? <><Spinner size="sm" /> Generating questions...</> : 'Generate questions →'}
            </button>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-ink-500">{questions.length} questions · {Object.keys(answers).length} answered</p>
              <button onClick={() => { setQuestions(null); setAnswers({}) }} className="btn-ghost text-xs">
                Regenerate
              </button>
            </div>
            {questions.map((q, i) => (
              <QuestionCard key={q.id || i} question={q} index={i} onEvaluate={handleEvaluate} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default Prep
