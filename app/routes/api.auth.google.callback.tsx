import { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { getAuthenticator } from '~/.server/auth'

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  /**
   * Googleログイン実行し成功ならloginに失敗ならsignupに遷移させる
   */
  const authenticator = getAuthenticator(context)
  return await authenticator.authenticate('google', request, {
    successRedirect: '/login',
    failureRedirect: '/signup',
  })
}
