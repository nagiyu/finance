# MyTicker

## 概要

MyTickerは、ユーザーが保有している株式情報を管理する機能です。各ティッカーの保有数量と平均取得価格を記録し、通知設定などの他機能との連携に活用します。

**主な特徴:**
- シンプルな保有株式情報の管理
- ユーザーが算出した平均取得価格を登録
- 通知設定（TargetPrice）との連携が容易

---

## データ構造

### MyTickerDataType

```typescript
interface MyTickerDataType {
  // 基本情報
  id: string;                    // レコードID（自動生成）
  userId: string;                // ユーザーID
  exchangeId: string;            // 取引所ID
  tickerId: string;              // ティッカーID
  
  // 保有情報
  quantity: number;              // 保有株数
  averagePrice: number;          // 1株あたりの平均取得価格
  
  // メタデータ
  create: number;                // 作成日時（タイムスタンプ）
  update: number;                // 更新日時（タイムスタンプ）
}
```

**フィールド説明:**

| フィールド | 型 | 必須 | 説明 |
|----------|-----|------|------|
| `id` | string | ✓ | 一意のレコードID |
| `userId` | string | ✓ | このレコードを所有するユーザーのID |
| `exchangeId` | string | ✓ | 取引所のID（Exchange テーブルの外部キー） |
| `tickerId` | string | ✓ | ティッカーのID（Ticker テーブルの外部キー） |
| `quantity` | number | ✓ | 現在の保有株数（少数可、例: 0.5株） |
| `averagePrice` | number | ✓ | 1株あたりの平均取得価格（ユーザーが算出） |
| `create` | number | ✓ | レコード作成日時（Unix タイムスタンプ） |
| `update` | number | ✓ | レコード更新日時（Unix タイムスタンプ） |

**制約:**
- `userId` + `exchangeId` + `tickerId` の組み合わせは一意（ユーザーごとに1つのティッカーは1レコードのみ）
- `quantity` は 0 より大きい値
- `averagePrice` は 0 より大きい値

### MyTickerRecordType

DynamoDB に保存するレコード型：

```typescript
interface MyTickerRecordType extends FinanceRecordTypeBase {
  DataType: 'MyTicker';          // データタイプ（固定値）
  UserID: string;                // ユーザーID
  ExchangeID: string;            // 取引所ID
  TickerID: string;              // ティッカーID
  Quantity: number;              // 保有株数
  AveragePrice: number;          // 平均取得価格
}
```

---

## サービス層

### MyTickerService

`MyTickerService` は `CRUDServiceBase` を継承し、基本的なCRUD操作を提供します。

**主要メソッド:**
- `create()`: 新規レコード作成
- `update()`: 既存レコード更新
- `get()`: レコード取得
- `delete()`: レコード削除

**データ変換:**

```typescript
// DataType から RecordType への変換
protected dataToRecord(data: Partial<MyTickerDataType>): Partial<MyTickerRecordType> {
  return {
    UserID: data.userId,
    ExchangeID: data.exchangeId,
    TickerID: data.tickerId,
    Quantity: data.quantity,
    AveragePrice: data.averagePrice,
  };
}

// RecordType から DataType への変換
protected recordToData(record: MyTickerRecordType): MyTickerDataType {
  return {
    id: record.ID,
    userId: record.UserID,
    exchangeId: record.ExchangeID,
    tickerId: record.TickerID,
    quantity: record.Quantity,
    averagePrice: record.AveragePrice,
    create: record.Create,
    update: record.Update,
  };
}
```

---

## バリデーション

### MyTickerValidator

入力値のバリデーションを提供する専用クラスです。

**バリデーションルール:**
- `userId`: 必須、空文字不可
- `exchangeId`: 必須、空文字不可
- `tickerId`: 必須、空文字不可
- `quantity`: 必須、0より大きい値（小数可）
- `averagePrice`: 必須、0より大きい値（小数可）

**使用例:**

```typescript
// エラーをスローする方式
MyTickerValidator.validate(data);

// エラーメッセージを返す方式
const error = MyTickerValidator.validateWithMessage(data);
if (error) {
  console.error(error);
}
```

---

## API

### POST /api/myticker

新規MyTickerレコードを作成します。

**Request Body:**
```json
{
  "userId": "user123",
  "exchangeId": "NYSE",
  "tickerId": "AAPL",
  "quantity": 10,
  "averagePrice": 150.5
}
```

**Response:**
```json
{
  "id": "generated-id",
  "userId": "user123",
  "exchangeId": "NYSE",
  "tickerId": "AAPL",
  "quantity": 10,
  "averagePrice": 150.5,
  "create": 1234567890,
  "update": 1234567890
}
```

### PUT /api/myticker/[id]

既存のMyTickerレコードを更新します。

**Request Body:**
```json
{
  "userId": "user123",
  "exchangeId": "NYSE",
  "tickerId": "AAPL",
  "quantity": 15,
  "averagePrice": 148.0
}
```

### GET /api/myticker

ユーザーの全MyTickerレコードを取得します。

### DELETE /api/myticker/[id]

