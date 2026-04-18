import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import clsx from 'clsx'

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1.5" y="1.5" width="5" height="5" rx="1"/>
        <rect x="9.5" y="1.5" width="5" height="5" rx="1"/>
        <rect x="1.5" y="9.5" width="5" height="5" rx="1"/>
        <rect x="9.5" y="9.5" width="5" height="5" rx="1"/>
      </svg>
    ),
  },
  {
    to: '/analyzer',
    label: 'Analyzer',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3h10v2H3zM3 7h7M3 11h5"/>
        <circle cx="12.5" cy="10.5" r="2.5"/>
        <path d="M14.5 12.5l1.5 1.5"/>
      </svg>
    ),
  },
  {
    to: '/roadmap',
    label: 'Skill Roadmap',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 12C2 12 4 8 8 8S14 4 14 4"/>
        <circle cx="2" cy="12" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="14" cy="4" r="1.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    to: '/prep',
    label: 'Interview Prep',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 4a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H9l-3 2v-2H3a1 1 0 01-1-1V4z"/>
      </svg>
    ),
  },
  {
    to: '/history',
    label: 'History',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="6"/>
        <path d="M8 5v3.5l2 1.5"/>
      </svg>
    ),
  },
]

const Sidebar = () => {
  const { user, logout } = useAuth()
  const { notify } = useApp()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch {
      notify('Failed to log out', 'error')
    }
  }

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-ink-100 flex flex-col py-5 fixed left-0 top-0 bottom-0 z-30">
      {/* Logo */}
      <div className="px-5 mb-8 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-cobalt-600 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
            <path d="M2 13V5l6-3 6 3v8l-6 2-6-2z" opacity="0.85"/>
            <path d="M8 2v13M2 5l6 3 6-3" strokeWidth="0.5" stroke="rgba(255,255,255,0.4)" fill="none"/>
          </svg>
        </div>
        <span className="font-display text-base font-700 text-ink-900 tracking-tight">ResumeIQ</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
                isActive
                  ? 'bg-cobalt-50 text-cobalt-700 font-medium'
                  : 'text-ink-500 hover:text-ink-800 hover:bg-ink-50'
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 pt-4 border-t border-ink-100 mt-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-cobalt-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-800 truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-xs text-ink-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-ink-400 hover:text-crimson-600 hover:bg-crimson-50 rounded-lg transition-all duration-150"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 3H3a1 1 0 00-1 1v8a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
