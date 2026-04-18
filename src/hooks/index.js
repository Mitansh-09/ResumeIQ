import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { getUserAnalyses, getUserRoadmap, getUserPrepSessions } from '../services/db'

// ─── useUserData ──────────────────────────────────────────────────────────────
export const useUserData = () => {
  const { user } = useAuth()
  const { state, dispatch } = useApp()
  const [loading, setLoading] = useState(false)
  const fetchedUidRef = useRef(null)

  const fetchAll = useCallback(async (force = false) => {
    if (!user) return
    if (!force && fetchedUidRef.current === user.uid) return
    fetchedUidRef.current = user.uid
    setLoading(true)
    try {
      const [analyses, roadmaps, sessions] = await Promise.all([
        getUserAnalyses(user.uid),
        getUserRoadmap(user.uid),
        getUserPrepSessions(user.uid),
      ])
      dispatch({ type: 'SET_ANALYSES', payload: analyses })
      if (roadmaps.length > 0) dispatch({ type: 'SET_ROADMAP', payload: roadmaps[0] })
      dispatch({ type: 'SET_PREP_SESSIONS', payload: sessions })
    } catch (err) {
      console.error('Failed to fetch user data:', err)
      fetchedUidRef.current = null
    } finally {
      setLoading(false)
    }
  }, [user, dispatch])

  useEffect(() => {
    if (!user) {
      fetchedUidRef.current = null
      dispatch({ type: 'SET_ANALYSES', payload: [] })
      dispatch({ type: 'SET_ROADMAP', payload: null })
      dispatch({ type: 'SET_PREP_SESSIONS', payload: [] })
      return
    }

    fetchAll(true)
  }, [fetchAll])

  return { loading, analyses: state.analyses, roadmap: state.roadmap, prepSessions: state.prepSessions }
}

// ─── useLocalStorage ──────────────────────────────────────────────────────────
export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  const set = useCallback((val) => {
    setValue(val)
    localStorage.setItem(key, JSON.stringify(val))
  }, [key])

  return [value, set]
}

// ─── useDebounce ──────────────────────────────────────────────────────────────
export const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ─── useScrollTop ─────────────────────────────────────────────────────────────
export const useScrollTop = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
}

// ─── useClickOutside ─────────────────────────────────────────────────────────
export const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return
      handler(e)
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}
