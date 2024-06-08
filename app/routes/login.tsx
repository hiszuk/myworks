import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare'
import { eq } from 'drizzle-orm'
import { getAuthenticator } from '~/.server/auth'
import { getAutorization, temporaryRegistration } from '~/.server/authorization'
import { createClient } from '~/.server/db'
import { setting } from '~/drizzle/schema.server'
import type { User } from '~/types/user'

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const authenticator = getAuthenticator(context)

  // ログインしているか? Yes: google: AuthUser, No: null
  const google = await authenticator.isAuthenticated(request)

  // User情報取得
  let user: User | undefined = undefined

  // Google Loginしている場合は認可チェックを実施
  if (google) {
    // 認可チェック（ユーザー情報取得）
    user = await getAutorization(context, google.email)

    if (!user) {
      // ユーザー登録がない場合はDBに仮登録する
      // 既に仮登録されている場合は仮登録のIDが返却される
      const tempId = await temporaryRegistration(context, google)

      // 仮登録状態の場合はsignupにidパラメータ付きでリダイレクトする
      const url = tempId ? `/signup?id=${tempId}` : '/signup'

      // 仮登録状態の場合はログアウトしてリダイレクト
      await authenticator.logout(request, {
        redirectTo: url,
      })
    }
  } else {
    // google login していない場合はloginする
    return await getAuthenticator(context).authenticate('google', request)
  }

  /**
   * 以降はgoogleログインしていてuser情報が取得できた
   * -> 通常のログイン処理
   * a) aboutの自己紹介が登録されていない -> aboutに遷移
   * b) portforioの問い合わせボタンが設定されていない -> portfolioに遷移
   * c) それ以外 -> プロジェクト一覧に遷移
   */
  let redirectUrl = '/signup'
  if (user) {
    if (!user.paragraphOne || user.paragraphOne === null) {
      redirectUrl = `/auth/${user.userId}/setting?tab=about`
    } else {
      const db = createClient(context.cloudflare.env.DB)
      const settings = await db.select({ contact: setting.contactLabel }).from(setting).where(eq(setting.id, user.id))
      if (settings.length === 1 && settings[0].contact === null) {
        redirectUrl = `/auth/${user.userId}/setting?tab=portfolio`
      } else {
        redirectUrl = `/auth/${user.userId}/projects`
      }
    }
  }

  // 遷移先に遷移する
  return redirect(redirectUrl)
}
