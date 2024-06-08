import React from 'react'
import { Form, Link, redirect, useLoaderData, useLocation, useNavigation, useSubmit } from '@remix-run/react'
import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction, json } from '@remix-run/cloudflare'
import invariant from 'tiny-invariant'
import { eq } from 'drizzle-orm'
import { format } from 'date-fns-tz'
import { createClient } from '~/.server/db'
import { projects } from '~/drizzle/schema.server'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { z } from 'zod'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useForm, getFormProps, getInputProps, getTextareaProps } from '@conform-to/react'
import { PageTitle } from '~/components/PageTitle'
import { Loader2, SquareCheckBig, SquareX, Undo2 } from 'lucide-react'
import { Button, buttonVariants } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { NoDataFound } from '~/components/svg'
import { Project } from '~/types/project'
import { Label } from '@radix-ui/react-label'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { jsonWithError, redirectWithSuccess } from 'remix-toast'
import { DatePicker } from '~/components/ui/daypicker'
import { AppAlertDialog, AppDialogProps } from '~/components/AlertDialog'
import { DeleteFile, UploadFile } from '~/components/UpnDownFile'

export const meta: MetaFunction = () => {
  return [{ title: 'プロジェクト編集 | MY WORKS' }]
}

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  invariant(params.projectId, 'Missing projectId param')
  const projectId = params.projectId

  const db = createClient(context.cloudflare.env.DB)
  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.id, Number(projectId)))

  if (!result || result.length === 0) {
    console.error('該当するプロジェクトデータがありません')
    throw new Response('該当するプロジェクトデータがありません', {
      status: 404,
      statusText: 'No Data Found',
    })
  }

  return json({
    project: result[0],
  })
}

export const action = async ({ params, request, context }: ActionFunctionArgs) => {
  if (request.method === 'PUT') {
    // 入力値を取得
    const formData = await request.formData()

    // 入力値のバリデーション
    const submission = parseWithZod(formData, { schema })
    if (submission.status !== 'success') {
      return json({
        status: 'invalid',
        result: submission.reply(),
      })
    }

    // 入力値から更新キー情報を取り出す
    const userId = formData.get('userid')
    const projectId = Number(formData.get('id'))

    // 更新情報取得
    const title = formData.get('title') as string
    const date = formData.get('date') as string
    const description = formData.get('description') as string
    const url = formData.get('url') as string
    const repository = formData.get('repository') as string
    const publish = formData.get('publish') as unknown as boolean

    const db = createClient(context.cloudflare.env.DB)
    try {
      const updatedProjectId: { updatedId: number }[] = await db
        .update(projects)
        .set({
          title: title,
          launchDate: date,
          description: description,
          url: url,
          repository: repository,
          publish: publish || false,
          updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss', { timeZone: 'Asia/Tokyo' }),
        })
        .where(eq(projects.id, projectId))
        .returning({ updatedId: projects.id })

      if (!updatedProjectId || updatedProjectId.length !== 1 || updatedProjectId[0].updatedId !== projectId) {
        console.error(`プロジェクト更新エラー`)
        return jsonWithError(
          {
            status: 'error',
            result: submission.reply(),
          },
          {
            message: 'プロジェクト更新エラー',
            description: 'プロジェクトの更新に失敗しました。しばらくお待ちいただいてから再度お試しください。',
          }
        )
      }
    } catch (error: unknown) {
      console.error(`予期しないエラーが発生しています。${(error as Error).message}`)
      return jsonWithError(
        {
          status: 'error',
          result: submission.reply(),
        },
        {
          message: 'プロジェクト更新エラー',
          description: 'プロジェクトの更新に失敗しました。しばらくお待ちいただいてから再度お試しください。',
        }
      )
    }

    // エラーなく更新できた場合の処理
    return redirectWithSuccess(`/auth/${userId}/project/${projectId}`, {
      message: 'プロジェクト更新に成功しました',
    })
  } else if (request.method === 'DELETE') {
    console.log('edit delete was called')
    const userId = params.userId
    redirect(`/auth/${userId}/projects`)
  }

  // method not allowed
  else {
    throw new Response('method not allowed', { status: 405 })
  }
}

/**
 * zod schema
 */
const schema = z.object({
  id: z.number({ required_error: 'idは必須' }),
  userid: z.string({ required_error: 'useridは必須' }),
  title: z.string({ required_error: 'タイトルは空白にはできません' }),
  date: z.string({ required_error: '日付は空白にはできません' }),
  description: z.string({ required_error: 'プロジェクトの説明は空白にはできません' }),
  url: z.string().url('URLの形式が間違っています').nullable().optional(),
  repository: z.string().url('URLの形式が間違っています').nullable().optional(),
  publish: z.boolean().default(false),
})

