# Finance Client

Finance モジュールのクライアントサイド実装です。Next.js を使用したWebアプリケーションで、株価チャートの表示と取引監視機能を提供します。

## 概要

Finance Client は以下の機能を提供します：

- **リアルタイム株価チャート**: ECharts を使用したインタラクティブなチャート表示
- **取引所・ティッカー選択**: ドロップダウンによる銘柄選択インターフェース
- **時間軸・セッション設定**: 分足から月足、通常時間から時間外取引まで対応
- **認証システム**: NextAuth.js を使用した認証機能
- **レスポンシブデザイン**: Material-UI ベースのモダンなUI

## アーキテクチャ

### Next.js App Router Structure

```
client/finance/
├── app/
│   ├── components/         # アプリケーション固有コンポーネント
│   │   ├── Auth.tsx       # 認証コンポーネント
│   │   └── graph/         # チャートコンポーネント
│   ├── api/               # API Routes
│   ├── utils/             # クライアント用ユーティリティ
│   ├── page.tsx           # メインページ
│   ├── layout.tsx         # レイアウト設定
│   └── globals.css        # グローバルスタイル
├── interfaces/            # TypeScript インターフェース
├── services/              # API通信サービス
└── utils/                 # ユーティリティ関数
```

## 主要コンポーネント

### ページコンポーネント

#### Home Page (`app/page.tsx`)

メインのダッシュボードページです。

**主要機能:**
- 取引所・ティッカー選択UI
- 時間軸・セッション設定
- リアルタイムチャート表示
- 認証状態管理

**State管理:**
```typescript
const [exchanges, setExchanges] = useState<ExchangeDataType[]>([]);
const [tickers, setTickers] = useState<TickerDataType[]>([]);
const [exchange, setExchange] = useState('');
const [ticker, setTicker] = useState('');
const [timeframe, setTimeframe] = useState<TimeFrame>('1');
const [session, setSession] = useState<string>('regular');
```

### UI Components

#### TimeFrameUtil
時間軸選択のためのユーティリティクラス

**対応時間軸:**
- **分足**: 1分、3分、5分、15分、30分、45分
- **時間足**: 1時間、2時間、3時間、4時間  
- **日足以上**: 日足、週足、月足

```typescript
const TIMEFRAME_OPTIONS = [
  { value: "1", label: "1分" },
  { value: "5", label: "5分" },
  { value: "15", label: "15分" },
  { value: "60", label: "1時間" },
  { value: "D", label: "日足" },
  // ... 他の時間軸
];
```

#### SessionUtil  
取引セッション選択のためのユーティリティクラス

**セッションタイプ:**
- `regular`: 通常取引時間
- `extended`: 時間外取引含む

### Services

#### ExchangeFetchService & TickerFetchService
取引所・ティッカーデータの取得を行うサービスクラス

```typescript
const exchangeFetchService = new ExchangeFetchService();
const exchanges = await exchangeFetchService.get();

const tickerFetchService = new TickerFetchService();  
const tickers = await tickerFetchService.get();
```

### Authentication

#### Auth Component
NextAuth.js を使用した認証コンポーネント

**機能:**
- ユーザー認証状態の管理
- 認証済みユーザーのみコンテンツ表示
- 権限ベースのアクセス制御

```typescript
<Auth
  userContent={
    // 認証済みユーザー向けコンテンツ
  }
/>
```

### Chart Integration

#### Graph Component
ECharts for React を使用したチャート表示

**特徴:**
- リアルタイムデータ更新
- インタラクティブな操作
- 複数の時間軸対応
- レスポンシブデザイン

## UI/UX Design

### Material-UI Integration

```typescript
import BasicSelect from '@client-common/components/inputs/Selects/BasicSelect';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';
import DirectionStack from '@client-common/components/Layout/Stacks/DirectionStack';
```

### CSS Variables

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

/* ダークモード対応（コメントアウト済み）
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
*/
```

### レスポンシブレイアウト

- モバイルファースト設計
- フレキシブルなグリッドレイアウト
- タッチデバイス対応

## API Integration

### 内部API Endpoints

```
/api/
├── send-notification     # 通知送信
├── exchanges            # 取引所データ
├── tickers              # ティッカーデータ
└── auth/                # 認証関連
```

### External APIs

- **TradingView API**: 株価データ取得（サーバー経由）
- **AWS Services**: DynamoDB、Secrets Manager

## 開発環境

### Scripts

```json
{
  "dev": "next dev",
  "build": "next build", 
  "start": "next start",
  "lint": "next lint"
}
```

### Development Server

```bash
npm run dev
# http://localhost:3000 でアクセス
```

### Dependencies

**Core Dependencies:**
- `next`: 15.4.3 (React Framework)
- `react`: 19.1.1
- `react-dom`: 19.1.1
- `next-auth`: 4.24.11 (Authentication)

**Development Dependencies:**
- `typescript`: 5.x
- `eslint`: 9.x
- `@types/*`: Type definitions

## 設定とカスタマイズ

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./app/*"],
      "@client-common/*": ["../common/*"],
      "@finance/*": ["../../finance/*"],
      "@common/*": ["../../common/*"]
    }
  }
}
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_SECRET` | NextAuth.js シークレット | `your-secret-key` |
| `NEXTAUTH_URL` | アプリケーションURL | `https://yourapp.vercel.app` |

## 認証とセキュリティ

### NextAuth.js Configuration

```typescript
// next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: {
      // カスタムユーザープロパティ
    }
  }
}
```

### 権限管理

```typescript
if (await AuthAPIUtil.isAuthorized('user')) {
  // 認証済みユーザーのみ実行
}
```

## デプロイメント

### Vercel Deployment

```bash
npm run build  # 本番ビルド
npm start     # 本番サーバー起動
```

### Environment Setup

本番環境では以下の環境変数が必要：
- NextAuth.js 関連設定
- AWS接続情報（必要に応じて）

## パフォーマンス最適化

### Next.js Features

- **自動コード分割**: ページ単位での最適化
- **画像最適化**: next/image による自動最適化
- **フォント最適化**: next/font による Web フォント最適化

### Client-Side Optimization

- React.memo による再レンダリング最適化
- useCallback/useMemo によるメモ化
- Lazy loading でのコンポーネント遅延読み込み

## テスト

### Testing Strategy

- コンポーネントテスト（Jest + React Testing Library）
- E2Eテスト（Playwright推奨）
- 型安全性（TypeScript）

## トラブルシューティング

### よくある問題

1. **チャートが表示されない**
   - 取引所・ティッカー選択状態を確認
   - ネットワーク接続を確認
   - ブラウザコンソールでエラーをチェック

2. **認証エラー**
   - NextAuth.js設定を確認
   - 環境変数を確認

3. **データ取得エラー**
   - API エンドポイントの動作を確認
   - サーバーログを確認

## 関連ドキュメント

- [Finance Module Overview](../README.md)
- [Server Documentation](../server/README.md)
- [Common Client Documentation](../../common/client/README.md)
- [Next.js Documentation](https://nextjs.org/docs)