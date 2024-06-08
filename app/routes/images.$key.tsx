import { LoaderFunction, LoaderFunctionArgs, json } from '@remix-run/cloudflare'
import invariant from 'tiny-invariant'

export const loader: LoaderFunction = async ({ params, context }: LoaderFunctionArgs) => {
  invariant(params.key, 'Missing key param')
  const key = params.key
  if (key === null || !key) {
    return json({ message: 'Missing key param' }, { status: 400 })
  }

  const { R2 } = context.cloudflare.env
  const object = await R2.get(key)
  if (object === null) {
    return json({ message: 'Fetch Error, No objects' }, { status: 404 })
  } else {
    const headers: HeadersInit = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.etag)
    return new Response(object.body, { headers })
  }
}
