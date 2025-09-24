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

#### SanzonCondition (三尊)
「三尊（Head and Shoulders）」パターンを検出 - 上昇トレンドの終盤に現れやすい弱気反転パターン：
1. 左肩：最初の上昇ピーク
2. 頭：中央で最も高いピーク
3. 右肩：再び上昇するが頭を超えられないピーク（左肩と類似の高さ）
4. ネックライン：山と山の間の安値を結んだライン

このパターンは価格がネックラインを下抜けることで下落トレンド入りのシグナルとされます。

**厳格な検証基準：**
- **肩の対称性**: 左肩と右肩の価格差は15%以内
- **谷の深さ**: 各谷は隣接するピークより少なくとも2%低い（現実的な市場条件に対応）
- **谷の一貫性**: 2つの谷の価格差は5%以内
- **ネックライン突破の確認**: 直近3本のローソク足のうち少なくとも2本がネックラインを下回って終値を付ける

#### DoubleTopCondition (ダブルトップ)
「ダブルトップ」パターンを検出 - 上昇トレンドの終盤に現れやすい弱気反転パターン：
1. 1つ目の山（トップ）：上昇トレンドの勢いで高値をつける
2. 押し目（谷）：一度下落して安値を形成する（これがネックラインの基準）
3. 2つ目の山（トップ）：再び反発するが、1つ目とほぼ同水準で高値止まり
4. ネックライン割れ：谷の安値（ネックライン）を明確に下抜けた時点で「ダブルトップ完成」

### ヘッジ戦略ベースの条件

#### BearCollarCondition (ベアコラッグ)
「ベアコラッグ（Bear Collar）」戦略の条件を検出 - 保有株式のリスクヘッジ機会を検出：

**戦略概要：**
- 保有株式（ロングポジション）
- プット購入による下値リスク限定
- コール売却による上値利益制限とプレミアム収入

**検出条件：**
1. **高ボラティリティ**：直近20期間の価格変動係数が2%以上
2. **目標価格接近**：現在価格が設定価格の5%以内
3. **下落圧力または境界接近**：
   - 直近5期間中3期間以上が陰線、または
   - 直近10期間の価格レンジで上下20%の境界に接近

**適用場面：**
- 市場ボラティリティが高い時期
- 保有株の利益を保護したい場合
- オプションプレミアムでヘッジコストを抑制したい場合

**注意事項：**
- 売り条件として分類（リスクヘッジのタイミング）
- 目標価格の設定が必要（プット行使価格またはコール行使価格）
- 時間枠の設定が可能

このパターンは2つの山がほぼ同じ水準で形成され、ネックラインを下抜けることで下落トレンドへの転換シグナルとされます。下落目標値は「高値とネックラインの差」を下方向に見込むことが多いです。

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

## リアルタイム条件評価

### ホームページでの条件表示

ホームページでは、目標価格が不要な条件（`enableTargetPrice: false`）の評価結果をリアルタイムで表示します。

#### 新機能: 全条件表示

**`/api/finance-notification/conditions/all`**

指定されたExchange、Ticker、時間軸、セッションに対して評価可能な全ての条件をチェックし、適用状況を表示します。

```typescript
// リクエストパラメータ
{
  exchangeId: string;
  tickerId: string;
  timeframe?: string;
  session?: string;
}

// レスポンス
{
  conditions: [
    {
      key: string;
      name: string;
      description: string;
      isBuyCondition: boolean;
      isSellCondition: boolean;
      isMet: boolean;
    }
  ]
}
```

#### 条件表示の特徴

- **全条件表示**: 適用中・適用外問わず全ての条件を表示
- **視覚的区別**: 適用中の条件は●、適用外の条件は○で表示し、適用外の条件は薄い色で表示
- **インタラクティブ**: 各条件をクリックするとダイアログで詳細情報を表示
- **グループ化**: 買いシグナルと売りシグナルに分けて表示

#### API エンドポイント

**`/api/finance-notification/conditions/check`**

指定されたExchange、Ticker、時間軸、セッションに対して評価可能な条件をチェックします。

```typescript
// リクエストパラメータ
{
  exchangeId: string;
  tickerId: string;
  timeframe?: string;
  session?: string;
}

// レスポンス
{
  conditions: [
    {
      name: string;
      key: string;
      isBuyCondition: boolean;
      isSellCondition: boolean;
    }
  ]
}
```

#### ConditionService の拡張

`ConditionService` に `getEvaluableConditionList()` メソッドを追加し、目標価格が不要な条件一覧を取得できるようになりました。

```typescript
public getEvaluableConditionList(): string[] {
  return Object.entries(this.conditionMap)
    .filter(([, value]) => !value.info.enableTargetPrice)
    .map(([key]) => key);
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