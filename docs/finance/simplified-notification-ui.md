# 簡易通知設定 UI 改善 (Simplified Notification UI Improvement)

## 概要 (Overview)

通知条件の選択UIを改善し、簡易モードでパターン条件をまとめて設定できるようにしました。

---

## 変更内容 (Changes)

### 1. 定数の追加

**ファイル**: `finance/consts/FinanceNotificationConst.ts`

簡易モードを表す特別な条件名定数を追加:

```typescript
export const SIMPLIFIED_CONDITION_NAME = 'SimplifiedAll' as const;
```

### 2. API エンドポイントの更新

#### 条件リスト取得 API

**ファイル**: `client/finance/app/api/finance-notification/conditions/[mode]/route.ts`

条件リストを取得する際に、以下のロジックを実装:

1. 全ての条件を `enableSimplifiedMode` プロパティで分類
2. 簡易モード対応条件がある場合、グループ化オプションを先頭に追加
   - 買いモード: `簡易設定 (全買いパターン)`
   - 売りモード: `簡易設定 (全売りパターン)`
3. 非簡易モード条件（GreaterThan, LessThan）は個別に表示

#### 条件情報取得 API

**ファイル**: `client/finance/app/api/finance-notification/condition/[condition]/route.ts`

`SIMPLIFIED_CONDITION_NAME` が指定された場合の情報を返すロジックを追加:

```typescript
{
  name: 'SimplifiedAll',
  description: '買い・売りモードに応じた全てのパターン条件を一括で設定します。個別の価格条件（指定価格を上回る・下回る）は含まれません。',
  isBuyCondition: true,
  isSellCondition: true,
  enableTargetPrice: false,
  enableTimeFrame: true,
  enableSimplifiedMode: true,
}
```

### 3. 通知サービスの更新

**ファイル**: `finance/services/FinanceNotificationService.ts`

通知チェック時に簡易条件名を展開するロジックを追加:

```typescript
if (condition.conditionName === SIMPLIFIED_CONDITION_NAME) {
  // 簡易モードの場合、checkConditionsByMode を使用して全ての条件をチェック
  return await this.checkConditionsByMode(
    condition.mode,
    exchange.id,
    ticker.id,
    condition.session,
    condition.targetPrice,
    condition.frequency,
    condition.timeframe
  );
}
```

結果処理も配列と単一結果の両方に対応するよう更新。

### 4. ドキュメントの更新

**ファイル**: `docs/finance/simplified-notification-api.md`

UI変更に関する注意事項を更新。

---

## UI の動作

### 条件選択画面

**買いモードの場合**:
```
[選択肢]
- 簡易設定 (全買いパターン)
- 指定価格を上回る (GreaterThan)
- 指定価格を下回る (LessThan)
```

**売りモードの場合**:
```
[選択肢]
- 簡易設定 (全売りパターン)
- 指定価格を上回る (GreaterThan)
- 指定価格を下回る (LessThan)
```

### 簡易設定の動作

「簡易設定」を選択した場合:

1. **買いモード**では以下の全パターン条件を自動チェック:
   - SansenAkenomyojo (三川明けの明星)
   - Sanzon (三尊)
   - RisingDoubleBottom (切り上げダブルボトム)
   - Gyakusanzon (逆三尊)
   - AscendingTriangle (アセンディング・トライアングル)
   - BullFlag (ブルフラッグ)

2. **売りモード**では以下の全パターン条件を自動チェック:
   - SansenYoinomyojo (三川宵の明星)
   - DoubleTop (ダブルトップ)
   - RisingWedge (上昇ウェッジ)
   - BearCollar (ベアコラッグ)

3. いずれかのパターンが検出された場合、通知を送信

---

## 利点

### 1. 設定の簡素化
- パターン条件を個別に選択する必要がない
- 買い/売りを選ぶだけで関連する全パターンを監視

### 2. 柔軟性の維持
- 個別の価格条件（GreaterThan/LessThan）は引き続き個別設定可能
- 簡易設定と個別設定を組み合わせることも可能

### 3. 既存機能との互換性
- 既存の個別条件設定も引き続き利用可能
- データ構造の変更なし

---

## 技術詳細

### データの保存方法

簡易設定を選択した場合、データベースには `conditionName: "SimplifiedAll"` として保存されます:

```typescript
{
  id: "condition-uuid",
  mode: "Buy",
  conditionName: "SimplifiedAll",
  frequency: "MinuteLevel",
  session: "Extended",
  targetPrice: null,
  timeframe: "1",
  firstNotificationSent: false
}
```

### 実行時の展開

通知チェック時に、`SimplifiedAll` は自動的に対応する全パターン条件に展開されます:

```
SimplifiedAll (Buy) →
  ├─ SansenAkenomyojo
  ├─ Sanzon
  ├─ RisingDoubleBottom
  ├─ Gyakusanzon
  ├─ AscendingTriangle
  └─ BullFlag
```

各条件は並列でチェックされ、いずれかが満たされた場合に通知が送信されます。

---

## テスト

既存の `checkConditionsByMode` のテストがこの機能をカバーしています:
- `finance/tests/FinanceNotification.test.ts`

---

## 関連ドキュメント

- [簡易通知設定 API](./simplified-notification-api.md)
- [条件システム](./conditions-system.md)
