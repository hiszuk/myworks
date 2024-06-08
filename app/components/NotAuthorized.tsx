import { Link } from '@remix-run/react'

export default function NotAuthoeized() {
  return (
    <>
      <h3>ユーザー認証・認可されていません</h3>
      <Link to="/">Homeに戻る</Link>
    </>
  )
}
