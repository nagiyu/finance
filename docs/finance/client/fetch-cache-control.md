# Fetch キャッシュ制御 (Fetch Cache Control)

## 概要 (Overview)

管理画面コンポーネントにおいて、常に最新のデータを取得できるようにするため、すべての fetch 操作でブラウザキャッシュを無効化しています。

---

## 背景 (Background)

従来、ブラウザのデフォルト動作により、GET リクエストの結果がキャッシュされる可能性がありました。これにより、管理画面でデータを更新しても、古いキャッシュデータが表示される問題が発生する場合がありました。

---

## 実装 (Implementation)

### 対象サービス

以下のすべてのサービスで `cache: 'no-store'` オプションを使用してキャッシュを無効化しています：

#### 管理画面用サービス
- **ExchangeFetchService**: 取引所データの取得
- **TickerFetchService**: ティッカーデータの取得
- **FinanceNotificationFetchService**: 金融通知データの取得
- **MyTickerFetchService**: マイティッカーデータの取得

#### 条件管理サービス
- **FinanceNotificationConditionFetchService**: 通知条件の取得
- **ConditionCheckService**: 条件チェックの実行
- **AllConditionsService**: すべての条件情報の取得

#### 認証サービス
- **AuthAPIUtil**: 認証状態の確認

### コード例

```typescript
// ExchangeFetchService.client.ts
public async get(): Promise<ExchangeDataType[]> {
  try {
    const response = await fetch(this.endpoint, {
      method: 'GET',
      cache: 'no-store'  // キャッシュを無効化
    });

    this.validateResponse(response);
    return await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ErrorUtil.throwError(`Error getting data from ${this.endpoint}: ${errorMessage}`);
  }
}
```

---

## 効果 (Benefits)

### 管理画面での利点

1. **データの整合性**: 常に最新のデータが表示される
2. **ユーザー体験の向上**: データ更新後、即座に変更が反映される
3. **デバッグの容易性**: キャッシュによる予期しない動作を防ぐ

### 対象ページ

- `/exchanges` - 取引所管理画面
- `/tickers` - ティッカー管理画面
- `/finance-notification` - 金融通知管理画面
- `/myticker` - マイティッカー管理画面

---

## 技術詳細 (Technical Details)

### Fetch API のキャッシュオプション

```typescript
interface RequestInit {
  cache?: RequestCache;
}

type RequestCache = 
  | "default"      // ブラウザのデフォルト動作
  | "no-store"     // キャッシュを使用せず、常にサーバーからデータを取得
  | "reload"       // キャッシュをバイパスして取得し、結果をキャッシュに保存
  | "no-cache"     // サーバーで検証してからキャッシュを使用
  | "force-cache"  // 常にキャッシュを使用
  | "only-if-cached"; // オフライン時のみキャッシュを使用
```

本実装では `cache: 'no-store'` を使用することで、以下を実現しています：

- ブラウザキャッシュを完全にバイパス
- 常にサーバーから最新データを取得
- 取得したデータをキャッシュに保存しない

---

## パフォーマンスへの影響 (Performance Impact)

### トレードオフ

**メリット:**
- データの鮮度が保証される
- 管理操作の即時反映

**デメリット:**
- ネットワークトラフィックの増加
- 初回表示までの時間が若干増加する可能性

### 最適化

管理画面は頻繁にアクセスされるページではないため、パフォーマンスへの影響は最小限です。ユーザー向けの主要ページ（ホームページなど）では、必要に応じて異なるキャッシュ戦略を使用できます。

---

## 関連ドキュメント (Related Documentation)

- [Client README](./README.md)
- [Finance Module Overview](../README.md)
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

---

## 変更履歴 (Change History)

### 2025-10-10
- 初版作成
- 全管理画面サービスにキャッシュ無効化を実装
