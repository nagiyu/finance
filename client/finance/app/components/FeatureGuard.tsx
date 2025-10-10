'use client';

import { useEffect, useState } from 'react';

import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';

interface FeatureGuardProps {
  feature: Feature;
  level: PermissionLevel;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * 機能ベースの認可コンポーネント
 * 指定された機能と権限レベルに対する権限をチェックし、
 * 権限がある場合のみ子コンポーネントを表示
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
    checkPermission();
  }, [feature, level]);

  const checkPermission = async () => {
    try {
      const response = await fetch('/api/auth/check-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature, level })
      });

      if (!response.ok) {
        setHasPermission(false);
        return;
      }

      const result = await response.json();
      setHasPermission(result.hasPermission);
    } catch (error) {
      console.error('Error checking permission:', error);
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
