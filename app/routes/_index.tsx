import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare'
import { Link, useLoaderData } from '@remix-run/react'
import { desc, eq, and, sql } from 'drizzle-orm'
import { UserIcon } from 'lucide-react'
import { createClient } from '~/.server/db'
import { Layout } from '~/components/Layout'
import { NoDataFound } from '~/components/svg'
import SvgOnlineWorld from '~/components/svg/OnlineWorld'
import SvgPortfolio from '~/components/svg/Portfolio'
import SvgPortfolioUpdate from '~/components/svg/PortfolioUpdate'
import SvgProgrammer from '~/components/svg/Programmer'
import SvgResumeFolder from '~/components/svg/ResumeFolder'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '~/components/ui/carousel'
import { projects, users } from '~/drizzle/schema.server'
import { UserProjects } from '~/types/user'
import { ProjecttCard } from '~/components/ProjectCard'
import { Project } from '~/types/project'

export const meta: MetaFunction = () => {
  return [
    { title: 'MY WORKSの特徴 | MY WORKS' },
    {
      property: 'og:title',
      content: 'MY WORKSのご紹介',
    },
    {
      name: 'description',
      content: 'MY WORKSはエンジニアが簡単にポートフォリオを作成・公開できるサービスです!',
    },
  ]
}

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const db = createClient(context.cloudflare.env.DB)
  // ユーザー毎のリリース日最大値を降順に並べた上位5件のサブクエリ
  const sq = db
    .select({
      userId: projects.projectUserId,
      launchDate: sql<string>`max(${projects.launchDate})`.as('launchDate'),
    })
    .from(projects)
    .where(eq(projects.publish, true))
    .groupBy(sql`${projects.projectUserId}`)
    .orderBy(desc(projects.launchDate))
    .limit(5)
    .as('sq')

  // 上記サブクエリとユーザーマスター、プロジェクトをjoinして直近リリース5件の
  // プロジェクトとそのユーザー情報を取得する
  const result: UserProjects[] = await db
    .select({
      id: users.id,
      userId: users.userId,
      displayName: users.displayName,
      avatar: users.avatar,
      img: users.img,
      twitter: users.twitter,
      paragraphOne: users.paragraphOne,
      paragraphTwo: users.paragraphTwo,
      paragraphThree: users.paragraphThree,
      projectId: sql<number>`${projects.id}`.as('projectId'),
      projectImage: sql<string>`${projects.img}`.as('projectImage'),
      projectTitle: projects.title,
      projectDate: projects.launchDate,
      description: projects.description,
      projectUrl: projects.url,
      repository: projects.repository,
      publish: projects.publish,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
    })
    .from(users)
    .innerJoin(sq, eq(users.userId, sq.userId))
    .innerJoin(projects, and(eq(projects.projectUserId, sq.userId), eq(projects.launchDate, sq.launchDate)))
    .orderBy(desc(sq.launchDate))

  return json({
    data: result,
  })
}

export default function Index() {
  return (
    <Layout>
      <div className="flex flex-col justify-start">
        <HeroHeader />
        <Features />
        <div className="sm:h-8 h-2"></div>
        <PortfolioList />
        <div className="sm:h-10 h-2"></div>
        <RegisterButton />
        <div className="sm:h-10 h-2"></div>
      </div>
    </Layout>
  )
}

/**
 * HERO HEADER
 */
const HeroHeader = () => {
  return (
    <div id="hero" className="grid grid-flow-row-dense grid-cols-12 gap-0">
      <div className="col-span-12 sm:col-span-5 p-4 flex flex-col justify-center">
        <h1 className="text-primary text-4xl font-black tracking-wider">MY WORKS</h1>
        <div className="h-2"></div>
        <div className="sm:h-2 h-1"></div>
        <h3 className="text-secondry text-xl font-bold break-keep">忙しいエンジニアのための ポートフォリオ 管理サービス</h3>
        <div className="sm:h-4 h-2"></div>
        <div className="text-sm text-center font-black -ml-2 bg-primary text-primary-foreground opacity-60 w-24 rounded-full">
          CONCEPT
        </div>
        <p className="text-secondry text-sm leading-relaxed">
          テンプレートを選び開発物の紹介文と紹介画像を投稿するだけでデザインされたポートフォリオが完成します。
        </p>
        <div className="sm:h-16 h-4"></div>
        <div className="flex flex-row justify-start gap-5">
          <Link to="#" className={`${buttonVariants({ variant: 'default', size: 'sm' })} w-full`}>
            編集画面サンプルを見る
          </Link>
          <Link to="/signup" className={`${buttonVariants({ variant: 'outline', size: 'sm' })} w-full`}>
            新規登録する
          </Link>
        </div>
      </div>
      <div className="col-span-12 sm:col-span-7">
        <SvgPortfolioUpdate className="h-full w-full" />
      </div>
    </div>
  )
}

/**
 * FEATURES 特徴
 */
