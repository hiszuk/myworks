import { parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs } from '@remix-run/cloudflare'
import { redirectWithError, redirectWithSuccess } from 'remix-toast'
import { schemaProfile as schema } from './auth.$userId.setting'
import { createClient } from '~/.server/db'
import { users } from '~/drizzle/schema.server'
import { eq } from 'drizzle-orm'
import invariant from 'tiny-invariant'

export const action = async ({ params, request, context }: ActionFunctionArgs) => {
  if (request.method === 'PUT') {
    // 入力値を取得
    const formData = await request.formData()

    // 入力値のバリデーション
    const submission = parseWithZod(formData, { schema })
    if (submission.status !== 'success') {
      return redirectWithError('../', {
        message: 'プロファイル更新エラー',
      })
    }

    // 入力値から更新キー情報を取り出す
    const id = formData.get('id') as string

    // 更新情報取得
    const displayName = formData.get('displayName') as string
    const link = formData.get('link') as string
    const github = formData.get('github') as string
    const instagram = formData.get('instagram') as string
    const twitter = formData.get('twitter') as string

    // DB情報
    const db = createClient(context.cloudflare.env.DB)

    // DB更新
    try {
      const updatedIds: { updatedId: number }[] = await db
        .update(users)
        .set({
          displayName: displayName,
          link: link,
          github: github,
          instagram: instagram,
          twitter: twitter,
        })
        .where(eq(users.id, Number(id)))
        .returning({
          updatedId: users.id,
        })

      // 更新結果が1件以外または更新IDが等しくない場合はエラー
      if (updatedIds.length !== 1 || updatedIds[0].updatedId !== Number(id)) {
        console.error(`プロファイル更新エラー(update)`)
        return redirectWithError('../', {
          message: 'プロファイル更新エラー',
          description: 'プロファイルの更新に失敗しました。しばらくお待ちいただいてから再度お試しください。',
        })
      }
    } catch (error: unknown) {
      console.error(`予期しないエラーが発生しています。${(error as Error).message}`)
      return redirectWithError('../', {
        message: 'プロファイル更新エラー',
        description: 'プロファイルの更新に失敗しました。しばらくお待ちいただいてから再度お試しください。',
      })
    }

    // エラーなく更新できた場合の処理
    return redirectWithSuccess('../', {
      message: 'プロファイル更新に成功しました',
    })
  } else if (request.method === 'DELETE') {
    /**
     * アカウント削除
     * ① R2コンテンツを削除する
     * ② usersからid指定でデータを削除する→他データはカスケードで削除される
     */
    // パスからユーザーIDを取得
    invariant(params.userId, 'Missing userId param')
    const userid = params.userId
    if (userid === null || !userid) {
      throw new Response('There are no userid', { status: 400 })
    }

    // リクエストからidを取得
    const formData = await request.formData()
    const id = formData.get('id')
    if (id === null || id === '') {
      throw new Response('There are no ID', { status: 400 })
    }

    // R2コンテンツ削除処理
    const r2 = context.cloudflare.env.R2
    try {
      const lists = await r2.list({
        prefix: userid,
      })
      const keys = lists.objects.map((obj) => obj.key)
      console.log(keys)
      await r2.delete(keys)
    } catch (error: unknown) {
      console.error(`R2コンテンツ削除に失敗しました ${(error as Error).message}`)
      redirectWithError('..', {
        message: 'ユーザー削除に失敗しました',
        description: 'コンテンツ削除ができませんでした。しばらくお待ちいただいてから再度削除してください。',
      })
    }

    // D1データ削除処理
    const db = createClient(context.cloudflare.env.DB)
    try {
      await db.delete(users).where(eq(users.id, Number(id)))
    } catch (error: unknown) {
      console.error(`DBユーザー削除に失敗しました ${(error as Error).message}`)
      redirectWithError('..', {
        message: 'ユーザー削除に失敗しました',
        description: 'コンテンツ削除ができませんでした。しばらくお待ちいただいてから再度削除してください。',
      })
    }

    // R2, D1ともに削除に成功した
    return redirectWithSuccess('/logout', {
      message: 'ユーザー登録の削除が完了しました',
      description: 'これまでのご利用ありがとうございました',
    })
  } else {
    throw new Response('Method not allowed', { status: 405 })
  }
}
