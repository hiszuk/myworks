import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip'

type Props = {
  message?: string
  children: React.ReactNode
} & React.ComponentPropsWithoutRef<typeof TooltipContent>

export const AppTooltip = ({ message, children }: Props) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
