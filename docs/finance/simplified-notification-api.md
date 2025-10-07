# 簡易通知設定 API (Simplified Notification API)

## 概要 (Overview)

従来の条件ごとの個別設定に加えて、買い/売りモードとターゲット価格のみで通知を設定できる新しいビジネスロジックを提供します。

このAPIは、UI部分の変更を必要とせず、バックエンドのビジネスロジックレベルでの改善として実装されています。

---

## 新しいメソッド

### `checkConditionsByMode`

買いまたは売りのモードを指定することで、該当する全ての条件を自動的に適用します。

#### メソッドシグネチャ

```typescript
public async checkConditionsByMode(
  mode: FinanceNotificationConditionModeType,
  exchangeId: string,
  tickerId: string,
  session?: ExchangeSessionType,
  targetPrice?: number | null,
  frequency?: FinanceNotificationFrequencyType,
  timeframe?: TimeFrame | null
): Promise<ConditionResult[]>
```

#### パラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `mode` | `FinanceNotificationConditionModeType` | ✓ | 買い (`FINANCE_NOTIFICATION_CONDITION_MODE.BUY`) または 売り (`FINANCE_NOTIFICATION_CONDITION_MODE.SELL`) |
| `exchangeId` | `string` | ✓ | 取引所ID |
| `tickerId` | `string` | ✓ | 銘柄ID |
| `session` | `ExchangeSessionType` | | 取引セッションタイプ（例: 通常取引、時間外取引） |
| `targetPrice` | `number \| null` | | ターゲット価格。設定された場合のみ価格条件がチェックされます |
| `frequency` | `FinanceNotificationFrequencyType` | | 通知頻度（1分ごと、10分ごと、1時間ごと、取引開始時のみ） |
| `timeframe` | `TimeFrame \| null` | | ローソク足の時間枠（'1', '5', '15', '60', 'D', 'W', 'M' など） |

#### 戻り値

`Promise<ConditionResult[]>` - 満たされた条件の結果配列

各 `ConditionResult` は以下の構造を持ちます:
```typescript
{
  met: boolean;        // 条件が満たされたかどうか
  message?: string;    // 通知メッセージ（オプション）
}
```

---

## 動作仕様

### 条件の自動選択

**重要**: 条件の `enableSimplifiedMode` プロパティが `false` に設定されている条件（GreaterThan（指定価格を上回る）とLessThan（指定価格を下回る）など）は、買い・売り両方のシナリオで利用可能なため、このシンプル設定APIからは除外されています。これらの条件は別途、個別に設定する必要があります。

#### 買いモード (`FINANCE_NOTIFICATION_CONDITION_MODE.BUY`)

以下のパターン条件が自動的にチェックされます（`enableSimplifiedMode: true` の条件のみ）:

**パターン条件 (targetPrice 不要):**
- SansenAkenomyojo (三川明けの明星)
- Sanzon (三尊)
- RisingDoubleBottom (切り上げダブルボトム)
- Gyakusanzon (逆三尊)
- AscendingTriangle (アセンディング・トライアングル)
- BullFlag (ブルフラッグ)

#### 売りモード (`FINANCE_NOTIFICATION_CONDITION_MODE.SELL`)

以下のパターン条件が自動的にチェックされます（`enableSimplifiedMode: true` の条件のみ）:

**パターン条件 (targetPrice 不要):**
- SansenYoinomyojo (三川宵の明星)
- DoubleTop (ダブルトップ)
- RisingWedge (上昇ウェッジ)
- BearCollar (ベアコラッグ) ※targetPriceが設定されていない場合も動作

### ターゲット価格のフィルタリング

**価格条件の取り扱い:**
- 条件の `enableSimplifiedMode` プロパティにより、簡易APIへの適用可否を管理
- GreaterThan（指定価格を上回る）とLessThan（指定価格を下回る）は `enableSimplifiedMode: false` のため除外
- これらの条件を使用する場合は、従来の個別設定方式を利用してください

