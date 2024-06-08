import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * profile
 * ユーザープロファイル情報
 */
export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id').unique().notNull(),
    email: text('email').unique().notNull(),
    displayName: text('display_name').notNull(),
    register: integer('register_flg', { mode: 'boolean' }).notNull().default(false),
    avatar: text('avatar_url'),
    link: text('link'),
    github: text('github'),
    instagram: text('instagram'),
    twitter: text('twitter'),
    title: text('title'),
    name: text('name'),
    subtitle: text('subtitle'),
    img: text('img'),
    paragraphOne: text('paragraph_one'),
    paragraphTwo: text('paragraph_two'),
    paragraphThree: text('paragraph_three'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      userIdx: index('user_idx').on(table.userId),
      emailIdx: index('email_idx').on(table.email),
    }
  }
)

/**
 * setting
 * portfolioの設定情報
 */
export const setting = sqliteTable('setting', {
  id: integer('id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  css: text('css'),
  cover: text('cover_img'),
  openLabel: text('open_label'),
  contactMessage: text('contact_message'),
  contactLabel: text('contact_label'),
  contactMail: text('contact_email'),
})

/**
 * projects
 * portfolio表示用のプロジェクトデータ
 */
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectUserId: text('project_user_id')
    .references(() => users.userId, { onDelete: 'cascade' })
    .notNull(),
  img: text('img'),
  title: text('title'),
  launchDate: text('launch_date'),
  description: text('description'),
  url: text('url'),
  repository: text('repository'),
  publish: integer('publish', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

/**
 * theme
 * テーマ切り替え用のKVテーブル
 */
export const theme = sqliteTable('theme', {
  name: text('name').notNull().primaryKey(),
  value: text('value').notNull(),
  order: integer('disp_order'),
})
