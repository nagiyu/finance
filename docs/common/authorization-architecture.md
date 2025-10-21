# 認可アーキテクチャ設計

## 概要

本ドキュメントは、Next.js アプリケーションにおける汎用的な認可（Authorization）アーキテクチャの設計を定義します。現在の実装は特定のロール（Admin、User）に限定されており、機能やレベルごとの細かい権限管理が困難です。本設計では、機能（Feature）とアクセスレベル（Permission Level）を組み合わせた柔軟な認可システムを提案します。

## 背景と課題

### 現在の実装

現在の認可システムは以下のような構造になっています：

- **ロールベース**: `Admin`、`User`の2つのロールが存在
- **機能単位の認可**: `FinanceAuthorizer.isAdmin()` / `FinanceAuthorizer.isUser()`
- **API/画面での個別チェック**: 各APIルートや画面コンポーネントで個別に認可チェック

```typescript
// 現在の実装例
export async function GET() {
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }
  // ...
}

// 画面での使用例
<Auth
  adminContent={<AdminPanel />}
  userContent={<UserPanel />}
/>
```

### 課題

1. **汎用性の欠如**: 機能ごとに異なる権限レベル（View、Edit、Delete など）を設定できない
2. **拡張性の低さ**: 新しいロールや権限を追加する際、多数のファイルを修正する必要がある
3. **一貫性の欠如**: API と画面で異なる認可ロジックが混在
4. **ゲストユーザー対応不足**: 未ログインユーザーに対する部分的な閲覧権限などが実装しにくい
5. **権限の粒度**: 機能全体ではなく、特定の操作（閲覧、編集、削除など）ごとに権限を設定したい

## 設計方針

### 基本コンセプト

1. **機能ベースの権限管理**: 各機能（Feature）に対して権限を定義
2. **レベル別のアクセス制御**: View、Edit、Delete など、操作レベルでの権限管理
3. **ユーザータイプの柔軟な定義**: ゲスト、ログインユーザー、管理者など
4. **宣言的な権限設定**: 設定ファイルで権限マトリックスを定義
5. **統一的な認可チェック**: API と画面で同じ認可ロジックを使用

### ユーザー識別の考え方

本設計では、ユーザーの識別に **AuthService が管理する UserID** を使用します。これは以下の理由によるものです：

- **抽象化**: 認証プロバイダー（Google、GitHub等）に依存しない設計
- **一貫性**: typescript-common の AuthService を通じて統一的にユーザーを管理
- **拡張性**: 将来的に複数の認証プロバイダーに対応可能

```typescript
// AuthService経由でUserIDを取得
const authService = new FinanceAuthService();
const userId = await authService.getUserIdFromSession();

// UserIDベースで認証データを取得
const authData = await authService.getById(userId);
```

GoogleUserID などのプロバイダー固有のIDは、AuthService の内部で管理され、直接使用しません。

## アーキテクチャ設計

### 1. 権限の構造

#### 1.1 機能（Feature）

アプリケーション内の各機能を表します。

```typescript
// 機能の定義
enum Feature {
  EXCHANGE = 'exchange',           // 取引所管理
  TICKER = 'ticker',               // ティッカー管理
  MY_TICKER = 'myTicker',          // 個人ティッカーリスト
  FINANCE_NOTIFICATION = 'financeNotification', // 通知設定
  STOCK_CHART = 'stockChart',      // 株価チャート
  TARGET_PRICE = 'targetPrice',    // 目標価格計算
}
```

#### 1.2 権限レベル（Permission Level）

各機能に対する操作の種類を表します。

```typescript
// 権限レベルの定義
enum PermissionLevel {
  NONE = 'none',       // アクセス不可
  VIEW = 'view',       // 閲覧のみ
  EDIT = 'edit',       // 編集可能（閲覧も含む）
  DELETE = 'delete',   // 削除可能（編集・閲覧も含む）
  ADMIN = 'admin',     // 管理者権限（すべての操作が可能）
}
```

**権限の階層関係**:
```
NONE < VIEW < EDIT < DELETE < ADMIN
```

#### 1.3 ユーザータイプ（User Type）

システムを利用するユーザーのカテゴリを表します。

