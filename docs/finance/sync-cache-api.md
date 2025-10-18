# キャッシュ同期 API (Sync Cache API)

## 概要 (Overview)

各サービス (Exchange, Ticker, MyTicker, FinanceNotification) でキャッシュを同期するためのAPIです。

`CRUDServiceBase` が提供する `syncCache()` メソッドを呼び出し、データベースから最新のデータを取得してキャッシュを更新します。

---

## API エンドポイント

### 1. Exchange キャッシュ同期

**Endpoint:** `POST /api/exchange/sync-cache`

**認証:** Admin権限が必要

**説明:** Exchangeサービスのキャッシュをデータベースの最新データで同期します。

**リクエスト例:**
```bash
curl -X POST https://your-app.com/api/exchange/sync-cache \
  -H "Cookie: next-auth.session-token=..."
```

**レスポンス:**
```json
{
  "success": true
}
```

---

### 2. Ticker キャッシュ同期

**Endpoint:** `POST /api/ticker/sync-cache`

**認証:** Admin権限が必要

**説明:** Tickerサービスのキャッシュをデータベースの最新データで同期します。

**リクエスト例:**
```bash
curl -X POST https://your-app.com/api/ticker/sync-cache \
  -H "Cookie: next-auth.session-token=..."
```

**レスポンス:**
```json
{
  "success": true
}
```

---

### 3. MyTicker キャッシュ同期

**Endpoint:** `POST /api/myticker/sync-cache`

**認証:** User権限が必要

**説明:** MyTickerサービスのキャッシュをデータベースの最新データで同期します。

**リクエスト例:**
```bash
curl -X POST https://your-app.com/api/myticker/sync-cache \
  -H "Cookie: next-auth.session-token=..."
```

**レスポンス:**
```json
{
  "success": true
}
```

---

### 4. FinanceNotification キャッシュ同期

**Endpoint:** `POST /api/finance-notification/sync-cache`

**認証:** User権限が必要

**説明:** FinanceNotificationサービスのキャッシュをデータベースの最新データで同期します。

**リクエスト例:**
```bash
curl -X POST https://your-app.com/api/finance-notification/sync-cache \
  -H "Cookie: next-auth.session-token=..."
```

**レスポンス:**
```json
{
  "success": true
}
```

---

## 使用方法

### クライアント側での呼び出し

#### FetchServiceを使用した呼び出し（推奨）

```typescript
import ExchangeFetchService from '@/services/exchange/ExchangeFetchService.client';
import TickerFetchService from '@/services/ticker/TickerFetchService.client';
import MyTickerFetchService from '@/services/myticker/MyTickerFetchService.client';
import FinanceNotificationFetchService from '@/services/financeNotification/FinanceNotificationFetchService.client';

// Exchange キャッシュ同期
const exchangeFetchService = new ExchangeFetchService();
await exchangeFetchService.syncCache();

// Ticker キャッシュ同期
const tickerFetchService = new TickerFetchService();
await tickerFetchService.syncCache();

// MyTicker キャッシュ同期
const myTickerFetchService = new MyTickerFetchService();
await myTickerFetchService.syncCache();

// FinanceNotification キャッシュ同期
const financeNotificationFetchService = new FinanceNotificationFetchService();
await financeNotificationFetchService.syncCache();
```

#### AdminManagement コンポーネントでの使用

管理画面コンポーネント（`AdminManagement`）では、`onRefresh` プロパティを使用して Refresh ボタン押下時にキャッシュ同期を実行できます：

```typescript
import AdminManagement from '@client-common/components/admin/AdminManagement';
import ExchangeFetchService from '@/services/exchange/ExchangeFetchService.client';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';

export default function ExchangesPage() {
    const exchangeFetchService = new ExchangeFetchService();

    const fetchData = async (): Promise<ExchangeDataType[]> => {
        return await exchangeFetchService.get();
    };

    const onRefresh = async (): Promise<void> => {
        await exchangeFetchService.syncCache();
    };

    return (
        <AdminManagement<ExchangeDataType>
            columns={columns}
            fetchData={fetchData}
            onRefresh={onRefresh}
            // ... その他のプロパティ
        />
    );
}
```

このように設定すると、Refresh ボタンを押した時に以下の処理が実行されます：
1. `onRefresh` が呼ばれ、`syncCache()` でキャッシュを最新化
2. その後 `fetchData` が呼ばれ、最新のデータを取得して画面を更新

#### 直接fetchを使用した呼び出し（非推奨）

```typescript
// Exchange キャッシュ同期
const response = await fetch('/api/exchange/sync-cache', {
  method: 'POST',
});

if (response.ok) {
  console.log('Exchange cache synced successfully');
}
```

---

## 仕組み

### CRUDServiceBase.syncCache()

各サービスは `CRUDServiceBase` を継承しており、以下のような `syncCache()` メソッドを持っています：

```typescript
// typescript-common/common/services/CRUDServiceBase.ts
public async syncCache(): Promise<void> {
  if (!this.useCache) {
    return;
  }

  const data = await this.dataAccessor.get();
  const mappedData = data.map(this.recordToData);

  CacheUtil.set(this.cacheKey, mappedData);
}
```

このメソッドは：
1. キャッシュが有効かチェック (`useCache`)
2. データベースから最新のレコードを取得 (`dataAccessor.get()`)
3. レコードをデータ型に変換 (`recordToData`)
4. キャッシュに保存 (`CacheUtil.set`)

---

## いつ使用するか

キャッシュ同期APIは、以下のような場合に使用します：

### 1. データの整合性が必要な時
- 外部からデータベースが直接更新された場合
- 複数のサーバーインスタンス間でキャッシュを同期したい場合

### 2. 定期的なキャッシュ更新
- スケジュールされたバッチ処理でキャッシュを更新
- 一定時間ごとにキャッシュをリフレッシュ

### 3. 手動でのキャッシュリフレッシュ
- 管理画面からの手動トリガー
  - Exchange、Ticker、MyTicker、FinanceNotification 管理画面の Refresh ボタン押下で自動的にキャッシュ同期が実行されます
  - Refresh ボタン押下時、`syncCache()` API が呼ばれてキャッシュが最新化され、その後データが再取得されます
- デバッグやメンテナンス作業

---

## 権限

| エンドポイント | 必要な権限 | 理由 |
|--------------|----------|------|
| `/api/exchange/sync-cache` | Admin | 取引所データは管理者のみが管理 |
| `/api/ticker/sync-cache` | Admin | ティッカーデータは管理者のみが管理 |
| `/api/myticker/sync-cache` | User | 個人のティッカーリストはユーザー自身が管理 |
| `/api/finance-notification/sync-cache` | User | 通知設定はユーザー自身が管理 |

---

## エラーハンドリング

### 認証エラー (401 Unauthorized)

```json
{
  "error": "Unauthorized"
}
```

ユーザーが適切な権限を持っていない場合に返されます。

### その他のエラー

キャッシュ同期中にエラーが発生した場合、適切なHTTPステータスコードとエラーメッセージが返されます。

---

## パフォーマンス考慮事項

### キャッシュサイズ
- 大量のデータをキャッシュする場合、メモリ使用量に注意
- 必要に応じてキャッシュのTTL（有効期限）を設定

### 同期頻度
- 頻繁な同期はデータベース負荷を増加させる可能性がある
- 適切な同期間隔を設定することを推奨

---

## 関連ドキュメント

- [CRUDServiceBase 実装](../../common/README.md#data-access-foundation)
- [キャッシュ機能](../../common/README.md#cacheutil)
- [Finance Module Overview](../README.md)
- [API Documentation](./client/README.md#api-integration)
