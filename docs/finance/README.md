# Finance Module

金融データ処理とStock Price Tracking機能を提供するコアモジュールです。

## 概要

Finance モジュールは以下の主要機能を提供します：

- **株価データ取得**: TradingView APIを使用したリアルタイム株価データの取得
- **通知サービス**: 株価条件に基づくアラート・通知機能
- **データアクセス**: DynamoDBを使用した金融データの永続化
- **取引所・ティッカー管理**: 取引所とティッカーシンボルの管理

## 主要コンポーネント

### Utilities

#### FinanceUtil
株価データ取得の中核となるユーティリティクラスです。

**主要メソッド:**
- `getStockPriceData(exchange, ticker, options)`: 指定された取引所・ティッカーの株価データを取得
- `getCurrentStockPrice(exchange, ticker, session)`: 現在の株価を取得
- `getFinanceTableName()`: 環境に応じたDynamoDBテーブル名を取得

**対応タイムフレーム:**
- 分足: 1分、3分、5分、15分、30分、45分
- 時間足: 1時間、2時間、3時間、4時間
- 日足、週足、月足

**取引セッション:**
- `regular`: 通常取引時間
- `extended`: 時間外取引含む

### Services

#### FinanceNotificationService
株価アラート機能を提供するサービスクラスです。

**機能:**
- 株価条件の監視
- 条件達成時の通知送信
- 通知頻度の管理（日次、分次レベル）
- 複数の通知条件タイプ対応

#### ExchangeService
取引所データの管理を行うサービスです。

#### TickerService / MyTickerService
ティッカーシンボル及び個人ティッカーリストの管理を行います。

### Data Access Layer

#### FinanceDataAccessorBase
金融データアクセスの基底クラスです。環境に応じたテーブル名管理を提供します。

**データアクセサー:**
- `ExchangeDataAccessor`: 取引所データ
- `TickerDataAccessor`: ティッカーデータ
- `MyTickerDataAccessor`: 個人ティッカーリスト
- `FinanceNotificationDataAccessor`: 通知設定データ

## 依存関係

### External Dependencies
- `@mathieuc/tradingview`: TradingView APIライブラリ
- `@aws-sdk/*`: AWS SDK（DynamoDB、Secrets Manager）

### Internal Dependencies
- `@common/*`: 共通ユーティリティとサービス

## 環境設定

### Environment Variables
- `PROCESS_ENV`: 実行環境 (`local`, `development`, `production`)
- `PROJECT_SECRET`: AWS Secrets Manager シークレット名

### DynamoDB Tables
- **Development**: `DevFinance`
- **Production**: `Finance`

## 使用例

### 株価データ取得
```typescript
import FinanceUtil from '@finance/utils/FinanceUtil';

// 基本的な株価データ取得
const priceData = await FinanceUtil.getStockPriceData('NYSE', 'AAPL');

// オプション付きでの取得
const priceData = await FinanceUtil.getStockPriceData('NYSE', 'AAPL', {
  count: 100,           // 100件のデータを取得
  timeframe: '5',       // 5分足
  session: 'extended'   // 時間外取引含む
});

// 現在価格のみ取得
const currentPrice = await FinanceUtil.getCurrentStockPrice('NYSE', 'AAPL');
```

### 通知サービス
```typescript
import FinanceNotificationService from '@finance/services/FinanceNotificationService';

const notificationService = new FinanceNotificationService();
await notificationService.notification('https://example.com/api/notifications');
```

## アーキテクチャ

```
Finance Module
├── utils/
│   └── FinanceUtil (TradingView API Integration)
├── services/
│   ├── FinanceNotificationService (Alert Management)
│   ├── ExchangeService (Exchange Management)
│   ├── TickerService (Ticker Management)
│   └── MyTickerService (Personal Ticker Lists)
├── interfaces/
│   ├── data/ (Data Transfer Objects)
│   └── record/ (Database Record Types)
└── types/
    └── (Type Definitions)
```

## 関連ドキュメント

- [Server Documentation](./server/README.md) - Lambda functions and API endpoints
- [Client Documentation](./client/README.md) - Next.js application and UI components
- [Common Module](../common/README.md) - Shared utilities and services