```typescript
// ユーザータイプの定義
enum UserType {
  GUEST = 'guest',           // 未ログインユーザー
  AUTHENTICATED = 'authenticated', // ログイン済みユーザー
  PREMIUM = 'premium',       // プレミアムユーザー（将来的な拡張用）
  ADMIN = 'admin',           // 管理者
}
```

### 2. 権限マトリックス

機能とユーザータイプの組み合わせで、各ユーザータイプが持つ権限レベルを定義します。

#### 2.1 権限マトリックスの管理

権限マトリックスは**管理画面で設定可能**にし、コード側ではハードコーディングしません。

```typescript
// 権限マトリックスの型定義
type PermissionMatrix = {
  [feature in Feature]: {
    [userType in UserType]: PermissionLevel;
  };
};

// 権限マトリックスはDynamoDBから動的に取得
interface PermissionMatrixRecord {
  Id: string;                    // 'PermissionMatrix'
  DataType: string;              // 'PermissionMatrix'
  Matrix: PermissionMatrix;      // 権限マトリックスデータ
  Create: number;
  Update: number;
}
```

#### 2.2 管理画面での権限設定

管理者権限を持つユーザーは、専用の管理画面から以下を設定できます：

- 各機能（Feature）に対する権限設定
- ユーザータイプごとの権限レベル（None/View/Edit/Delete/Admin）
- 権限マトリックスの更新履歴

```typescript
// 権限マトリックス管理サービス
class PermissionMatrixService {
  /**
   * 権限マトリックスを取得
   */
  public static async getPermissionMatrix(): Promise<PermissionMatrix> {
    const record = await dataAccessor.getById('PermissionMatrix');
    return record?.Matrix || this.getDefaultMatrix();
  }

  /**
   * 権限マトリックスを更新（管理者のみ）
   */
  public static async updatePermissionMatrix(
    matrix: PermissionMatrix,
    updatedBy: string
  ): Promise<void> {
    // 管理者権限チェック
    if (!await AuthorizationService.authorize(Feature.PERMISSION_ADMIN, PermissionLevel.ADMIN)) {
      throw new Error('Unauthorized');
    }

    await dataAccessor.update({
      Id: 'PermissionMatrix',
      DataType: 'PermissionMatrix',
      Matrix: matrix,
      Update: Date.now()
    });
  }

  /**
   * デフォルトの権限マトリックス
   */
  private static getDefaultMatrix(): PermissionMatrix {
    return {
      [Feature.EXCHANGE]: {
        [UserType.GUEST]: PermissionLevel.NONE,
        [UserType.AUTHENTICATED]: PermissionLevel.VIEW,
        [UserType.PREMIUM]: PermissionLevel.VIEW,
        [UserType.ADMIN]: PermissionLevel.ADMIN,
      },
      // 他の機能のデフォルト設定...
    };
  }
}
```

### 3. 認可サービス

#### 3.1 AuthorizationService

汎用的な認可チェックを提供するサービスクラスです。

```typescript
/**
 * 汎用認可サービス
 * 機能とレベルに基づいた権限チェックを提供
 */
class AuthorizationService {
  /**
   * ユーザーが指定された機能に対して指定レベルの権限を持つかチェック
   * 
   * @param userType ユーザータイプ
   * @param feature 機能
   * @param requiredLevel 必要な権限レベル
   * @returns 権限がある場合true
   */
  public static async hasPermission(
    userType: UserType,
    feature: Feature,
    requiredLevel: PermissionLevel
  ): Promise<boolean> {
    // データベースから権限マトリックスを取得
    const permissionMatrix = await PermissionMatrixService.getPermissionMatrix();
    const userPermission = permissionMatrix[feature]?.[userType] || PermissionLevel.NONE;
    return this.comparePermissionLevel(userPermission, requiredLevel);
  }

  /**
   * 権限レベルの比較（階層を考慮）
   * 
   * @param userLevel ユーザーが持つ権限レベル
   * @param requiredLevel 必要な権限レベル
   * @returns ユーザーレベルが必要レベル以上の場合true
   */
  private static comparePermissionLevel(
    userLevel: PermissionLevel,
    requiredLevel: PermissionLevel
  ): boolean {
    const levelHierarchy = [
      PermissionLevel.NONE,
      PermissionLevel.VIEW,
      PermissionLevel.EDIT,
      PermissionLevel.DELETE,
      PermissionLevel.ADMIN,
    ];

    const userLevelIndex = levelHierarchy.indexOf(userLevel);
    const requiredLevelIndex = levelHierarchy.indexOf(requiredLevel);

    return userLevelIndex >= requiredLevelIndex;
  }

  /**
   * セッションからユーザータイプを取得
   * AuthServiceを通じてUserIDベースで認証情報を取得
   * 
   * @returns ユーザータイプ
   */
  public static async getUserType(): Promise<UserType> {
    const session = await getServerSession();
    
    if (!session?.user) {
      return UserType.GUEST;
    }

    // AuthService経由でUserIDを取得し、認証情報をチェック
    const authService = new FinanceAuthService();
    const userId = await authService.getUserIdFromSession();
    
    if (!userId) {
      return UserType.GUEST;
    }

    // ユーザーの認証データを取得
    const authData = await authService.getById(userId);
    
    if (!authData) {
      return UserType.GUEST;
    }

    // 管理者チェック
    if (authData.finance === 'Admin') {
      return UserType.ADMIN;
    }

    // 認証済みユーザー
    return UserType.AUTHENTICATED;
  }

  /**
   * 現在のユーザーが指定機能へのアクセス権限を持つかチェック
   * 
   * @param feature 機能
   * @param requiredLevel 必要な権限レベル
   * @returns 権限がある場合true
   */
  public static async authorize(
    feature: Feature,
    requiredLevel: PermissionLevel
  ): Promise<boolean> {
    const userType = await this.getUserType();
    return this.hasPermission(userType, feature, requiredLevel);
  }
}
```

