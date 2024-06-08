import { ActionFunctionArgs } from '@remix-run/cloudflare'
import { redirectWithSuccess } from 'remix-toast'
import invariant from 'tiny-invariant'

export const action = async ({ params, request, context }: ActionFunctionArgs) => {
  invariant(params.userId, 'Missing userId param')
  const userid = params.userId
  const referer = `/auth/${userid}/setting?tab=csseditor`
  const formData = await request.formData()
  const stylesheet = formData.get('stylesheet')

  if (stylesheet === null || !stylesheet) {
    console.error('There are no stylesheet')
    throw new Response('no stylesheet data', { status: 400 })
  }
  if (userid === null) {
    console.error('There are no userid')
    throw new Response('no userid', { status: 400 })
  }

  try {
    // cssファイルは固定のファイル名
    const path = `${userid}/css`

    // テキストをblobに変換する
    const file = new Blob([stylesheet], { type: 'text/css' })

    // R2ストレージを取得
    const storage = context.cloudflare.env.R2

    // 変換済みblobデータをarrayBufferに変換してR2に保存する
    await storage.put(path, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type,
      },
    })
  } catch (error: unknown) {
    console.error('Error -> ', (error as Error).message)
    throw new Response('unexpected error', { status: 500 })
  }

  return redirectWithSuccess(referer, {
    message: 'CSSを保存しました',
  })
}
