# AdminManagementWithCache Component

## 概要 (Overview)

`AdminManagementWithCache` は、`AdminManagement` コンポーネントを拡張した管理画面用のコンポーネントです。Refresh ボタン押下時にキャッシュを同期する機能を追加しています。

## 特徴

- `AdminManagement` のすべての機能を保持
- Refresh ボタン押下時にキャッシュ同期を実行可能
- `onRefresh` プロパティを通じて、カスタムのリフレッシュ処理を追加可能

## 使用方法

### 基本的な使い方

```typescript
import AdminManagementWithCache from '@/app/components/admin/AdminManagementWithCache';
import ExchangeFetchService from '@/services/exchange/ExchangeFetchService.client';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';

export default function ExchangesPage() {
    const exchangeFetchService = new ExchangeFetchService();

    const fetchData = async (): Promise<ExchangeDataType[]> => {
        return await exchangeFetchService.get();
    };

    const onRefresh = async (): Promise<void> => {
        // Refresh ボタン押下時にキャッシュを同期
        await exchangeFetchService.syncCache();
    };

    return (
        <AdminManagementWithCache<ExchangeDataType>
            columns={columns}
            fetchData={fetchData}
            itemName='Exchange'
            defaultItem={defaultItem}
            validateItem={validateItem}
            onCreate={onCreate}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onRefresh={onRefresh}  // キャッシュ同期処理を指定
        >
            {(item, _, onItemChange) => (
                <ExchangeEditDialogContent item={item} onItemChange={onItemChange} />
            )}
        </AdminManagementWithCache>
    );
}
```

## プロパティ

`AdminManagementWithCache` は `AdminManagement` のすべてのプロパティに加えて、以下のプロパティを追加しています：

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `onRefresh` | `() => Promise<void>` | No | Refresh ボタン押下時に実行される処理。通常は `syncCache()` を呼び出す |

その他のプロパティは `AdminManagement` と同じです：

- `columns`: テーブルのカラム定義
- `loading`: ローディング状態
- `fetchData`: データ取得関数
- `itemName`: アイテム名（ダイアログタイトルなどで使用）
- `defaultItem`: デフォルトのアイテム
- `validateItem`: バリデーション関数
- `onCreate`: 作成処理
- `onUpdate`: 更新処理
- `onDelete`: 削除処理
- `children`: 編集ダイアログの内容をレンダリングする関数

## Refresh ボタンの動作

Refresh ボタンを押すと、以下の順序で処理が実行されます：

1. `onRefresh` が提供されている場合、それを実行（キャッシュ同期）
2. `fetchData` を実行してデータを再取得
3. テーブルを最新のデータで更新

これにより、サーバー側のキャッシュを最新化してから、最新のデータを表示することができます。

## 使用例

以下の管理画面で使用されています：

- **Exchange 管理画面** (`/app/exchanges/page.tsx`)
  - Exchange データのキャッシュを同期
  
- **Ticker 管理画面** (`/app/tickers/page.tsx`)
  - Ticker データのキャッシュを同期
  
- **MyTicker 管理画面** (`/app/myticker/page.tsx`)
  - MyTicker データのキャッシュを同期
  
- **FinanceNotification 管理画面** (`/app/finance-notification/page.tsx`)
  - FinanceNotification データのキャッシュを同期

## 実装の背景

このコンポーネントが作成された理由：

1. `AdminManagement` は `nextjs-common` サブモジュール（共有ライブラリ）にあり、直接変更できない
2. キャッシュ同期機能を追加するために、ローカルでラッパーコンポーネントを作成
3. 元の `AdminManagement` の機能をすべて保持しつつ、`onRefresh` フックを追加

## 関連ドキュメント

- [Sync Cache API ドキュメント](../../../docs/finance/sync-cache-api.md)
- [AdminManagement コンポーネント](../../../nextjs-common/common/components/admin/AdminManagement.tsx)
