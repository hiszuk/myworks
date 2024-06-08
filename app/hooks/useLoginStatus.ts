import { useRouteLoaderData } from '@remix-run/react'
import type { loader } from '~/root'

export type useLoginStatusType = ReturnType<typeof useLoginStatus>
export const useLoginStatus = () => {
  const data = useRouteLoaderData<typeof loader>('root')
  const isLoggedIn = !!data && !!data.user && !!data.user?.id

  return {
    user: data?.user !== null ? data?.user : undefined,
    isLoggedIn: isLoggedIn,
  }
}
