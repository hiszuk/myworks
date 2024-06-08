import { LoaderFunctionArgs, json } from '@remix-run/cloudflare'
import { Outlet } from '@remix-run/react'
import { checkLogin } from '~/.server/checkLogin'

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  /**
   * Google認証がされており、ユーザーが利用登録されているか確認する
   * 利用登録されている場合はユーザー情報を返却してもらい
   * 利用登録されていない場合はサインアップ画面にリダイレクトする
   */
  const user = await checkLogin({ context: context, request: request })

  /**
   * ユーザー情報を返却する
   * 下位のコンポーネントで使用する
   */
  return json({ user })
}

export default function AuthPage() {
  return <Outlet />
}
