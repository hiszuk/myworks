import { parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs } from '@remix-run/cloudflare'
import { redirectWithError, redirectWithSuccess } from 'remix-toast'
import { eq } from 'drizzle-orm'
import { schemaPortfolio as schema } from './auth.$userId.setting'
import { createClient } from '~/.server/db'
import { setting } from '~/drizzle/schema.server'

export const action = async ({ request, context }: ActionFunctionArgs) => {
  if (request.method === 'PUT') {
    // 戻り先
    const url = request.headers.get('Referer') || '..'

    // 入力値を取得
    const formData = await request.formData()

    // 入力値のバリデーション
    const submission = parseWithZod(formData, { schema })
    if (submission.status !== 'success') {
      return redirectWithError('..', {
        message: 'ポートフォリオ更新エラー',
      })
    }

    // 入力値から更新キー情報を取り出す
    const id = formData.get('id') as string

    // 更新情報取得
    const css = formData.get('css') as string
    const openLabel = formData.get('openLabel') as string
    const contactMessage = formData.get('contactMessage') as string
    const contactLabel = formData.get('contactLabel') as string
    const contactMail = formData.get('contactMail') as string

    // DB情報
    const db = createClient(context.cloudflare.env.DB)

    // DB更新
    try {
      const updatedIds: { updatedId: number }[] = await db
        .update(setting)
        .set({
          css: css,
          openLabel: openLabel,
          contactMessage: contactMessage,
          contactLabel: contactLabel,
          contactMail: contactMail,
        })
        .where(eq(setting.id, Number(id)))
        .returning({
          updatedId: setting.id,
        })

      // 更新結果が1件以外または更新IDが等しくない場合はエラー
      if (updatedIds.length !== 1 || updatedIds[0].updatedId !== Number(id)) {
        console.error(`ポートフォリオ更新エラー(update)`)
        return redirectWithError(url, {
          message: 'ポートフォリオ更新エラー',
          description: 'ポートフォリオ更新に失敗しました。しばらくお待ちいただいてから再度お試しください。',
        })
      }
    } catch (error: unknown) {
      console.error(`予期しないエラーが発生しています。${(error as Error).message}`)
      return redirectWithError(url, {
        message: 'ポートフォリオ更新エラー',
        description: 'ポートフォリオ更新に失敗しました。しばらくお待ちいただいてから再度お試しください。',
      })
    }

    // エラーなく更新できた場合の処理
    return redirectWithSuccess(url, {
      message: 'ポートフォリオ更新に成功しました',
    })
  } else {
    throw new Response('Method not allowed', { status: 405 })
  }
}
