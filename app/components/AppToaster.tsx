import { Toaster as OrgToaster } from 'sonner'
export const Toaster = () => {
  return (
    <OrgToaster
      position="top-center"
      offset="16px"
      toastOptions={{
        unstyled: false,
        style: {
          background: '#f8f8f8',
          borderColor: '#eeeeee',
        },
        classNames: {
          error: 'text-red-400',
          success: 'text-green-500',
          warning: 'text-orange-400',
          info: 'text-blue-500',
          closeButton: 'bg-zinc-200 border-zinc-300',
        },
      }}
    />
  )
}
