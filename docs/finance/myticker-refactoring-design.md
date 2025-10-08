# MyTicker リファクタリング設計書

## 概要

MyTickerは、ユーザーが保有している株式情報を管理する機能です。現在の実装では売買履歴を追跡し、保有株式のサマリーを自動計算していますが、機能が複雑化しているため、シンプルなアーキテクチャへリファクタリングします。

**リファクタリングの目的:**
- 複雑な売買履歴管理を削除し、シンプルな保有株情報管理に変更
- ユーザーが自分で算出した1株あたりの平均取得価格を登録する方式に変更
- 通知設定などの他機能との連携をシンプルにする

**注意事項:**
- 後方互換性は考慮しない（データ移行は手動で行う想定）
- 既存の売買履歴データは削除される

---

## 現状の問題点

### 1. データ構造の複雑性

現在のMyTickerは以下の情報を管理しています：

```typescript
// 現在のMyTickerDataType
interface MyTickerDataType {
  id: string;
  userId: string;
  exchangeId: string;
  tickerId: string;
  deal: 'purchase' | 'sell';  // 売買区分
  date: number;                // 取引日
  price: number;               // 取引価格（総額）
  quantity: number;            // 取引数量
  create: number;
  update: number;
}
```

**問題点:**
- 売買履歴を1件ずつ記録する必要がある
- 保有株数や平均取得価格を取得するには複雑な計算が必要
- データ量が増えるとパフォーマンスが低下する

### 2. サマリー計算の複雑性

現在の実装では、`MyTickerSummaryUtil.calculateSummary()` が以下の処理を行っています：

- FIFO（先入先出）方式での平均取得価格計算
- 売却による保有数量の調整
- 取引履歴のソートと順次処理

**問題点:**
- ビジネスロジックが複雑で保守が困難
- クライアント側で重い計算処理が発生
- エッジケースのバグが発生しやすい

### 3. 本来の目的とのズレ

MyTickerの本来の目的は「保有株式情報を通知設定に活用する」ことですが、現在は以下のような余計な機能が含まれています：

- 詳細な売買履歴の管理
- 複雑なポートフォリオ計算
- 取引履歴の時系列表示

これらは本来、別の機能（ポートフォリオ管理など）として実装すべきものです。

---

## 新しいアーキテクチャ設計

### 設計方針

1. **シンプルさを最優先**: 保有株式の「現在の状態」のみを管理
2. **ユーザーに計算を任せる**: 平均取得価格は外部で計算してもらう
3. **通知機能との連携を重視**: 目標価格設定との統合を容易にする

### データモデル

新しいMyTickerは、各ティッカーの保有情報を以下の形式で保持します：

```typescript
/**
 * 新しいMyTickerDataType
 * ユーザーが保有している株式の情報を管理
 */
interface MyTickerDataType {
  // 基本情報
  id: string;                    // レコードID
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
| `id` | string | ✓ | 一意のレコードID（自動生成） |
| `userId` | string | ✓ | このレコードを所有するユーザーのID |
| `exchangeId` | string | ✓ | 取引所のID（Exchange テーブルの外部キー） |
| `tickerId` | string | ✓ | ティッカーのID（Ticker テーブルの外部キー） |
| `quantity` | number | ✓ | 現在の保有株数（少数可、例: 0.5株） |
| `averagePrice` | number | ✓ | 1株あたりの平均取得価格（ユーザーが算出） |
| `create` | number | ✓ | レコード作成日時（Unix タイムスタンプ） |
| `update` | number | ✓ | レコード更新日時（Unix タイムスタンプ） |

**制約:**
- `userId` + `exchangeId` + `tickerId` の組み合わせは一意である（ユーザーごとに1つのティッカーは1レコードのみ）
- `quantity` は 0 より大きい値である（0以下の場合はレコードを削除する）
- `averagePrice` は 0 より大きい値である

---

## RecordType 設計

DynamoDB に保存するレコード型は以下のようになります：

```typescript
/**
 * MyTickerRecordType
 * DynamoDB のレコード形式
 */
