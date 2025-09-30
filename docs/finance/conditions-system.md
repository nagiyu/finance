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

#### BullFlagCondition (ブルフラッグ)
「ブルフラッグ」パターンを検出 - 上昇トレンドの継続を示す強気パターン：

**構成の特徴：**
1. **フラッグポール（旗竿部分）**：株価が短期間で急騰する部分（強い買いの勢いを示す）
2. **フラッグ（旗部分）**：上昇後に現れる、やや下向きまたは横ばいの調整局面
3. **ブレイクアウト**：調整後に再度上昇し、フラッグの上限を突破

**検出条件：**
- **フラッグポール**: 少なくとも3%以上の価格上昇を3-8本のローソク足で実現
- **フラッグ形成**: フラッグポール後に3-8本のローソク足で小幅な調整（1-5%の値幅）
- **ブレイクアウト確認**: フラッグ上限を0.5%以上上抜けし、終値でも上限を超える

**価格例：**
- フラッグポール: 1000円 → 1300円（300円の上昇）
- フラッグ形成: 1300円 → 1250円 → 1270円（小幅な戻し）
- ブレイク後の目標: 1270円 + 300円 = 1570円

このパターンは上昇トレンドの一時的な休息を示し、その後の継続的な上昇を予測します。

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

#### GyakusanzonCondition (逆三尊)
「逆三尊（Inverse Head and Shoulders）」パターンを検出 - 下落トレンドの終盤に現れやすい強気反転パターン：
1. 左肩：最初の下落谷（底）
2. 頭：中央で最も深い谷（底）
3. 右肩：再び下落するが頭を超えず、左肩と類似の深さで止まる谷（底）
4. ネックライン：谷と谷の間の高値を結んだライン

このパターンは価格がネックラインを上抜けることで上昇トレンド入りのシグナルとされます。

**厳格な検証基準：**
- **肩の対称性**: 左肩と右肩の価格差は15%以内
- **山の高さ**: 各山は隣接するボトムより少なくとも2%高い（現実的な市場条件に対応）
- **山の一貫性**: 2つの山の価格差は5%以内
- **ネックライン突破の確認**: 直近3本のローソク足のうち少なくとも2本がネックラインを上回って終値を付ける

**価格例：**
- 左肩：1000円 → 900円 → 950円
- 頭：950円 → 800円 → 950円
- 右肩：950円 → 880円 → 950円
- ネックライン：950円付近を上抜けて強気転換シグナル

#### DoubleTopCondition (ダブルトップ)
「ダブルトップ」パターンを検出 - 上昇トレンドの終盤に現れやすい弱気反転パターン：
1. 1つ目の山（トップ）：上昇トレンドの勢いで高値をつける
2. 押し目（谷）：一度下落して安値を形成する（これがネックラインの基準）
3. 2つ目の山（トップ）：再び反発するが、1つ目とほぼ同水準で高値止まり
4. ネックライン割れ：谷の安値（ネックライン）を明確に下抜けた時点で「ダブルトップ完成」

#### RisingDoubleBottomCondition (切り上げダブルボトム)
「切り上げダブルボトム」パターンを検出 - 下降トレンドの底値圏で出現する強気反転パターン：
1. **1回目の底（ボトムA）**：下落トレンドの中で安値を付ける
2. **一度の反発**：そこから一定の戻り（ネックライン候補）をつける
3. **2回目の底（ボトムB）**：再び下げるが、1回目の安値よりも高い位置で反発（「切り上げ」ポイント）
4. **ネックライン突破**：戻り高値（ネックライン）を出来高を伴って上抜けると買いシグナル

**検出条件：**
- **切り上げ特徴**: 2回目の底が1回目より0.5%〜10%高い位置にある
- **ネックライン形成**: 2つの底の間のピークが両底より少なくとも3%高い
- **突破確認**: 直近2-3本のローソク足がネックラインを上抜けて終値を付ける

**価格例：**
- 1回目の底：1,000円で底を付ける
- 反発：1,200円まで戻す（ネックライン候補）
- 2回目の底：1,050円で下げ止まる（1回目より高い）
- 突破：1,200円を上抜けて切り上げダブルボトム完成

#### RisingWedgeCondition (上昇ウェッジ)
「上昇ウェッジ（Rising Wedge）」パターンを検出 - 上昇相場の天井近くに現れやすい弱気反転パターン：

**構成の特徴：**
1. **トレンド方向**: 直前のトレンドは「上昇」が多い（上昇相場の天井近くに出やすい）
2. **ラインの形**:
   - 高値を結んだトレンドライン：緩やかに上昇
   - 安値を結んだトレンドライン：より急角度で上昇
   - 2本のラインが収束していく先細りの「くさび型（ウェッジ）」を形成
3. **出来高**: ウェッジ形成中は出来高が減少する傾向

