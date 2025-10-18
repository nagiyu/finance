# 認可基盤の実装状況

## 概要

`authorization-architecture.md` のフェーズ1に基づいて、認可基盤の実装を完了しました。

## 実装完了項目

### 1. 型定義の追加 ✅

**ファイル**: `client/finance/types/AuthorizationTypes.ts`

以下の型とenumを定義：
- `Feature`: アプリケーションの機能を定義
- `PermissionLevel`: 権限レベル（NONE, VIEW, EDIT, DELETE, ADMIN）
- `UserType`: ユーザータイプ（GUEST, AUTHENTICATED, PREMIUM, ADMIN）
- `PermissionMatrix`: 権限マトリックスの型
- `PermissionMatrixRecord`: DynamoDB保存用のレコード型

### 2. PermissionMatrixService の実装 ✅

**ファイル**: `client/finance/services/auth/PermissionMatrixService.ts`

実装機能：
- `getPermissionMatrix()`: DBから権限マトリックスを取得、存在しない場合はデフォルトを返す
- `updatePermissionMatrix()`: 権限マトリックスを更新（DB保存）
- `getDefaultMatrix()`: デフォルトの権限設定を提供

**データアクセス**: `finance/services/PermissionMatrixDataAccessor.ts` を実装

### 3. AuthorizationService の実装 ✅

**ファイル**: `client/finance/services/auth/AuthorizationService.ts`

実装機能：
- `getUserType()`: セッションからユーザータイプを取得
- `hasPermission()`: ユーザータイプと機能に基づいて権限チェック
- `authorize()`: 現在のユーザーの権限をチェック
- `comparePermissionLevel()`: 権限レベルの階層比較

### 4. 権限チェックAPIの実装 ✅

**ファイル**: `client/finance/app/api/auth/check-permission/route.ts`

実装機能：
- POST `/api/auth/check-permission`: クライアントから権限チェックリクエストを受け付け
- 入力検証（Feature、PermissionLevel）
- 権限チェック結果を返却

### 5. 権限管理画面の実装 ✅

実装ファイル：
- `client/finance/app/permission-admin/page.tsx`: 権限管理ページ
- `client/finance/app/permission-admin/components/PermissionMatrixEditor.tsx`: 権限編集UI
- `client/finance/app/api/permission-matrix/route.ts`: 権限マトリックスのGET/PUT API

機能：
- 管理者のみアクセス可能
- 権限マトリックスの表形式での編集
- リアルタイムでの権限変更と保存

### 6. コンポーネントの実装 ✅

**ファイル**: `client/finance/app/components/FeatureGuard.tsx`

実装機能：
- 機能と権限レベルに基づいたコンポーネント表示制御
- 権限がない場合のフォールバック表示
- クライアントサイドでの権限チェック

### 7. 後方互換性の維持 ✅

**ファイル**: `client/finance/services/finance/FinanceAuthorizer.ts`

実装内容：
- 既存の`isAdmin()`、`isUser()`メソッドを維持
- 内部実装を新しい`AuthorizationService`に変更
- 既存コードへの影響を最小化

## ファイル構成

```
client/finance/
├── types/
│   └── AuthorizationTypes.ts              # ✅ 型定義
├── services/
│   └── auth/
│       ├── AuthorizationService.ts        # ✅ 認可サービス
│       ├── PermissionMatrixService.ts     # ✅ 権限マトリックス管理
│       └── FinanceAuthorizer.ts           # ✅ 既存（互換レイヤー）
├── app/
│   ├── components/
│   │   └── FeatureGuard.tsx              # ✅ 認可コンポーネント
│   ├── permission-admin/
│   │   ├── page.tsx                      # ✅ 権限管理画面
│   │   └── components/
│   │       └── PermissionMatrixEditor.tsx # ✅ 権限編集コンポーネント
│   └── api/
│       ├── auth/
│       │   └── check-permission/
│       │       └── route.ts              # ✅ 権限チェックAPI
│       └── permission-matrix/
│           └── route.ts                  # ✅ 権限マトリックスAPI

finance/
├── types/
│   └── FinanceRecordDataType.ts          # ✅ PermissionMatrix追加
└── services/
    └── PermissionMatrixDataAccessor.ts   # ✅ データアクセサー
```

## デフォルト権限設定

実装されているデフォルト権限：

| 機能 | GUEST | AUTHENTICATED | PREMIUM | ADMIN |
|------|-------|---------------|---------|-------|
| EXCHANGE | NONE | VIEW | VIEW | ADMIN |
| TICKER | NONE | VIEW | VIEW | ADMIN |
| MY_TICKER | NONE | EDIT | EDIT | ADMIN |
| FINANCE_NOTIFICATION | NONE | EDIT | EDIT | ADMIN |
| STOCK_CHART | NONE | VIEW | VIEW | ADMIN |
| TARGET_PRICE | NONE | VIEW | VIEW | ADMIN |
| PERMISSION_ADMIN | NONE | NONE | NONE | ADMIN |

