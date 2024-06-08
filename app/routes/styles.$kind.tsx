import { LoaderFunctionArgs, json } from '@remix-run/cloudflare'
import invariant from 'tiny-invariant'

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  invariant(params.kind, 'Missing kind param')
  const kind = params.kind
  if (kind === null || !kind) {
    return json({ message: 'Missing kind param' }, { status: 400 })
  }
  const { R2 } = context.cloudflare.env
  try {
    const object = await R2.get(kind)
    if (object === null) {
      throw new Response('no such objects', { status: 400 })
    } else {
      const headers: HeadersInit = new Headers()
      object.writeHttpMetadata(headers)
      headers.set('Content-Type', 'text/css')
      return new Response(object.body, { headers })
    }
  } catch (error: unknown) {
    console.error('Error -> ', (error as Error).message)
    throw new Response('unexpected error', { status: 500 })
  }
}
