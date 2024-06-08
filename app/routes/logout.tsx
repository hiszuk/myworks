import { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { getAuthenticator } from '~/.server/auth'

export async function loader({ context, request }: LoaderFunctionArgs) {
  await getAuthenticator(context).logout(request, { redirectTo: '/' })
}
