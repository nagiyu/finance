---
title: "TargetPrice 算出ツール"
area: finance
topic: feature
owner: "@nagiyu"
last-updated: 2025-11-27
related-code-paths:
    - "finance/services/TargetPriceService.ts"
    - "finance/interfaces/data/TargetPriceDataType.ts"
    - "client/finance/app/components/financeNotification/TargetPriceCalculationDialog.tsx"
status: active
---

# TargetPrice 算出ツール

## 概要

TargetPriceService は、保有している株式の情報から売買の目標価格を算出するビジネスロジックを提供します。

## 主要機能

### 1. 目標価格算出

現在の保有情報から以下を算出します：

- **平均取得価格**: 保有株数とトータルコストから算出
- **買い目標価格**: 平均取得価格 × (1 - 許容範囲)
- **売り目標価格**: 平均取得価格 × (1 + 許容範囲)

### 2. 許容範囲設定

- **許容範囲**: 平均取得価格からの変動幅を示す倍率（例: 0.1 = ±10%）
  - 買い目標価格: 平均価格 × (1 - 許容範囲)
  - 売り目標価格: 平均価格 × (1 + 許容範囲)
  - 許容範囲は買い、売りに共通して適用される単一の倍率です

### 3. 通貨変換

- JPY（円）とUSD（ドル）間の自動変換
- 固定レート使用（USD → JPY: 143.0, JPY → USD: 0.007）

## 使用例

### 基本的な使用方法

```typescript
import TargetPriceService from '@finance/services/TargetPriceService';

// 基本的な算出
const result = TargetPriceService.calculateTargetPriceFromHoldings(
  100,      // 保有株数
  150000,   // 総コスト（円）
  0.1,      // 許容範囲（±10%）
  'JPY'     // 通貨
);

console.log(result);
// {
//   averagePrice: 1500,     // 平均取得価格: ¥1,500
//   buyTargetPrice: 1350,   // 買い目標価格: ¥1,350 (1500 × 0.9)
//   sellTargetPrice: 1650,  // 売り目標価格: ¥1,650 (1500 × 1.1)
//   currency: 'JPY'
// }
```

### 通貨変換付きの使用方法

```typescript
// ドル建て保有を円換算で算出
const result = TargetPriceService.calculateTargetPriceFromHoldings(
  50,       // 保有株数
  2500,     // 総コスト（ドル）
  0.05,     // 許容範囲（±5%）
  'USD',    // 元通貨
  'JPY'     // 目標通貨
);

console.log(result);
// {
//   averagePrice: 7150,       // 平均取得価格: ¥7,150 ($50 × 143)
//   buyTargetPrice: 6792.5,   // 買い目標価格: ¥6,792.5 (7150 × 0.95)
//   sellTargetPrice: 7507.5,  // 売り目標価格: ¥7,507.5 (7150 × 1.05)
//   currency: 'JPY',
//   originalCurrency: 'USD',
//   exchangeRate: 143.0
// }
```

### 詳細パラメータでの使用方法

```typescript
import { TargetPriceCalculationInput } from '@finance/interfaces/data/TargetPriceDataType';

const input: TargetPriceCalculationInput = {
  currentQuantity: 75,
  totalCost: 112500,
  tolerance: 0.2,          // ±20%
  currency: 'JPY',
  targetCurrency: 'USD'  // ドル換算で表示
};

const result = TargetPriceService.calculateTargetPrice(input);
```

## データ型

### TargetPriceCalculationInput

```typescript
interface TargetPriceCalculationInput {
  currentQuantity: number;      // 現在の保有株数
  totalCost: number;           // 保有株式の総コスト
  tolerance: number;           // 許容範囲 (0 <= tolerance < 1)
  currency: 'JPY' | 'USD';     // 入力値の通貨
  targetCurrency?: 'JPY' | 'USD';  // 変換先通貨（オプション）
}
```

### TargetPriceCalculationResult

```typescript
interface TargetPriceCalculationResult {
  averagePrice: number;        // 平均取得価格
  buyTargetPrice: number;      // 買い目標価格
  sellTargetPrice: number;     // 売り目標価格
  currency: 'JPY' | 'USD';     // 結果の通貨
  originalCurrency?: 'JPY' | 'USD';  // 変換前通貨
  exchangeRate?: number;       // 使用した為替レート
}
```

## バリデーション

以下の条件でエラーがスローされます：

- `currentQuantity` が 0 以下
- `totalCost` が 0 以下
- `tolerance` が 0 未満、または 1 以上
- 無効な通貨コード

## 注意事項

1. **固定為替レート**: 現在は固定レートを使用（実装はCurrencyUtilに依存）
2. **精度**: 浮動小数点計算による微小な誤差が発生する可能性
3. **通貨サポート**: 現在はJPYとUSDのみサポート

## UI統合

### TargetPrice算出ダイアログ

Finance Notification Conditionの編集画面にて、**モードが『売り』で、かつ売り条件で目標価格が必要な場合のみ**、目標価格の入力欄に「算出ツールを使用」ボタンが表示されます。

#### 使用方法

1. **ボタンをクリック**: 目標価格入力欄の下にある「算出ツールを使用」ボタンをクリックします。
2. **保有情報を入力**: ダイアログにて以下の情報を入力します：
   - **保有株数**: 現在の保有株数（MyTickerに登録済みの場合は自動的に適用されます）
   - **総コスト**: 保有株式の総コスト（MyTickerに登録済みの場合は自動的に計算・適用されます）
   - **許容範囲**: 平均価格からの変動幅をラジオボタンで選択（-15%, -10%, -5%, +5%, +10%, +15%）
3. **適用をクリック**: 算出された売り目標価格が自動的に目標価格フィールドに設定されます。

#### ダイアログの機能

- **MyTicker連動**: ダイアログが開かれた時、開く元のExchange, Tickerの情報に紐づくMyTickerが登録されていれば、保有株数と総コストが自動的に適用されます。
- **許容範囲選択**: ラジオボタンで簡単に許容範囲を選択できます（買い・売りに関わらず同じ倍率が適用されます）。
- **シンプルな計算**: ダイアログ内で直接計算を実行します（売り目標価格 = 平均価格 × (1 + 許容範囲)）
- **バリデーション**: 入力値のバリデーションが行われ、エラーがある場合はアラートが表示されます。
- **キャンセル**: ダイアログをキャンセルした場合、目標価格は変更されません。

## 関連ファイル

- `client/finance/app/components/financeNotification/TargetPriceCalculationDialog.tsx` - UI ダイアログコンポーネント
- `client/finance/app/components/financeNotification/FinanceNotificationConditionEditDialogContent.tsx` - 統合先コンポーネント