**検出条件：**
- **高値・安値の上昇**: 両方のトレンドラインが正の傾きを持つ
- **収束性**: 安値ラインの上昇角度が高値ラインより急で、価格幅が狭まっている（スプレッド分析と線形回帰による傾き検証を組み合わせて判定）
- **ブレイクダウン確認**: 安値トレンドラインを下抜けし、直近3本以上のローソク足で確認される（うち少なくとも1本は明確な下抜け）

**検出アルゴリズム：**
1. **スイング高値・安値の抽出**: 周辺のローソク足と比較して相対的な高値・安値を識別
2. **トレンドライン計算**: 線形回帰を用いて上限・下限のトレンドラインを算出
3. **収束判定**: スプレッドの縮小と傾きの関係を複合的に評価（急激な収束から緩やかな収束まで対応）
4. **サポートレベル算出**: トレンドラインまたは直近安値の平均から動的に計算
5. **ブレイクダウン検証**: サポートレベルを下回る持続的な価格推移を確認

**価格例：**
- 高値の推移：1000円 → 1050円 → 1080円（伸びが鈍化）
- 安値の推移：950円 → 1000円 → 1040円（依然として強い上昇角度）
- 結果：先細りの形を作り、その後安値ラインを下抜けして900円台に下落

#### AscendingTriangleCondition (アセンディング・トライアングル)
「アセンディング・トライアングル（Ascending Triangle）」パターンを検出 - 上昇型三角持ち合いと呼ばれる強気継続パターン：

**構成の特徴：**
1. **水平の上値抵抗線（Resistance Line）**: 高値がほぼ同じ価格で頭打ちになるライン
2. **上昇する下値支持線（Rising Support Line）**: 安値が徐々に切り上がっていくライン
3. **収束点（Apex）**: 上値抵抗線と下値支持線が交わる点
4. **ブレイクアウト（Breakout）**: 価格が上値抵抗線を突破すると強い上昇トレンドが期待される

**検出条件：**
- **水平抵抗線**: 複数の高値が2%以内の価格帯で形成される
- **上昇支持線**: 安値が段階的に切り上がっている（正の傾きを持つ）
- **パターン収束**: 抵抗線と支持線の価格幅が時間と共に狭まっている
- **ブレイクアウト確認**: 直近3本のローソク足で高値が抵抗線を超え、終値でも抵抗線を上抜ける

**価格例：**
- 上値抵抗線：1500円前後で複数回跳ね返る
- 下値支持線：1400円 → 1420円 → 1450円と段階的に上昇
- 結果：1500円を突破後、目標値1600円（抵抗線＋三角形の高さ）を目指す

**パターンの意味：**
- 買い勢力が徐々に強まっていることを示す
- 売り勢力は一定の価格で抑えているが、下値が切り上がることで最終的に上に抜けやすい
- 上方向への強気継続パターンとして機能

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

## テスト構造

### 条件別テストファイル

各条件タイプは専用のテストファイルに分離されており、保守性とテスト性を向上させています：

```
finance/tests/conditions/
├── GreaterThanCondition.test.ts      # 指定価格を上回る
├── LessThanCondition.test.ts         # 指定価格を下回る  
├── SansenAkenomyojoCondition.test.ts # 三川明けの明星
├── SansenYoinomyojoCondition.test.ts # 三川宵の明星
├── SanzonCondition.test.ts           # 三尊
├── GyakusanzonCondition.test.ts      # 逆三尊
├── DoubleTopCondition.test.ts        # ダブルトップ
├── RisingDoubleBottomCondition.test.ts # 切り上げダブルボトム
├── BearCollarCondition.test.ts       # ベアコラッグ
├── RisingWedgeCondition.test.ts      # 上昇ウェッジ
└── AscendingTriangleCondition.test.ts # アセンディング・トライアングル
```

### テストの特徴

- **分離されたテスト**: 各条件に特化したテストケース
- **包括的カバレッジ**: 正常系・異常系・境界値のテストを含む
- **モック使用**: `FinanceUtilMock` を使用した予測可能なテスト環境
- **一貫した構造**: 全テストファイルで統一されたテストパターン

### テスト内容

各条件テストには以下が含まれます：

1. **サービス登録テスト**: 買い・売り条件リストへの登録確認
2. **条件情報テスト**: メタデータの正確性確認
3. **条件クラステスト**: 正しいクラスインスタンスの取得確認
4. **条件ロジックテスト**: 実際の条件チェック動作の検証

## 利点

- **関心事の分離**: 各条件タイプが専用のクラスを持つ
- **拡張性**: コアサービスを変更せずに新しい条件タイプを簡単に追加
- **テスト性**: 個別の条件を分離してテスト可能
- **保守性**: 条件ロジックが整理され、保守しやすい
- **一貫性**: 標準化されたインターフェースにより条件間の一貫した動作を保証
- **パフォーマンス**: 並列実行により全体的な条件チェック時間を短縮
- **柔軟性**: 設定可能なパラメータを持つ価格ベースとパターンベース両方の条件をサポート