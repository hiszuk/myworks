export const PageTitle = ({ title, description }: { title: string; description: string }) => {
  return (
    <div>
      <h1 className="text-xl font-black mb-1">{title}</h1>
      <h3 className="text-xs text-muted-foreground">{description}</h3>
      <div className="border-b-2 mt-3"></div>
      <div className="h-5"></div>
    </div>
  )
}
