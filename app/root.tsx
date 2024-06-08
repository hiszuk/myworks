import {
  type LoaderFunctionArgs,
  type LinksFunction,
} from "@remix-run/cloudflare";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { getToast } from "remix-toast";
import { Toaster } from "./components/AppToaster";
import { useToaster } from "./hooks/useToaster";
import stylesheet from "~/tailwind.css?url";
import { ErrorBoundaryComponent } from "./components/ErrorBoundary";
import { buttonVariants } from "./components/ui/button";
import { checkLogin } from "./.server/checkLogin";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export async function loader({ request, context }: LoaderFunctionArgs) {
  // トースト
  const { toast, headers } = await getToast(request);

  // 認証・認可
  const user = await checkLogin({ request, context })

  return json(
    { toast, user },
    { headers },
  );
}

/**
 * Error Boundary for Root
 */
export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <html lang="en">
      <head>
        <title>ERROR | MY WORKS</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-screen flex flex-col justify-between items-center">
        <div className="pt-20 h-full flex flex-col justify-start items-center">
          <ErrorBoundaryComponent error={error} />
          <div className="mt-8 flex justify-center">
            <Link to="/" className={buttonVariants({ variant: "default", size: "sm" })}>
              Homeに戻る
            </Link>
          </div>
        </div>
        <div className="w-full bg-zinc-600 text-sm text-white text-center py-2">
          <span className="text-xs">Attributed by </span>
          <a href="https://storyset.com/web">Web illustrations by Storyset</a>
        </div>
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  // トースト
  const { toast } = useLoaderData<typeof loader>();
  useToaster(toast);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}
