import { isRouteErrorResponse } from '@remix-run/react'
import SvgError404NotFound from './svg/Error404NotFound'
import SvgError400BadRequest from './svg/Error400BadRequest'
import SvgError401Unauthorized from './svg/Error401Unauthorized'
import SvgError403Forbidden from './svg/Error403Forbidden'
import SvgError500InternalServerError from './svg/Error500InternalServerError'
import SvgErroOthersFeelingSorry from './svg/ErroOthersFeelingSorry'

/**
 * Error Boundary for Root
 */
export function ErrorBoundaryComponent({ error }: { error: unknown }) {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) return <NotFound />
    if (error.status === 400) return <BadRequest />
    if (error.status === 401) return <UnAuthorized />
    if (error.status === 403) return <Forbidden />
    if (error.status === 500) return <ServerError />
    return <UnExpected message={`${error.status}:${error.statusText}`} data={error.data} />
  } else if (error instanceof Error) {
    return <ErrorPage title="Error" message={error.message} detail={`Stack Trace: ${error.stack}`} />
  } else {
    return <ErrorPage title="Unknown Error" message="その他予測していない問題が発生しました" />
  }
}

const NotFound = () => {
  return (
    <div className="h-3/5 md:w-2/3 w-11/12 flex flex-col justify-center items-center">
      <SvgError404NotFound className="w-full h-full" />
      <p className="px-2 py-1 bg-destructive text-destructive-foreground text-sm rounded">ページが見つかりません</p>
      <p className="text-xs text-center mt-2">一度HOME画面に戻りメニューからお進みください</p>
    </div>
  )
}

const BadRequest = () => {
  return (
    <div className="h-3/5 w-full flex flex-col justify-center items-center">
      <SvgError400BadRequest className="w-full h-full" />
      <p className="px-2 py-1 bg-destructive text-destructive-foreground text-sm rounded">
        アプリケーションが正しく動作していません
      </p>
      <p className="text-xs text-center mt-2">一度HOME画面に戻りメニューからお進みください</p>
    </div>
  )
}

const UnAuthorized = () => {
  return (
    <div className="h-3/5 w-full flex flex-col justify-center items-center">
      <SvgError401Unauthorized className="w-full h-full" />
      <p className="px-2 py-1 bg-destructive text-destructive-foreground text-sm rounded">ログインしていません</p>
      <p className="text-xs text-center mt-2">ログイン後に再度お試しください</p>
    </div>
  )
}

const Forbidden = () => {
  return (
    <div className="h-3/5 w-full flex flex-col justify-center items-center">
      <SvgError403Forbidden className="w-full h-full" />
      <p className="px-2 py-1 bg-destructive text-destructive-foreground text-sm rounded">閲覧権限がありません</p>
      <p className="text-xs text-center mt-2">正しい権限で再度アクセスしてください</p>
    </div>
  )
}

const ServerError = () => {
  return (
    <div className="h-3/5 w-full flex flex-col justify-center items-center">
      <SvgError500InternalServerError className="w-full h-full" />
      <p className="px-2 py-1 bg-destructive text-destructive-foreground text-sm rounded">予期しないエラーが発生しました</p>
      <p className="text-xs text-center mt-2">しばらく待ってもう一度お試しください</p>
    </div>
  )
}

const UnExpected = ({ message, data }: { message?: string | undefined; data?: string | undefined }) => {
  return (
    <div className="h-3/5 w-full flex flex-col justify-center items-center">
      <SvgErroOthersFeelingSorry className="w-full h-full" />
      <p className="px-2 py-1 bg-destructive text-destructive-foreground text-sm rounded">予期しないエラーが発生しました</p>
      <p className="text-xs text-center mt-2">{message}</p>
      <p className="text-primary-foreground text-xs text-center mt-2 mx-5">{data}</p>
    </div>
  )
}

const ErrorPage = ({
  title,
  message,
  detail,
}: {
  title: string
  message?: string | undefined
  detail?: string | undefined
}) => {
  return (
    <div className="h-3/5 w-full flex flex-col justify-center items-center">
      <SvgErroOthersFeelingSorry className="w-full h-full" />
      <p className="px-2 py-1 bg-destructive text-destructive-foreground text-sm rounded">{title}</p>
      <p className="text-xs text-center mt-2">{message}</p>
      <p className="text-primary-foreground text-xs text-center mt-2 mx-5">{detail}</p>
    </div>
  )
}
