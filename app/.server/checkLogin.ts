import { AppLoadContext } from "@remix-run/cloudflare";
import { type AuthUser, getAuthenticator } from "./auth";
import { getAutorization } from "./authorization";
import { User } from "~/types/user";

export const checkLogin = async ({ context, request }: { context: AppLoadContext; request: Request }) => {
  /**
   * google認証されているか?
   */
  const authenticator = getAuthenticator(context);
  const googleUser: AuthUser | null = await authenticator.isAuthenticated(request);

  /**
   * Google Login認証済みの場合は認可チェックを行い
   * 認可されていない場合は/signupにリダイレクトする
   */
  let user: User | undefined = undefined;
  if (googleUser) {
    user = await getAutorization(context, googleUser.email);
    if (!user) {
      // const url = `/signup?name=${googleUser.name}&email=${googleUser.email}`;
      const url = `/signup`;
      await getAuthenticator(context).logout(request, {
        // redirectTo: '/notauthorized',
        redirectTo: url,
      });
    }
  }

  /**
   * 認証認可に成功した場合はuser情報を返却
   * Googleログインしていない場合はundefinedを返却
   */
  return user;
}