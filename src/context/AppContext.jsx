import { createContext, useContext, useReducer, useCallback } from 'react'

const AppContext = createContext(null)

const initialState = {
  analyses: [],
  activeAnalysis: null,
  roadmap: null,
  prepSessions: [],
  notifications: [],
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_ANALYSES':
      return { ...state, analyses: action.payload }
    case 'ADD_ANALYSIS':
      return { ...state, analyses: [action.payload, ...state.analyses] }
    case 'SET_ACTIVE_ANALYSIS':
      return { ...state, activeAnalysis: action.payload }
    case 'SET_ROADMAP':
      return { ...state, roadmap: action.payload }
    case 'UPDATE_ROADMAP_ITEM': {
      const updated = state.roadmap?.items?.map((item) =>
        item.id === action.payload.id ? { ...item, ...action.payload } : item
      )
      return { ...state, roadmap: { ...state.roadmap, items: updated } }
    }
    case 'SET_PREP_SESSIONS':
      return { ...state, prepSessions: action.payload }
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, { id: Date.now(), ...action.payload }] }
    case 'REMOVE_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter((n) => n.id !== action.payload) }
    default:
      return state
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const notify = useCallback((message, type = 'info') => {
    const id = Date.now()
    dispatch({ type: 'ADD_NOTIFICATION', payload: { id, message, type } })
    setTimeout(() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }), 4000)
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch, notify }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
