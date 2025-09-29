# 新旧システム移行例 (Migration Example)

## 従来のシステム (Old System)

従来は各条件を個別に設定する必要がありました:

```typescript
// 従来: 条件ごとに個別設定が必要
const notification = await notificationService.create({
  terminalId: 'user-terminal-123',
  subscriptionEndpoint: 'https://fcm.googleapis.com/fcm/send/...',
  subscriptionKeysP256dh: 'BNK...',
  subscriptionKeysAuth: 'xyz...',
  exchangeId: 'NASDAQ',
  tickerId: 'AAPL',
  conditionList: [
    {
      id: null,
      mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
      conditionName: 'GreaterThan',
      frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
      session: EXCHANGE_SESSION.EXTENDED,
      targetPrice: 150.00,
      firstNotificationSent: false
    },
    {
      id: null,
      mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
      conditionName: 'SansenAkenomyojo',
      frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
      session: EXCHANGE_SESSION.EXTENDED,
      targetPrice: null, // この条件は目標価格不要
      firstNotificationSent: false
    },
    {
      id: null,
      mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
      conditionName: 'GyakusanZon',
      frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
      session: EXCHANGE_SESSION.EXTENDED,
      targetPrice: null, // この条件は目標価格不要
      firstNotificationSent: false
    },
    // 他の買い条件も個別に追加...
  ]
});
```

## 新しいシステム (New System)

新システムでは「買い」を選択するだけで、該当する全条件が自動適用されます:

```typescript
// 新システム: 「買い」選択のみで全買い条件が自動適用
const baseData = {
  terminalId: 'user-terminal-123',
  subscriptionEndpoint: 'https://fcm.googleapis.com/fcm/send/...',
  subscriptionKeysP256dh: 'BNK...',
  subscriptionKeysAuth: 'xyz...',
  exchangeId: 'NASDAQ',
  tickerId: 'AAPL'
};

const config: FinanceNotificationSimplifiedConfig = {
  mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
  frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
  session: EXCHANGE_SESSION.EXTENDED,
  targetPrice: 150.00
};

const notification = await notificationService.createWithSimplifiedConfig(baseData, config);

// 内部的に以下が自動実行される:
// - 全買い条件の取得 (getBuyConditionList())
// - 目標価格が必要な条件には150.00を設定
// - 目標価格が不要な条件にはnullを設定
// - 全条件をconditionListに自動追加
```

## 利点の比較 (Benefits Comparison)

| 項目 | 従来システム | 新システム |
|------|-------------|-----------|
| 設定の複雑さ | 各条件を個別設定 | モード選択のみ |
| 新条件追加時 | 手動で追加が必要 | 自動適用 |
| 設定ミス | 設定忘れや誤設定のリスク | 自動適用により軽減 |
| 保守性 | 条件追加時にコード変更要 | 自動適用により不要 |
| 後方互換性 | - | 完全互換 |

## 条件フィルタリング例 (Condition Filtering Example)

### 目標価格ありの場合

```typescript
const configWithPrice: FinanceNotificationSimplifiedConfig = {
  mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
  frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
  session: EXCHANGE_SESSION.EXTENDED,
  targetPrice: 150.00 // 目標価格あり
};

// 適用される条件:
// ✅ GreaterThan (目標価格: 150.00)
// ✅ LessThan (目標価格: 150.00) 
// ✅ SansenAkenomyojo (目標価格: null - 不要)
// ✅ GyakusanZon (目標価格: null - 不要)
// ✅ BullFlag (目標価格: null - 不要)
// ... 他の全買い条件
```

### 目標価格なしの場合

```typescript
const configWithoutPrice: FinanceNotificationSimplifiedConfig = {
  mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
  frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
  session: EXCHANGE_SESSION.EXTENDED
  // targetPrice なし
};

// 適用される条件:
// ❌ GreaterThan (目標価格が必要なので除外)
// ❌ LessThan (目標価格が必要なので除外)
// ✅ SansenAkenomyojo (目標価格不要)
// ✅ GyakusanZon (目標価格不要)
// ✅ BullFlag (目標価格不要)
// ... 他の目標価格不要な買い条件のみ
```

## 実際の使用ケース (Real Use Cases)

### ケース1: 株価上昇の売り時を狙う

```typescript
// 売り条件で通知設定
const sellConfig: FinanceNotificationSimplifiedConfig = {
  mode: FINANCE_NOTIFICATION_CONDITION_MODE.SELL,
  frequency: FINANCE_NOTIFICATION_FREQUENCY.TEN_MINUTE_LEVEL,
  session: EXCHANGE_SESSION.REGULAR,
  targetPrice: 200.00 // 200円を上回ったら売り検討
};

const sellNotification = await notificationService.createWithSimplifiedConfig(baseData, sellConfig);

// 自動適用される売り条件:
// - LessThan (200円を下回ったら)
// - DoubleTop (ダブルトップパターン)
// - SanZon (三尊パターン)
// - RisingWedge (上昇ウェッジパターン)
// ... 他の売りシグナル
```

### ケース2: パターン分析のみ

```typescript
// 目標価格なしでパターン分析のみ
const patternConfig: FinanceNotificationSimplifiedConfig = {
  mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
  frequency: FINANCE_NOTIFICATION_FREQUENCY.HOURLY_LEVEL,
  session: EXCHANGE_SESSION.EXTENDED
  // targetPrice: なし - パターン条件のみ
};

const patternNotification = await notificationService.createWithSimplifiedConfig(baseData, patternConfig);

// パターン系の買い条件のみ適用:
// - SansenAkenomyojo (三川明けの明星)
// - GyakusanZon (逆三尊)
// - RisingDoubleBottom (切り上げダブルボトム)
// - AscendingTriangle (アセンディング・トライアングル)
// - BullFlag (ブルフラッグ)
```

## 後方互換性の維持 (Maintaining Backward Compatibility)

既存のコードは変更なしで動作し続けます:

```typescript
// 既存のコードはそのまま使用可能
const oldStyleNotification = await notificationService.create({
  terminalId: 'user-terminal-123',
  // ... 既存の設定
  conditionList: [
    // ... 既存の条件設定
  ]
});

// 既存の通知処理もそのまま動作
await notificationService.notification('webhook-endpoint');
```

新機能は既存機能に影響を与えず、段階的な移行が可能です。