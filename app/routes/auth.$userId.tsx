import { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { Outlet, json, useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { Layout } from '~/components/Layout'
import { useLoginStatus } from '~/hooks/useLoginStatus'

export const loader = ({ params }: LoaderFunctionArgs) => {
  invariant(params.userId, 'Missing userId param')
  const user = params.userId
  return json({ userId: user })
}

export default function AuthPage() {
  const { user, isLoggedIn } = useLoginStatus()
  const { userId } = useLoaderData<typeof loader>()

  if (!isLoggedIn || !user) {
    throw new Response('ログインしていません', { status: 401 })
  }

  if (userId !== user.userId) {
    throw new Response('認可されていません', { status: 403 })
  }

  return (
    <Layout>
      <Outlet context={user} />
    </Layout>
  )
}
