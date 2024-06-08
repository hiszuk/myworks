import { Link, LinkProps, useNavigation } from '@remix-run/react'
import { LogOut, FilePenLine, User as UserIcon, UserRoundCog, Eye } from 'lucide-react'
import { Transition } from '@headlessui/react'
import { Button, buttonVariants } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Logo } from './Logo'
import { useState } from 'react'

export function Layout(props: { children: React.ReactNode }) {
  const userid = 'sample-b'
  const avatar = '/images/sample-b%2Favatar'
  const twitter = ''
  const setting = '/demo/sample-b/setting'
  const edit = '/demo/sample-b/projects'
  const view = `/${userid}/portfolio`
  const { state } = useNavigation()

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div id="content" className="h-full">
        <header>
          <nav className="flex justify-between items-center px-2 bg-primary">
            <Link to="/">
              <Logo />
            </Link>
            <div className="flex items-center">
              <NavLink to={view}>確認</NavLink>
              <div className="sm:w-2 w-1"></div>
              <NavLink to={edit}>編集</NavLink>
              <div className="sm:w-2 w-1"></div>
              <NavLink to={setting}>設定</NavLink>
              <div className="sm:w-2 w-1"></div>
              <UserMenu avatar={avatar} twitter={twitter} setting={setting} edit={edit} view={view} />
              <div className="sm:w-4 w-2"></div>
            </div>
          </nav>
        </header>
        {state === 'loading' ? <LoadingProgress isShowing={true} /> : <LoadingProgressArea />}
        <main className="container mx-auto px-4 sm:px-10 pb-8 h-full">{props.children}</main>
      </div>
      <footer>
        <div className="w-full bg-zinc-600 text-xs text-white text-center py-2">
          <span className="text-xs">cool image attibuttion:</span>
          <a
            className="px-2 py-1 font-bold font-sans hover:bg-zinc-400 rounded"
            href="https://storyset.com/web"
            target="_blank"
            rel="noreferrer"
          >
            Web illustrations by Storyset
          </a>
        </div>
      </footer>
    </div>
  )
}

const NavLink = (props: LinkProps & { children: React.ReactNode }) => {
  return (
    <div className="py-1">
      <Link {...props} className={`${buttonVariants({ variant: 'reverse', size: 'sm' })} text-xs`}>
        {props.children}
      </Link>
    </div>
  )
}

const UserMenu = ({
  avatar,
  twitter,
  setting,
  edit,
  view,
}: {
  avatar: string | undefined
  twitter: string | undefined
  setting: string
  edit: string
  view: string
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="overflow-hidden rounded-full w-8 h-8">
          <Avatar className="w-8 h-8">
            <AvatarImage src={avatar} alt={twitter} />
            <AvatarFallback>
              <UserIcon />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>アカウント</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link to={view}>
            <DropdownMenuItem className="hover:cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              <span>ポートフォリオ確認</span>
            </DropdownMenuItem>
          </Link>
          <Link to={edit}>
            <DropdownMenuItem className="hover:cursor-pointer">
              <FilePenLine className="mr-2 h-4 w-4" />
              <span>ポートフォリオ編集</span>
            </DropdownMenuItem>
          </Link>
          <Link to={setting}>
            <DropdownMenuItem className="hover:cursor-pointer">
              <UserRoundCog className="mr-2 h-4 w-4" />
              <span>ユーザー設定</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <Link to="/logout">
          <DropdownMenuItem className="hover:cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>ログアウト</span>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const LoadingProgress = ({ isShowing }: { isShowing: boolean }) => {
  const [show, setShow] = useState<boolean>(isShowing)
  return (
    <Transition
      appear={true}
      show={show}
      enter="transition-transform duration-1000"
      enterFrom="translate-x-0"
      enterTo="translate-x-[70%]"
      afterEnter={() => setShow(false)}
      leave="transition-transform duration-1000"
      leaveFrom="translate-x-[70%]"
      leaveTo="translate-x-0"
      afterLeave={() => setShow(true)}
    >
      <div className="flex-start flex h-2 w-full overflow-hidden bg-blue-gray-50">
        <div className="flex h-full w-[30%] overflow-hidden break-all rounded-full bg-indigo-400"></div>
      </div>
    </Transition>
  )
}
const LoadingProgressArea = () => {
  return <div className="flex-start flex h-2 w-full overflow-hidden bg-transparent"></div>
}
