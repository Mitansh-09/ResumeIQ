import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import { Spinner } from './components/ui'

// Lazy load all pages for code splitting
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Analyzer = lazy(() => import('./pages/Analyzer'))
const Roadmap = lazy(() => import('./pages/Roadmap'))
const Prep = lazy(() => import('./pages/Prep'))
const History = lazy(() => import('./pages/History'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-ink-50">
    <Spinner size="lg" />
  </div>
)

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/analyzer" element={
              <ProtectedRoute><Analyzer /></ProtectedRoute>
            } />
            <Route path="/roadmap" element={
              <ProtectedRoute><Roadmap /></ProtectedRoute>
            } />
            <Route path="/prep" element={
              <ProtectedRoute><Prep /></ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute><History /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Analytics />
      </AppProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
