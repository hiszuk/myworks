import { eq, and } from "drizzle-orm";
import { AppLoadContext } from "@remix-run/cloudflare";
import { createClient } from "./db";
import { users } from "~/drizzle/schema.server";
import { GoogleUser, User } from "~/types/user";

/**
 * googleユーザーのemailでusersマスターを検索し登録されているか確認
 * @param context 
 * @param email googleのemailアドレス
 * @returns user: User
 */
export async function getAutorization(
  context: AppLoadContext,
  email: string
): Promise<User | undefined> {
  const db = createClient(context.cloudflare.env.DB);
  const ret = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), eq(users.register, true)));
  if (ret.length !== 1) {
    console.error(`Googleアカウント:'${email}'が登録されていません`);
    return undefined;
  }
  return ret[0];
}

/**
 * googleユーザーがDBに存在しない場合仮登録を行う
 * 既に仮登録されている場合は仮登録のuserIdを返す
 * @param context 
 * @param google googleログイン情報
 * @returns 仮登録ID(usertId)
 */
export async function temporaryRegistration(
  context: AppLoadContext,
  google: GoogleUser
): Promise<string | undefined> {
  const db = createClient(context.cloudflare.env.DB);
  const ret = await db
    .select({ id: users.userId })
    .from(users)
    .where(and(eq(users.email, google.email), eq(users.register, false)));

  // すでに仮登録IDがあった場合はそのIDを返す
  if (ret && ret.length === 1) return ret[0].id;

  // GoogleIDで仮登録する
  try {
    await db.insert(users).values({
      userId: google.id,
      email: google.email,
      displayName: google.name,
      register: false,
    });

    return google.id;
  } catch (error: unknown) {
    console.error(`GoogleID仮登録に失敗, ${(error as Error).message}`)
    return undefined;
  }
}