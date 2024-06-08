import {
  type ActionFunctionArgs,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  // redirect,
} from '@remix-run/cloudflare'
import { redirectWithError, redirectWithSuccess } from 'remix-toast'
import invariant from 'tiny-invariant'

export async function action({ params, request, context }: ActionFunctionArgs) {
  invariant(params.userId, 'Missing userId param')
  const userid = params.userId
  const referer = request.headers.get('Referer') || `/auth/${userid}/projects`
  const env = context.cloudflare.env

  if (request.method === 'PUT') {
    const uploadHandler = unstable_createMemoryUploadHandler({
      maxPartSize: 1024 * 1024 * 10,
    })

    try {
      const form = await unstable_parseMultipartFormData(request, uploadHandler)

      const file = form.get('file') as Blob
      const path = form.get('path') as string
      if (path === null) {
        throw new Response('No Path', { status: 400, statusText: 'Bad Request: No Path' })
      }

      // R2にファイルをアップロードする
      await env.R2.put(path, await file.arrayBuffer(), {
        httpMetadata: {
          contentType: file.type,
        },
      })

      // エラーなく更新できた場合の処理
      return redirectWithSuccess(`${referer}`, {
        message: 'ファイルアップロードに成功しました',
      })
    } catch (error: unknown) {
      console.error(`予期しないエラーが発生しています。${(error as Error).message}`)
      return redirectWithError(`${referer}`, {
        message: 'アップロードエラー',
        description: `ファイルアップロードに失敗しました。${(error as Error).message}`,
      })
    }
  } else if (request.method === 'DELETE') {
    const formData = await request.formData()
    const path = formData.get('path')

    if (path === null || !path) {
      return redirectWithError(`${referer}`, {
        message: '削除エラー',
        description: '削除するファイルパスが空です',
      })
    }

    // R2からファイルを削除する
    try {
      await env.R2.delete(path as string)

      return redirectWithSuccess(`${referer}`, {
        message: 'ファイル削除に成功しました',
      })
    } catch (error: unknown) {
      console.error(`予期しないエラーが発生しています。${(error as Error).message}`)
      return redirectWithError(`${referer}`, {
        message: '削除エラー',
        description: `ファイル削除に失敗しました。${(error as Error).message}`,
      })
    }
  } else {
    throw new Response('method not allowed', { status: 405 })
  }
}
