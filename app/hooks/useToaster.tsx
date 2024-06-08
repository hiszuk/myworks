import { useEffect } from 'react'
import { toast as notify } from 'sonner'
import type { ToastMessage } from 'remix-toast'

export const useToaster = (toast: ToastMessage | undefined) => {
  useEffect(() => {
    switch (toast?.type as string) {
      case 'success':
        notify.success(toast?.message, {
          description: toast?.description,
          closeButton: true,
        })
        break
      case 'info':
        notify.info(toast?.message, {
          description: toast?.description,
          closeButton: true,
        })
        break
      case 'warning':
        notify.warning(toast?.message, {
          description: toast?.description,
          closeButton: true,
        })
        break
      case 'error':
        notify.error(toast?.message, {
          description: toast?.description,
          closeButton: true,
          duration: 10000,
        })
        break
      default:
      // notify(toast?.message, { description: toast?.description, closeButton: true });
    }
  }, [toast])

  return
}