#### 3.2 使用例

**API ルートでの使用**:

```typescript
// app/api/exchange/route.ts
export async function GET() {
  // 取引所情報の閲覧権限をチェック
  if (!await AuthorizationService.authorize(Feature.EXCHANGE, PermissionLevel.VIEW)) {
    return APIUtil.ReturnUnauthorized();
  }

  const exchanges = await ExchangeUtil.GetAll();
  return APIUtil.ReturnSuccessWithObject(exchanges);
}

export async function POST(request: NextRequest) {
  // 取引所情報の管理者権限をチェック
  if (!await AuthorizationService.authorize(Feature.EXCHANGE, PermissionLevel.ADMIN)) {
    return APIUtil.ReturnUnauthorized();
  }

  const body: ExchangeDataType = await request.json();
  // ...作成処理
}

export async function PUT(request: NextRequest) {
  // 取引所情報の編集権限をチェック
  if (!await AuthorizationService.authorize(Feature.EXCHANGE, PermissionLevel.EDIT)) {
    return APIUtil.ReturnUnauthorized();
  }

  const body: ExchangeDataType = await request.json();
  // ...更新処理
}

export async function DELETE(request: NextRequest) {
  // 取引所情報の削除権限をチェック
  if (!await AuthorizationService.authorize(Feature.EXCHANGE, PermissionLevel.DELETE)) {
    return APIUtil.ReturnUnauthorized();
  }

  // ...削除処理
}
```

**画面コンポーネントでの使用**:

```typescript
// app/components/FeatureGuard.tsx
'use client';

import { useEffect, useState } from 'react';

interface FeatureGuardProps {
  feature: Feature;
  level: PermissionLevel;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * 機能ベースの認可コンポーネント
 */
export default function FeatureGuard({
  feature,
  level,
  children,
  fallback = <div>この機能へのアクセス権限がありません。</div>
}: FeatureGuardProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const authorized = await checkPermission(feature, level);
      setHasPermission(authorized);
      setLoading(false);
    })();
  }, [feature, level]);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!hasPermission) {
    return fallback;
  }

  return <>{children}</>;
}

/**
 * APIを通じて権限チェック
 */
async function checkPermission(
  feature: Feature, 
  level: PermissionLevel
): Promise<boolean> {
  const response = await fetch(`/api/auth/check-permission`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feature, level })
  });

  if (!response.ok) {
    return false;
  }

  const result = await response.json();
  return result.hasPermission;
}
```

**ページでの使用例**:

```typescript
// app/exchanges/page.tsx
export default function ExchangesPage() {
  return (
    <FeatureGuard 
      feature={Feature.EXCHANGE} 
      level={PermissionLevel.VIEW}
    >
      <FeatureGuard 
        feature={Feature.EXCHANGE} 
        level={PermissionLevel.ADMIN}
        fallback={<div>閲覧のみ可能です。</div>}
      >
        <AdminManagement {...props} />
      </FeatureGuard>
    </FeatureGuard>
  );
}
```

