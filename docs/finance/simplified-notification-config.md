# 簡略化された通知設定 (Simplified Notification Configuration)

## 概要 (Overview)

従来の通知システムは条件ごとに個別の設定が必要でしたが、新しいシステムでは「買い」または「売り」のモード選択のみで、該当する条件が自動的に適用されるようになります。

## 新しいビジネスロジック (New Business Logic)

### 主な変更点 (Key Changes)

1. **モードベース設定**: 「買い」または「売り」のモードを選択するだけで、該当する全ての条件が自動適用
2. **目標価格フィルタリング**: 目標価格が不要な条件は内部的に自動除外
3. **後方互換性**: 既存のメソッドはそのまま維持、新しいメソッドを別途提供

### 新しいインターフェース (New Interface)

```typescript
/**
 * 簡略化された通知設定
 */
export interface FinanceNotificationSimplifiedConfig {
  /**
   * 通知モード（買い/売り）- 適用する条件を決定
   */
  mode: FinanceNotificationConditionModeType;

  /**
   * 適用される全条件に対する頻度設定
   */
  frequency: FinanceNotificationFrequencyType;

  /**
   * 価格データのセッションタイプ
   */
  session: ExchangeSessionType;

  /**
   * 条件チェックに使用するローソク足の時間枠
   */
  timeframe?: TimeFrame | null;

  /**
   * 目標価格 - 不要な条件は内部的に除外される
   */
  targetPrice?: number | null;
}
```

### 新しいメソッド (New Methods)

#### 1. generateConditionListFromMode

モードベース設定から条件リストを自動生成します。

```typescript
public generateConditionListFromMode(
  config: FinanceNotificationSimplifiedConfig
): FinanceNotificationCondition[]
```

**機能:**
- 指定されたモード（買い/売り）に応じて適用条件を自動選択
- 目標価格が未設定の場合、目標価格が必要な条件を自動除外
- 目標価格をサポートしない条件には null を設定

#### 2. createWithSimplifiedConfig

簡略化された設定を使用して通知を作成します。

```typescript
public async createWithSimplifiedConfig(
  creates: Omit<Partial<FinanceNotificationDataType>, 'conditionList'>,
  config: FinanceNotificationSimplifiedConfig
): Promise<FinanceNotificationDataType>
```

**機能:**
- モードベース設定から条件リストを自動生成
- 適用可能な条件がない場合はエラーを発生
- 既存の create メソッドを内部で使用して後方互換性を維持

#### 3. checkConditionsWithMode

モードベース設定を使用して条件をチェックします。

```typescript
public async checkConditionsWithMode(
  exchangeId: string,
  tickerId: string,
  config: FinanceNotificationSimplifiedConfig
): Promise<ConditionResult | null>
```

**機能:**
- 指定されたモードに応じて適用条件を並列チェック
- 目標価格の有無に基づいて条件を自動フィルタリング
- 最初に満たされた条件の結果を返却
- エラーハンドリングを内蔵し、他条件のチェックを継続

## 使用例 (Usage Examples)

### 買い条件での通知作成

```typescript
const notificationService = new FinanceNotificationService(/* ... */);

// 基本的な通知データ
const baseData = {
  terminalId: 'user-terminal-123',
  subscriptionEndpoint: 'https://fcm.googleapis.com/fcm/send/...',
  subscriptionKeysP256dh: 'BNK...',
  subscriptionKeysAuth: 'xyz...',
  exchangeId: 'NASDAQ',
  tickerId: 'AAPL'
};

// 簡略化された設定
const config: FinanceNotificationSimplifiedConfig = {
  mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
  frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
  session: EXCHANGE_SESSION.EXTENDED,
  targetPrice: 150.00
};

// 通知作成（買い条件が全て自動適用される）
const notification = await notificationService.createWithSimplifiedConfig(baseData, config);
```

### 売り条件でのリアルタイムチェック

```typescript
// 売り条件でリアルタイムチェック
const sellConfig: FinanceNotificationSimplifiedConfig = {
  mode: FINANCE_NOTIFICATION_CONDITION_MODE.SELL,
  frequency: FINANCE_NOTIFICATION_FREQUENCY.HOURLY_LEVEL,
  session: EXCHANGE_SESSION.REGULAR,
  targetPrice: 140.00
};

const result = await notificationService.checkConditionsWithMode(
  'NASDAQ',
  'AAPL',
  sellConfig
);

if (result?.met) {
  console.log('売り条件が満たされました:', result.message);
}
```

### 目標価格なしでのパターン検出

```typescript
// 目標価格を必要としない条件のみをチェック
const patternConfig: FinanceNotificationSimplifiedConfig = {
  mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
  frequency: FINANCE_NOTIFICATION_FREQUENCY.TEN_MINUTE_LEVEL,
  session: EXCHANGE_SESSION.EXTENDED
  // targetPrice は未設定 - パターン条件のみが適用される
};

const patternResult = await notificationService.checkConditionsWithMode(
  'TSE',
  '7203',
  patternConfig
);
```

## 内部動作 (Internal Operations)

### 条件フィルタリングロジック

1. **モード選択**: `getBuyConditionList()` または `getSellConditionList()` で適用条件を取得
2. **目標価格フィルタ**: `enableTargetPrice` プロパティを確認し、目標価格が未設定かつ必要な条件を除外
3. **条件生成**: 残った条件に対して統一的な設定を適用
4. **並列実行**: `Promise.allSettled()` を使用して全条件を同時チェック

### エラーハンドリング

- 個別条件のエラーは他条件に影響せず継続実行
- 適用可能な条件がない場合は明確なエラーメッセージ
- ログ出力により調査・運用をサポート

## 後方互換性 (Backward Compatibility)

既存のメソッドは変更されておらず、従来のコードは引き続き動作します:

- `notification(endpoint: string)`: 既存の通知処理
- `create(creates: Partial<FinanceNotificationDataType>)`: 既存の作成処理
- 既存の `FinanceNotificationCondition` インターフェースは維持

## テストカバレッジ (Test Coverage)

新機能に対する包括的なテストが実装されています:

### generateConditionListFromMode テスト
- 買い条件の正確な生成
- 売り条件の正確な生成
- 目標価格フィルタリングの動作
- 目標価格設定の適切な適用

### createWithSimplifiedConfig テスト
- 正常な通知作成
- 適用可能条件なしの場合のエラーハンドリング

### checkConditionsWithMode テスト
- 条件満足時の結果返却
- 条件非満足時の null 返却
- 目標価格による条件フィルタリング
- エラー時の優雅な処理

## 運用上の利点 (Operational Benefits)

1. **設定の簡素化**: 複雑な条件個別設定から「買い/売り」選択への簡素化
2. **保守性向上**: 新しい条件追加時の自動適用
3. **エラー削減**: 手動設定ミスの削減
4. **パフォーマンス**: 並列処理による高速条件チェック
5. **柔軟性**: 目標価格の有無に応じた適切な条件適用

## 今後の拡張可能性 (Future Extensibility)

- カスタムフィルタリングルールの追加
- 条件の重み付け機能
- 複数モードの同時適用
- 条件の動的有効/無効化