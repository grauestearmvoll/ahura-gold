// Toast container component
'use client'

import { useEffect } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import type { Toast, ToastType } from '@/hooks/useToast'

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

const icons: Record<ToastType, any> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const colors: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-500 text-green-900',
  error: 'bg-red-50 border-red-500 text-red-900',
  info: 'bg-blue-50 border-blue-500 text-blue-900',
  warning: 'bg-yellow-50 border-yellow-500 text-yellow-900',
}

const iconColors: Record<ToastType, string> = {
  success: 'text-green-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  warning: 'text-yellow-600',
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => {
        const Icon = icons[toast.type]
        return (
          <div
            key={toast.id}
            className={`${colors[toast.type]} border-l-4 p-4 rounded-lg shadow-lg animate-in slide-in-from-right duration-300`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColors[toast.type]}`} />
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
