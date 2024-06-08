import type { AppLoadContext } from "@remix-run/cloudflare";
import {
  createCookieSessionStorage,
} from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";
import { GoogleUser } from "~/types/user";

export type AuthUser = GoogleUser | undefined;

let _authenticator: Authenticator<AuthUser>;

export function getAuthenticator(context: AppLoadContext): Authenticator<AuthUser> {
  if (_authenticator == null) {
    const sessionStorage = createCookieSessionStorage({
      cookie: {
        secrets: [context.cloudflare.env.SESSION_SECRET],
        path: "/",
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV == "production",
      }
    });

    _authenticator = new Authenticator<AuthUser>(sessionStorage);
    const googleAuth = new GoogleStrategy({
      clientID: context.cloudflare.env.GOOGLE_CLIENT_ID,
      clientSecret: context.cloudflare.env.GOOGLE_CLIENT_SECRET,
      callbackURL: context.cloudflare.env.GOOGLE_CLIENT_CALLBACK_URL,
    }, async ({ profile }) => {
      return {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        image: profile.photos[0].value,
      };
    })
    _authenticator.use(googleAuth);
  }
  return _authenticator;
}