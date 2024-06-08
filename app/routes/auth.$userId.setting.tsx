import React, { FormEvent, MutableRefObject } from 'react'
import { LoaderFunctionArgs, MetaFunction, json } from '@remix-run/cloudflare'
import { Form, useLoaderData, useLocation, useNavigation, useSubmit } from '@remix-run/react'
import { z } from 'zod'
import { getFormProps, getInputProps, getSelectProps, getTextareaProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import invariant from 'tiny-invariant'
import Editor, { Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import Iframe from 'react-iframe'
import { PageTitle } from '~/components/PageTitle'
import { eq } from 'drizzle-orm'
import { Button } from '~/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import {
  ClipboardPaste,
  Github,
  Instagram,
  Laptop,
  Link,
  Loader2,
  Save,
  Smartphone,
  SquareCheckBig,
  Sun,
  SunMoon,
  Tablet,
  UserRoundX,
} from 'lucide-react'
import SvgXTwitter from '~/components/svg/XTwitter'
import { DeleteFile, UploadFile } from '~/components/UpnDownFile'
import { Textarea } from '~/components/ui/textarea'
import { createClient } from '~/.server/db'
import { setting, theme, users } from '~/drizzle/schema.server'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '~/components/ui/select'
import { cn } from '~/lib/utils'
import { AppAlertDialog, AppDialogProps } from '~/components/AlertDialog'

export const meta: MetaFunction = () => {
  return [{ title: 'ユーザー設定 | MY WORKS' }]
}

export const loader = async ({ params, request, context }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const tab = url.searchParams.get('tab')

  invariant(params.userId, 'Missing userId param')
  const userid = params.userId

  const db = createClient(context.cloudflare.env.DB)
  const result = await db
    .select({
      id: setting.id,
      userid: users.userId,
      cover: setting.cover,
      openLabel: setting.openLabel,
      contactMessage: setting.contactMessage,
      contactLabel: setting.contactLabel,
      contactMail: setting.contactMail,
      css: setting.css,
    })
    .from(setting)
    .innerJoin(users, eq(setting.id, users.id))
    .where(eq(users.userId, userid))

  // 結果が1件ではない場合404を返す
  if (result.length !== 1) {
    throw new Response('No Data Found', { status: 404 })
  }

  const result2 = await db.select().from(users).where(eq(users.userId, userid))

  // スキン選択肢
  const skins = await db.select({ name: theme.name, value: theme.value }).from(theme).orderBy(theme.order)

  // カスタムCSS取得
  const cssFile = `${userid}%2Fcss`
  const path = cssFile.replaceAll('%2F', '/')
  const { R2 } = context.cloudflare.env
  let stylesheet: string | null = null
  try {
    const object = await R2.get(path)
    if (object !== null) {
      skins.unshift({
        name: 'カスタマイズ',
        value: cssFile,
      })
      stylesheet = await new Response(object.body).text()
    }
  } catch (error: unknown) {
    console.error('Error -> ', (error as Error).message)
    throw new Response('unexpected error', { status: 500 })
  }

  return json({
    tab: tab,
    setting: result[0],
    skins: skins,
    user: result2[0],
    customcss: stylesheet,
  })
}

/**
 * ユーザー設定画面 トップ
 */
export default function ProfileSetting() {
  const title = 'ユーザー設定'
  const description = 'ユーザープロファイルとポートフォリオの設定を行います。'
  const { tab } = useLoaderData<typeof loader>()
  const defaultTab = tab !== null ? tab : 'profile'

  return (
    <>
      <div className="lg:h-10 h-2"></div>
      <PageTitle title={title} description={description} />
      <Tabs defaultValue={defaultTab} className="">
        <TabsList className="bg-zinc-100 w-full sm:justify-start justify-between">
          <TabsTrigger className="text-xs px-4" value="profile">
            プロファイル
          </TabsTrigger>
          <TabsTrigger className="text-xs px-4" value="about">
            ABOUT設定
          </TabsTrigger>
          <TabsTrigger className="text-xs px-4" value="portfolio">
            ポートフォリオ設定
          </TabsTrigger>
          <TabsTrigger className="text-xs px-4 max-sm:hidden visible" value="csseditor">
            CSS編集
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Profile id="profile" />
        </TabsContent>
        <TabsContent value="about">
          <About id="about" />
        </TabsContent>
        <TabsContent value="portfolio">
          <Portfolio id="portfolio" />
        </TabsContent>
        <TabsContent value="csseditor" className="max-sm:hidden visible">
          <EditCss id="csseditor" />
        </TabsContent>
      </Tabs>
    </>
  )
}

/**
 * コンテンツ部分のコンテナ
 */
const SettingContainer = ({ children, id }: { children: React.ReactNode; id: string }) => {
  return (
    <section className="sm:px-8 px-4 py-4 min-h-[500px]" id={id}>
      {children}
    </section>
  )
}

/**
 * プロファイル設定タブ
 */
const Profile = ({ id }: { id: string }) => {
  return (
    <SettingContainer id={id}>
      <div className="flex grid lg:grid-cols-2 grid-cols-1 gap-2">
        <div>
          <h1 className="text-base font-black border-b-2 border-l-4 pl-2">プロファイル編集</h1>
          <div className="h-4"></div>
          <ProfileFormArea />
        </div>
        <div>
          <h1 className="text-base font-black border-b-2 border-l-4 pl-2">アバター画像</h1>
          <div className="h-4"></div>
          <ProfileImageArea />
        </div>
      </div>
      <div className="flex flex-row justify-end">
        <div className="mt-5 w-[240px]">
          <DeleteAcount />
        </div>
      </div>
    </SettingContainer>
  )
}
// zod schema / action側でも使うのでexportする
export const schemaProfile = z.object({
  id: z.number(),
  email: z.string().email().nullable().optional(),
  userId: z.string().nullable().optional(),
  displayName: z.string({ required_error: '表示名は必須入力です' }),
  link: z.string().url('URLの形式が間違っています').nullable().optional(),
  github: z.string().url('URLの形式が間違っています').nullable().optional(),
  instagram: z.string().url('URLの形式が間違っています').nullable().optional(),
  twitter: z.string().nullable().optional(),
})
const ProfileFormArea = () => {
  // authで取得したユーザー情報を使う
  // const user: User = useOutletContext();
  const { user } = useLoaderData<typeof loader>()
  const { state } = useNavigation()
  const isSubmitting = state === 'submitting'

  // 入力フォームに関する部分
  const [form, fields] = useForm({
    id: `profile-${user.id}`,
    constraint: getZodConstraint(schemaProfile),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: schemaProfile })
    },
  })
  const labelClass = 'w-48 text-sm sm:text-right text-left pt-3 pr-4 flex flex-row sm:justify-end items-center'

  return (
    <Form method="put" action="profile" {...getFormProps(form)} preventScrollReset>
      {/* 更新プライマリキー項目 */}
      <input {...getInputProps(fields.id, { type: 'hidden' })} defaultValue={user.id} />

      {/* email */}
      <div className="flex sm:flex-row flex-col justify-between items-start mb-2">
        <Label htmlFor={fields.email.id} className={labelClass}>
          Googleメール
        </Label>
        <div className="w-full">
          <Input {...getInputProps(fields.email, { type: 'text' })} disabled defaultValue={user.email} />
          <div id={fields.email.errorId} className="text-xs text-red-600">
            {fields.email.errors}
          </div>
        </div>
      </div>

      {/* ユーザーID */}
      <div className="flex sm:flex-row flex-col justify-between items-start mb-2">
        <Label htmlFor={fields.userId.id} className={labelClass}>
          ユーザーID
        </Label>
        <div className="w-full">
          <Input {...getInputProps(fields.userId, { type: 'text' })} disabled defaultValue={user.userId} />
          <div className="h-1"></div>
          <div className="text-xs text-muted-foreground">サインアップの際に登録したIDになります(変更不可)</div>
          <div id={fields.userId.errorId} className="text-xs text-red-600">
            {fields.userId.errors}
          </div>
        </div>
      </div>

      {/* 表示名 */}
      <div className="flex sm:flex-row flex-col justify-between items-start mb-2">
        <Label htmlFor={fields.displayName.id} className={labelClass}>
          <span className="text-xs text-red-600">*</span>表示名
        </Label>
        <div className="w-full">
          <Input
            {...getInputProps(fields.displayName, { type: 'text' })}
            placeholder="表示名を入力してください（必須）"
            defaultValue={user.displayName}
            className={`${fields.displayName.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
          />
          <div className="h-1"></div>
          <div className="text-xs text-muted-foreground">ポートフォリオに公開される名前です(変更できます)</div>
          <div id={fields.displayName.errorId} className="text-xs text-red-600">
            {fields.displayName.errors}
          </div>
        </div>
      </div>

      {/* リンク */}
      <div className="flex sm:flex-row flex-col justify-between items-start mb-2">
        <Label htmlFor={fields.link.id} className={labelClass}>
          <Link size={16} className="mr-1" />
          リンク
        </Label>
        <div className="w-full">
          <Input
            {...getInputProps(fields.link, { type: 'text' })}
            placeholder="公開するサイトがあればURLを登録"
            defaultValue={user.link || ''}
            className={`${fields.link.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
          />
          <div className="h-1"></div>
          <div id={fields.link.errorId} className="text-xs text-red-600">
            {fields.link.errors}
          </div>
        </div>
      </div>

      {/* GitHub */}
      <div className="flex sm:flex-row flex-col justify-between items-start mb-2">
        <Label htmlFor={fields.github.id} className={labelClass}>
          <Github size={16} className="mr-1" />
          GitHub
        </Label>
        <div className="w-full">
          <Input
            {...getInputProps(fields.github, { type: 'text' })}
            placeholder="公開するGitHubサイトがあればURLを登録"
            defaultValue={user.github || ''}
            className={`${fields.github.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
          />
          <div className="h-1"></div>
          <div id={fields.github.errorId} className="text-xs text-red-600">
            {fields.github.errors}
          </div>
        </div>
      </div>

      {/* Instagram */}
      <div className="flex sm:flex-row flex-col justify-between items-start mb-2">
        <Label htmlFor={fields.instagram.id} className={labelClass}>
          <Instagram size={16} className="mr-1" />
          Instagram
        </Label>
        <div className="w-full">
          <Input
            {...getInputProps(fields.instagram, { type: 'text' })}
            placeholder="公開するInstagramサイトがあればURLを登録"
            defaultValue={user.instagram || ''}
            className={`${fields.instagram.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
          />
          <div className="h-1"></div>
          <div id={fields.instagram.errorId} className="text-xs text-red-600">
            {fields.instagram.errors}
          </div>
        </div>
      </div>

      {/* Twitter */}
      <div className="flex sm:flex-row flex-col justify-between items-start mb-2">
        <Label htmlFor={fields.twitter.id} className={labelClass}>
          <SvgXTwitter className="w-4 h-4 mr-1" />
          X(Twitter)
        </Label>
        <div className="w-full">
          <Input
            {...getInputProps(fields.twitter, { type: 'text' })}
            placeholder="公開するXアカウントがあれば登録"
            defaultValue={user.twitter || ''}
            className={`${fields.twitter.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
          />
          <div className="h-1"></div>
          <div id={fields.twitter.errorId} className="text-xs text-red-600">
            {fields.twitter.errors}
          </div>
        </div>
      </div>

      {/* 更新ボタン */}
      <div id="update-button" className="flex justify-end gap-1 mt-2 mr-4">
        <Button variant="default" size="sm" type="submit" disabled={isSubmitting} className="text-xs sm:w-auto w-full">
          {isSubmitting ? <Loader2 size={18} className="mr-1 animate-spin" /> : <SquareCheckBig size={18} className="mr-1" />}
          更新する
        </Button>
      </div>
      <div className="h-5"></div>
    </Form>
  )
}
const ProfileImageArea = () => {
  // const user: User = useOutletContext();
  const { user } = useLoaderData<typeof loader>()
  const path = `${user.userId}/images/avatar`
  const encodedPath = encodeURIComponent(path)
  const location = useLocation()
  return (
    <div className="border shadow pt-4">
      <div className="max-w-[320px] aspect-square m-auto bg-zinc-100">
        <img src={`/images/${encodedPath}?${location.key}`} alt="user avatar" className="h-full m-auto object-cover" />
      </div>
      <div className="sm:mx-10 mx-2 my-5 flex flex-row justify-between gap-2">
        <UploadFile userid={user.userId} path={path} />
        <DeleteFile userid={user.userId} path={path} />
      </div>
    </div>
  )
}
/**
 * ユーザー登録解除ボタン
 * 確認ダイアログを出力し削除の意思を確認する
 * 削除の場合はDELETE ./profile をコールする
 */
const DeleteAcount = () => {
  const { user } = useLoaderData<typeof loader>()
  const { id } = user
  const submit = useSubmit()

  const [modalConfig, setModalConfig] = React.useState<AppDialogProps | undefined>()
  const handleDelete = async () => {
    const ret = await new Promise<string>((resolve) => {
      setModalConfig({
        onClose: resolve,
        title: 'ユーザー登録を削除します',
        message: '削除するとアップロードしたコンテンツも全て削除され、元には戻せません。このまま削除を実行しますか?',
        variant: 'warning',
        okLabel: '削除する',
        cancelLabel: 'やめる',
      })
    })
    setModalConfig(undefined)
    if (ret === 'ok') {
      const formData = new FormData()
      formData.append('id', (id || '') as unknown as string)
      submit(formData, {
        method: 'delete',
        encType: 'application/x-www-form-urlencoded',
        action: 'profile',
      })
    }
    if (ret === 'cancel') {
      // console.log('CANCELが押された');
    }
  }
  return (
    <div className="flex flex-col justify-end">
      <Button variant="destructive" size="sm" className="text-sm" onClick={handleDelete}>
        <UserRoundX size={20} className="mr-1" />
        ユーザー登録削除
      </Button>
      <p className="mt-1 text-xs text-muted-foreground text-right">データ・コンテンツも削除されます</p>
      {modalConfig && <AppAlertDialog {...modalConfig} />}
    </div>
  )
}

/**
 * ABOUT設定タブ
 */
const About = ({ id }: { id: string }) => {
  return (
    <SettingContainer id={id}>
      <div className="flex grid lg:grid-cols-2 grid-cols-1 gap-2">
        <div>
          <h1 className="text-base font-black border-b-2 border-l-4 pl-2">ABOUT編集</h1>
          <div className="h-4"></div>
          <AboutFormArea />
        </div>
        <div>
          <h1 className="text-base font-black border-b-2 border-l-4 pl-2">ABOUT画像</h1>
          <div className="h-4"></div>
          <AboutImageArea />
        </div>
      </div>
    </SettingContainer>
  )
}
export const schemaAbout = z.object({
  id: z.number(),
  title: z.string({ required_error: 'タイトルは必須です' }),
  name: z.string({ required_error: '名前は必須です' }),
  subtitle: z.string().nullable().optional(),
  paragraphOne: z.string({ required_error: '少なともひとつの説明文は必要です' }),
  paragraphTwo: z.string().nullable().optional(),
  paragraphThree: z.string().nullable().optional(),
})

const AboutFormArea = () => {
  // authで取得したユーザー情報を使う
  // const user: User = useOutletContext();
  const { user } = useLoaderData<typeof loader>()
  const { state } = useNavigation()
  const isSubmitting = state === 'submitting'

  // 入力フォームに関する部分
  const [form, fields] = useForm({
    id: `profile-${user.id}`,
    constraint: getZodConstraint(schemaAbout),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: schemaAbout })
    },
  })
  const labelClass = 'w-32 text-sm sm:text-right text-left pt-3 pr-4 flex flex-row sm:justify-end items-center'

  return (
    <Form method="put" action="about" {...getFormProps(form)} preventScrollReset>
      {/* 更新キー項目 */}
      <input {...getInputProps(fields.id, { type: 'hidden' })} defaultValue={user.id} />

      {/* title */}
      <div className="flex sm:flex-row flex-col justify-between items-start sm:mb-4 mb-2">
        <Label htmlFor={fields.title.id} className={labelClass}>
          <span className="text-xs text-red-600">*</span>タイトル
        </Label>
        <div className="w-full">
          <Input
            {...getInputProps(fields.title, { type: 'text' })}
            placeholder="タイトルを入力してください（必須）"
            defaultValue={user.title || ''}
            className={`${fields.title.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
          />
          <div className="h-1"></div>
          <div className="text-xs text-muted-foreground">タイトルはプロファイルの最初の画面に大きく表示される文字です</div>
          <div id={fields.title.errorId} className="text-xs text-red-600">
            {fields.title.errors}
          </div>
        </div>
      </div>

      {/* name */}
      <div className="flex sm:flex-row flex-col justify-between items-start sm:mb-4 mb-2">
        <Label htmlFor={fields.name.id} className={labelClass}>
          <span className="text-xs text-red-600">*</span>名前
        </Label>
        <div className="w-full">
          <Input
            {...getInputProps(fields.name, { type: 'text' })}
            placeholder="名前を入力してください（必須）"
            defaultValue={user.name || ''}
            className={`${fields.name.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
          />
          <div className="h-1"></div>
          <div className="text-xs text-muted-foreground">名前はプロファイルの最初の画面に大きく表示されます</div>
          <div id={fields.name.errorId} className="text-xs text-red-600">
            {fields.name.errors}
          </div>
        </div>
      </div>

      {/* subtite */}
      <div className="flex sm:flex-row flex-col justify-between items-start sm:mb-4 mb-2">
        <Label htmlFor={fields.subtitle.id} className={labelClass}>
          サブタイトル
        </Label>
        <div className="w-full">
          <Input
            {...getInputProps(fields.subtitle, { type: 'text' })}
            placeholder="サブタイトルを入力してください（任意）"
            defaultValue={user.subtitle || ''}
            className={`${fields.subtitle.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
          />
          <div className="h-1"></div>
          <div className="text-xs text-muted-foreground">サブタイトルはあなたの特徴を簡潔に表す言葉が良いでしょう</div>
          <div id={fields.subtitle.errorId} className="text-xs text-red-600">
            {fields.subtitle.errors}
          </div>
        </div>
      </div>

      {/* paragraphOne */}
      <div className="flex sm:flex-row flex-col justify-between items-start sm:mb-4 mb-2">
        <Label htmlFor={fields.paragraphOne.id} className={labelClass}>
          <span className="text-xs text-red-600">*</span>説明文1
        </Label>
        <div className="w-full">
          <Textarea
            {...getTextareaProps(fields.paragraphOne)}
            rows={4}
            placeholder="説明文を入力してください（必須）"
            defaultValue={user.paragraphOne || ''}
            className={`${fields.paragraphOne.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
          />
          <div className="h-1"></div>
          <div className="text-xs text-muted-foreground">あなたの経歴や得意分野などをPRしましょう</div>
          <div id={fields.paragraphOne.errorId} className="text-xs text-red-600">
            {fields.paragraphOne.errors}
          </div>
        </div>
      </div>

      {/* paragraphTwo */}
      <div className="flex sm:flex-row flex-col justify-between items-start sm:mb-4 mb-2">
        <Label htmlFor={fields.paragraphTwo.id} className={labelClass}>
          説明文2
        </Label>
        <div className="w-full">
          <Textarea
            {...getTextareaProps(fields.paragraphTwo)}
            rows={4}
            placeholder="追加の説明文を入力できます"
            defaultValue={user.paragraphTwo || ''}
            className={`${fields.paragraphTwo.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
          />
          <div id={fields.paragraphTwo.errorId} className="text-xs text-red-600">
            {fields.paragraphTwo.errors}
          </div>
        </div>
      </div>

      {/* paragraphThree */}
      <div className="flex sm:flex-row flex-col justify-between items-start sm:mb-4 mb-2">
        <Label htmlFor={fields.paragraphThree.id} className={labelClass}>
          説明文3
        </Label>
        <div className="w-full">
          <Textarea
            {...getTextareaProps(fields.paragraphThree)}
            rows={4}
            placeholder="追加の説明文を入力できます"
            defaultValue={user.paragraphThree || ''}
            className={`${fields.paragraphThree.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
          />
          <div id={fields.paragraphThree.errorId} className="text-xs text-red-600">
            {fields.paragraphThree.errors}
          </div>
        </div>
      </div>

      {/* 更新ボタン */}
      <div id="update-button" className="flex justify-end gap-1 mt-2 mr-4">
        <Button variant="default" size="sm" type="submit" disabled={isSubmitting} className="text-xs sm:w-auto w-full">
          {isSubmitting ? <Loader2 size={18} className="mr-1 animate-spin" /> : <SquareCheckBig size={18} className="mr-1" />}
          更新する
        </Button>
      </div>
      <div className="h-5"></div>
    </Form>
  )
}
/**
 * ABOUT画像
 */
const AboutImageArea = () => {
  // const user: User = useOutletContext();
  const { user } = useLoaderData<typeof loader>()
  const path = `${user.userId}/images/profile`
  const encodedPath = encodeURIComponent(path)
  const location = useLocation()
  return (
    <div className="border shadow pt-4">
      <div className="max-w-[320px] aspect-square m-auto bg-zinc-100">
        <img src={`/images/${encodedPath}?${location.key}`} alt="user profile" className="h-full m-auto object-cover" />
      </div>
      <div className="sm:mx-10 mx-2 my-5 flex flex-row justify-between gap-2">
        <UploadFile userid={user.userId} path={path} />
        <DeleteFile userid={user.userId} path={path} />
      </div>
    </div>
  )
}

/**
 * ポートフォリオ設定タブ
 */
const Portfolio = ({ id }: { id: string }) => {
  return (
    <SettingContainer id={id}>
      <div className="flex grid lg:grid-cols-2 grid-cols-1 gap-2">
        <div>
          <h1 className="text-base font-black border-b-2 border-l-4 pl-2">ポートフォリオ設定編集</h1>
          <div className="h-4"></div>
          <PortfolioFormArea />
        </div>
        <div>
          <h1 className="text-base font-black border-b-2 border-l-4 pl-2">HERO画像</h1>
          <div className="h-4"></div>
          <HeroImageArea />
        </div>
      </div>
    </SettingContainer>
  )
}

export const schemaPortfolio = z.object({
  id: z.number(),
  css: z.string({ required_error: 'スキンが選択されていません' }),
  openLabel: z.string().nullable().optional(),
  contactMessage: z.string().nullable().optional(),
  contactLabel: z.string().nullable().optional(),
  contactMail: z
    .string({ required_error: '問い合わせ送信先メールは必須入力です' })
    .email('メールアドレスの形式が正しくありません'),
})

const PortfolioFormArea = () => {
  // authで取得したユーザー情報を使う
  const { setting, skins } = useLoaderData<typeof loader>()
  const { state } = useNavigation()
  const isSubmitting = state === 'submitting'

  // 入力フォームに関する部分
  const [form, fields] = useForm({
    id: `portfolio-${setting.id}`,
    constraint: getZodConstraint(schemaPortfolio),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: schemaPortfolio })
    },
  })
  const labelClass = 'w-48 text-sm sm:text-right text-left pt-3 pr-4 flex flex-row sm:justify-end items-center'

  return (
    <Form method="put" action="portfolio" {...getFormProps(form)} preventScrollReset>
      {/* 更新キー項目 */}
      <input {...getInputProps(fields.id, { type: 'hidden' })} defaultValue={setting.id} />

      {/* CSSスキン */}
      <div className="flex sm:flex-row flex-col justify-between items-start sm:mb-4 mb-2">
        <Label htmlFor={fields.css.id} className={labelClass}>
          <span className="text-xs text-red-600">*</span>スキン
        </Label>
        <div className="w-full">
          <div className="flex flex-row justify-between">
            <Select {...getSelectProps(fields.css)} defaultValue={setting.css || ''}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="スキン" />
              </SelectTrigger>
              <SelectContent>
                {skins &&
                  skins.length > 0 &&
                  skins.map((skin) => (
                    <SelectItem key={skin.name} value={skin.value}>
                      {skin.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="h-1"></div>
          <div className="text-xs text-muted-foreground">スキン(CSS)を変更することでポートフォリオの見た目を変えます</div>
          <div id={fields.css.errorId} className="text-xs text-red-600">
            {fields.css.errors}
          </div>
        </div>
      </div>

      {/* open label */}
      <div className="flex sm:flex-row flex-col justify-between items-start sm:mb-4 mb-2">
        <Label htmlFor={fields.openLabel.id} className={labelClass}>
          表紙ボタンのラベル
        </Label>
        <div className="w-full">
          <Input
            {...getInputProps(fields.openLabel, { type: 'text' })}
            placeholder="表紙のボタンのラベルを入力"
            defaultValue={setting.openLabel || ''}
            className={`${fields.openLabel.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
          />
          <div className="h-1"></div>
          <div className="text-xs text-muted-foreground">「ポートフォリオを見る」など、表紙ボタンラベルを決めます。</div>
          <div id={fields.openLabel.errorId} className="text-xs text-red-600">
            {fields.openLabel.errors}
          </div>
        </div>
      </div>

      {/* 問い合わせ文言 */}
      <div className="flex sm:flex-row flex-col justify-between items-start sm:mb-4 mb-2">
        <Label htmlFor={fields.contactMessage.id} className={labelClass}>
          問い合わせ文言
        </Label>
        <div className="w-full">
          <Input
            {...getInputProps(fields.contactMessage, { type: 'text' })}
            placeholder="問い合わせメッセージを入力"
            defaultValue={setting.contactMessage || ''}
            className={`${fields.contactMessage.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
          />
          <div className="h-1"></div>
          <div className="text-xs text-muted-foreground">問い合わせメッセージを決めます。</div>
          <div id={fields.contactMessage.errorId} className="text-xs text-red-600">
            {fields.contactMessage.errors}
          </div>
        </div>
      </div>

      {/* 問い合わせボタンラベル */}
      <div className="flex sm:flex-row flex-col justify-between items-start sm:mb-4 mb-2">
        <Label htmlFor={fields.contactLabel.id} className={labelClass}>
          問い合わせボタン
        </Label>
        <div className="w-full">
          <Input
            {...getInputProps(fields.contactLabel, { type: 'text' })}
            placeholder="問い合わせボタンのラベルを入力"
            defaultValue={setting.contactLabel || ''}
            className={`${fields.contactLabel.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
          />
          <div className="h-1"></div>
          <div className="text-xs text-muted-foreground">「お問い合わせ」など、問い合わせボタンのラベルを決めます。</div>
          <div id={fields.contactLabel.errorId} className="text-xs text-red-600">
            {fields.contactLabel.errors}
          </div>
        </div>
      </div>

      {/* 問い合わせ送信先 */}
      <div className="flex sm:flex-row flex-col justify-between items-start sm:mb-4 mb-2">
        <Label htmlFor={fields.contactMail.id} className={labelClass}>
          <span className="text-xs text-red-600">*</span>送信先
        </Label>
        <div className="w-full">
          <Input
            {...getInputProps(fields.contactMail, { type: 'email' })}
            placeholder="送信先メールアドレスを入力（必須）"
            defaultValue={setting.contactMail || ''}
            className={`${fields.contactMail.errors && 'focus-visible:ring-red-600'} placeholder:text-xs`}
          />
          <div className="h-1"></div>
          <div className="text-xs text-muted-foreground">送信先のメールアドレスを設定します。</div>
          <div id={fields.contactMail.errorId} className="text-xs text-red-600">
            {fields.contactMail.errors}
          </div>
        </div>
      </div>

      {/* 更新ボタン */}
      <div id="update-button" className="flex justify-end gap-1 mt-2 mr-4">
        <Button variant="default" size="sm" type="submit" disabled={isSubmitting} className="text-xs sm:w-auto w-full">
          {isSubmitting ? <Loader2 size={18} className="mr-1 animate-spin" /> : <SquareCheckBig size={18} className="mr-1" />}
          更新する
        </Button>
      </div>
      <div className="h-5"></div>
    </Form>
  )
}

/**
 * HERO画像
 */
const HeroImageArea = () => {
  // const user: User = useOutletContext();
  const { user } = useLoaderData<typeof loader>()
  const path = `${user.userId}/images/hero`
  const encodedPath = encodeURIComponent(path)
  const location = useLocation()
  return (
    <div className="border shadow pt-4">
      <div className="max-w-[320px] aspect-square m-auto bg-zinc-100">
        <img src={`/images/${encodedPath}?${location.key}`} alt="hero" className="h-full m-auto object-cover" />
      </div>
      <div className="sm:mx-10 mx-2 my-5 flex flex-row justify-between gap-2">
        <UploadFile userid={user.userId} path={path} />
        <DeleteFile userid={user.userId} path={path} />
      </div>
    </div>
  )
}

/**
 * CSS編集タブ
 */
const EditCss = ({ id }: { id: string }) => {
  const { user } = useLoaderData<typeof loader>()
  const [width, setWidth] = React.useState<string>('xl:w-[1280px] lg:w-full w-[640px]')
  return (
    <SettingContainer id={id}>
      <div className="flex grid xl:grid-cols-5 grid-cols-1 gap-2">
        <div className="col-span-2">
          <h1 className="text-base font-black border-b-2 border-l-4 pl-2">CSS編集</h1>
          <div className="h-4"></div>
          <CssEditArea />
        </div>
        <div className="col-span-3">
          <h1 className="text-base font-black border-b-2 border-l-4 pl-2">プレビュー</h1>
          <div className="flex flex-row justify-start items-center">
            <Button variant="ghost" onClick={() => setWidth('xl:w-[1280px] lg:w-full w-[640px]')}>
              <Laptop size={24} />
            </Button>
            <Button variant="ghost" onClick={() => setWidth('lg:w-[768px] w-[640px]')}>
              <Tablet size={24} />
            </Button>
            <Button variant="ghost" onClick={() => setWidth('w-[375px]')}>
              <Smartphone size={24} />
            </Button>
          </div>
          <div className={cn('xl:h-full h-[500px] lg:pb-14 pb-2', width)}>
            <Iframe url={`/${user.userId}/portfolio?css=custom`} width="100%" height="100%" />
          </div>
        </div>
      </div>
    </SettingContainer>
  )
}

const CssEditArea = () => {
  // 個別ユーザーのカスタムCSSの中身
  const { customcss } = useLoaderData<typeof loader>()

  const editorRef = React.useRef<editor.IStandaloneCodeEditor | null>(null)

  const [dark, setDark] = React.useState<boolean>(true)
  const theme = dark ? 'vs-dark' : 'light'
  const toggleTheme = () => setDark(!dark)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    editorRef.current = editor
  }

  const [edited, setEdited] = React.useState<boolean>(false)
  function handleChange() {
    if (editorRef === null || editorRef.current == null) return
    const curentCss = editorRef.current.getValue()
    if (customcss !== curentCss) setEdited(true)
    else setEdited(false)
  }

  return (
    <>
      <CopyCss editorRef={editorRef} toggleTheme={toggleTheme} isDark={dark} isEdited={edited} />
      <div className="h-[600px]">
        <Editor
          height="100%"
          theme={theme}
          defaultLanguage="css"
          defaultValue={customcss || '/* create your style sheet here */'}
          onMount={handleEditorDidMount}
          onChange={handleChange}
        />
      </div>
    </>
  )
}

const CopyCss = ({
  editorRef,
  toggleTheme,
  isDark,
  isEdited,
}: {
  editorRef: MutableRefObject<editor.IStandaloneCodeEditor | null>
  toggleTheme: () => void
  isDark: boolean
  isEdited: boolean
}) => {
  const { skins, user } = useLoaderData<typeof loader>()
  const [skin, setSkin] = React.useState<string | undefined>(undefined)
  const submit = useSubmit()

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    submit(event.currentTarget)
  }

  const [css, setCss] = React.useState<string | undefined>(undefined)
  const handleClick = () => {
    const buffer = editorRef.current?.getValue()
    setCss(buffer)
  }

  return (
    <div className="flex sm:flex-row flex-col justify-between items-center mx-1 mb-4">
      <div className="flex flex-row justify-start items-center gap-1">
        <Select value={skin} onValueChange={(val: string) => setSkin(val)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="コピー元を選択" />
          </SelectTrigger>
          <SelectContent>
            {skins &&
              skins.length > 0 &&
              skins.slice(1).map((skin) => (
                <SelectItem key={skin.name} value={skin.value}>
                  {skin.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Form id={`copy-css-${user.userId}`} method="post" action="copycss" reloadDocument>
          <input type="hidden" name="skin" value={skin} />
          <Button type="submit" variant="ghost" className="text-xs" disabled={!skin}>
            <ClipboardPaste size={20} className="mr-1" />
            スキンをコピー
          </Button>
        </Form>
        <Button variant="ghost" onClick={toggleTheme}>
          {isDark ? <Sun size={24} className="mx-1" /> : <SunMoon size={24} className="mx-1" />}
        </Button>
      </div>
      <Form
        id={`save-css-${user.userId}`}
        method="post"
        action="savecss"
        onChange={handleSave}
        reloadDocument
        preventScrollReset
      >
        <input type="hidden" name="stylesheet" value={css} />
        <Button variant="default" className="text-xs" disabled={!isEdited} onClick={handleClick}>
          <Save size={20} className="mr-1" />
          保存する
        </Button>
      </Form>
    </div>
  )
}