const Features = () => {
  return (
    <div id="features" className="grid grid-flow-row-dense grid-cols-12 gap-4">
      <div className="col-span-12">
        <h1 className="text-primary text-4xl font-black">Features</h1>
        <div className="sm:h-5 h-2"></div>
      </div>
      <div className="col-span-12 sm:col-span-4 flex flex-col justify-start items-center rounded-xl bg-sky-100/80">
        <h2 className="text-secondry text-2xl font-semibold mt-2">Edge Computing</h2>
        <SvgOnlineWorld className="w-full" />
        <p className="text-sm text-primary px-5 leading-relaxed">
          <span className="text-primary/80 font-bold">MY WORKS</span>は
          <a
            href="https://www.cloudflare.com/ja-jp/"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-blue-700 hover:bg-blue-200 px-1"
          >
            cloudflare
          </a>
          にホスティングしています。 世界中の閲覧者の最も近くのエッジから配信することで最大限のパフォーマンスを発揮します。
        </p>
        <div className="sm:h-8 h-5"></div>
      </div>
      <div className="col-span-12 sm:col-span-4 flex flex-col justify-start items-center rounded-xl bg-sky-100/80">
        <h2 className="text-secondry text-2xl font-semibold mt-2">Easy</h2>
        <SvgPortfolio className="w-full" />
        <p className="text-sm text-primary px-2">３ステップでデザインされたポートフォリを公開</p>
        <ol className="text-xs list-decimal list-inside mt-2 ml-5 leading-relaxed">
          <li>プロファイルを登録</li>
          <li>開発物の紹介文とスナップショットを登録</li>
          <li>テンプレートを選んで公開!</li>
        </ol>
        <div className="sm:h-8 h-5"></div>
      </div>
      <div className="col-span-12 sm:col-span-4 flex flex-col justify-start items-center rounded-xl bg-sky-100/80">
        <h2 className="text-secondry text-2xl font-semibold mt-2">Customize</h2>
        <SvgProgrammer className="w-full" />
        <p className="text-sm text-primary px-2 leading-relaxed">
          自分で細かくカスタマイズしたい・・・
          <br />
          という要望にもお応えします。
        </p>
        <ul className="text-xs list-disc list-inside mt-2 leading-relaxed">
          <li>CSSを自由にカスタマイズ可能</li>
          <li>MY WORKS自体もGitHubで公開(予定)</li>
        </ul>
        <div className="sm:h-8 h-5"></div>
      </div>
    </div>
  )
}

/**
 * PORTFOLIOS リスト表示
 */
const PortfolioList = () => {
  return (
    <div id="portfolios" className="grid grid-flow-row-dense grid-cols-12 gap-2 items-center">
      <div className="col-span-12">
        <h1 className="text-primary text-4xl font-black">Portfolio</h1>
        <div className="sm:h-5 h-2"></div>
      </div>
      <div className="col-span-12 sm:col-span-3">
        <SvgResumeFolder className="w-full" />
      </div>
      <div className="col-span-12 sm:col-span-9">
        <CarouselSet />
      </div>
    </div>
  )
}

/**
 * CTA 新規登録のボタン部品
 */
const RegisterButton = () => {
  return (
    <div id="register" className="grid grid-flow-row-dense grid-cols-3 gap-2">
      <div></div>
      <div className="sm:col-span-1 col-span-3">
        <Link to="/signup" className={`${buttonVariants({ variant: 'outline', size: 'sm' })} w-full`}>
          新規登録する
        </Link>
      </div>
      <div></div>
    </div>
  )
}

/**
 * portfolioカードのカルーセル
 */
const CarouselSet = () => {
  // user-project一覧を取得する
  const { data } = useLoaderData<typeof loader>()

  if (!data || data.length < 1) {
    return (
      <div className="flex flex-col justify-center items-center">
        <NoDataFound className="sm:w-2/5 w-4/5" />
        <h3 className="text-sm sm:-mt-8 -mt-5 mb-5">ポートフォリオデータがありません</h3>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-row justify-center items-center">
        <Carousel className="w-4/5">
          <CarouselContent>
            {data.map((d) => (
              <CarouselItem key={d.userId}>
                <ProfileCard data={d} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  )
}

const ProfileCard = ({ data }: { data: UserProjects }) => {
  const avatar = data.avatar === null || !data.avatar ? undefined : `/images/${data.avatar}`
  const profileImage = data.img === null || !data.img ? '/images/no-image' : `/images/${data.img}`
  const twitter = data.twitter === null || !data.twitter ? undefined : data.twitter
  const portfolio = `/${data.userId}/portfolio`
  const paragraphOne = data.paragraphOne || ''
  const paragraphTwo = data.paragraphTwo || ''
  const paragraphThree = data.paragraphThree || ''
  const project: Project = {
    id: data.projectId,
    projectUserId: data.userId,
    img: data.projectImage,
    title: data.projectTitle,
    launchDate: data.projectDate,
    description: data.description,
    url: data.porjectUrl,
    repository: data.repository,
    publish: data.publish,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }

  return (
    <div className="p-1">
      <Card className="bg-sky-100/50">
        <CardHeader className="px-4 py-1 flex flex-row justify-between items-center border-b-2 border-primary/50">
          <CardTitle className="text-lg font-black tracking-wider">
            <Link to={portfolio}>{data.displayName}</Link>
          </CardTitle>
          <div className="flex sm:flex-row items-center">
            <Link to={portfolio} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              <span className="text-xs sm:block hidden">ポートフォリオを見る</span>
            </Link>
            <Link to={portfolio}>
              <Avatar>
                <AvatarImage src={avatar} alt={twitter} />
                <AvatarFallback>
                  <UserIcon />
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="aspect-video pt-1">
          <ProjecttCard project={project} />
          <div className="grid grid-cols-4 sm:items-start justify-center gap-1 mt-4">
            <div className="sm:col-span-1 col-span-4 sm:w-full w-32 aspect-square rounded bg-zinc-200">
              <img src={profileImage} alt="profile" className="object-cover rounded" />
            </div>
            <div className="sm:col-span-3 col-span-4 overflow-auto">
              <p className="p-1 text-sm">{paragraphOne}</p>
              <p className="p-1 text-sm">{paragraphTwo}</p>
              <p className="p-1 text-sm">{paragraphThree}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
