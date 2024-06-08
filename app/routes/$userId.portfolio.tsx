import React, { useEffect } from 'react'
import { LinksFunction, LoaderFunctionArgs, MetaFunction, json } from '@remix-run/cloudflare'
import { Link, useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { desc, eq, and } from 'drizzle-orm'
import { ChevronUp, Link as LinkIcon, Github, Instagram } from 'lucide-react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { createClient } from '~/.server/db'
import { projects, setting, users } from '~/drizzle/schema.server'
import Title from '~/components/Title'
import { Logo } from '~/components/Logo'
import { useLoginStatus } from '~/hooks/useLoginStatus'
import { useOffsetTop } from '~/hooks/useOffsetTop'
import type { Setting, User } from '~/types/user'
import type { Project } from '~/types/project'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const user = data?.user
  return [
    { title: `${user?.displayName}さんのポートフォリオ | MY WORKS` },
    {
      property: 'og:title',
      content: `${user?.displayName}さんのポートフォリオ`,
    },
    {
      name: 'description',
      content: `${user?.paragraphOne}`,
    },
  ]
}

export const links: LinksFunction = () => {
  return [{ id: 'PageStyleSheet', rel: 'stylesheet', href: '/css/default.css' }]
}

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  invariant(params.userId, 'Missing userId param')
  const id = params.userId
  const custom = new URL(request.url).searchParams.get('css')
  const db = createClient(context.cloudflare.env.DB)
  const result: User[] = await db.select().from(users).where(eq(users.userId, id))
  if (result.length !== 1) {
    const errmsg = `ユーザーID: '${id}' が登録されていいません。` as string
    throw new Response(errmsg, {
      status: 404,
      statusText: `Not Found user: ${id}`,
    })
  }

  const settings = await db
    .select({
      id: setting.id,
      css: setting.css,
      cover: setting.cover,
      openLabel: setting.openLabel,
      contactMessage: setting.contactMessage,
      contactLabel: setting.contactLabel,
      contactMail: setting.contactMail,
    })
    .from(setting)
    .innerJoin(users, eq(setting.id, users.id))
    .where(eq(users.userId, id))

  const works: Project[] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.projectUserId, id), eq(projects.publish, true)))
    .orderBy(desc(projects.launchDate))

  return json({
    user: result[0],
    setting: settings[0],
    projects: works,
    custom: custom,
  })
}

export default function Portfolio() {
  const { user, setting, projects, custom } = useLoaderData<typeof loader>()
  const { isLoggedIn } = useLoginStatus()
  const edit = `/auth/${user.userId}/projects`

  const aboutRef = React.useRef(null)
  const { viewportTop } = useOffsetTop(aboutRef)

  const isMenuVisible: boolean = React.useMemo(() => {
    return viewportTop && viewportTop > 0 ? false : true
  }, [viewportTop])

  let stylesheet = '/css/default.css'
  if (custom !== null && custom) stylesheet = `/styles/${user.userId}%2Fcss`
  else if (setting.css !== null) stylesheet = `/styles/${setting.css}`

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    const css = document.getElementById('PageStyleSheet')
    css?.setAttribute('href', stylesheet)
  }, [stylesheet])

  return (
    <>
      <header>
        <MenuBar isLoggedIn={isLoggedIn} isVisible={isMenuVisible} edit={edit} />
      </header>
      <main id="portfolio">
        <Header user={user} setting={setting} />
        <div ref={aboutRef}>
          <About user={user} />
        </div>
        <Projects projects={projects} />
        <Contact user={user} setting={setting} />
        <Footer user={user} />
      </main>
    </>
  )
}

/**
 * ヘッダメニューバー
 */