interface MyTickerRecordType extends FinanceRecordTypeBase {
  DataType: 'MyTicker';          // データタイプ（固定値）
  UserID: string;                // ユーザーID（PascalCase）
  ExchangeID: string;            // 取引所ID
  TickerID: string;              // ティッカーID
  Quantity: number;              // 保有株数
  AveragePrice: number;          // 平均取得価格
}
```

**FinanceRecordTypeBase からの継承フィールド:**
- `ID`: レコードのプライマリキー
- `DataType`: データタイプ識別子
- `Create`: 作成日時
- `Update`: 更新日時

**インデックス戦略:**
- プライマリキー: `ID` (パーティションキー) + `DataType` (ソートキー)
- GSI（グローバルセカンダリインデックス）: `UserID` (パーティションキー) でユーザーごとの検索を最適化

---

## サービス層設計

### MyTickerService

`MyTickerService` は `CRUDServiceBase` を継承し、基本的なCRUD操作を提供します。

```typescript
/**
 * MyTickerService
 * MyTickerのビジネスロジックを提供
 */
class MyTickerService extends CRUDServiceBase<MyTickerDataType, MyTickerRecordType> {
  constructor() {
    super(new MyTickerDataAccessor());
  }

  /**
   * DataType から RecordType への変換
   */
  protected dataToRecord(data: Partial<MyTickerDataType>): Partial<MyTickerRecordType> {
    return {
      UserID: data.userId,
      ExchangeID: data.exchangeId,
      TickerID: data.tickerId,
      Quantity: data.quantity,
      AveragePrice: data.averagePrice,
    };
  }

  /**
   * RecordType から DataType への変換
   */
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
}
```

**追加メソッド（必要に応じて）:**

```typescript
/**
 * 特定ユーザーの保有株式一覧を取得
 */
async getByUserId(userId: string): Promise<MyTickerDataType[]> {
  // UserID でフィルタリングして取得
}

/**
 * 特定ユーザーの特定ティッカーの保有情報を取得
 */
async getByUserAndTicker(
  userId: string, 
  exchangeId: string, 
  tickerId: string
): Promise<MyTickerDataType | null> {
  // 特定の組み合わせでレコードを検索
}

/**
 * 保有情報を更新または作成（Upsert）
 */
async upsert(data: MyTickerDataType): Promise<MyTickerDataType> {
  // 既存レコードがあれば更新、なければ作成
}
```

### MyTickerDataAccessor

データアクセス層は現在の実装をベースに、簡素化されたデータ構造に対応します。

```typescript
/**
 * MyTickerDataAccessor
 * DynamoDB へのアクセスを提供
 */
class MyTickerDataAccessor extends FinanceDataAccessorBase<MyTickerRecordType> {
  private static readonly dataType = 'MyTicker';

  constructor() {
    super(MyTickerDataAccessor.dataType);
  }
}
```

**注記:**
- 基本的なCRUD操作は `FinanceDataAccessorBase` から継承
- 必要に応じて、ユーザーIDでのフィルタリングなど、カスタムクエリを追加

---

## クライアント（UI）設計

### 編集ダイアログ

MyTicker の編集フォームは以下のフィールドを持ちます：

**入力フィールド:**

1. **Exchange**（取引所）
   - タイプ: ドロップダウン選択
   - データソース: ExchangeService から取得
   - 必須項目

2. **Ticker**（ティッカー）
   - タイプ: ドロップダウン選択
   - データソース: 選択された Exchange に紐づく Ticker を表示
   - 必須項目

3. **Quantity**（保有株数）
   - タイプ: 数値入力フィールド
   - バリデーション: 0より大きい値
   - 小数点対応（例: 0.5株）
   - 必須項目

4. **Average Price**（平均取得価格）
   - タイプ: 通貨入力フィールド
   - バリデーション: 0より大きい値
   - 通貨フォーマット表示
   - 必須項目
   - ヘルパーテキスト: 「1株あたりの平均取得価格を入力してください」

**UI コンポーネント例:**

```tsx
/**
 * MyTickerEditDialogContent
 */
