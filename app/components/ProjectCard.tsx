import { Project } from '~/types/project'
import { buttonVariants } from './ui/button'
import { AppWindow, Github } from 'lucide-react'
import { useLocation } from '@remix-run/react'

export const ProjecttCard = ({ project }: { project: Project }) => {
  const location = useLocation()
  const projectImage = project.img ? `/images/${project.img}?${location.key}` : '/images/no-image'
  const projectTitle = project.title ? project.title : undefined
  const projectDate = project.launchDate ? project.launchDate : undefined
  const projectLive = project.url ? project.url : undefined
  const projectGithub = project.repository ? project.repository : undefined

  return (
    <div className="grid grid-cols-2 items-center gap-4 min-h-40">
      <div className="sm:col-span-1 col-span-2 flex flex-col items-center gap-1">
        <h3 className="text-lg font-black text-center">{projectTitle || 'NO NAME'}</h3>
        <h4 className="text-sm text-right">{projectDate || 'NO DATE'}</h4>
        <div className="mt-4 w-full flex 2xl:flex-row flex-col 2xl:gap-1 gap-4">
          {projectLive && (
            <a
              href={projectLive}
              target="_blank"
              rel="noreferrer"
              className={`${buttonVariants({ variant: 'default', size: 'sm' })} w-full`}
            >
              <AppWindow size={18} className="mr-1" />
              See Live
            </a>
          )}
          {projectGithub && (
            <a
              href={projectGithub}
              target="_blank"
              rel="noreferrer"
              className={`${buttonVariants({ variant: 'outline', size: 'sm' })} w-full`}
            >
              <Github size={18} className="mr-1" />
              Source
            </a>
          )}
        </div>
      </div>
      <div className="sm:col-span-1 col-span-2">
        <a href={projectLive} target="_blank" rel="noreferrer" className="cursor-pointer">
          <img
            src={projectImage}
            alt="Latest Project"
            className="w-full aspect-video object-cover rounded hover:scale-105 hover:drop-shadow bg-zinc-200"
          />
        </a>
      </div>
    </div>
  )
}
