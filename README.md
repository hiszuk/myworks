# MY WORKS

忙しいエンジニアのためのポートフォリオ管理サービス

![hero](assets/myworks.png)

[Web illustrations by Storyset](https://storyset.com/web)

## コンセプト

テンプレートを選び開発物の紹介文と紹介画像を投稿するだけでデザインされたポートフォリオが完成します。

## ライブデモ

実際に動作する画面はこちらです。➡️　[MY WORKS](https://myworks-services.com)

## ソースコードについて

ここに公開しているソースコードは、自由にダンロードし改変しても構いません。

ただし、私の作成したソースコードに起因するいかなる不具合・不利益については一切保証は致しません。

## ご利用にあたり

ご利用にあたり、本アプリケーションを動作させるためには[Cloudflare](https://www.cloudflare.com/ja-jp/)のアカウント作成、および、同アカウントでの以下の設定が必要です。

- アプリケーションの作成 [Workersドキュメント](https://developers.cloudflare.com/workers/)と[Pagesのドキュメント](https://developers.cloudflare.com/pages/)ご参照
- D1データベースの作成 [D1ドキュメント](https://developers.cloudflare.com/d1/)を参照
- R2バケットの作成 [R2ドキュメント](https://developers.cloudflare.com/r2/)を参照（R2は無料枠を超えると従量制で使用量が必要で、このためクレジットカード登録が求められます）

また、ログイン認証に関してはGoogle OAuthを使用しています。このため、[Google Cloud](https://cloud.google.com/?_gl=1*1vhixiu*_up*MQ..&gclid=CjwKCAjw34qzBhBmEiwAOUQcF9V0arBfImTLf5Uz1SVMAl9bz2b52cFJFBUH1846NccvkaotZtIdnhoCEaYQAvD_BwE&gclsrc=aw.ds)のアカウント作成と、認証用のアプリ作成・各種設定が必要です。

- プロジェクトを作成する [プロジェクトの作成と管理](https://cloud.google.com/resource-manager/docs/creating-managing-projects?hl=ja)
- OAuth同意画面の設定とコールバックURL設定
- クライアントID,シークレットIDの取得

問い合わせメール送信については、下記準備が必要です。

- ドメインの取得と[cloudflare上での設定](https://developers.cloudflare.com/registrar/account-options/domain-management)
- [Resend](https://resend.com/)へのアカウント登録とcloudflareに登録した[ドメインの登録](https://resend.com/docs/dashboard/domains/introduction)と[API KEYの発行](https://resend.com/docs/dashboard/api-keys/introduction)
- [cloudflareでのドメイン設定追加](https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend/?mkt_tok=NzEzLVhTQy05MTgAAAGTjjG8kGOAxmwpJB3t6-7IfYqIU2Uo-kQx5QW7cBQV4fvRRNMpOZtqVnJ8S-oMtc9wWFOk5beaZ8ga3FjL8Aptbjj0LAkrhWYzrz046pvOxwteTV7LPs5L#add-your-domain-to-resend)

## 設定手順

ソースコードをgit cloneしてからローカルで動作確認し、cloudflareにデプロイ・各種設定を行い、最終的に問い合わせメールを送信するまでの手順をwikiにまとめていますので、そちらを参照してください。

[MY WORKS 設定手順](https://github.com/hiszuk/myworks/wiki)
