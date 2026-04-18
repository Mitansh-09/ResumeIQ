import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui'

const Login = () => {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async ({ email, password }) => {
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.code === 'auth/invalid-credential'
        ? 'Wrong email or password. Try again.'
        : 'Something went wrong. Please try again.')
    }
  }

  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      navigate('/dashboard')
    } catch {
      setError('Google sign-in failed. Try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[45%] bg-ink-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-cobalt-700 opacity-20" />
        <div className="absolute bottom-12 -right-12 w-56 h-56 rounded-full bg-cobalt-600 opacity-10" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-cobalt-500 opacity-10" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 rounded-xl bg-cobalt-600 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="white">
                <path d="M2 13V5l6-3 6 3v8l-6 2-6-2z" opacity="0.9"/>
              </svg>
            </div>
            <span className="font-display text-lg font-700 text-white tracking-tight">ResumeIQ</span>
          </div>

          <h1 className="font-display text-4xl font-700 text-white leading-tight mb-4">
            Turn your resume<br />into a strategy.
          </h1>
          <p className="text-ink-300 text-base leading-relaxed max-w-xs">
            Understand exactly where you stand for any role, and know precisely what to do next.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { stat: '78%', label: 'avg match improvement after using roadmap' },
            { stat: '3 min', label: 'to get a full gap analysis of your resume' },
            { stat: '100%', label: 'personalized to your actual background' },
          ].map((item) => (
            <div key={item.stat} className="flex items-baseline gap-3">
              <span className="font-display text-2xl font-700 text-cobalt-400">{item.stat}</span>
              <span className="text-ink-400 text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-700 text-ink-900 mb-1">Welcome back</h2>
            <p className="text-sm text-ink-400">Sign in to your account to continue</p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-ink-200 rounded-xl text-sm font-medium text-ink-700 hover:bg-ink-50 transition-all duration-150 mb-5 active:scale-[0.98]"
          >
            {googleLoading ? <Spinner size="sm" /> : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-ink-100" />
            <span className="text-xs text-ink-300">or</span>
            <div className="flex-1 h-px bg-ink-100" />
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-crimson-50 border border-crimson-200 rounded-xl text-sm text-crimson-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-600 mb-1.5">Email</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' }
                })}
                type="email"
                placeholder="you@example.com"
                className="input-base"
              />
              {errors.email && <p className="mt-1 text-xs text-crimson-500">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-ink-600">Password</label>
                <Link to="/forgot-password" className="text-xs text-cobalt-600 hover:text-cobalt-700">
                  Forgot?
                </Link>
              </div>
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                placeholder="••••••••"
                className="input-base"
              />
              {errors.password && <p className="mt-1 text-xs text-crimson-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center py-3"
            >
              {isSubmitting ? <Spinner size="sm" /> : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-400">
            New here?{' '}
            <Link to="/signup" className="text-cobalt-600 hover:text-cobalt-700 font-medium">
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
