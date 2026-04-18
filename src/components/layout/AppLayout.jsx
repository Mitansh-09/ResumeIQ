import { useApp } from '../../context/AppContext'
import Sidebar from './Sidebar'
import { Toast } from '../ui'

const AppLayout = ({ children }) => {
  const { state, dispatch } = useApp()

  return (
    <div className="flex min-h-screen bg-ink-50">
      <Sidebar />
      <main className="flex-1 ml-56 min-h-screen">
        {children}
      </main>

      {/* Toast stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
        {state.notifications.map((n) => (
          <Toast
            key={n.id}
            message={n.message}
            type={n.type}
            onClose={() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: n.id })}
          />
        ))}
      </div>
    </div>
  )
}

export default AppLayout
