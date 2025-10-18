'use client';

import { useEffect, useState } from 'react';

import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';
import type {
  CheckPermissionRequestType,
  CheckPermissionResponseType,
} from '@/app/api/auth/check-permission/route';

/**
 * 権限チェックカスタムフック
 * 指定された機能と権限レベルに対する権限を確認
 * 
 * @param feature チェックする機能
 * @param level 必要な権限レベル
 * @returns { hasPermission: boolean, loading: boolean }
 */
export function usePermission(feature: Feature, level: PermissionLevel) {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkPermission = async () => {
      try {
        const requestBody: CheckPermissionRequestType = { feature, level };
        const response = await fetch('/api/auth/check-permission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          cache: 'no-store', // Ensure fresh permission checks
        });

        if (!response.ok) {
          if (mounted) {
            setHasPermission(false);
          }
          return;
        }

        const result: CheckPermissionResponseType = await response.json();
        if (mounted) {
          setHasPermission(result.hasPermission);
        }
      } catch (error) {
        console.error('Error checking permission:', error);
        if (mounted) {
          setHasPermission(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkPermission();

    return () => {
      mounted = false;
    };
  }, [feature, level]);

  return { hasPermission, loading };
}
