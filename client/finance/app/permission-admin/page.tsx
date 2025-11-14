'use client';

import React, { useState, useEffect } from 'react';

import { PermissionLevel } from '@common/enums/PermissionLevel';
import { PermissionMatrix } from '@common/interfaces/authorization/PermissionMatrix';

import { CheckPermissionRequestType, CheckPermissionResponseType, } from '@client-common/routes/auth/check-permission/route';

import { FinanceFeature } from '@finance/consts/FinanceConst';

import type {
  PermissionMatrixGetResponseType,
  PermissionMatrixUpdateRequestType,
} from '@/app/api/permission-matrix/route';
import PermissionMatrixEditor from './components/PermissionMatrixEditor';

/**
 * 権限管理画面
 * 管理者専用
 */
export default function PermissionAdminPage() {
  const [matrix, setMatrix] = useState<PermissionMatrix | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      // 権限チェック
      const requestBody: CheckPermissionRequestType = {
        feature: FinanceFeature.PERMISSION_ADMIN,
        level: PermissionLevel.ADMIN,
      };
      const response = await fetch('/api/auth/check-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      const result: CheckPermissionResponseType = await response.json();
      setIsAuthorized(result.hasPermission);

      if (result.hasPermission) {
        await fetchMatrix();
      }
    } catch (error) {
      console.error('Error checking authorization:', error);
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMatrix = async () => {
    try {
      const response = await fetch('/api/permission-matrix', {
        cache: 'no-store', // Ensure fresh data on every request
      });

      if (!response.ok) {
        throw new Error('Failed to fetch permission matrix');
      }

      const data: PermissionMatrixGetResponseType = await response.json();
      setMatrix(data.matrix);
    } catch (error) {
      console.error('Error fetching matrix:', error);
      alert('権限マトリックスの取得に失敗しました。');
    }
  };

  const handleSave = async (updatedMatrix: PermissionMatrix) => {
    try {
      const requestBody: PermissionMatrixUpdateRequestType = {
        matrix: updatedMatrix,
      };
      const response = await fetch('/api/permission-matrix', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        cache: 'no-store', // Ensure the update is not cached
      });

      if (!response.ok) {
        throw new Error('Failed to update permission matrix');
      }

      setMatrix(updatedMatrix);
    } catch (error) {
      console.error('Error saving matrix:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>アクセス拒否</h2>
        <p>この機能へのアクセス権限がありません。</p>
      </div>
    );
  }

  if (!matrix) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>権限マトリックスの取得に失敗しました。</p>
      </div>
    );
  }

  return (
    <div>
      <PermissionMatrixEditor matrix={matrix} onSave={handleSave} />
    </div>
  );
}
