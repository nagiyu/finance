'use client';

import React, { useState, useEffect } from 'react';

import {
  Feature,
  PermissionLevel,
  PermissionMatrix,
  UserType,
} from '@/types/AuthorizationTypes';

interface PermissionMatrixEditorProps {
  matrix: PermissionMatrix;
  onSave: (matrix: PermissionMatrix) => Promise<void>;
}

/**
 * 権限マトリックス編集コンポーネント
 */
export default function PermissionMatrixEditor({
  matrix: initialMatrix,
  onSave,
}: PermissionMatrixEditorProps) {
  const [matrix, setMatrix] = useState<PermissionMatrix>(initialMatrix);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMatrix(initialMatrix);
  }, [initialMatrix]);

  const handlePermissionChange = (
    feature: Feature,
    userType: UserType,
    level: PermissionLevel
  ) => {
    setMatrix((prev) => ({
      ...prev,
      [feature]: {
        ...prev[feature],
        [userType]: level,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(matrix);
      alert('権限マトリックスを保存しました。');
    } catch (error) {
      console.error('Error saving matrix:', error);
      alert('権限マトリックスの保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  const getFeatureLabel = (feature: Feature): string => {
    const labels: Record<Feature, string> = {
      [Feature.EXCHANGE]: '取引所管理',
      [Feature.TICKER]: 'ティッカー管理',
      [Feature.MY_TICKER]: '個人ティッカーリスト',
      [Feature.FINANCE_NOTIFICATION]: '通知設定',
      [Feature.STOCK_CHART]: '株価チャート',
      [Feature.TARGET_PRICE]: '目標価格計算',
      [Feature.PERMISSION_ADMIN]: '権限管理',
    };
    return labels[feature] || feature;
  };

  const getUserTypeLabel = (userType: UserType): string => {
    const labels: Record<UserType, string> = {
      [UserType.GUEST]: 'ゲスト',
      [UserType.AUTHENTICATED]: '認証済み',
      [UserType.PREMIUM]: 'プレミアム',
      [UserType.ADMIN]: '管理者',
    };
    return labels[userType] || userType;
  };

  const getPermissionLevelLabel = (level: PermissionLevel): string => {
    const labels: Record<PermissionLevel, string> = {
      [PermissionLevel.NONE]: 'アクセス不可',
      [PermissionLevel.VIEW]: '閲覧のみ',
      [PermissionLevel.EDIT]: '編集可能',
      [PermissionLevel.DELETE]: '削除可能',
      [PermissionLevel.ADMIN]: '管理者',
    };
    return labels[level] || level;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>権限マトリックス設定</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>
                機能
              </th>
              {Object.values(UserType).map((userType) => (
                <th
                  key={userType}
                  style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}
                >
                  {getUserTypeLabel(userType)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.values(Feature).map((feature) => (
              <tr key={feature}>
                <td style={{ border: '1px solid #ddd', padding: '12px', fontWeight: 'bold' }}>
                  {getFeatureLabel(feature)}
                </td>
                {Object.values(UserType).map((userType) => (
                  <td
                    key={`${feature}-${userType}`}
                    style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}
                  >
                    <select
                      value={matrix[feature]?.[userType] || PermissionLevel.NONE}
                      onChange={(e) =>
                        handlePermissionChange(
                          feature,
                          userType,
                          e.target.value as PermissionLevel
                        )
                      }
                      style={{
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        width: '100%',
                      }}
                    >
                      {Object.values(PermissionLevel).map((level) => (
                        <option key={level} value={level}>
                          {getPermissionLevelLabel(level)}
                        </option>
                      ))}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: '10px 20px',
            backgroundColor: isSaving ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          {isSaving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}
