import { ActionFunctionArgs } from '@remix-run/cloudflare'
import { eq } from 'drizzle-orm'
import { jsonWithError, redirectWithSuccess } from 'remix-toast'
import invariant from 'tiny-invariant'
import { createClient } from '~/.server/db'
import { projects } from '~/drizzle/schema.server'

export const action = async ({ params, context }: ActionFunctionArgs) => {
  // in case of delete
  // プロジェクト削除
  invariant(params.userId, 'Missing userId param')
  invariant(params.projectId, 'Missing projectId param')
  const userId = params.userId
  const projectId = params.projectId

  if (!userId || !projectId || Number.isInteger(projectId)) {
    throw new Response('userId, projectId is not correct', { status: 400 })
  }

  const db = createClient(context.cloudflare.env.DB)
  try {
    // プロジェクト削除
    const deletedProjects: { deletedId: number }[] = await db
      .delete(projects)
      .where(eq(projects.id, Number(projectId)))
      .returning({
        deletedId: projects.id,
      })

    // 結果確認
    if (!deletedProjects || deletedProjects.length !== 1 || !deletedProjects[0].deletedId) {
      console.error('プロジェクト削除に失敗しました。しばらくお待ちいただいてから再度お試しください。')
      return jsonWithError(
        {
          status: 'error',
        },
        {
          message: 'プロジェクト削除エラー',
          description: 'プロジェクトの削除に失敗しました。しばらくお待ちいただいてから再度お試しください。',
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
        message: 'プロジェクト削除エラー',
        description: 'プロジェクトの削除に失敗しました。しばらくお待ちいただいてから再度お試しください。',
      }
    )
  }

  // エラーなく削除できたらプロジェクト一覧に戻る
  return redirectWithSuccess(`/auth/${userId}/projects`, {
    message: 'プロジェクト削除に成功しました',
  })
}
