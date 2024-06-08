export const Spinner = ({
  message = 'Loading...',
  color = 'white',
  size = 'md',
}: {
  message?: string | undefined
  color?: string | undefined
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined
}) => {
  const arc = {
    xs: 'h-4 w-4 border-2',
    sm: 'h-6 w-6 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-10 w-10 border-4',
    xl: 'h-12 w-12 border-8',
  }
  const sz = size === 'md' ? 'base' : size

  return (
    <div className="h-screen w-screen z-10 fixed left-0 top-0 bg-black opacity-75">
      <div className="h-full w-full flex justify-center items-center flex-col space-y-4">
        <div className={`animate-spin ${arc[size]} border-${color} rounded-full border-t-transparent`}></div>
        <div className={`text-${color} text-${sz} z-20`}>{message}</div>
      </div>
    </div>
  )
}
