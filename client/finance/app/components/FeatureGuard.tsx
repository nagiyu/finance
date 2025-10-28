'use client';

import { PermissionLevel } from '@common/enums/PermissionLevel';

import BaseFeatureGuard from '@client-common/components/authorization/FeatureGuard';

import { FinanceFeature } from '@finance/consts/FinanceConst';

interface FeatureGuardProps {
  feature: FinanceFeature;
  level: PermissionLevel;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Finance用の機能ベースの認可コンポーネント
 * nextjs-common の FeatureGuard をラップして型安全性を提供
 */
export default function FeatureGuard({
  feature,
  level,
  children,
  fallback = <div>この機能へのアクセス権限がありません。</div>
}: FeatureGuardProps) {
  return (
    <BaseFeatureGuard
      feature={feature}
      level={level}
      fallback={fallback}
    >
      {children}
    </BaseFeatureGuard>
  );
}