function MyTickerEditDialogContent({
  item,
  onItemChange,
  exchanges,
  tickers,
}: Props) {
  const filteredTickers = tickers.filter(t => t.exchange === item.exchangeId);

  return (
    <>
      {/* 取引所選択 */}
      <BasicSelect
        label='Exchange'
        options={ExchangeUtil.dataToSelectOptions(exchanges)}
        value={item.exchangeId}
        onChange={(value) => {
          const newTickers = tickers.filter(t => t.exchange === value);
          onItemChange({ 
            ...item, 
            exchangeId: value, 
            tickerId: newTickers.length > 0 ? newTickers[0].id : '' 
          });
        }}
      />
      
      {/* ティッカー選択 */}
      <BasicSelect
        label='Ticker'
        options={TickerUtil.dataToSelectOptions(filteredTickers)}
        value={item.tickerId}
        onChange={(value) => onItemChange({ ...item, tickerId: value })}
      />
      
      {/* 保有株数入力 */}
      <BasicNumberField
        label='Quantity'
        value={item.quantity}
        onChange={(e) => onItemChange({ ...item, quantity: Number(e.target.value) })}
        helperText='保有している株数を入力してください'
      />
      
      {/* 平均取得価格入力 */}
      <CurrencyNumberField
        label='Average Price per Share'
        value={item.averagePrice}
        onChange={(e) => onItemChange({ ...item, averagePrice: Number(e.target.value) })}
        onValueChange={(value) => onItemChange({ ...item, averagePrice: value })}
        helperText='1株あたりの平均取得価格を入力してください'
      />
    </>
  );
}
```

### 一覧表示

MyTicker の一覧画面は以下の情報を表示します：

**表示カラム:**

| カラム | 内容 | フォーマット |
|--------|------|------------|
| Exchange | 取引所名 | テキスト |
| Ticker | ティッカーシンボル/名称 | テキスト |
| Quantity | 保有株数 | 数値（小数点対応） |
| Average Price | 平均取得価格 | 通貨フォーマット |
| Total Cost | 総コスト（計算値） | 通貨フォーマット |
| Action | 編集/削除ボタン | アクションボタン |

**計算フィールド:**
- **Total Cost**: `quantity × averagePrice` で算出
- クライアント側で計算して表示のみ（DBには保存しない）

**ソート・フィルタリング:**
- Exchange でフィルタリング可能
- Ticker名でソート可能
- Total Cost でソート可能

### サマリー表示の削除

**削除する機能:**
- `MyTickerSummary` コンポーネント
- `MyTickerSummaryUtil.calculateSummary()` メソッド
- `MyTickerSummaryDataType` インターフェース
- 売買履歴に基づくサマリー計算ロジック

**理由:**
新しい設計では、各レコードがすでに「現在の保有状態」を表しているため、別途サマリーを計算する必要がありません。一覧画面がそのままサマリーとして機能します。

---

## バリデーション設計

### クライアント側バリデーション

```typescript
/**
 * MyTicker 入力値のバリデーション
 */
function validateItem(item: MyTickerDataType): string | null {
  if (!item.exchangeId.trim()) {
    return 'Exchange is required.';
  }
  
  if (!item.tickerId.trim()) {
    return 'Ticker is required.';
  }
  
  if (item.quantity <= 0) {
    return 'Quantity must be greater than 0.';
  }
  
  if (item.averagePrice <= 0) {
    return 'Average Price must be greater than 0.';
  }
  
  return null; // バリデーション成功
}
```

### サーバー側バリデーション

Lambda 関数でも同様のバリデーションを実施します：

```typescript
/**
 * サーバー側バリデーション（Lambda関数内）
 */
function validateMyTickerData(data: Partial<MyTickerDataType>): void {
  if (!data.userId) {
    throw new Error('UserID is required');
  }
  
  if (!data.exchangeId) {
    throw new Error('ExchangeID is required');
  }
  
  if (!data.tickerId) {
    throw new Error('TickerID is required');
  }
  
  if (!data.quantity || data.quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }
  
  if (!data.averagePrice || data.averagePrice <= 0) {
    throw new Error('AveragePrice must be greater than 0');
  }
}
```

---

## 通知機能との連携

### TargetPriceService との統合

新しい MyTicker のデータ構造は、`TargetPriceService` との連携がシンプルになります。

**現在の TargetPriceService の入力:**

```typescript
interface TargetPriceCalculationInput {
  currentQuantity: number;      // 保有株数
  totalCost: number;           // 総コスト
  tolerance: number;           // 許容範囲
  currency: 'JPY' | 'USD';
  targetCurrency?: 'JPY' | 'USD';
}
```

**新しい MyTicker からの変換:**

```typescript
/**
 * MyTickerDataType から TargetPriceCalculationInput への変換
 */
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

## データ移行戦略

### 移行方針

後方互換性は考慮しないため、以下の移行方法を推奨します：

**オプション1: 手動移行（推奨）**
1. 既存の売買履歴データをエクスポート
2. ユーザーが現在の保有株数と平均取得価格を計算
3. 新しい形式でデータを再登録

**オプション2: 移行スクリプト使用**
1. 既存データから最終的な保有状態を自動計算
2. 新しい形式のレコードに変換
3. データベースに投入

### 移行スクリプト例

