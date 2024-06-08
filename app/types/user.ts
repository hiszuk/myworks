export type GoogleUser = {
  id: string
  name: string
  email: string
  image: string | undefined
}

export type User = {
  id: number
  userId: string
  email: string
  displayName: string
  avatar?: string | null
  link?: string | null
  github?: string | null
  instagram?: string | null
  twitter?: string | null
  title?: string | null
  name?: string | null
  subtitle?: string | null
  img?: string | null
  paragraphOne?: string | null
  paragraphTwo?: string | null
  paragraphThree?: string | null
  createdAt: string
  updatedAt: string
}

export type UserProjects = {
  id: number
  userId: string
  displayName: string
  avatar?: string | null
  img?: string | null
  twitter?: string | null
  paragraphOne?: string | null
  paragraphTwo?: string | null
  paragraphThree?: string | null
  projectId: number
  projectImage?: string | null
  projectTitle?: string | null
  projectDate?: string | null
  description?: string | null
  porjectUrl?: string | null
  repository?: string | null
  publish: boolean
  createdAt: string
  updatedAt: string
}

export type Setting = {
  id: number
  css: string | null
  cover: string | null
  openLabel: string | null
  contactMessage: string | null
  contactLabel: string | null
  contactMail: string | null
}
