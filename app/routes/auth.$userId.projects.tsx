import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare'
import { Form, Link, json, redirect, useFetcher, useLoaderData, useNavigation } from '@remix-run/react'
import { format } from 'date-fns-tz'
import { desc, eq, isNull, and, isNotNull } from 'drizzle-orm'
import { FilePenLine, Loader2, SquarePlus } from 'lucide-react'
import { jsonWithError } from 'remix-toast'
import invariant from 'tiny-invariant'
import { createClient } from '~/.server/db'
import { AppTooltip } from '~/components/AppTooltip'
import { PageTitle } from '~/components/PageTitle'
import { ProjecttCard } from '~/components/ProjectCard'
import { NoDataFound } from '~/components/svg'
import { badgeVariants } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { projects } from '~/drizzle/schema.server'
import type { Project } from '~/types/project'

export const meta: MetaFunction = () => {
  return [{ title: 'プロジェクト一覧 | MY WORKS' }]
}

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  invariant(params.userId, 'Missing userId param')
  const userId = params.userId
  const db = createClient(context.cloudflare.env.DB)

  const result1 = await db
    .select()
    .from(projects)
    .where(and(eq(projects.projectUserId, userId), isNull(projects.launchDate)))
    .orderBy(desc(projects.updatedAt))

  const result2 = await db
    .select()
    .from(projects)
    .where(and(eq(projects.projectUserId, userId), isNotNull(projects.launchDate)))
    .orderBy(desc(projects.launchDate))

  const result = [...result1, ...result2]

  return json({ projects: result })
}

export const action = async ({ request, params, context }: ActionFunctionArgs) => {
  invariant(params.userId, 'Missing userId param')
  const userId = params.userId
  const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss', { timeZone: 'Asia/Tokyo' })

  if (!userId) {
    throw new Response('userId is undefined', { status: 400 })
  }

  if (request.method === 'POST') {
    const db = createClient(context.cloudflare.env.DB)
    let insertedProjectId: number | null = null
    try {
      const projectId: { insertedId: number }[] = await db
        .insert(projects)
        .values({
          projectUserId: userId,
          createdAt: now,
          updatedAt: now,
        })
        .returning({
          insertedId: projects.id,
        })

      if (!projectId || projectId.length !== 1 || projectId[0].insertedId === null) {
        return jsonWithError(
          {
            status: 'error',
          },
          {
            message: 'プロジェクト登録エラー',
            description: 'プロジェクトの新規登録に失敗しました。しばらくお待ちいただいてから再度お試しください。',
          }
        )
      }

      insertedProjectId = projectId[0].insertedId
      const imageUrl = `${userId}%2Fimages%2F${insertedProjectId}%2Fimg`
      const updatedProjectId: { updatedId: number }[] = await db
        .update(projects)
        .set({ img: imageUrl })
        .where(eq(projects.id, insertedProjectId))
        .returning({ updatedId: projects.id })
      if (!updatedProjectId || updatedProjectId.length !== 1) {
        // 更新に失敗したら登録自体も取り消す
        await db.delete(projects).where(eq(projects.id, insertedProjectId))
        return jsonWithError(
          {
            status: 'error',
          },
          {
            message: 'プロジェクト登録エラー',
            description: '画像情報の更新に失敗しました。しばらくお待ちいただいてから再度お試しください。',
          }
        )
      }
    } catch (error: unknown) {
      // 失敗したら登録自体も取り消す
      await db.delete(projects).where(eq(projects.id, insertedProjectId as number))
      console.error(`予期しないエラーが発生しています。${(error as Error).message}`)
      return jsonWithError(
        {
          status: 'error',
        },
        {
          message: 'プロジェクト登録エラー',
          description: 'プロジェクトの新規登録に失敗しました。しばらくお待ちいただいてから再度お試しください。',
        }
      )
    }

    // エラーなく更新できた場合の処理
    return redirect(`/auth/${userId}/project/${insertedProjectId}`)
  } else if (request.method === 'PATCH') {
    const formData = await request.formData()
    const projectId = formData.get('projectId')
    const publish = formData.get('publish') === '1' ? true : false

    if (!projectId || projectId === null) {
      console.error('projectId is null or undefined')
      throw new Response('projectId is null or undefined', { status: 400 })
    }
    const id = Number(projectId)
    const db = createClient(context.cloudflare.env.DB)

    try {
      const updatedIds: { updatedId: number }[] = await db
        .update(projects)
        .set({ publish: publish, updatedAt: now })
        .where(eq(projects.id, id))
        .returning({ updatedId: projects.id })

      if (updatedIds.length !== 1 || updatedIds[0].updatedId !== id) {
        console.error('公開フラグ更新エラーが発生しています。')
        return jsonWithError(
          {
            status: 'error',
          },
          {
            message: '公開フラグ更新エラー',
            description: '公開フラグ更新に失敗しました。しばらくお待ちいただいてから再度お試しください。',
          }
        )
      }
    } catch (error: unknown) {
      console.error(`予期しないエラーが発生しています。${(error as Error).message}`)
      return jsonWithError(
        {
          status: 'error',
        },
        {
          message: '公開フラグ更新エラー',
          description: '公開フラグ更新に失敗しました。しばらくお待ちいただいてから再度お試しください。',
        }
      )
    }

    // 成功してもトーストは表示しない
    return json({ result: 'OK' }, { status: 200 })
  } else {
    throw new Response('Method not allowd', { status: 405 })
  }
}

