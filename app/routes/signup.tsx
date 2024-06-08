import { SubmissionResult, getFormProps, getInputProps, useForm } from '@conform-to/react'
import { conformZodMessage, getZodConstraint, parseWithZod } from '@conform-to/zod'
import { DialogClose } from '@radix-ui/react-dialog'
import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/cloudflare'
import { Form, Link, redirect, useActionData, useLoaderData, useSubmit } from '@remix-run/react'
import { count, eq } from 'drizzle-orm'
import { Info } from 'lucide-react'
import React from 'react'
import Iframe from 'react-iframe'
import { jsonWithError, redirectWithSuccess } from 'remix-toast'
import { z } from 'zod'
import { getAuthenticator } from '~/.server/auth'
import { createClient } from '~/.server/db'
import { Layout } from '~/components/Layout'
import SvgSignIn from '~/components/svg/SignIn'
import SvgSigningContract from '~/components/svg/SigningContract'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { setting, users } from '~/drizzle/schema.server'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const userid = url.searchParams.get('id')
  const isTemporaryRegistered = userid !== null

  const db = createClient(context.cloudflare.env.DB)
  const ret = await db
    .select()
    .from(users)
    .where(eq(users.userId, userid || ''))

  const user = ret && ret.length === 1 ? ret[0] : undefined

  return json({
    user,
    isTemporaryRegistered,
  })
}

// userid存在チェックをサーバーのみで実施するため
// スキーマクリエーターを準備する
function createSchema(options?: { isUseridUnique: (userid: string) => Promise<boolean> }) {
  const check = new RegExp('^(\\w|\\-|\\.)+$')
  return z.object({
    id: z.number(),
    userid: z
      .string({ required_error: '必須入力です' })
      .regex(check, '入力できない文字が使われています')
      // 正規表現チェックOKのものだけカスタムチェックする
      .pipe(
        /**
         * .superRefineでチェックを細かくカスタマイズする
         */
        z.string().superRefine((userid, ctx) => {
          /**
           * options関数の定義がない場合サーバーバリデーションにフォールバックさせる
           */
          if (typeof options?.isUseridUnique !== 'function') {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: conformZodMessage.VALIDATION_UNDEFINED,
              fatal: true,
            })
            return
          }

          /**
           * options関数定義がある場合はサーバー側で処理される
           * 結果をプロミスで返すことでZodに非同期であることを伝える
           */
          return options.isUseridUnique(userid).then((isUnique) => {
            if (!isUnique) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'ユーザーIDがユニークではありません',
              })
            }
          })
        })
      ),
    name: z.string({ required_error: '必須入力です' }),
    email: z.string().email(),
  })
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const db = createClient(context.cloudflare.env.DB)

  if (request.method === 'POST') {
    /**
     * googleアカウントでログイン後にユーザー仮登録する
     */
    return await getAuthenticator(context).authenticate('google', request)
  } else if (request.method === 'PUT') {
    /**
     * 本登録
     */
    const formData = await request.formData()

    // 入力値のバリデーション
    const submission = await parseWithZod(formData, {
      /**
       * サーバーサイドでは非同期でバリデーションを行うようにoptionsの関数を実装する
       */
      schema: createSchema({
        async isUseridUnique(userid) {
          // userid既存チェック
          const cnt = await db.select({ count: count() }).from(users).where(eq(users.userId, userid))
          if (cnt[0].count != 0) return false
          else return true
        },
      }),
      /**
       * 非同期バリデーションを有効にするためasyncをtrueにする
       */
      async: true,
    })

    if (submission.status !== 'success') {
      return json({
        status: 'error',
        result: submission.reply(),
      })
    }

    // 入力値から更新キー情報を取り出す
    const id = formData.get('id') as unknown as number

    const userid = formData.get('userid') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string

    // DB更新
    try {
      const updatedIds: { updatedId: number }[] = await db
        .update(users)
        .set({
          userId: userid,
          displayName: name,
          register: true,
          avatar: `${userid}%2Fimages%2Favatar`,
          img: `${userid}%2Fimages%2Fprofile`,
        })
        .where(eq(users.id, id))
        .returning({ updatedId: users.id })

      if (updatedIds.length !== 1) {
        console.error(`アカウント登録エラー`)
        return jsonWithError(
          {
            status: 'error',
            result: submission.reply(),
          },
          {
            message: 'アカウント登録エラー',
            description: `更新結果が1件ではありません(${updatedIds.length}件)`,
          }
        )
      }

      // settingテーブルへのINSERT
      const insertedSettings: { insertedId: number }[] = await db
        .insert(setting)
        .values({
          id: id,
          css: 'css%2Fblue.css',
          cover: `${userid}%2Fimages%2Fhero`,
          contactMail: email,
        })
        .returning({ insertedId: users.id })

      if (insertedSettings.length !== 1) {
        return jsonWithError(
          {
            status: 'error',
            result: submission.reply(),
          },
          {
            message: 'アカウント登録エラー',
            description: `登録結果が1件ではありません(${insertedSettings.length}件)`,
          }
        )
      }

      // エラーなく成功した場合の処理
      return redirectWithSuccess('/login', {
        message: 'アカウント登録に成功しました',
      })
    } catch (error: unknown) {
      console.error(`予期しないエラーが発生しています。${(error as Error).message}`)
      return jsonWithError(
        {
          status: 'error',
          result: submission.reply(),
        },
        {
          message: 'アカウント登録エラー',
          description: 'しばらくお待ちいただいてから再度お試しください。',
        }
      )
    }
  } else if (request.method === 'DELETE') {
    /**
     * 仮登録したアカウントを削除する
     */
    const body: { id: number } = await request.json()
    const id = body.id
    try {
      await db.delete(users).where(eq(users.id, id))
      return redirect('/')
    } catch (error: unknown) {
      console.error('仮登録データ削除失敗', (error as Error).message)
      throw new Response('unexpected error', { status: 500 })
    }
  }
}