const MenuBar = ({ isLoggedIn, isVisible, edit }: { isLoggedIn: boolean; isVisible: boolean; edit: string }) => {
  return (
    <nav>
      <ul id="menubar" className={isVisible ? 'fixed' : ''}>
        <li className="menu-desktop">
          <Link to="/">
            <span>powerd by </span>MYWORKS
          </Link>
        </li>
        <li>
          <Link to="#about">ABOUT</Link>
        </li>
        <li>
          <Link to="#projects">PROJECTS</Link>
        </li>
        <li>
          <Link to="#contact">CONTACT</Link>
        </li>
        {isLoggedIn && (
          <li className="menu-desktop">
            <Link to={edit}>
              EDIT<span> portfolio</span>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}

/**
 * portfolioのTOP画面
 */
const Header = ({ user, setting }: { user: User; setting: Setting }) => {
  const title = user.title
  const name = user.name
  const subtitle = user.subtitle
  const cta = setting.openLabel || 'ポートフォリオを見る'
  const bgimg = !setting.cover || setting.cover !== null ? `/images/${setting.cover}` : ''

  return (
    <section
      id="hero"
      style={{
        backgroundImage: `url(${bgimg})`,
      }}
    >
      <div className="hero-wrapper">
        <div className="hero-text">
          <h1 className="hero-title">
            {title || ''} <span className="text-color-main">{name || ''}</span>
          </h1>
          <h3 className="hero-subtitle">{subtitle || ''}</h3>
        </div>
        <div className="hero-cta">
          <span className="cta-btn cta-btn--hero">
            <Link to="#about">{cta || ''}</Link>
          </span>
        </div>
      </div>
    </section>
  )
}

/**
 * ABOUT ME
 */
const About = ({ user }: { user: User }) => {
  // イメージはクエリパラメータにランダムな文字を設定することでマウントされるたびに再読み込みする
  const image = `/images/${user.img}`
  const paragraphOne = user.paragraphOne || ''
  const paragraphTwo = user.paragraphTwo || ''
  const paragraphThree = user.paragraphThree || ''

  return (
    <section id="about">
      <div className="section-wrapper">
        <div className="about-title">
          <Title title="About Me" />
        </div>
        <div className="about-wrapper">
          <div className="about-wrapper__image">
            <img
              src={image}
              alt="profile"
              onError={(e) => {
                console.error('image fallback')
                e.currentTarget.onerror = null
                e.currentTarget.src = '/img/no-image.png'
              }}
            />
          </div>
          <div className="about-wrapper__info">
            <p className="about-wrapper__info-text">{paragraphOne}</p>
            <p className="about-wrapper__info-text">{paragraphTwo}</p>
            <p className="about-wrapper__info-text">{paragraphThree}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Projectsを表示するコンポーネント
 * @param projects: Project[]
 */
const Projects = ({ projects }: { projects: Project[] }) => {
  return (
    <section id="projects">
      <div className="section-wrapper">
        <div className="projects-title">
          <Title title="Projects" />
        </div>
        <div className="projects-body">
          {projects.map((pj, index) => (
            <Project key={pj.id} project={pj} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
/**
 * Project 1件表示
 * @param project:  Project
 * @returns
 */
const Project = ({ project, index }: { project: Project; index: number }) => {
  const title = project.title || 'Project Title'
  const term = project.launchDate
  const img = project.img || 'no-image'
  const description = project.description || 'Project Description'
  const url = project.url
  const repository = project.repository
  const isOdd: boolean = (index + 1) % 2 === 1

  return (
    <div className={`project-wrapper ${isOdd ? 'odd' : 'even'}`}>
      <div className="project-wrapper__text">
        <h3 className="project-wrapper__text-title">{title}</h3>
        {term && <h3 className="project-wrapper__text-term">{term}</h3>}
        <div className="project-wrapper__text-markdown">
          <Markdown remarkPlugins={[remarkGfm]}>{description}</Markdown>
        </div>
        <div className="project-wrapper__button-group">
          {url && (
            <a target="_blank" rel="noopener noreferrer" className="cta-btn cta-btn--hero" href={url}>
              See Live
            </a>
          )}
          {repository && (
            <a target="_blank" rel="noopener noreferrer" className="cta-btn text-color-main" href={repository}>
              Source Code
            </a>
          )}
        </div>
      </div>
      <div className="project-wrapper__image">
        <a href={url || '#!'} target="_blank" aria-label="Project Link" rel="noopener noreferrer">
          <div className="thumbnail rounded">
            <img src={`/images/${img}`} alt={project.title || 'NO TITLE'} />
          </div>
        </a>
      </div>
    </div>
  )
}

/**
 * CONTACT
 */
const Contact = ({ user, setting }: { user: User; setting: Setting }) => {
  const userid = user.userId
  const message = setting.contactMessage || 'お問い合わせは下記のボタンを押してメッセージを送信してください。'
  const label = setting.contactLabel || 'お問い合わせ送信'
  return (
    <section id="contact">
      <div className="section-wrapper">
        <div className="contact-title">
          <Title title="Contact" />
        </div>
        <div className="contact-wrapper">
          <p className="contact-wrapper__text">{message}</p>
        </div>
        <div className="contact-wrapper__button-group">
          <Link to={`/${userid}/contact`} className="cta-btn cta-btn--resume">
            {label}
          </Link>
        </div>
      </div>
    </section>
  )
}

/**
 * FOOTER
 */
const Footer = ({ user }: { user: User }) => {
  const link = user.link === null ? undefined : user.link
  const github = user.github === null ? undefined : user.github
  const instagram = user.instagram === null ? undefined : user.instagram

  return (
    <footer className="footer navbar-static-bottom">
      <div id="footer" className="section-wrapper">
        <div className="back-to-top">
          <Link to="#hero">
            <ChevronUp />
          </Link>
        </div>
        <div className="icons">
          <div>
            <Link to="/" className="logo">
              Powerd by &nbsp;
              <Logo />
            </Link>
          </div>
          <div className="social-links">
            <SocialLink url={link} icon={<LinkIcon />} />
            <SocialLink url={github} icon={<Github />} />
            <SocialLink url={instagram} icon={<Instagram />} />
          </div>
        </div>
      </div>
      <hr />
      <p className="footer__text">
        © {new Date().getFullYear()} - Template developed by{' '}
        <a href="https://github.com/cobidev" target="_blank" rel="noopener noreferrer">
          Jacobo Martínez
        </a>
      </p>
    </footer>
  )
}

/**
 * Social Icon
 */
const SocialLink = ({ url, icon }: { url: string | undefined; icon: React.ReactElement }) => {
  // if (!url) return <></>
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {icon}
    </a>
  )
}