```typescript
/**
 * 旧形式から新形式へのデータ移行
 * （参考実装）
 */
async function migrateMyTickerData(
  oldTransactions: OldMyTickerDataType[],
  userId: string
): Promise<MyTickerDataType[]> {
  // ティッカーごとにグループ化
  const grouped = groupByTicker(oldTransactions);
  
  const newRecords: MyTickerDataType[] = [];
  
  for (const [key, transactions] of grouped.entries()) {
    const [exchangeId, tickerId] = key.split('|');
    
    // FIFO方式で現在の保有状態を計算
    const { quantity, totalCost } = calculateCurrentHoldings(transactions);
    
    if (quantity > 0) {
      newRecords.push({
        id: generateId(),
        userId,
        exchangeId,
        tickerId,
        quantity,
        averagePrice: totalCost / quantity,
        create: Date.now(),
        update: Date.now(),
      });
    }
  }
  
  return newRecords;
}
```

**注意事項:**
- 移行スクリプトは参考実装であり、実際のデータに応じて調整が必要
- 移行前に必ずデータのバックアップを取得
- 移行後は旧データと新データを比較検証

---

## 実装の優先順位

### Phase 1: バックエンド実装（優先度: 高）

1. **データ型定義の更新**
   - `MyTickerDataType` の更新
   - `MyTickerRecordType` の更新
   - 型定義ファイルの修正

2. **サービス層の実装**
   - `MyTickerService` の更新
   - `dataToRecord` / `recordToData` メソッドの修正
   - 必要に応じて追加メソッドの実装

3. **Lambda API の更新**
   - CRUD エンドポイントの動作確認
   - バリデーションの追加
   - エラーハンドリングの調整

### Phase 2: フロントエンド実装（優先度: 高）

1. **UI コンポーネントの更新**
   - `MyTickerEditDialogContent` の書き換え
   - 不要なフィールド（Deal, Date, Price）の削除
   - 新フィールド（Quantity, AveragePrice）の追加

2. **一覧画面の更新**
   - テーブルカラムの変更
   - 計算フィールド（Total Cost）の追加
   - ソート・フィルタリング機能の調整

3. **サマリー機能の削除**
   - `MyTickerSummary` コンポーネントの削除
   - `MyTickerSummaryUtil` の削除
   - 関連する State の削除

### Phase 3: 統合とテスト（優先度: 中）

1. **TargetPrice 機能との統合**
   - MyTicker から TargetPrice への自動変換機能
   - 通知設定画面での連携確認

2. **テストコード作成**
   - `MyTickerService` のユニットテスト
   - バリデーションのテスト
   - UI コンポーネントのテスト

3. **E2Eテスト**
   - 全体フローの動作確認
   - エラーケースの確認

### Phase 4: データ移行とドキュメント（優先度: 低）

1. **データ移行**
   - 移行スクリプトの作成（必要に応じて）
   - テストデータでの動作確認
   - 本番データの移行

2. **ドキュメント更新**
   - README の更新
   - API ドキュメントの更新
   - ユーザーガイドの作成

---

## テスト戦略

### ユニットテスト

**テスト対象:**
- `MyTickerService.dataToRecord()`
- `MyTickerService.recordToData()`
- バリデーション関数
- データ変換関数

**テストケース例:**

```typescript
describe('MyTickerService', () => {
  describe('dataToRecord', () => {
    it('should convert DataType to RecordType correctly', () => {
      const data: Partial<MyTickerDataType> = {
        userId: 'user123',
        exchangeId: 'NYSE',
        tickerId: 'AAPL-NYSE',
        quantity: 10,
        averagePrice: 150.5,
      };
      
      const record = service.dataToRecord(data);
      
      expect(record.UserID).toBe('user123');
      expect(record.ExchangeID).toBe('NYSE');
      expect(record.TickerID).toBe('AAPL-NYSE');
      expect(record.Quantity).toBe(10);
      expect(record.AveragePrice).toBe(150.5);
    });
  });
  
  describe('validation', () => {
    it('should reject negative quantity', () => {
      const data: MyTickerDataType = {
        id: 'test',
        userId: 'user123',
        exchangeId: 'NYSE',
        tickerId: 'AAPL-NYSE',
        quantity: -10,  // 不正な値
        averagePrice: 150.5,
        create: Date.now(),
        update: Date.now(),
      };
      
      const error = validateItem(data);
      expect(error).toBe('Quantity must be greater than 0.');
    });
  });
});
```

### 統合テスト

**テスト対象:**
- DynamoDB への保存・取得
- Lambda API のエンドポイント
- クライアントからの API 呼び出し

**テストシナリオ:**