指定されたMyTickerレコードを削除します。

---

## UI

### 編集ダイアログ

MyTicker の編集フォームは以下のフィールドを持ちます：

1. **Exchange**（取引所）
   - ドロップダウン選択
   - 必須項目

2. **Ticker**（ティッカー）
   - ドロップダウン選択
   - 選択された Exchange に紐づく Ticker を表示
   - 必須項目

3. **Quantity**（保有株数）
   - 数値入力フィールド
   - バリデーション: 0より大きい値
   - 小数点対応
   - 必須項目

4. **Average Price**（平均取得価格）
   - 通貨入力フィールド
   - バリデーション: 0より大きい値
   - 必須項目
   - ヘルパーテキスト: 「1株あたりの平均取得価格を入力してください」

### 一覧表示

MyTicker の一覧画面では以下の情報を表示します：

| カラム | 内容 | フォーマット |
|--------|------|------------|
| Exchange | 取引所名 | テキスト |
| Ticker | ティッカーシンボル/名称 | テキスト |
| Quantity | 保有株数 | 数値（小数点対応） |
| Avg Price | 平均取得価格 | 数値 |
| Total Cost | 総コスト（計算値） | 数値（小数点以下2桁） |
| Action | 編集/削除ボタン | アクションボタン |

**計算フィールド:**
- **Total Cost**: `quantity × averagePrice` で算出
- クライアント側で計算して表示のみ（DBには保存しない）

```typescript
{
    id: 'totalCost',
    label: 'Total Cost',
    format: (cell, row) => {
        const quantity = row.quantity || 0;
        const avgPrice = row.averagePrice || 0;
        return (quantity * avgPrice).toFixed(2);
    }
}
```

---

## 他機能との連携

### TargetPrice Service との統合

MyTicker のデータ構造は、`TargetPriceService` との連携がシンプルです。

**変換例:**

```typescript
// MyTickerDataType から TargetPriceCalculationInput への変換
function myTickerToTargetPriceInput(
  myTicker: MyTickerDataType,
  tolerance: number,
  currency: 'JPY' | 'USD'
): TargetPriceCalculationInput {
  return {
    currentQuantity: myTicker.quantity,
    totalCost: myTicker.quantity * myTicker.averagePrice,
    tolerance,
    currency,
  };
}
```

**活用例:**

1. **通知設定画面での自動入力**
   - MyTicker で登録された保有株式を選択
   - 平均取得価格と保有株数が自動的に TargetPriceService に渡される
   - 目標価格が自動計算される

2. **一括通知設定**
   - 全ての保有株式に対して一括で通知条件を設定
   - 統一された許容範囲（例: ±10%）を適用

---

## ファイル構成

### データ型定義
- `finance/interfaces/data/MyTickerDataType.ts` - DataType定義
- `finance/interfaces/record/MyTickerRecordType.ts` - RecordType定義

### サービス層
- `finance/services/MyTickerService.ts` - ビジネスロジック

### バリデーション
- `finance/utils/MyTickerValidator.ts` - バリデーションユーティリティ

### API
- `client/finance/app/api/myticker/route.ts` - POST/GET エンドポイント
- `client/finance/app/api/myticker/[id]/route.ts` - PUT/DELETE エンドポイント

### UI コンポーネント
- `client/finance/app/components/myticker/MyTickerEditDialogContent.tsx` - 編集ダイアログ
- `client/finance/app/myticker/page.tsx` - 一覧ページ

### テスト
- `finance/tests/utils/MyTickerValidator.test.ts` - バリデーションのテスト
- `finance/tests/services/MyTickerService.test.ts` - サービスのテスト

---

## テスト

### ユニットテスト

**MyTickerValidator テスト:**
- 15/15 テストケース合格
- 必須フィールドのテスト
- 値の制約テスト（> 0）
- エッジケースのテスト

**MyTickerService テスト:**
- 10/10 テストケース合格
- データ変換のテスト
- 部分データの処理テスト
- データ型の保持テスト
- ラウンドトリップデータ整合性テスト

---

## セキュリティ

### 認証・認可

1. **ユーザー認証**
   - すべての API アクセスで認証を必須化
   - NextAuth による OAuth 認証

2. **データアクセス制御**
   - ユーザーは自分のデータのみアクセス可能
   - Lambda 関数でユーザーID のチェックを実施

### 入力値検証

1. **クライアント側**
   - フォーム入力時にリアルタイムバリデーション
   - 不正な値の送信を防止

2. **サーバー側**
   - Lambda 関数で再度バリデーション実施

### データ保護

1. **暗号化**
   - DynamoDB の暗号化を有効化（at-rest）
   - HTTPS による通信暗号化（in-transit）

2. **アクセスログ**
   - CloudWatch Logs によるアクセス記録
   - 異常なアクセスパターンの監視

---

## 参考資料

- [Finance Module Documentation](./README.md)
- [Common Module Documentation](../common/README.md)
- [TargetPrice 算出ツール](./target-price-calculation.md)
- [CRUDServiceBase 実装ガイド](../common/README.md#data-access-foundation)
