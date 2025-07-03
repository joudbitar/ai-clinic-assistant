import { useToast } from '@/hooks/useToast.jsx'
import { Toast, ToastClose, ToastDescription, ToastTitle } from '@/components/ui/toast'

export function Toaster() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast key={toast.id} variant={toast.variant} className="mb-2">
          <div className="grid gap-1">
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </div>
          <ToastClose onClick={() => removeToast(toast.id)} />
        </Toast>
      ))}
    </div>
  )
} 