**パターン条件のフィルタリング:**
1. 指定されたモード（買い/売り）に対応する全ての条件を取得
2. `enableSimplifiedMode: false` の条件を除外
3. 各条件の `enableTargetPrice` プロパティをチェック
4. `targetPrice` が `null` または `undefined` の場合:
   - `enableTargetPrice: true` の条件は除外
   - `enableTargetPrice: false` の条件のみ実行
5. `targetPrice` が設定されている場合:
   - 全てのパターン条件を実行（`enableSimplifiedMode: false` の条件は除外）

---

## 使用例

### 例1: 買い条件の全チェック（パターン条件のみ）

```typescript
const results = await financeNotificationService.checkConditionsByMode(
  FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
  'NYSE',
  'AAPL',
  EXCHANGE_SESSION.EXTENDED,
  null,    // ターゲット価格は不要（パターン条件のみ）
  FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
  '1'      // 1分足
);

// 結果: パターン条件のみがチェックされる
// - SansenAkenomyojo: 三川明けの明星パターンをチェック
// - Gyakusanzon: 逆三尊パターンをチェック
// - その他全ての買いパターン条件もチェック
// - GreaterThan/LessThanは除外
```

### 例2: 買い条件の全チェック（ターゲット価格あり）

```typescript
const results = await financeNotificationService.checkConditionsByMode(
  FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
  'NYSE',
  'AAPL',
  EXCHANGE_SESSION.EXTENDED,
  150.00,  // ターゲット価格を設定しても、GreaterThan/LessThanは除外
  FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
  '1'      // 1分足
);

// 結果: パターン条件のみがチェックされる（価格条件は除外）
// - SansenAkenomyojo: チェックされる
// - その他の買いパターン条件もチェックされる
// - GreaterThan: 除外される（別途個別設定が必要）
```

### 例3: パターンのみチェック（ターゲット価格なし）

```typescript
const results = await financeNotificationService.checkConditionsByMode(
  FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
  'NYSE',
  'AAPL',
  EXCHANGE_SESSION.EXTENDED,
  null,    // ターゲット価格なし
  FINANCE_NOTIFICATION_FREQUENCY.HOURLY_LEVEL,
  'D'      // 日足
);

// 結果: パターン条件のみがチェックされる
// - SansenAkenomyojo: チェックされる
// - その他の買いパターン条件もチェックされる
```

### 例4: 売り条件の全チェック

```typescript
const results = await financeNotificationService.checkConditionsByMode(
  FINANCE_NOTIFICATION_CONDITION_MODE.SELL,
  'NYSE',
  'AAPL',
  EXCHANGE_SESSION.EXTENDED,
  140.00,  // ターゲット価格を設定しても、LessThanは除外
  FINANCE_NOTIFICATION_FREQUENCY.TEN_MINUTE_LEVEL,
  '5'      // 5分足
);

// 結果: パターン条件のみがチェックされる
// - SansenYoinomyojo: 三川宵の明星パターンをチェック
// - その他全ての売りパターン条件もチェック
// - LessThan: 除外される（別途個別設定が必要）
```

### 例5: 結果の処理

```typescript
const results = await financeNotificationService.checkConditionsByMode(
  FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
  'NYSE',
  'AAPL',
  EXCHANGE_SESSION.EXTENDED,
  null,
  FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
  '1'
);

// 満たされた条件を確認
if (results.length > 0) {
  console.log(`${results.length} 個の条件が満たされました`);
  
  results.forEach((result, index) => {
    if (result.message) {
      console.log(`条件 ${index + 1}: ${result.message}`);
      // 例: "AAPL shows 三川明けの明星 pattern - signal detected (通知頻度: 1分ごと)"
    }
  });
} else {
  console.log('満たされた条件はありません');
}
```

---

## 利点

### 1. シンプルな設定
- 買い/売りを選択するだけで、関連するパターン条件が適用される
- 個別に条件を選択する必要がない
- GreaterThan/LessThanは除外され、必要に応じて個別設定可能

### 2. 柔軟性
- パターン条件のみに焦点を当てた設定
- 価格条件（GreaterThan/LessThan）は別途個別に管理

### 3. 自動フィルタリング
- パターン条件の適用可否を内部的に判断
- 不要な条件チェックを自動的にスキップ

