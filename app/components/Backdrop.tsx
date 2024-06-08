export const BackDrop = ({ children }: { children: React.ReactNode }) => {
  return <div className="h-screen w-screen z-10 fixed left-0 top-0 bg-black opacity-75">{children}</div>
}
