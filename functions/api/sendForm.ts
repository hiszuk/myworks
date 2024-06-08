import type { Request } from '@cloudflare/workers-types'

export const onRequest = async ({ request, env }: { request: Request; env: Env }) => {
  const sender = 'MYWORKS'
  const senderEmail = 'contact@myworks-services.com'

  const formData = await request.formData() // クライアントサイドから送られたフォームデータを取得
  const name = formData.get('name') // フォームデータの中身
  const email = formData.get('email_address') // フォームデータの中身
  const detail = formData.get('detail') // フォームデータの中身
  const recipientEmail = formData.get('usermail') // 自分のメールアドレス
  const username = formData.get('username')
  const subject1 = formData.get('subject1')
  const subject2 = formData.get('subject2')
  const template1 = formData.get('template1')
  const template2 = formData.get('template2')

  // resend url
  const domain = `https://api.resend.com/domains/${env.RESEND_ID}`
  const resend = 'https://api.resend.com/emails'

  // メール本文をテンプレートから作成
  const body1 =
    template1 &&
    template1
      .replaceAll('#name#', name || 'no name')
      .replaceAll('#email#', email || 'no email')
      .replaceAll('#detail#', detail || 'no body')
  const body2 =
    template2 &&
    template2
      .replaceAll('#name#', name || 'no name')
      .replaceAll('#email#', email || 'no email')
      .replaceAll('#detail#', detail || 'no body')
      .replaceAll('#username#', username || 'no username')

  // お問い合わせ内容をサイト運営者に送信
  try {
    // tlsオプションを変更する
    await fetch(domain, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        open_tracking: false,
        click_tracking: false,
        tls: 'opportunistic',
      }),
    })

    // 運営者にメールを送付
    const ret = await fetch(resend, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${sender} <${senderEmail}>`,
        to: recipientEmail || 'hiszuk@gmail.com',
        subject: subject1 || 'NO SUBJECT',
        text: body1 || 'NO BODY',
      }),
    })
    if (!ret.ok) {
      console.error(`問い合わせメール送信に失敗しました。${ret.status}:${ret.statusText}`)
      return new Response('問い合わせメール送信に失敗しました。', { status: ret.status, statusText: ret.statusText })
    }
  } catch (error: unknown) {
    console.error(`問い合わせメール送信に失敗しました。${JSON.stringify(error)}`)
    return new Response(`問い合わせメール送信に失敗しました。${JSON.stringify(error)}`, { status: 500 })
  }

  // お客様へ自動返信メール
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const ret = await fetch(resend, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${sender} <${senderEmail}>`,
        to: email || 'hiszuk@gmail.com',
        subject: subject2 || 'お問い合わせありがとうございます',
        text: body2 || 'お問い合わせありがとうございます。内容確認し、後ほど返信いたします。',
      }),
    })
    if (!ret.ok) {
      console.error(`お客様へ自動返信メール送信に失敗しました。${ret.status}:${ret.statusText}`)
      return new Response('お客様へ自動返信メール送信に失敗しました。', { status: ret.status, statusText: ret.statusText })
    }
    return new Response('送信に成功しました！', { status: 200 })
  } catch (error: unknown) {
    console.error(`お客様へ自動返信メール送信に失敗しました。${JSON.stringify(error)}`)
    return new Response(`お客様へ自動返信メール送信に失敗しました。${JSON.stringify(error)}`, { status: 500 })
  }
}