### 4. APIエンドポイント

認可チェック用のAPIエンドポイントを提供します。

```typescript
// app/api/auth/check-permission/route.ts
import { NextRequest } from 'next/server';
import APIUtil from '@client-common/utils/APIUtil';
import AuthorizationService from '@/services/auth/AuthorizationService';
import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';

export async function POST(request: NextRequest) {
  const { feature, level } = await request.json();

  // 入力検証
  if (!Object.values(Feature).includes(feature)) {
    return APIUtil.ReturnBadRequest('Invalid feature');
  }

  if (!Object.values(PermissionLevel).includes(level)) {
    return APIUtil.ReturnBadRequest('Invalid permission level');
  }

  const hasPermission = await AuthorizationService.authorize(feature, level);

  return APIUtil.ReturnSuccessWithObject({ hasPermission });
}
```

### 5. ミドルウェアパターン（オプション）

よりエレガントなアプローチとして、ミドルウェアパターンを使用することもできます。

```typescript
/**
 * 認可ミドルウェアファクトリー
 * APIルートハンドラーをラップして認可チェックを追加
 */
function withAuthorization(
  feature: Feature,
  level: PermissionLevel,
  handler: (request: NextRequest, ...args: unknown[]) => Promise<Response>
) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const authorized = await AuthorizationService.authorize(feature, level);
    
    if (!authorized) {
      return APIUtil.ReturnUnauthorized();
    }

    return handler(request, ...args);
  };
}

// 使用例
export const GET = withAuthorization(
  Feature.EXCHANGE, 
  PermissionLevel.VIEW,
  async () => {
    const exchanges = await ExchangeUtil.GetAll();
    return APIUtil.ReturnSuccessWithObject(exchanges);
  }
);

export const POST = withAuthorization(
  Feature.EXCHANGE,
  PermissionLevel.ADMIN,
  async (request: NextRequest) => {
    const body: ExchangeDataType = await request.json();
    // ...作成処理
  }
);
```

## データモデル

### DynamoDB テーブル構造（既存の拡張）

既存の `AuthRecordType` を拡張して権限情報を追加します。

```typescript
// AuthRecordType の拡張
// typescript-common の AuthRecordType を継承
interface FinanceAuthRecordType extends AuthRecordType {
  Finance?: {
    roles: string[];             // ['Admin'] など（後方互換性のため維持）
    userType?: UserType;         // 新しいユーザータイプ
    customPermissions?: {        // カスタム権限（オプション）
      [feature: string]: PermissionLevel;
    };
  };
}
```

**注意**: `AuthRecordType` は typescript-common で定義されており、本機能以外でも使用される基底型です。この設計では、Finance 固有の情報を `Finance` フィールド内にカプセル化することで、他のモジュールへの影響を避けています。

### カスタム権限のサポート

特定のユーザーに対して、権限マトリックスとは異なる権限を設定できるようにします。

```typescript
class AuthorizationService {
  public static async hasPermission(
    userType: UserType,
    feature: Feature,
    requiredLevel: PermissionLevel,
    userId?: string
  ): Promise<boolean> {
    // カスタム権限のチェック（ユーザーIDが指定されている場合）
    if (userId) {
      const customPermission = await this.getCustomPermission(userId, feature);
      if (customPermission !== null) {
        return this.comparePermissionLevel(customPermission, requiredLevel);
      }
    }

    // データベースから権限マトリックスを取得してチェック
    const permissionMatrix = await PermissionMatrixService.getPermissionMatrix();
    const userPermission = permissionMatrix[feature]?.[userType] || PermissionLevel.NONE;
    return this.comparePermissionLevel(userPermission, requiredLevel);
  }

  private static async getCustomPermission(
    userId: string,
    feature: Feature
  ): Promise<PermissionLevel | null> {
    const authService = new FinanceAuthService();
    const authData = await authService.getById(userId);
    
    return authData?.finance?.customPermissions?.[feature] ?? null;
  }
}
```

## ファイル構成

新しい認可アーキテクチャを実装する際のファイル構成案：