### 4. 並列処理
- 全ての条件を並列でチェックするため高速

### 5. エラーハンドリング
- 一部の条件でエラーが発生しても他の条件のチェックは継続

---

## 後方互換性

### 既存のメソッド

既存の `notification` メソッドは引き続き利用可能です:

```typescript
public async notification(endpoint: string): Promise<void>
```

このメソッドは従来通り、個別に設定された条件リスト (`conditionList`) を使用して通知を行います。

### 移行パス

1. **段階的な移行**: 新しい `checkConditionsByMode` メソッドと既存の `notification` メソッドは共存可能
2. **選択的な利用**: 用途に応じて適切なメソッドを選択
3. **データ構造**: 既存の `FinanceNotificationDataType` のデータ構造は変更されていません

---

## テストカバレッジ

新しいメソッドには以下の包括的なテストが含まれています:

### 買いモードのテスト
- ✓ ターゲット価格が提供された場合、全ての買い条件をチェック
- ✓ ターゲット価格が提供されない場合、価格条件を除外
- ✓ 満たされる条件がない場合、空の配列を返す
- ✓ 異なる時間枠での条件処理

### 売りモードのテスト
- ✓ ターゲット価格が提供された場合、全ての売り条件をチェック
- ✓ ターゲット価格が提供されない場合、価格条件を除外
- ✓ 満たされる条件がない場合、空の配列を返す

### エラーハンドリング
- ✓ エラーが発生しても他の条件のチェックを継続

### 頻度統合
- ✓ 満たされた条件のメッセージに頻度情報を含む

---

## 実装詳細

### 内部フロー

```
1. モードに基づいて条件リストを取得
   ├─ BUY → getBuyConditionList()
   └─ SELL → getSellConditionList()

2. enableSimplifiedMode プロパティでフィルタリング
   └─ enableSimplifiedMode: false の条件を除外（買い・売り両方で使用可能な条件）

3. targetPrice の有無をチェック
   ├─ あり → パターン条件を適用（enableSimplifiedMode: false は除外済み）
   └─ なし → enableTargetPrice=false のパターン条件のみ適用

4. 適用可能な条件を順次チェック（レート制限対策）
   └─ 各条件チェックの間に500ms の待機時間を挿入

5. 結果を収集
   ├─ met=true の条件のみを抽出
   └─ エラーは無視して次の条件へ

6. 結果配列を返す
```

### パフォーマンス

- **順次実行**: TradingView API のレート制限を回避するため、条件を順番にチェック
- **遅延制御**: 各条件チェック間に 500ms の遅延を挿入
- **早期スキップ**: 不適用な条件は事前にフィルタリング
- **エラーレジリエント**: 個別の条件エラーが全体の実行を妨げない

---

## 関連ドキュメント

- [条件システム](./conditions-system.md) - 利用可能な条件の詳細
- [条件ごとの通知頻度・時間枠設定機能](./per-condition-frequency.md) - 従来の条件ごと設定方式
- [ターゲット価格計算](./target-price-calculation.md) - ターゲット価格の算出方法

---

## 注意事項

### UI 変更

この実装には UI 部分の改善が含まれています:

- 条件選択画面で、簡易設定オプション（買い・売りパターンをまとめたもの）が表示されます
- 個別の価格条件（GreaterThan/LessThan）は引き続き個別に選択可能です

### データ保存

`checkConditionsByMode` メソッドは条件チェックのみを行い、データベースへの保存は行いません。
通知設定を保存する場合は、従来通り `create` または `update` メソッドを使用してください。

### 通知の送信

このメソッドは条件チェックの結果を返すのみで、実際の通知送信は行いません。
通知を送信するには、既存の `notification` メソッドを使用するか、
返された結果を基に独自の通知ロジックを実装してください。

---

## まとめ

`checkConditionsByMode` メソッドは、通知設定を簡素化し、より直感的な買い/売りベースの条件チェックを提供します。
既存のシステムとの互換性を保ちながら、新しい使用パターンをサポートする柔軟な設計となっています。
