import { ActionFunctionArgs, redirect } from '@remix-run/cloudflare'
import invariant from 'tiny-invariant'

export const action = async ({ params, request, context }: ActionFunctionArgs) => {
  invariant(params.userId, 'Missing userId param')
  const userid = params.userId
  const referer = '..?tab=csseditor'
  const formData = await request.formData()
  const skin = formData.get('skin')

  if (skin === null) {
    console.error('There are no skin')
    throw new Response('skin selection error', { status: 400 })
  }
  if (userid === null) {
    console.error('There are no userid')
    throw new Response('no userid', { status: 400 })
  }
  try {
    const path = `${userid}/css`
    const key = (skin as string).replaceAll('%2F', '/')
    const storage = context.cloudflare.env.R2
    const object = await storage.get(key as string)
    if (object === null) {
      throw new Response('no such objects', { status: 400 })
    } else {
      const file = await object.blob()
      await storage.put(path, await file.arrayBuffer(), {
        httpMetadata: {
          contentType: file.type,
        },
      })
    }
  } catch (error: unknown) {
    console.error('Error -> ', (error as Error).message)
    throw new Response('unexpected error', { status: 500 })
  }

  return redirect(referer)
}
