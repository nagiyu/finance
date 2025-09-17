# Google Adsense 対応

このドキュメントでは、CommonLayout に Google Adsense を設定する方法を説明します。

## 概要

CommonLayout コンポーネントに Google Adsense サポートが追加されました。AWS Secrets Manager から Publisher ID を動的に取得し、アプリケーション全体で Google Adsense 広告を簡単に設定できます。

## 設定方法

### 1. AWS Secrets Manager の設定

AWS Secrets Manager に「GoogleAdSense」という名前のシークレットを作成し、「PublisherID」キーで Google Adsense のパブリッシャーID を設定してください。

### 2. CommonLayout での使用

```typescript
import CommonLayout from '@client-common/components/layout/CommonLayout';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <CommonLayout
      title="Your App Title"
      enableAdSense={true}       // AWS Secrets Manager から Publisher ID を自動取得
    >
      {children}
    </CommonLayout>
  );
}
```

## パラメータ

### CommonLayoutProps（Google Adsense 関連）

| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| `enableAdSense` | `boolean` | - | AWS Secrets Manager から Publisher ID を自動取得して Google AdSense を有効にするかどうか（デフォルト: false） |

## 動作

Google Adsense が設定されると、以下の処理が自動的に行われます：

1. **環境チェック**: ProcessEnv が 'local' の場合、AdSense は無効化されます（デバッグ環境での広告表示を防止）
2. **Publisher ID の取得**: AWS Secrets Manager から「GoogleAdSense」シークレットの「PublisherID」キーを取得します（キャッシュ機能付き）
3. **AdSense スクリプトの読み込み**: Google AdSense の JavaScript ライブラリ（adsbygoogle.js）がページの `<head>` セクションに読み込まれます
4. **エラーハンドリング**: Secrets Manager への接続に失敗した場合、AdSense は読み込まれず、警告がログに出力されます

## 技術的な詳細

### 読み込まれるスクリプト

AdSense が有効な場合、以下のスクリプトがページに追加されます：

```html
<!-- AdSense メインスクリプト -->
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxx"
  crossorigin="anonymous"
></script>
```

### サーバーサイド処理

- **AdSenseUtil.server.ts**: AWS Secrets Manager から Publisher ID を取得
- **CommonLayout**: サーバーサイドで Publisher ID を取得し、クライアントに適切なスクリプトを配信
- **キャッシュ**: SecretsManagerUtil による自動キャッシュでパフォーマンスを最適化

## 注意事項

- AWS Secrets Manager に「GoogleAdSense」シークレットが正しく設定されていることを確認してください
- Publisher ID は Google AdSense アカウントから取得した正しいパブリッシャーID（ca-pub-xxxxxxxxxx 形式）を使用してください
- **ローカル環境（ProcessEnv が 'local'）では AdSense は自動的に無効化されます**
- 開発環境（ProcessEnv が 'development'）および本番環境（ProcessEnv が 'production'）では通常通り AdSense が動作します
- AWS Secrets Manager へのアクセス権限が適切に設定されていることを確認してください
- Secrets Manager からの取得に失敗した場合、AdSense は読み込まれませんが、アプリケーションの動作には影響しません
- Publisher ID の取得にはキャッシュ機能が使用されるため、初回取得後はパフォーマンスが向上します

## 例

```typescript
// 基本的な設定例
<CommonLayout
  title="Tools"
  enableAdSense={true}
>
  {children}
</CommonLayout>
```