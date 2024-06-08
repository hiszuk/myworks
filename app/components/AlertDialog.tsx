import { CircleCheckBig, CircleX, Info, TriangleAlert } from 'lucide-react'
import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { cn } from '~/lib/utils'

export type AppDialogProps = {
  title?: string
  message?: string
  okLabel?: string
  cancelLabel?: string
  onClose: (value: string) => void
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default'
}

export function AppAlertDialog(props: AppDialogProps) {
  const { title, message, okLabel = 'OK', cancelLabel = 'CANCEL', onClose, variant = 'default' } = props
  const [open, setOpen] = React.useState<boolean>(true)
  const kind = {
    success: {
      icon: <CircleCheckBig size={32} className="mr-2" />,
      color: 'text-green-500',
    },
    error: {
      icon: <CircleX size={32} className="mr-2" />,
      color: 'text-red-500',
    },
    warning: {
      icon: <TriangleAlert size={32} className="mr-2" />,
      color: 'text-orange-500',
    },
    info: {
      icon: <Info size={32} className="mr-2" />,
      color: 'text-blue-500',
    },
    default: {
      icon: <Info size={32} className="mr-2" />,
      color: 'text-primary',
    },
  }

  return (
    <AlertDialog open={open} onOpenChange={(open) => setOpen(!open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className={cn('flex flex-row items-center', kind[variant].color)}>
            {kind[variant].icon}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onClose('ok')}>{okLabel || 'OK'}</AlertDialogAction>
          <AlertDialogCancel onClick={() => onClose('cancel')}>{cancelLabel || 'Cancel'}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
