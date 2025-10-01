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
- 条件ステータス表示（画面下部）

**State管理:**
```typescript
const [exchanges, setExchanges] = useState<ExchangeDataType[]>([]);
const [tickers, setTickers] = useState<TickerDataType[]>([]);
const [exchange, setExchange] = useState('');
const [ticker, setTicker] = useState('');
const [timeframe, setTimeframe] = useState<TimeFrame>('1');
const [session, setSession] = useState<string>('extended');
```

#### Condition Status (`app/components/ConditionStatus.tsx`)

選択されたExchange、Ticker、時間軸に基づいて、指定価格が不要な条件の評価結果を表示するコンポーネントです。

**主要機能:**
- 目標価格が不要な条件（enableTargetPrice: false）の自動評価
- 買いシグナル・売りシグナルの視覚的表示
- 条件名のみの簡潔な表示（説明文は非表示）
- 条件が満たされた場合のみ表示

**表示される条件:**
- 三川明けの明星（買いシグナル）
- 三川宵の明星（売りシグナル）

**API連携:**
- `/api/finance-notification/conditions/check` - 条件評価API
- `ConditionCheckService` - クライアントサービス

### UI Components

#### Finance Notification Condition Edit Dialog
金融通知条件の作成・編集を行うダイアログコンポーネント

**機能:**
- 条件の選択時に詳細な説明を表示
- 条件の種類（買い・売り）に応じた適切な条件一覧の表示
- 通知頻度、セッション、時間枠などの詳細設定
- 目標価格の設定とTargetPrice算出ツールの統合

**条件説明表示:**
条件を選択すると、選択した条件の詳細説明が条件選択欄の下に表示されます。これにより、ユーザーは各条件の動作を理解してから設定を行うことができます。

```typescript
// 条件情報の例
{
  name: "指定価格を上回る",
  description: "株価が指定した価格を上回った時に通知します。",
  isBuyCondition: true,
  isSellCondition: true,
  enableTargetPrice: true,
  enableTimeFrame: false
}
```

**TargetPrice算出ツール:**
目標価格が必要な条件（`enableTargetPrice: true`）では、「算出ツールを使用」ボタンが表示されます。このボタンをクリックすると、TargetPrice算出ダイアログが開き、保有株式情報から目標価格を自動算出できます。

詳細は [TargetPrice算出ツール](../target-price-calculation.md#ui統合) を参照してください。

#### TargetPrice Calculation Dialog
目標価格を自動算出するためのダイアログコンポーネント

**機能:**
- 保有株数、総コスト、許容範囲の入力
- 通貨選択（JPY/USD）と自動為替変換
- 算出された売り目標価格の自動適用

**入力フィールド:**
- **保有株数**: 現在の保有株数
- **総コスト**: 保有株式の総コスト
- **買い許容範囲**: 買い増し判断の許容範囲（例: 0.9 = 90%）
- **売り許容範囲**: 売却判断の許容範囲（例: 1.1 = 110%）
- **入力通貨**: 入力値の通貨（円またはドル）
- **目標通貨**: 目標価格の通貨（円またはドル）

**実装:**
```typescript
import TargetPriceCalculationDialog from '@/app/components/financeNotification/TargetPriceCalculationDialog';

<TargetPriceCalculationDialog
  open={calculationDialogOpen}
  onClose={() => setCalculationDialogOpen(false)}
  onApply={(targetPrice) => {
    // 目標価格を適用
  }}
/>
```

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
      "@client-common/*": ["../typescript-common/*"],
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