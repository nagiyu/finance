# 条件システム

## 概要

条件システムは、様々な金融通知条件をチェックするためのモジュラーで拡張可能な方法を提供します。このシステムは、`ConditionService`によって管理される各条件タイプごとに個別の条件クラスを提供することで、関心事を分離します。

## アーキテクチャ

### 基本コンポーネント

#### ConditionBase
すべての条件が継承する抽象基底クラス。共通機能を提供し、一貫した実装パターンを保証します。

```typescript
abstract class ConditionBase {
  constructor(
    exchangeService: ExchangeService,
    tickerService: TickerService
  );

  abstract checkCondition(
    exchangeId: string,
    tickerId: string,
    session?: ExchangeSessionType,
    targetPrice?: number | null,
    timeframe?: TimeFrame | null
  ): Promise<boolean>;

  // データアクセス用のヘルパーメソッド
  protected getStockPriceData(exchangeId: string, tickerId: string, options?: GetStockPriceDataOptions): Promise<any>;
  protected getCurrentStockPrice(exchangeId: string, tickerId: string, session?: string): Promise<number | null>;
}
```

#### ConditionInfo
各条件のメタデータを定義するインターフェース：

```typescript
interface ConditionInfo {
  name: string;                    // 人間が読める名前
  description: string;             // 詳細な説明
  isBuyCondition: boolean;         // 買いシグナルかどうか
  isSellCondition: boolean;        // 売りシグナルかどうか
  enableTargetPrice: boolean;      // 目標価格が必要かどうか
  enableTimeFrame: boolean;        // 時間枠が設定可能かどうか
}
```

#### ConditionResult
条件チェックの結果を表すインターフェース：

```typescript
interface ConditionResult {
  met: boolean;     // 条件が満たされたかどうか
  message?: string; // 通知用のオプションメッセージ
}
```

### ConditionService

`ConditionService`はすべての条件を管理し、条件チェックのための統一されたインターフェースを提供します。

```typescript
const conditionService = new ConditionService(exchangeService, tickerService);

// 条件をチェック
const result = await conditionService.checkCondition(
  conditionName,
  exchangeId,
  tickerId,
  session,
  targetPrice,
  frequency,
  timeframe
);
```

## 利用可能な条件

### 価格ベースの条件

#### GreaterThanCondition
現在の株価が指定された閾値より大きいかどうかをチェックします。
- 目標価格が必要
- すべての時間枠をサポート

#### LessThanCondition
現在の株価が指定された閾値より小さいかどうかをチェックします。
- 目標価格が必要
- すべての時間枠をサポート

### パターンベースの条件

#### SansenAkenomyojoCondition (三川明けの明星)
「明けの明星」パターンを検出 - 3本のローソク足による強気反転パターン：
1. 長い陰線
2. ギャップアップした小さな陽線
3. もう一つの陽線

このパターンは売り圧力が弱まり、買い圧力が強まっていることを示します。

#### SansenYoinomyojoCondition (三川宵の明星)
「宵の明星」パターンを検出 - 明けの明星と似ているが反転した弱気反転パターン。

## 新しい条件の作成

新しい条件を追加するには：

1. `ConditionBase`を継承する新しいクラスを作成
2. メタデータを含む`ConditionInfo`オブジェクトをエクスポート
3. `checkCondition`メソッドを実装
4. `ConditionService.conditionMap`に条件を追加
5. このドキュメントを更新

例：

```typescript
export const MyPatternConditionInfo: ConditionInfo = {
  name: 'マイパターン',
  description: 'パターンの説明...',
  isBuyCondition: true,
  isSellCondition: false,
  enableTargetPrice: false,
  enableTimeFrame: true,
};

export default class MyPatternCondition extends ConditionBase {
  async checkCondition(
    exchangeId: string,
    tickerId: string,
    session?: ExchangeSessionType,
    targetPrice?: number | null,
    timeframe?: TimeFrame | null
  ): Promise<boolean> {
    try {
      const stockData = await this.getStockPriceData(exchangeId, tickerId, {
        count: 3,
        session,
        timeframe: timeframe || '1'
      });

      if (!stockData || stockData.length < 3) {
        return false;
      }

      // パターン検出ロジックを実装
      return this.detectPattern(stockData);
    } catch (error) {
      console.error('パターンチェックエラー:', error);
      return false;
    }
  }
}
```

## FinanceNotificationServiceとの統合

`FinanceNotificationService`は`ConditionService`を使用して条件をチェックします：

1. **タイミングフィルター**: 頻度制約に基づいて条件をフィルタリング
2. **並列実行**: `Promise.allSettled()`を使用してすべての条件を同時にチェック
3. **結果処理**: 最初に満たされた条件を見つけるために結果を処理
4. **通知**: 条件が満たされた場合、プッシュ通知が送信

## 利点

- **関心事の分離**: 各条件タイプが専用のクラスを持つ
- **拡張性**: コアサービスを変更せずに新しい条件タイプを簡単に追加
- **テスト性**: 個別の条件を分離してテスト可能
- **保守性**: 条件ロジックが整理され、保守しやすい
- **一貫性**: 標準化されたインターフェースにより条件間の一貫した動作を保証
- **パフォーマンス**: 並列実行により全体的な条件チェック時間を短縮
- **柔軟性**: 設定可能なパラメータを持つ価格ベースとパターンベース両方の条件をサポート