# TargetPrice 算出ツール

## 概要

TargetPriceService は、保有している株式の情報から売買の目標価格を算出するビジネスロジックを提供します。

## 主要機能

### 1. 目標価格算出

現在の保有情報から以下を算出します：

- **平均取得価格**: 保有株数とトータルコストから算出
- **買い目標価格**: 平均取得価格 × 買い許容範囲
- **売り目標価格**: 平均取得価格 × 売り許容範囲

### 2. 許容範囲設定

- **買い許容範囲**: 平均取得価格より低い価格での買い増し判断（例: 0.9 = 90%）
- **売り許容範囲**: 平均取得価格より高い価格での売却判断（例: 1.1 = 110%）

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
  0.9,      // 買い許容範囲（90%）
  1.1,      // 売り許容範囲（110%）
  'JPY'     // 通貨
);

console.log(result);
// {
//   averagePrice: 1500,     // 平均取得価格: ¥1,500
//   buyTargetPrice: 1350,   // 買い目標価格: ¥1,350
//   sellTargetPrice: 1650,  // 売り目標価格: ¥1,650
//   currency: 'JPY'
// }
```

### 通貨変換付きの使用方法

```typescript
// ドル建て保有を円換算で算出
const result = TargetPriceService.calculateTargetPriceFromHoldings(
  50,       // 保有株数
  2500,     // 総コスト（ドル）
  0.95,     // 買い許容範囲（95%）
  1.05,     // 売り許容範囲（105%）
  'USD',    // 元通貨
  'JPY'     // 目標通貨
);

console.log(result);
// {
//   averagePrice: 7150,       // 平均取得価格: ¥7,150 ($50 × 143)
//   buyTargetPrice: 6792.5,   // 買い目標価格: ¥6,792.5
//   sellTargetPrice: 7507.5,  // sell目標価格: ¥7,507.5
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
  buyTolerance: 0.85,    // 85%で買い増し
  sellTolerance: 1.2,    // 120%で売却
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
  buyTolerance: number;        // 買い許容範囲 (0 < buyTolerance < sellTolerance)
  sellTolerance: number;       // 売り許容範囲 (sellTolerance > buyTolerance)
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
- `buyTolerance` が 0 以下
- `sellTolerance` が 0 以下
- `buyTolerance` が `sellTolerance` 以上
- 無効な通貨コード

## 注意事項

1. **固定為替レート**: 現在は固定レートを使用（実装はCurrencyUtilに依存）
2. **精度**: 浮動小数点計算による微小な誤差が発生する可能性
3. **通貨サポート**: 現在はJPYとUSDのみサポート

## 関連ファイル

- `finance/services/TargetPriceService.ts` - メインサービス
- `finance/interfaces/data/TargetPriceDataType.ts` - 型定義
- `finance/tests/services/TargetPriceService.test.ts` - テストコード
- `common/utils/CurrencyUtil.ts` - 通貨変換ユーティリティ