/**
 * サインアップページ
 */
export default function SignupPage() {
  const { isTemporaryRegistered } = useLoaderData<typeof loader>()

  /**
   * isTemporaryRegisteredでコンテンツを切り替える
   */
  return (
    <Layout>
      <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
        <div className="flex items-center justify-center py-12">
          <div className="mx-auto grid w-[350px] gap-6">{isTemporaryRegistered ? <Account /> : <SignUp />}</div>
        </div>
        <div className="hidden bg-muted lg:block">
          {isTemporaryRegistered ? (
            <SvgSigningContract className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
          ) : (
            <SvgSignIn className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
          )}
        </div>
      </div>
    </Layout>
  )
}

/**
 * 最初に表示されるサインアップ画面
 */
const SignUp = () => {
  const [termsConfig, setTermsConfig] = React.useState<TermsDialogProps | undefined>()
  const [privacyConfig, setPrivacyConfig] = React.useState<TermsDialogProps | undefined>()

  const openTerms = async () => {
    const ret = await new Promise<string>((resolve) => {
      setTermsConfig({
        onClose: resolve,
        title: 'ご確認願います',
        url: 'https://kiyac.app/termsOfService/0xdqrbXkzjOMhgVMyfkZ',
      })
    })
    setTermsConfig(undefined)
    if (ret === 'ok') {
      console.log('ok clicked')
    } else {
      console.log('do not agree')
      location.href = '/'
    }
  }

  const openPrivacy = async () => {
    const ret = await new Promise<string>((resolve) => {
      setPrivacyConfig({
        onClose: resolve,
        title: 'ご確認願います',
        url: 'https://kiyac.app/privacypolicy/BCqWKpZ3w05TiwK0mqsr',
      })
    })
    setPrivacyConfig(undefined)
    if (ret === 'ok') {
      console.log('ok clicked')
    } else {
      console.log('do not agree')
      location.href = '/'
    }
  }

  return (
    <>
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">ユーザー登録</h1>
        <div className="h-4"></div>
        <p className="text-balance text-muted-foreground">MY WORKSのユーザー登録はGoogleアカウントに対応しています。</p>
      </div>
      <div className="h-6"></div>
      <div className="grid gap-4">
        <Form method="post">
          <Button type="submit" className="w-full">
            googleアカウントでユーザー登録する
          </Button>
        </Form>
      </div>
      <div className="text-sm text-muted-foreground leading-loose">
        <span className="text-primary font-black">「googleアカウントでユーザー登録する」</span>ボタンをクリックすることで、
        <Link to="#" className="text-primary font-black hover:underline" onClick={openTerms}>
          利用規約
        </Link>
        および
        <Link to="#" className="text-primary font-black hover:underline" onClick={openPrivacy}>
          プライバシーポリシー
        </Link>
        に合意したものとみなします。
      </div>
      <div className="mt-5 text-center text-sm">
        既にアカウントをお持ちですか?{'  '}
        <Link to="/login" className="underline">
          ログイン
        </Link>
      </div>
      {termsConfig && <TermsDialog {...termsConfig} />}
      {privacyConfig && <TermsDialog {...privacyConfig} />}
    </>
  )
}

