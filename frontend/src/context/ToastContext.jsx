import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

const STYLES = {
  success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  error:   'bg-red-500/15 border-red-500/30 text-red-400',
  info:    'bg-brand-600/15 border-brand-600/30 text-brand-400',
}
const ICONS = { success: '✓', error: '✕', info: 'ℹ' }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(({ id, message, type }) => (
          <div
            key={id}
            className={`flex items-center gap-3 border rounded-xl px-4 py-3 text-sm font-medium shadow-xl pointer-events-auto ${STYLES[type]}`}
          >
            <span className="shrink-0 font-bold">{ICONS[type]}</span>
            <span className="flex-1">{message}</span>
            <button onClick={() => dismiss(id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-1 text-base leading-none">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
