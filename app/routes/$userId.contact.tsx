import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/cloudflare'
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react'
import { eq } from 'drizzle-orm'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useForm, getFormProps, getInputProps, getTextareaProps } from '@conform-to/react'
import { createClient } from '~/.server/db'
import { Layout } from '~/components/Layout'
import { Button, buttonVariants } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { setting, users } from '~/drizzle/schema.server'
import { Spinner } from '~/components/Spinner'
import { jsonWithError, redirectWithSuccess } from 'remix-toast'

/**
 * zod schema定義
 */
const schema = z.object({
  name: z.string({ required_error: 'お名前は必須入力です' }),
  email_address: z.string({ required_error: 'メールアドレスは必須入力です' }).email('メールアドレスの形式を満たしていません'),
  detail: z.string({ required_error: 'お問い合わせ内容は必須入力です' }),
  userid: z.string({ required_error: 'no userid' }),
  usermail: z.string({ required_error: 'no user email' }).email('email format error'),
  username: z.string({ required_error: 'no name' }),
})

export async function loader({ params, context }: LoaderFunctionArgs) {
  invariant(params.userId, 'Missing userId param')
  const id = params.userId
  const db = createClient(context.cloudflare.env.DB)
  const result = await db
    .select({
      userId: users.userId,
      displayName: users.displayName,
      email: users.email,
      contactMail: setting.contactMail,
    })
    .from(setting)
    .innerJoin(users, eq(setting.id, users.id))
    .where(eq(users.userId, id))

  if (result.length !== 1) {
    const errmsg = `ユーザーID: '${id}' が登録されていいません...` as string
    throw new Response(errmsg, {
      status: 401,
      statusText: `Not Found user: ${id}`,
    })
  }

  return json({
    user: result[0],
  })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()

  // 入力値のバリデーション
  const submission = parseWithZod(formData, { schema })
  if (submission.status !== 'success') {
    return json({
      status: 'invalid',
      result: submission.reply(),
    })
  }

  // await new Promise((resolve) => setTimeout(resolve, 2000));
  // return redirectWithSuccess(`/${formData.get('userid')}/portfolio#contact`, {
  //     message: 'メール送信成功!',
  //     description: 'お問い合わせメールを承りました。返信致しますのでしばらくお待ちください。',
  // });

  // お問い合わせメールの準備
  // templateはデータベースからユーザー別に取得予定
  const subject1 = `お問い合わせ(${formData.get('name')})様`
  const template1 = `【お名前】 #name# 様

【メールアドレス】 #email#

【お問い合わせ内容】
#detail#
`
  const subject2 = 'お問い合わせありがとうございます'
  const template2 = `#name# 様

この度はお問い合わせいただき誠にありがとうございます。
#username# と申します。

下記のお問い合わせ内容について承りました。
後日、#name# 様宛に返信させていただきます。

今後ともよろしくお願いいたします。

---------- お問い合わせ内容 ----------
#detail#

-----------------------------------

#username#

`

  // payloadを作成
  formData.append('subject1', subject1)
  formData.append('subject2', subject2)
  formData.append('template1', template1)
  formData.append('template2', template2)

  // お問い合わせメッセージの送信
  const base = request.headers.get('Origin') || 'http://localhost:3000'
  const url = new URL('/api/sendForm', base)
  try {
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) {
      console.error(`メール送信失敗: ${res.status} ${res.statusText}`)
      return jsonWithError(
        {
          status: 'error',
          result: submission.reply(),
        },
        {
          message: 'メール送信エラー',
          description: 'お問い合わせメッセージ送信に失敗しました。しばらくお待ちいただいてから再度お試しください。',
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
        message: 'メール送信エラー',
        description: 'お問い合わせメッセージ送信に失敗しました。しばらくお待ちいただいてから再度お試しください。',
      }
    )
  }

  // エラーなくメールを送信できた場合の処理
  return redirectWithSuccess(`/${formData.get('userid')}/portfolio#contact`, {
    message: 'メール送信成功!',
    description: 'お問い合わせメールを承りました。返信致しますのでしばらくお待ちください。',
  })
}

export default function Contact() {
  // レンダリング前にuserデータを取得する
  const { user } = useLoaderData<typeof loader>()

  // 入力フォームに関する部分
  const actionData = useActionData<typeof action>()
  const [form, fields] = useForm({
    id: `contact-${user.userId}`,
    lastResult: actionData?.result,
    constraint: getZodConstraint(schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema })
    },
  })

  // UIフィードバック用
  const { state } = useNavigation()

  return (
    <Layout>
      <div className="md:max-w-md md:m-5  w-5/6 m-auto">
        <div className="flex flex-col gap-2 items-center mb-5">
          <h1 className="md:text-2xl text-xl">Contact / お問い合わせ</h1>
          <h2 className="md:text-xl text-lg">{user.displayName}</h2>
        </div>
        {state === 'submitting' && <Spinner message="メールを送信しています..." color="white" size="xl" />}

        <Form method="POST" {...getFormProps(form)} preventScrollReset>
          <div className="grid w-full items-center gap-1.5 mb-3">
            <Label htmlFor={fields.name.id}>名前</Label>
            <Input
              {...getInputProps(fields.name, { type: 'text' })}
              placeholder="名前を入力してください（必須）"
              className={`${fields.name.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
            />
            <div id={fields.name.errorId} className="text-xs text-red-600">
              {fields.name.errors}
            </div>
          </div>

          <div className="grid w-full items-center gap-1.5 mb-3">
            <Label htmlFor={fields.email_address.id}>メール</Label>
            <Input
              {...getInputProps(fields.email_address, { type: 'email' })}
              placeholder="メールアドレスを入力してください（必須）"
              className={`${fields.email_address.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
            />
            <div id={fields.email_address.errorId} className="text-xs text-red-600">
              {fields.email_address.errors}
            </div>
          </div>

          <div className="grid w-full items-center gap-1.5 mb-10">
            <Label htmlFor={fields.detail.id}>お問い合わせ内容</Label>
            <Textarea
              {...getTextareaProps(fields.detail)}
              rows={10}
              placeholder="お問い合わせ内容を入力してください（必須）"
              className={`${fields.detail.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
            />
            <div id={fields.detail.errorId} className="text-xs text-red-600">
              {fields.detail.errors}
            </div>
          </div>

          {/* ユーザー情報 */}
          <input {...getInputProps(fields.userid, { type: 'hidden' })} defaultValue={user.userId} />
          <input {...getInputProps(fields.usermail, { type: 'hidden' })} defaultValue={user.contactMail || user.email} />
          <input {...getInputProps(fields.username, { type: 'hidden' })} defaultValue={user.displayName} />

          <Button variant="default" size="sm" type="submit" className="mr-4">
            送信する
          </Button>
          <Link to={`/${user.userId}/portfolio#contact`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            ポートフォリオに戻る
          </Link>
        </Form>
      </div>
    </Layout>
  )
}
