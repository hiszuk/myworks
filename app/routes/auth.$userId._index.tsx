import { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/react'
import invariant from 'tiny-invariant'

export const loader = ({ params }: LoaderFunctionArgs) => {
  invariant(params.userId, 'Missing userId param')
  const userid = params.userId
  return redirect(`/auth/${userid}/setting`)
}
