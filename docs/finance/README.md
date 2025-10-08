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
- **スマート通知ナビゲーション**: 通知クリック時に該当のExchangeとTickerが選択されたトップ画面に遷移
- **条件ごとの通知頻度管理** (機能)
  - 価格条件 (指定価格を上回る/下回る)
  - パターン条件 (赤三兵、三川明けの明星、三川宵の明星、陰の三つ星など)
  - 各条件で独立して頻度設定可能
- **条件ごとの時間枠設定** (新機能)
  - 各条件で独立してローソク足の時間枠を設定可能
  - 通知タイミングと条件チェックの時間枠を分離
- **簡易通知設定 API** (新機能)
  - 買い/売りモードの選択でパターン条件を自動適用
  - GreaterThan/LessThanは除外（別途個別設定が必要）
  - 該当するパターン条件を自動的に適用
- 複数の通知条件タイプ対応

**通知頻度オプション:**
- 1分ごと: 毎分チェック
- 10分ごと: 10分間隔でチェック  
- 1時間ごと: 1時間間隔でチェック
- 取引開始時のみ: 取引開始時のみチェック

**時間枠オプション:**
- 分足: 1分、3分、5分、15分、30分、45分
- 時間足: 1時間、2時間、3時間、4時間
- 日足、週足、月足

#### TargetPriceService
目標価格算出機能を提供するサービスクラスです。

**機能:**
- 保有株式情報からの平均取得価格算出
- 買い・売り目標価格の算出（許容範囲ベース）
- JPY・USD通貨変換機能
- 入力パラメータのバリデーション

**算出項目:**
- 平均取得価格: 総コスト ÷ 保有株数
- 買い目標価格: 平均取得価格 × 買い許容範囲（例: 0.9）
- 売り目標価格: 平均取得価格 × 売り許容範囲（例: 1.1）

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

// 従来の方法: 個別設定された条件での通知
const notificationService = new FinanceNotificationService();
await notificationService.notification('https://example.com/api/notifications');

// 新しい方法: 買い/売りモードでのパターン条件チェック
import { FINANCE_NOTIFICATION_CONDITION_MODE, FINANCE_NOTIFICATION_FREQUENCY } from '@finance/consts/FinanceNotificationConst';
import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';

// 買いパターン条件の全チェック（GreaterThan/LessThanは除外）
const buyResults = await notificationService.checkConditionsByMode(
  FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
  'NYSE',
  'AAPL',
  EXCHANGE_SESSION.EXTENDED,
  null,    // パターン条件のみをチェック
  FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
  '1'      // 1分足
);

// 売りパターン条件の全チェック（GreaterThan/LessThanは除外）
const sellResults = await notificationService.checkConditionsByMode(
  FINANCE_NOTIFICATION_CONDITION_MODE.SELL,
  'NYSE',
  'AAPL',
  EXCHANGE_SESSION.EXTENDED,
  null,    // パターン条件のみをチェック
  FINANCE_NOTIFICATION_FREQUENCY.HOURLY_LEVEL,
  'D'      // 日足
);

// 満たされた条件の処理
buyResults.forEach(result => {
  if (result.met && result.message) {
    console.log(result.message);
  }
});
```

### TargetPrice算出ツール
```typescript
import TargetPriceService from '@finance/services/TargetPriceService';

// 基本的な目標価格算出
const result = TargetPriceService.calculateTargetPriceFromHoldings(
  100,      // 保有株数
  150000,   // 総コスト（円）
  0.9,      // 買い許容範囲（90%）
  1.1,      // 売り許容範囲（110%）
  'JPY'     // 通貨
);

console.log(`平均取得価格: ${result.averagePrice}`);
console.log(`買い目標価格: ${result.buyTargetPrice}`);
console.log(`売り目標価格: ${result.sellTargetPrice}`);

// 通貨変換付きの算出
const convertedResult = TargetPriceService.calculateTargetPriceFromHoldings(
  50,       // 保有株数
  2500,     // 総コスト（ドル）
  0.95,     // 買い許容範囲（95%）
  1.05,     // 売り許容範囲（105%）
  'USD',    // 元通貨
  'JPY'     // 目標通貨（円換算）
);
```

### スマート通知ナビゲーション
通知をクリックした時、該当のExchange、Ticker、および TimeFrame が自動的に選択されたトップ画面に遷移する機能を提供します。

**仕組み:**
1. 通知送信時にexchangeId、tickerId、timeframeをメッセージデータに含める
2. Service Workerが通知クリックを検知し、URLパラメータとして追加
3. ホーム画面がURLパラメータを読み取り、該当のExchange、Ticker、TimeFrameを自動選択

**URL例:**
```
https://your-app.com/?exchangeId=NYSE&tickerId=AAPL-NYSE&timeframe=5
```

## アーキテクチャ

```
Finance Module
├── utils/
│   └── FinanceUtil (TradingView API Integration)
├── services/
│   ├── FinanceNotificationService (Alert Management)
│   ├── TargetPriceService (Target Price Calculation)
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
- **[条件システム](./conditions-system.md)** - 利用可能な条件の詳細説明
- **[条件ごとの通知頻度設定機能](./per-condition-frequency.md)** - 条件別通知頻度設定・時間枠設定機能
- **[簡易通知設定 API](./simplified-notification-api.md)** - 買い/売りモードとターゲット価格のみで設定できる新しいAPI
- **[簡易通知設定 UI](./simplified-notification-ui.md)** - 簡易モードでパターン条件をまとめて設定するUI改善
- **[TargetPrice算出ツール](./target-price-calculation.md)** - 保有株式からの目標価格算出機能
- **[MyTickerリファクタリング設計書](./myticker-refactoring-design.md)** - MyTicker機能のアーキテクチャ見直し設計