## 使用方法

### サーバーサイド（API）での使用

```typescript
import AuthorizationService from '@/services/auth/AuthorizationService';
import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';

export async function GET() {
  // 閲覧権限チェック
  if (!await AuthorizationService.authorize(Feature.EXCHANGE, PermissionLevel.VIEW)) {
    return APIUtil.ReturnUnauthorized();
  }
  // ... 処理
}
```

### クライアントサイドでの使用

```typescript
import FeatureGuard from '@/app/components/FeatureGuard';
import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';

export default function MyPage() {
  return (
    <FeatureGuard feature={Feature.EXCHANGE} level={PermissionLevel.VIEW}>
      <div>権限がある場合のみ表示される内容</div>
    </FeatureGuard>
  );
}
```

### 既存コードとの互換性

```typescript
import FinanceAuthorizer from '@/services/finance/FinanceAuthorizer';

// 既存コードは変更なしで動作
const isAdmin = await FinanceAuthorizer.isAdmin();
const isUser = await FinanceAuthorizer.isUser();
```

## フェーズ2の実装状況

### ✅ 完了した移行

すべての既存APIルートを新しい`AuthorizationService`に移行しました。

#### 移行済みAPIルート

1. **Exchange API** (`Feature.EXCHANGE`)
   - GET `/api/exchange` - VIEW権限
   - POST `/api/exchange` - ADMIN権限
   - PUT `/api/exchange/[id]` - ADMIN権限
   - DELETE `/api/exchange/[id]` - ADMIN権限
   - POST `/api/exchange/sync-cache` - ADMIN権限

2. **Ticker API** (`Feature.TICKER`)
   - GET `/api/ticker` - VIEW権限
   - POST `/api/ticker` - ADMIN権限
   - PUT `/api/ticker/[id]` - ADMIN権限
   - DELETE `/api/ticker/[id]` - ADMIN権限
   - POST `/api/ticker/sync-cache` - ADMIN権限

3. **MyTicker API** (`Feature.MY_TICKER`)
   - GET `/api/myticker` - VIEW権限
   - POST `/api/myticker` - EDIT権限
   - GET `/api/myticker/[id]` - VIEW権限
   - PUT `/api/myticker/[id]` - EDIT権限
   - DELETE `/api/myticker/[id]` - EDIT権限
   - POST `/api/myticker/sync-cache` - EDIT権限

4. **FinanceNotification API** (`Feature.FINANCE_NOTIFICATION`)
   - GET `/api/finance-notification` - VIEW権限
   - POST `/api/finance-notification` - EDIT権限
   - GET `/api/finance-notification/[id]` - VIEW権限
   - PUT `/api/finance-notification/[id]` - EDIT権限
   - DELETE `/api/finance-notification/[id]` - EDIT権限
   - POST `/api/finance-notification/sync-cache` - EDIT権限
   - GET `/api/finance-notification/condition/[condition]` - VIEW権限
   - GET `/api/finance-notification/conditions/all` - VIEW権限
   - GET `/api/finance-notification/conditions/check` - VIEW権限
   - GET `/api/finance-notification/conditions/[mode]` - VIEW権限

5. **StockChart API** (`Feature.STOCK_CHART`)
   - POST `/api/candle-stick` - VIEW権限

6. **Layout** (`app/layout.tsx`)
   - メニュー表示制御を`AuthorizationService`に移行

### 後方互換性

- `FinanceAuthorizer.isAdmin()` と `FinanceAuthorizer.isUser()` は内部で `AuthorizationService` を使用する互換レイヤーとして維持
- `/api/auth/authorize/[role]` エンドポイントは互換性のため維持
- 既存コードは段階的に新しいシステムに移行可能

### ✅ クライアントコンポーネントの移行

すべての主要なクライアントコンポーネントを新しい認可システムに移行しました。

#### 移行済みコンポーネント

1. **usePermission フック** (`app/hooks/usePermission.ts`)
   - クライアントサイドで権限チェックを行うカスタムフック
   - 機能と権限レベルに基づいた権限確認
   - ローディング状態の管理

2. **ページコンポーネントの移行**
   - `app/page.tsx`: FeatureGuard を使用（Feature.STOCK_CHART、PermissionLevel.VIEW）
   - `app/exchanges/page.tsx`: FeatureGuard を使用（Feature.EXCHANGE、PermissionLevel.ADMIN）
   - `app/tickers/page.tsx`: FeatureGuard を使用（Feature.TICKER、PermissionLevel.ADMIN）
   - `app/myticker/page.tsx`: FeatureGuard を使用（Feature.MY_TICKER、PermissionLevel.VIEW）
   - `app/finance-notification/page.tsx`: FeatureGuard + LoadingContent を使用（Feature.FINANCE_NOTIFICATION、PermissionLevel.EDIT）