type TermsDialogProps = {
  title?: string | undefined
  url?: string | undefined
  onClose: (value: string) => void
}
const TermsDialog = (props: TermsDialogProps) => {
  const { title, url, onClose } = props
  const [open, setOpen] = React.useState<boolean>(true)
  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(!open)}>
      <DialogContent className="sm:max-w-5xl max-w-full">
        <DialogHeader>
          <DialogTitle className="flex flex-row justify-start items-center">
            <Info size={24} className="mr-2" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="w-full h-[600px]">{url && <Iframe url={url} width="100%" height="100%" />}</div>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={() => onClose('ok')}>閉じる</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * 仮登録後に表示されるアカウント情報入力画面
 */
const Account = () => {
  const { user } = useLoaderData<typeof loader>()

  // サーバーサイドのバリデーションの結果をフォームに反映するためactionの結果を利用する
  const actionData: { status: string; result: SubmissionResult<string[]> } | undefined = useActionData()

  // クライアントバリデーションは同期的なためoptions関数を実装せずにcreateSchemaする
  const schema = createSchema()

  const [form, fields] = useForm({
    id: `account-${user?.id}`,
    // actionData?.resultにはサーバーサイドのエラーが格納されている
    lastResult: actionData?.result,
    constraint: getZodConstraint(schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      // 同期的なクライアントバリデーションなのでasyncオプションは設定しない
      return parseWithZod(formData, { schema })
    },
  })
  const submit = useSubmit()

  /**
   * アカウント作成をやめる 押下時は仮登録した情報を削除する処理を呼ぶ
   */
  const handleDelete = () => {
    if (user?.id) {
      const payload = {
        id: user?.id,
      }
      submit(payload, {
        method: 'delete',
        encType: 'application/json',
      })
    }
  }

  return (
    <>
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">アカウント情報</h1>
        <div className="sm:h-4 h-1"></div>
        <p className="text-balance text-muted-foreground">MY WORKSのアカウントを設定します。</p>
        <div className="sm:h-2 h-0"></div>
      </div>
      <Form method="put" {...getFormProps(form)}>
        {/* 更新プライマリキー項目 */}
        <input {...getInputProps(fields.id, { type: 'hidden' })} defaultValue={user?.id} />

        {/* MY WORKSユーザーID */}
        <div className="grid gap-2">
          <Label htmlFor={fields.userid.id}>
            <span className="text-xs text-red-600">*</span>MY WORKSユーザーID
          </Label>
          <Input
            {...getInputProps(fields.userid, { type: 'text' })}
            placeholder="MYWORKSユーザーID(必須)"
            className={`${fields.userid.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
          />
          <div className="text-xs text-muted-foreground">半角英数字と「-」「.」が入力可能です(後で変更できません)</div>
          <div id={fields.userid.errorId} className="text-xs text-red-600">
            {fields.userid.errors}
          </div>
        </div>

        {/* 名前 */}
        <div className="grid gap-2 mt-4">
          <Label htmlFor={fields.name.id}>
            <span className="text-xs text-red-600">*</span>表示名
          </Label>
          <Input
            {...getInputProps(fields.name, { type: 'text' })}
            placeholder="表示名を入力してください（必須）"
            defaultValue={user?.displayName}
            className={`${fields.name.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
          />
          <div className="text-xs text-muted-foreground">ポートフォリオに公開される名前です(変更できます)</div>
          <div id={fields.name.errorId} className="text-xs text-red-600">
            {fields.name.errors}
          </div>
        </div>

        {/* メールアドレス */}
        <div className="grid gap-2 mt-4">
          <Label htmlFor={fields.email.id}>Googleメールアドレス</Label>
          <Input defaultValue={user?.email} disabled className="placeholder:text-xs" />
          <input {...getInputProps(fields.email, { type: 'hidden' })} defaultValue={user?.email} />
        </div>
        <div className="h-4"></div>

        <Button type="submit" className="w-full">
          MYWORKSにアカウント作成をする
        </Button>
      </Form>

      <div className="h-2"></div>
      <Button variant="outline" onClick={handleDelete} className="w-full">
        アカウント作成をやめる
      </Button>
    </>
  )
}