```
client/finance/
├── types/
│   └── AuthorizationTypes.ts              # Feature, PermissionLevel, UserType の定義
├── services/
│   └── auth/
│       ├── AuthorizationService.ts        # 汎用認可サービス
│       ├── PermissionMatrixService.ts     # 権限マトリックス管理サービス
│       └── FinanceAuthorizer.ts           # 既存（互換性のため維持）
├── app/
│   ├── components/
│   │   └── FeatureGuard.tsx              # 認可コンポーネント
│   ├── permission-admin/                  # 権限管理画面（管理者専用）
│   │   ├── page.tsx                      # 権限マトリックス設定UI
│   │   └── components/
│   │       ├── PermissionMatrixEditor.tsx # 権限編集コンポーネント
│   │       └── PermissionHistory.tsx     # 権限変更履歴
│   └── api/
│       ├── auth/
│       │   ├── check-permission/
│       │   │   └── route.ts              # 権限チェックAPI
│       │   └── authorize/[role]/
│       │       └── route.ts              # 既存（互換性のため維持）
│       └── permission-matrix/
│           ├── route.ts                  # 権限マトリックス取得・更新API
│           └── history/
│               └── route.ts              # 権限変更履歴API
└── utils/
    └── authorizationMiddleware.ts        # ミドルウェアヘルパー
```

## 移行戦略

既存のシステムから新しいアーキテクチャへの移行は段階的に行います。

### フェーズ 1: 基盤構築

1. 型定義の追加（`AuthorizationTypes.ts`）
2. `PermissionMatrixService` の実装（DBから権限マトリックスを取得）
3. `AuthorizationService` の実装
4. 権限チェックAPIの実装
5. **権限管理画面の実装**（管理者が権限を設定できるUI）

### フェーズ 2: 並行運用

1. 既存の `FinanceAuthorizer` は維持
2. 新しいAPIや画面では `AuthorizationService` を使用
3. 段階的に既存コードを移行
4. 権限マトリックスの初期設定を管理画面から登録

### フェーズ 3: 完全移行

1. すべてのAPI/画面を新しいシステムに移行
2. 既存の `FinanceAuthorizer` は廃止または互換レイヤーとして残す
3. ドキュメントの更新

### 後方互換性の維持

既存のコードとの互換性を保つため、ラッパー関数を提供：

```typescript
// FinanceAuthorizer.ts を互換レイヤーとして維持
export default class FinanceAuthorizer {
  public static async isAdmin(): Promise<boolean> {
    return AuthorizationService.authorize(Feature.EXCHANGE, PermissionLevel.ADMIN);
  }

  public static async isUser(): Promise<boolean> {
    const userType = await AuthorizationService.getUserType();
    return userType !== UserType.GUEST;
  }
}
```

## セキュリティ考慮事項

### 1. クライアントサイドの権限チェック

- クライアントサイドの権限チェックはUIの表示制御のみに使用
- 実際の認可はサーバーサイド（APIルート）で必ず実施

### 2. 権限の検証

- 各APIエンドポイントで必ず認可チェックを実施
- ミドルウェアパターンを使用して認可チェックの漏れを防止

### 3. 権限マトリックスの管理

- 権限マトリックスは設定ファイルで一元管理
- 変更時はコードレビューを必須とする
- 定期的な権限の見直し

### 4. ログとモニタリング

- 認可の成功/失敗をログに記録
- 不正なアクセス試行を検知・警告

## テスト戦略

### 単体テスト

```typescript
describe('AuthorizationService', () => {
  describe('comparePermissionLevel', () => {
    it('should return true when user level is higher than required level', () => {
      expect(AuthorizationService.comparePermissionLevel(
        PermissionLevel.ADMIN,
        PermissionLevel.VIEW
      )).toBe(true);
    });

    it('should return false when user level is lower than required level', () => {
      expect(AuthorizationService.comparePermissionLevel(
        PermissionLevel.VIEW,
        PermissionLevel.EDIT
      )).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should grant admin full access to all features', () => {
      Object.values(Feature).forEach(feature => {
        expect(AuthorizationService.hasPermission(
          UserType.ADMIN,
          feature,
          PermissionLevel.ADMIN
        )).toBe(true);
      });
    });

    it('should deny guest access to restricted features', () => {
      expect(AuthorizationService.hasPermission(
        UserType.GUEST,
        Feature.MY_TICKER,
        PermissionLevel.VIEW
      )).toBe(false);
    });
  });
});
```