3. **削除されたコンポーネント**
   - `app/components/Auth.tsx`: FeatureGuard で完全に置き換え可能なため削除
   - `app/components/pages/LoadingAuthPage.tsx`: FeatureGuard + LoadingContent の組み合わせで置き換え可能なため削除

#### 移行の影響

- すべてのページが新しい認可システムで動作
- 権限マトリックスによる柔軟な権限管理が可能
- UI レベルでの権限制御が統一的に実装
- ボタンの有効/無効化は AdminManagement コンポーネントによって自動的に処理される
- 冗長なコンポーネントを削除し、コードベースを簡素化

## キャッシュ制御の実装 ✅

### 問題

初期実装では、以下の問題が発生していました：

1. **権限マトリックス更新後、再読み込みで古い状態に戻る**
   - Next.js 15のRoute HandlersはデフォルトでGETリクエストをキャッシュする
   - 権限マトリックスAPI (`/api/permission-matrix`) がキャッシュされていた

2. **権限変更が即座に反映されない**
   - 権限チェックAPI (`/api/auth/check-permission`) の結果がキャッシュされていた
   - クライアント側のfetch呼び出しでもブラウザキャッシュが使用されていた

3. **新規レコード作成時のID問題**
   - `PermissionMatrixService.updatePermissionMatrix()` が新規レコード作成時に、
     `DataAccessorBase.create()` を使用していた
   - `create()` メソッドはIDを自動生成するため、固定ID "PermissionMatrix" が使用されなかった

### 解決策

#### 1. API Route のキャッシュ無効化

**変更ファイル**:
- `client/finance/app/api/permission-matrix/route.ts`
- `client/finance/app/api/auth/check-permission/route.ts`

**実装内容**:
```typescript
// APIルートでキャッシュを無効化
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

これにより、Next.js 15のRoute Handlersがレスポンスをキャッシュしなくなります。

#### 2. クライアント側のキャッシュ制御

**変更ファイル**:
- `client/finance/app/permission-admin/page.tsx`
- `client/finance/app/components/FeatureGuard.tsx`
- `client/finance/app/hooks/usePermission.ts`

**実装内容**:
```typescript
// fetch呼び出しにcache: 'no-store'を追加
const response = await fetch('/api/auth/check-permission', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestBody),
  cache: 'no-store', // ブラウザキャッシュを無効化
});
```

これにより、ブラウザがレスポンスをキャッシュせず、常に最新のデータを取得します。

#### 3. PermissionMatrixService の修正

**変更ファイル**:
- `client/finance/services/auth/PermissionMatrixService.ts`

**実装内容**:
```typescript
public static async updatePermissionMatrix(matrix: PermissionMatrix): Promise<void> {
  const dataAccessor = new PermissionMatrixDataAccessor();
  const existingRecord = await dataAccessor.getById(this.PERMISSION_MATRIX_ID);
  
  if (existingRecord) {
    // 既存レコードを更新
    await dataAccessor.update(this.PERMISSION_MATRIX_ID, { Matrix: matrix });
  } else {
    // 新規レコードは固定IDで直接DynamoDB PutItemを実行
    await this.initializePermissionMatrix(matrix);
  }
}

private static async initializePermissionMatrix(matrix: PermissionMatrix): Promise<void> {
  // DynamoDB SDKを直接使用してPutItemを実行
  // IDを "PermissionMatrix" に固定して作成
  const item = {
    ID: this.PERMISSION_MATRIX_ID,
    DataType: this.PERMISSION_MATRIX_DATA_TYPE,
    Matrix: matrix,
    Create: Date.now(),
    Update: Date.now(),
  };
  // ... DynamoDB PutItem実行
}
```

これにより、新規レコード作成時も固定ID "PermissionMatrix" が使用されます。

### 効果

- ✅ 権限マトリックスの更新が即座にDBに保存される
- ✅ ページ再読み込み後も最新の権限設定が反映される
- ✅ 権限変更（例：ゲストユーザーにSTOCK_CHARTのVIEW権限を付与）が即座に有効になる
- ✅ 権限管理画面での更新後、保存成功メッセージが表示される

## 次のステップ（フェーズ3）

1. 実際のユースケースでテストして改善
2. パフォーマンス監視とキャッシュ実装の検討（適切なキャッシュ戦略の導入）
3. 必要に応じて追加の機能（リソースレベルの認可、動的権限など）を実装
4. ドキュメントの更新と開発者ガイドの整備

## 注意事項

- サーバーサイドでの権限チェックは必須
- クライアントサイドの権限チェックはUI表示制御のみ
- 権限マトリックスの変更は管理画面から行う（コード変更不要）
- デフォルト権限は既存の動作と互換性を保つよう設定
- **キャッシュ無効化により、権限チェックは毎回DBアクセスが発生するため、将来的には適切なキャッシュ戦略（TTL付きキャッシュなど）の導入を検討**
