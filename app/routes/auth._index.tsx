import { useLoginStatus } from '~/hooks/useLoginStatus'

export default function AuthIndexPage() {
  const { user, isLoggedIn } = useLoginStatus()

  if (!isLoggedIn || !user) {
    throw new Response('ログインしていません', { status: 401 })
  }

  return (
    <>
      <div>Auth Index Page</div>
      <h1>user情報</h1>
      <ul>
        <li>name: {user?.displayName}</li>
        <li>email: {user?.email}</li>
      </ul>
    </>
  )
}
