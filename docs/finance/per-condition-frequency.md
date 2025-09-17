# 条件ごとの通知頻度設定機能

## 概要

Finance Notification システムで、各条件ごとに通知頻度を個別に設定できる機能です。従来は通知全体で一つの頻度設定でしたが、条件の種類に応じてより柔軟な頻度設定が可能になりました。

## 機能詳細

### 対応条件タイプ

#### 価格条件
- **指定価格を上回る (GREATER_THAN)**
- **指定価格を下回る (LESS_THAN)**

#### パターン条件
- **赤三兵 (THREE_RED_SOLDIERS)**
- **三川明けの明星 (THREE_RIVER_EVENING_STAR)**
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