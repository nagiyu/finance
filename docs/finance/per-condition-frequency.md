---
title: "条件ごとの通知頻度・時間枠設定機能"
area: finance
topic: feature
owner: "@nagiyu"
last-updated: 2025-11-27
related-code-paths:
    - "finance/services/FinanceNotificationService.ts"
    - "finance/interfaces/data/FinanceNotificationDataType.ts"
status: active
---

# 条件ごとの通知頻度・時間枠設定機能

## 概要

Finance Notification システムで、各条件ごとに通知頻度と時間枠を個別に設定できる機能です。従来は通知全体で一つの設定でしたが、条件の種類に応じてより柔軟な設定が可能になりました。

## 機能詳細

### 対応条件タイプ

#### 価格条件
- **指定価格を上回る (GREATER_THAN)**
- **指定価格を下回る (LESS_THAN)**

#### パターン条件
- **赤三兵 (THREE_RED_SOLDIERS)**
- **三川明けの明星 (THREE_RIVER_EVENING_STAR)**
- **三川宵の明星 (SANSEN_YOINOMYOJO)**
- **二本たくり線 (TWO_TAKURI_LINES)**
- **つばめ返し (SWALLOW_RETURN)**
- **仕掛け花火 (FIREWORKS)**
- **岡時三羽 (OKAJI_THREE_CROWS)**
- **小石崩れ (FALLING_STONES)**
- **陽の両はらみ (BULLISH_HARAMI_CROSS)**
- **陰の両はらみ (BEARISH_HARAMI_CROSS)**
- **鷹かえし (HAWK_REVERSAL)**
- **陰の三つ星 (THREE_DARK_STARS)**
- **流れ星 (SHOOTING_STAR)**

### 通知頻度オプション

#### 1分ごと (MINUTE_LEVEL)
- 毎分チェックを実行
- 価格条件: 取引時間中は毎分チェック
- パターン条件: 初回通知後は取引開始時のみ

#### 10分ごと (TEN_MINUTE_LEVEL)
- 10分間隔（0, 10, 20, 30, 40, 50分）でチェック
- 全ての条件タイプで利用可能

#### 1時間ごと (HOURLY_LEVEL)
- 1時間間隔（毎時0分）でチェック
- 全ての条件タイプで利用可能

#### 取引開始時のみ (EXCHANGE_START_ONLY)
- 取引開始時間のみチェック
- パターン条件に適した設定

## データ構造

### 新形式 (推奨)
```json
{
  "conditions": "[{\"type\":\"GreaterThan\",\"frequency\":\"MinuteLevel\"},{\"type\":\"ThreeRedSoldiers\",\"frequency\":\"ExchangeStartOnly\"}]"
}
```

### 旧形式 (後方互換性維持)
```json
{
  "conditions": "[\"GreaterThan\",\"ThreeRedSoldiers\"]",
  "frequency": "MinuteLevel"
}
```

## UI での使用方法

1. **条件選択**: 買い/売りモードに応じて利用可能な条件を選択
2. **頻度設定**: 選択した各条件について個別に通知頻度を設定
3. **保存**: 条件と頻度の組み合わせが保存される

## 実装詳細

### クライアント側

#### 新しいヘルパー関数
- `getSelectedConditionsWithFrequency()`: 条件と頻度の組み合わせを取得
- `updateConditionFrequency()`: 特定条件の頻度を更新
- `updateConditions()`: 条件の追加/削除（頻度付き）

### サーバー側

#### 新しいメソッド
- `parseConditions()`: 旧形式・新形式の条件データを解析
- `shouldCheckCondition()`: 条件ごとの頻度に基づくチェック判定

#### 更新されたロジック
- 通知処理時に各条件を個別に評価
- 条件ごとの頻度設定に基づくタイミング制御

## 後方互換性

- 既存の通知設定は自動的に新形式に変換
- 旧形式のデータも引き続き動作
- 段階的な移行が可能

## 通知メッセージ

### メッセージ形式

通知が送信される際、メッセージには設定された頻度情報が含まれます。

```
{銘柄名} shows {条件名} pattern - signal detected (通知頻度: {頻度})
```

### 例

- **1分ごと**: `AAPL shows GreaterThan pattern - signal detected (通知頻度: 1分ごと)`
- **10分ごと**: `GOOGL shows LessThan pattern - signal detected (通知頻度: 10分ごと)`
- **1時間ごと**: `MSFT shows Pattern pattern - signal detected (通知頻度: 1時間ごと)`
- **取引開始時のみ**: `TSLA shows Pattern pattern - signal detected (通知頻度: 取引開始時のみ)`

これにより、受信した通知がどの頻度設定で送信されたかを確認することができます。

## 使用例

### 買い条件の設定例
```
指定価格を上回る: 1分ごと
赤三兵: 取引開始時のみ
```

### 売り条件の設定例  
```
指定価格を下回る: 10分ごと
陰の三つ星: 1時間ごと
```

この機能により、価格チェックは頻繁に、パターン認識は適度な頻度で実行するなど、条件の性質に応じた最適な通知設定が可能になります。

## 条件ごとの時間枠設定機能 (新機能)

### 概要

各条件で独立してローソク足の時間枠（タイムフレーム）を設定できる機能です。通知頻度とは別に、条件チェックに使用するローソク足データの時間枠を指定できます。

### 利用可能な時間枠

#### 分足
- **1分**: `'1'` - 最も細かい時間枠、リアルタイム性重視
- **3分**: `'3'` - 短期トレンド把握
- **5分**: `'5'` - 一般的な短期分析
- **15分**: `'15'` - 中期トレンド分析
- **30分**: `'30'` - 半時間足
- **45分**: `'45'` - 45分足

#### 時間足
- **1時間**: `'60'` - 時間足の基本
- **2時間**: `'120'` - 中期トレンド
- **3時間**: `'180'` - 3時間足
- **4時間**: `'240'` - 4時間足

#### 日足・週足・月足
- **日足**: `'D'` - 長期トレンド分析
- **週足**: `'W'` - 週次トレンド
- **月足**: `'M'` - 月次トレンド

### 使用例

#### パターン条件での活用
```
三川明けの明星: 日足で判定、取引開始時のみ通知
赤三兵: 1時間足で判定、1時間ごと通知
```

#### 価格条件での活用
```
指定価格を上回る: 1分足で判定、1分ごと通知
指定価格を下回る: 5分足で判定、10分ごと通知
```

### 利点

1. **条件に適した時間枠**: パターン条件は長期時間枠、価格条件は短期時間枠など適切な設定が可能
2. **ノイズ軽減**: 長期時間枠を使用することで短期的な価格変動ノイズを除去
3. **柔軟な分析**: 同じ銘柄でも異なる時間枠で複数の条件を設定可能
4. **通知頻度との分離**: 通知のタイミングと分析の時間枠を独立して設定

### データ形式

```json
{
  "conditions": "[{\"type\":\"GreaterThan\",\"frequency\":\"MinuteLevel\",\"timeframe\":\"1\"},{\"type\":\"SansenAkenomyojo\",\"frequency\":\"ExchangeStartOnly\",\"timeframe\":\"D\"}]"
}
```

### 後方互換性

- 既存の条件設定は自動的に1分足（`'1'`）に設定
- timeframeが指定されていない条件は1分足で動作