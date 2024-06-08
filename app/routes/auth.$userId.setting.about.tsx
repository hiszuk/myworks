import { parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs } from '@remix-run/cloudflare'
import { redirectWithError, redirectWithSuccess } from 'remix-toast'
import { schemaAbout as schema } from './auth.$userId.setting'
import { createClient } from '~/.server/db'
import { users } from '~/drizzle/schema.server'
import { eq } from 'drizzle-orm'

export const action = async ({ request, context }: ActionFunctionArgs) => {
  if (request.method === 'PUT') {
    // 入力値を取得
    const formData = await request.formData()

    // 入力値のバリデーション
    const submission = parseWithZod(formData, { schema })
    if (submission.status !== 'success') {
      return redirectWithError('../', {
        message: 'ABOUT更新エラー',
      })
    }

    // 入力値から更新キー情報を取り出す
    const id = formData.get('id') as string

    // 更新情報取得
    const title = formData.get('title') as string
    const name = formData.get('name') as string
    const subtitle = formData.get('subtitle') as string
    const paragraphOne = formData.get('paragraphOne') as string
    const paragraphTwo = formData.get('paragraphTwo') as string
    const paragraphThree = formData.get('paragraphThree') as string

    // DB情報
    const db = createClient(context.cloudflare.env.DB)

    // DB更新
    try {
      const updatedIds: { updatedId: number }[] = await db
        .update(users)
        .set({
          title: title,
          name: name,
          subtitle: subtitle,
          paragraphOne: paragraphOne,
          paragraphTwo: paragraphTwo,
          paragraphThree: paragraphThree,
        })
        .where(eq(users.id, Number(id)))
        .returning({
          updatedId: users.id,
        })

      // 更新結果が1件以外または更新IDが等しくない場合はエラー
      if (updatedIds.length !== 1 || updatedIds[0].updatedId !== Number(id)) {
        console.error(`ABOUT更新エラー(update)`)
        return redirectWithError('../', {
          message: 'ABOUT更新エラー',
          description: 'ABOUT更新に失敗しました。しばらくお待ちいただいてから再度お試しください。',
        })
      }
    } catch (error: unknown) {
      console.error(`予期しないエラーが発生しています。${(error as Error).message}`)
      return redirectWithError('../', {
        message: 'ABOUT更新エラー',
        description: 'ABOUT更新に失敗しました。しばらくお待ちいただいてから再度お試しください。',
      })
    }

    // エラーなく更新できた場合の処理
    return redirectWithSuccess('../', {
      message: 'ABOUT更新に成功しました',
    })
  } else {
    throw new Response('Method not allowed', { status: 405 })
  }
}