export default function EditPeoject() {
  const { project } = useLoaderData<typeof loader>()
  const { state } = useNavigation()

  const title = 'プロジェクト編集'
  const description =
    'プロジェクトを編集します。項目を編集後、更新するボタンを押します。プロジェクトを削除する場合はプロジェクト削除ボタンを押します。'
  const isSubmitting = state === 'submitting'

  if (!project) {
    return (
      <>
        <PageTitle title={title} description={description} />
        <div className="flex flex-col justify-center items-center">
          <NoDataFound className="sm:w-2/5 w-4/5" />
          <h3 className="text-sm sm:-mt-8 -mt-5 mb-5">プロジェクトデータがありません</h3>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="lg:h-10 h-2"></div>
      <PageTitle title={title} description={description} />
      <div className="flex grid lg:grid-cols-2 grid-cols-1 gap-2">
        <div className="">
          <EditArea project={project} isSubmitting={isSubmitting} />
        </div>
        <div className="">
          <PreviewArea project={project} />
        </div>
      </div>
      <div className="h-5"></div>
      <DeleteButton isSubmitting={isSubmitting} />
    </>
  )
}

/**
 * 更新フォーム
 */
const EditArea = ({ project, isSubmitting }: { project: Project; isSubmitting: boolean }) => {
  return (
    <div className="p-2">
      <h1 className="text-lg font-black border-b-2 border-l-4 pl-2">編集</h1>
      <div className="h-4"></div>
      <UpdateForm project={project} isSubmitting={isSubmitting} />
    </div>
  )
}

/**
 * プレビューエリア
 */
const proseClass = `
prose
prose-sm
prose-headings:my-2
prose-h1:text-2xl
prose-h2:text-xl
prose-h3:text-lg
prose-p:my-1
prose-a:m-0
prose-blockquote:my-1
prose-ul:m-1
prose-ol:m-0
prose-li:m-0
prose-pre:my-1
prose-table:my-1
prose-th:bg-zinc-100
leading-relaxed
`

const PreviewArea = ({ project }: { project: Project }) => {
  const path = `${project.projectUserId}/images/${project.id}/img`
  const encodedPath = encodeURIComponent(path)

  // urlは同じだが呼ばれるたびにランダムなキーが生成される
  const location = useLocation()

  return (
    <div className="p-2">
      <h1 className="text-lg font-black border-b-2 border-l-4 pl-2">プレビュー表示</h1>
      <div className={cn(proseClass, 'sm:mx-10 mx-2 my-2')}>
        <Markdown remarkPlugins={[remarkGfm]}>{project.description}</Markdown>
      </div>
      <div className="h-3"></div>
      <div className="border shadow pt-4">
        <div className="w-4/5 aspect-video m-auto bg-zinc-100">
          <img src={`/images/${encodedPath}?${location.key}`} alt="project" className="h-full m-auto object-cover" />
        </div>
        <div className="sm:mx-10 mx-2 my-4 flex flex-row justify-between gap-2">
          <UploadFile userid={project.projectUserId} path={path} />
          <DeleteFile userid={project.projectUserId} path={path} />
        </div>
      </div>
    </div>
  )
}

/**
 * 更新フォーム
 */
const UpdateForm = ({ project, isSubmitting }: { project: Project; isSubmitting: boolean }) => {
  // 入力フォームに関する部分
  const [form, fields] = useForm({
    id: `project-${project.id}`,
    constraint: getZodConstraint(schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema })
    },
  })
  const labelClass = 'w-28 text-sm sm:text-right text-left pt-3 pr-4'
  const defaultDate = project.launchDate === null || !project.launchDate ? format(new Date(), 'yyyy-MM-dd') : project.launchDate

  return (
    <>
      <Form method="PUT" preventScrollReset {...getFormProps(form)}>
        {/* 更新キー項目 */}
        <input {...getInputProps(fields.id, { type: 'hidden' })} defaultValue={project.id} />
        <input {...getInputProps(fields.userid, { type: 'hidden' })} defaultValue={project.projectUserId} />

        {/* タイトル */}
        <div className="flex sm:flex-row flex-col justify-between items-start sm:mb-4 mb-2">
          <Label htmlFor={fields.title.id} className={labelClass}>
            <span className="text-xs text-red-600">*</span>件名
          </Label>
          <div className="w-full">
            <Input
              {...getInputProps(fields.title, { type: 'text' })}
              placeholder="件名を入力してください（必須）"
              defaultValue={project.title || ''}
              className={`${fields.title.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
            />
            <div className="h-1"></div>
            <div className="text-xs text-muted-foreground">件名は分かりやすい名前を簡潔に入力しましょう。</div>
            <div id={fields.title.errorId} className="text-xs text-red-600">
              {fields.title.errors}
            </div>
          </div>
        </div>

        {/* 日付 */}
        <div className="flex sm:flex-row flex-col justify-between items-start sm:mb-4 mb-2">
          <Label htmlFor={fields.date.id} className={labelClass}>
            <span className="text-xs text-red-600">*</span>日付
          </Label>
          <div className="w-full">
            <DatePicker meta={fields.date} defaultValue={defaultDate} />
            <div className="h-1"></div>
            <div className="text-xs text-muted-foreground">正確にわからなくても良いのでおおよその日付を選んでください。</div>
            <div id={fields.date.errorId} className="text-xs text-red-600">
              {fields.date.errors}
            </div>
          </div>
        </div>

        {/* 紹介文 */}
        <div className="flex sm:flex-row flex-col justify-between items-start sm:mb-4 mb-2">
          <Label htmlFor={fields.description.id} className={labelClass}>
            <span className="text-xs text-red-600">*</span>紹介文
          </Label>
          <div className="w-full">
            <Textarea
              {...getTextareaProps(fields.description)}
              rows={10}
              placeholder="紹介文を入力してください（必須）"
              defaultValue={project.description || ''}
              className={`${fields.description.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
            />
            <div className="h-1"></div>
            <div className="text-xs text-muted-foreground">開発物の紹介文を入力します。Markdown形式で入力できます。</div>
            <div id={fields.description.errorId} className="text-xs text-red-600">
              {fields.description.errors}
            </div>
          </div>
        </div>

        {/* デモサイト */}
        <div className="flex sm:flex-row flex-col justify-between items-start sm:mb-4 mb-2">
          <Label htmlFor={fields.url.id} className={labelClass}>
            公開サイト
          </Label>
          <div className="w-full">
            <Input
              {...getInputProps(fields.url, { type: 'text' })}
              placeholder="公開可能なサイトがあればURLを登録"
              defaultValue={project.url || ''}
              className={`${fields.url.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
            />
            <div className="h-1"></div>
            <div className="text-xs text-muted-foreground">公開可能なサイトがあれば是非URLを登録しましょう。</div>
            <div id={fields.url.errorId} className="text-xs text-red-600">
              {fields.url.errors}
            </div>
          </div>
        </div>

        {/* ソースコード */}
        <div className="flex sm:flex-row flex-col justify-between items-start sm:mb-4 mb-2">
          <Label htmlFor={fields.repository.id} className={labelClass}>
            リポジトリ
          </Label>
          <div className="w-full">
            <Input
              {...getInputProps(fields.repository, { type: 'text' })}
              placeholder="公開しているリポジトリがあればURLを登録"
              defaultValue={project.repository || ''}
              className={`${fields.repository.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
            />
            <div className="h-1"></div>
            <div className="text-xs text-muted-foreground">ソースコードを公開可能なリポジトリがあればURLを登録しましょう。</div>
            <div id={fields.repository.errorId} className="text-xs text-red-600">
              {fields.repository.errors}
            </div>
          </div>
        </div>

        {/* 公開・未公開 */}
        <div className="flex sm:flex-row flex-col justify-between items-start mt-2 sm:mb-4 mb-2">
          <Label htmlFor={fields.publish.id} className="w-28 text-sm sm:text-right text-left pr-4 mb-2">
            公開化
          </Label>
          <div className="w-full flex flex-row items-center">
            <Input
              {...getInputProps(fields.publish, { type: 'checkbox' })}
              defaultChecked={project.publish}
              className="w-4 h-4"
            />
            <p className="text-xs text-muted-foreground ml-2">チェックすることでポートフォリオに公開されます。</p>
          </div>
        </div>

        {/* 更新ボタン */}
        <div className="h-5"></div>
        <div id="update-button" className="flex justify-between gap-1 mb-1">
          <Button variant="default" size="sm" type="submit" disabled={isSubmitting} className="text-xs sm:w-1/3 w-full">
            {isSubmitting ? <Loader2 size={18} className="mr-1 animate-spin" /> : <SquareCheckBig size={18} className="mr-1" />}
            更新する
          </Button>
          <Link
            to={`/auth/${project.projectUserId}/projects`}
            className={`${buttonVariants({ variant: 'outline', size: 'sm' })} sm:w-1/3 w-full`}
          >
            <Undo2 size={18} className="mr-1" />
            一覧に戻る
          </Link>
        </div>
      </Form>
    </>
  )
}

/**
 * プロジェクト削除ボタン
 */
const DeleteButton = ({ isSubmitting }: { isSubmitting: boolean }) => {
  const submit = useSubmit()
  const [modalConfig, setModalConfig] = React.useState<AppDialogProps | undefined>()
  const handleSubmit = async () => {
    const ret = await new Promise<string>((resolve) => {
      setModalConfig({
        onClose: resolve,
        title: 'プロジェクトを削除します',
        message: '削除すると元には戻せません。このまま削除を実行しますか?',
        variant: 'warning',
        okLabel: '削除する',
        cancelLabel: 'やめる',
      })
    })
    setModalConfig(undefined)
    if (ret === 'ok') {
      const formData = new FormData()
      submit(formData, {
        method: 'post',
        action: 'delete',
        encType: 'application/x-www-form-urlencoded',
      })
    }
    if (ret === 'cancel') {
      // console.log('CANCELが押された');
    }
  }

  return (
    <div className="flex justify-end mb-1 pt-4 border-t">
      <Button variant="destructive" size="sm" disabled={isSubmitting} className="text-xs" type="button" onClick={handleSubmit}>
        <SquareX size={18} className="mr-1" />
        プロジェクト削除
      </Button>
      {modalConfig && <AppAlertDialog {...modalConfig} />}
    </div>
  )
}