export default function PortfolioList() {
  // const user: User = useOutletContext();
  const { projects } = useLoaderData<typeof loader>()
  const { state } = useNavigation()

  const title = 'プロジェクト一覧'
  const description =
    'プロジェクト一覧から編集したいプロジェクトを選ぶ、または、右上の新規プロジェクト登録ボタンをクリックして新しいプロジェクトを追加します。'
  const isSubmitting = state === 'submitting'

  return (
    <>
      <CreateButton isSubmitting={isSubmitting} />
      <PageTitle title={title} description={description} />
      <DataTable projects={projects} />
    </>
  )
}

/**
 * 新規登録ボタン
 */
const CreateButton = ({ isSubmitting }: { isSubmitting: boolean }) => {
  return (
    <Form method="POST">
      <div className="flex justify-end mb-1">
        <Button variant="outline" size="sm" type="submit" disabled={isSubmitting} className="text-xs sm:w-auto w-full">
          {isSubmitting ? <Loader2 size={18} className="mr-1 animate-spin" /> : <SquarePlus size={18} className="mr-1" />}
          新規プロジェクト登録
        </Button>
      </div>
    </Form>
  )
}

/**
 * プロジェクト・カード一覧作成
 */
const DataTable = ({ projects }: { projects: Project[] }) => {
  const fetcher = useFetcher()
  const handleSubmit = (id: number, publish: boolean) => {
    const formData = new FormData()
    formData.append('projectId', String(id))
    formData.append('publish', publish ? '0' : '1')
    fetcher.submit(formData, {
      method: 'PATCH',
      encType: 'application/x-www-form-urlencoded',
    })
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center">
        <NoDataFound className="sm:w-2/5 w-4/5" />
        <h3 className="text-sm sm:-mt-8 -mt-5 mb-5">プロジェクトデータがありません</h3>
      </div>
    )
  }

  return (
    <div className="grid xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-2">
      {projects.map((p) => (
        <div key={p.id} className="mb-2">
          <div className="max-w-lg  m-auto px-2 py-2 bg-white rounded-lg border border-zinc-300 shadow">
            {p.publish ? (
              <fetcher.Form>
                <AppTooltip message="クリックすると非公開になります">
                  <Link
                    to="#"
                    onClick={() => {
                      handleSubmit(p.id, p.publish)
                    }}
                    className={badgeVariants({ variant: 'success' })}
                  >
                    公開
                  </Link>
                </AppTooltip>
              </fetcher.Form>
            ) : (
              <fetcher.Form>
                <AppTooltip message="クリックすると公開になります">
                  <Link
                    to="#"
                    onClick={() => {
                      handleSubmit(p.id, p.publish)
                    }}
                    className={badgeVariants({ variant: 'gray' })}
                  >
                    未公開
                  </Link>
                </AppTooltip>
              </fetcher.Form>
            )}
            <ProjecttCard project={p} />
            <div className="mt-1 flex sm:flex-row flex-col justify-between items-center">
              <div className="text-sm">最終更新:{p.updatedAt}</div>
              <div className="sm:mt-0 mt-2">
                <Link
                  to={`/auth/${p.projectUserId}/project/${p.id}`}
                  className={`${buttonVariants({ variant: 'ghost', size: 'sm' })} w-full`}
                >
                  <FilePenLine size={18} className="mr-1" />
                  編集する
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
