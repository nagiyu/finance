# 認可部品の共通化 - 移行ガイド

## 概要

Finance の認可部品を共通部品（typescript-common/nextjs-common）を使用するように更新しました。

## 変更内容

### 1. 共通部品の使用

#### 型定義
以前はローカルの `client/finance/types/AuthorizationTypes.ts` で定義していた型を、共通部品から使用するように変更しました。

**移行前:**
```typescript
import { Feature, PermissionLevel, UserType, PermissionMatrix } from '@/types/AuthorizationTypes';
```

**移行後:**
```typescript
import { PermissionLevel } from '@common/enums/PermissionLevel';
import { UserType } from '@common/enums/UserType';
import { PermissionMatrix } from '@common/interfaces/authorization/PermissionMatrix';
import { FinanceFeature } from '@finance/consts/FinanceConst';
```

#### FeatureGuard コンポーネント
nextjs-common の FeatureGuard を使用するように変更しました。

**移行前:**
```typescript
// client/finance/app/components/FeatureGuard.tsx
// 独自実装の FeatureGuard
```

**移行後:**
```typescript
// client/finance/app/components/FeatureGuard.tsx
// nextjs-common の FeatureGuard をラップ
import BaseFeatureGuard from '@client-common/components/authorization/FeatureGuard';
```

#### AuthorizationService
typescript-common の AuthorizationServiceBase を継承するように変更しました。

**新規追加:**
```typescript
// finance/services/FinanceAuthorizationService.ts
export class FinanceAuthorizationService extends AuthorizationServiceBase<FinanceFeature> {
  // Finance 固有の実装
}

// client/finance/services/auth/AuthorizationService.ts
class FinanceClientAuthorizationService extends FinanceAuthorizationService {
  // クライアント側の実装
}
```

### 2. FinanceFeature の定義

`finance/consts/FinanceConst.ts` に FinanceFeature enum を追加しました。

```typescript
export enum FinanceFeature {
  EXCHANGE = 'exchange',
  TICKER = 'ticker',
  MY_TICKER = 'myTicker',
  FINANCE_NOTIFICATION = 'financeNotification',
  STOCK_CHART = 'stockChart',
  TARGET_PRICE = 'targetPrice',
  PERMISSION_ADMIN = 'permissionAdmin',
}
```

### 3. 削除されたファイル

- `client/finance/types/AuthorizationTypes.ts` - 共通部品を使用するため削除

### 4. 更新されたファイル

#### finance モジュール
- `finance/consts/FinanceConst.ts` - FinanceFeature enum を追加
- `finance/services/FinanceAuthorizationService.ts` - 新規作成

#### client/finance モジュール
- `services/auth/AuthorizationService.ts` - 共通部品を継承
- `services/auth/PermissionMatrixService.ts` - 共通型を使用
- `app/components/FeatureGuard.tsx` - 共通コンポーネントをラップ
- すべての API routes - FinanceFeature と共通型を使用
- すべての page components - FinanceFeature と共通型を使用

## 使用方法

### API routes での使用例

```typescript
import { PermissionLevel } from '@common/enums/PermissionLevel';
import { FinanceFeature } from '@finance/consts/FinanceConst';
import AuthorizationService from '@/services/auth/AuthorizationService';

export async function GET() {
  if (!await AuthorizationService.authorize(FinanceFeature.EXCHANGE, PermissionLevel.VIEW)) {
    return APIUtil.ReturnUnauthorized();
  }
  // ...
}
```

### Page components での使用例

```typescript
import { PermissionLevel } from '@common/enums/PermissionLevel';
import { FinanceFeature } from '@finance/consts/FinanceConst';
import FeatureGuard from '@/app/components/FeatureGuard';

export default function ExchangesPage() {
  return (
    <FeatureGuard 
      feature={FinanceFeature.EXCHANGE} 
      level={PermissionLevel.ADMIN}
    >
      <div>コンテンツ</div>
    </FeatureGuard>
  );
}
```

### PermissionMatrix の型定義

```typescript
import { PermissionMatrix } from '@common/interfaces/authorization/PermissionMatrix';
import { FinanceFeature } from '@finance/consts/FinanceConst';

const matrix: PermissionMatrix<FinanceFeature> = {
  [FinanceFeature.EXCHANGE]: {
    [UserType.GUEST]: PermissionLevel.NONE,
    [UserType.AUTHENTICATED]: PermissionLevel.VIEW,
    [UserType.ADMIN]: PermissionLevel.ADMIN,
  },
  // ...
};
```

## メリット

1. **コードの重複排除**: 共通部品を使用することで、認可ロジックの重複を排除
2. **保守性の向上**: 共通部品の改善が自動的に Finance にも反映される
3. **一貫性の確保**: typescript-common/nextjs-common の設計思想に沿った実装
4. **型安全性**: ジェネリック型パラメータにより、FinanceFeature の型安全性を保持

## 今後の拡張

今後、新しい機能を追加する場合は:

1. `finance/consts/FinanceConst.ts` の `FinanceFeature` enum に機能を追加
2. `PermissionMatrixService.getDefaultMatrix()` にデフォルト権限を定義
3. ページやAPIで `FeatureGuard` または `AuthorizationService.authorize()` を使用

共通部品をベースにしているため、typescript-common や nextjs-common の機能拡張も活用できます。
