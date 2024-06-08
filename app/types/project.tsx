export type Project = {
  id: number
  projectUserId: string
  img?: string | null
  title?: string | null
  launchDate?: string | null
  description?: string | null
  url?: string | null
  repository?: string | null
  publish: boolean
  createdAt: string
  updatedAt: string
}