1. **作成フロー**
   - 新規 MyTicker レコードを作成
   - データが正しく保存されることを確認
   - 作成日時・更新日時が設定されることを確認

2. **更新フロー**
   - 既存レコードの更新
   - 更新日時が変更されることを確認
   - 他のフィールドが正しく更新されることを確認

3. **削除フロー**
   - レコードの削除
   - 削除後に取得できないことを確認

4. **ユーザーフィルタリング**
   - 特定ユーザーのレコードのみ取得
   - 他のユーザーのデータが含まれないことを確認

### E2E テスト

**テストシナリオ:**

1. **保有株式の登録**
   - ログイン
   - MyTicker 画面を開く
   - 「Add」ボタンをクリック
   - Exchange, Ticker, Quantity, AveragePrice を入力
   - 保存
   - 一覧に表示されることを確認

2. **保有株式の編集**
   - 一覧から編集ボタンをクリック
   - Quantity または AveragePrice を変更
   - 保存
   - 変更が反映されることを確認

3. **保有株式の削除**
   - 一覧から削除ボタンをクリック
   - 確認ダイアログで OK
   - 一覧から削除されることを確認

---

## パフォーマンス最適化

### データベース最適化

1. **インデックス戦略**
   - `UserID` に GSI を作成し、ユーザーごとの検索を高速化
   - パーティションキーの分散を考慮

2. **クエリ最適化**
   - 必要なフィールドのみを取得（ProjectionExpression の使用）
   - BatchGet/BatchWrite の活用（複数レコードの操作時）

### クライアント最適化

1. **データキャッシング**
   - Exchange/Ticker のマスターデータをキャッシュ
   - 不要な再取得を避ける

2. **遅延ローディング**
   - 大量のレコードがある場合はページネーション実装
   - 仮想スクロールの検討

3. **計算の最適化**
   - Total Cost などの計算フィールドは、表示時のみ計算
   - メモ化（useMemo）の活用

---

## セキュリティ考慮事項

### 認証・認可

1. **ユーザー認証**
   - すべての API アクセスで認証を必須化
   - NextAuth による OAuth 認証

2. **データアクセス制御**
   - ユーザーは自分のデータのみアクセス可能
   - Lambda 関数でユーザーID のチェックを実施

```typescript
// Lambda 関数内での認可チェック例
async function getMyTickers(userId: string): Promise<MyTickerDataType[]> {
  // リクエストユーザーと一致するデータのみ取得
  const records = await accessor.get();
  return records.filter(r => r.userId === userId);
}
```

### 入力値検証

1. **クライアント側**
   - フォーム入力時にリアルタイムバリデーション
   - 不正な値の送信を防止

2. **サーバー側**
   - Lambda 関数で再度バリデーション実施
   - SQL インジェクション対策（該当しないが、安全性の考慮）

### データ保護

1. **暗号化**
   - DynamoDB の暗号化を有効化（at-rest）
   - HTTPS による通信暗号化（in-transit）

2. **アクセスログ**
   - CloudWatch Logs によるアクセス記録
   - 異常なアクセスパターンの監視

---

## まとめ

### 新しいアーキテクチャの利点

1. **シンプルさ**
   - データ構造がシンプルで理解しやすい
   - 複雑な計算ロジックが不要

2. **パフォーマンス**
   - データ量が減少し、クエリが高速化
   - クライアント側の計算負荷が軽減

3. **保守性**
   - コードが短くなり、バグが減少
   - 新機能の追加が容易

4. **拡張性**
   - 他機能（通知設定など）との連携が容易
   - 将来的な機能追加がシンプル

### 削除される機能

以下の機能は新しいアーキテクチャでは提供されません：

- 売買履歴の詳細記録
- 取引日ごとの履歴表示
- FIFO 方式での自動計算
- 売却による保有数量の自動調整

これらの機能が必要な場合は、別途「ポートフォリオ管理」機能として実装することを推奨します。

### 次のステップ

1. この設計書のレビュー
2. 実装計画の策定
3. Phase 1（バックエンド実装）の開始
4. 段階的なリリースとフィードバック収集

---

## 変更履歴

| 日付 | バージョン | 変更内容 | 作成者 |
|------|----------|---------|--------|
| 2024-xx-xx | 1.0 | 初版作成 | - |

---

## 参考資料

- [Finance Module Documentation](./README.md)
- [Common Module Documentation](../common/README.md)
- [TargetPrice 算出ツール](./target-price-calculation.md)
- [CRUDServiceBase 実装ガイド](../common/README.md#data-access-foundation)