**注**: API の統合テストは単体テストでは実施できないため、スキップします。API レベルの動作確認は手動テストまたはE2Eテストで実施してください。

## パフォーマンス考慮事項

### 1. 権限マトリックスのキャッシュ

頻繁な権限チェックによるパフォーマンス低下を防ぐため、権限マトリックスをキャッシュします。

**PermissionMatrixService** では **typescript-common/common/utils/CacheUtil** を使用してキャッシュを実装しています：

```typescript
import CacheUtil from '@common/utils/CacheUtil';

export default class PermissionMatrixService {
  private static readonly CACHE_KEY = 'permission_matrix';
  private static readonly CACHE_TTL = 300000; // 5分（ミリ秒）

  /**
   * 権限マトリックスを取得
   * CacheUtilを使用してキャッシュを管理
   */
  public static async getPermissionMatrix(): Promise<PermissionMatrix> {
    // キャッシュから取得を試みる
    const cachedMatrix = CacheUtil.get<PermissionMatrix>(this.CACHE_KEY);
    if (cachedMatrix) {
      return cachedMatrix;
    }
    
    // DBから取得してキャッシュに保存
    const dataAccessor = new PermissionMatrixDataAccessor();
    const record = await dataAccessor.getById(this.PERMISSION_MATRIX_ID);
    const matrix = record?.Matrix || this.getDefaultMatrix();
    
    CacheUtil.set(this.CACHE_KEY, matrix, this.CACHE_TTL);
    
    return matrix;
  }

  /**
   * キャッシュをクリア
   * 権限マトリックスが更新された際に自動的に呼び出される
   */
  public static clearCache(): void {
    CacheUtil.delete(this.CACHE_KEY);
  }
  
  /**
   * 強制的にキャッシュを更新
   */
  public static async refreshCache(): Promise<PermissionMatrix> {
    this.clearCache();
    return this.getPermissionMatrix();
  }
}
```

**キャッシュの特徴**:
- **TTL（Time-To-Live）**: 5分間キャッシュを保持
- **自動無効化**: 権限マトリックス更新時に自動的にキャッシュをクリア
- **CacheUtil使用**: typescript-common の統一的なキャッシュユーティリティを使用
- **パフォーマンス**: DB読み取りを最小限に抑える
- **整合性**: 更新後すぐに新しい権限が反映される

## 将来的な拡張

### 1. リソースレベルの認可

特定のリソース（例：特定の通知設定）に対する権限管理：

```typescript
// 例：自分の通知設定のみ編集可能
await AuthorizationService.authorizeResource(
  Feature.FINANCE_NOTIFICATION,
  PermissionLevel.EDIT,
  { resourceId: notificationId, userId: currentUserId }
);
```

### 2. 動的権限

時間や条件に基づく動的な権限管理：

```typescript
// 例：取引時間中のみアクセス可能
await AuthorizationService.authorizeWithConditions(
  Feature.STOCK_CHART,
  PermissionLevel.VIEW,
  { 
    timeWindow: { start: '09:00', end: '15:00' },
    timezone: 'Asia/Tokyo'
  }
);
```

### 3. 権限委譲

管理者が他のユーザーに一時的に権限を委譲：

```typescript
await AuthorizationService.delegatePermission(
  fromUserId,
  toUserId,
  Feature.EXCHANGE,
  PermissionLevel.EDIT,
  { expiresAt: Date.now() + 86400000 } // 24時間
);
```

## まとめ

本設計により、以下のメリットが得られます：

### 利点

1. **柔軟性**: 機能とレベルを組み合わせた細かい権限制御
2. **拡張性**: 新しい機能や権限レベルを容易に追加可能
3. **一貫性**: API と画面で統一された認可ロジック
4. **保守性**: 権限マトリックスによる一元管理
5. **テスタビリティ**: 明確な責務分離によるテスト容易性
6. **型安全性**: TypeScript による型チェック

### 運用における注意点

1. **権限マトリックスの定期的な見直し**: ビジネス要件の変更に応じて更新
2. **セキュリティ監査**: 定期的な権限設定のレビュー
3. **パフォーマンス監視**: キャッシュの効果測定と調整
4. **ドキュメント維持**: 権限変更時のドキュメント更新

本アーキテクチャは、現在のシステムを段階的に改善しながら、将来的な拡張にも対応できる柔軟な設計となっています。
