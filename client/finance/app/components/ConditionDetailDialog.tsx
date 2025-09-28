'use client';

import React from 'react';
import BasicDialog from '@client-common/components/feedback/dialog/BasicDialog';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';
import { AllConditionResult } from '@/services/condition/AllConditionsService.client';

interface ConditionDetailDialogProps {
  open: boolean;
  condition: AllConditionResult | null;
  onClose: () => void;
}

export default function ConditionDetailDialog({
  open,
  condition,
  onClose
}: ConditionDetailDialogProps) {
  if (!condition) {
    return null;
  }

  return (
    <BasicDialog
      open={open}
      title={condition.name}
      onClose={onClose}
      closeText='閉じる'
    >
      {() => (
        <BasicStack>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: '#333'
            }}>
              条件名
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {condition.name}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: '#333'
            }}>
              説明
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#666',
              lineHeight: '1.5'
            }}>
              {condition.description}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: '#333'
            }}>
              現在の状態
            </div>
            <div style={{ 
              fontSize: '14px',
              color: condition.isMet ? '#2e7d32' : '#666',
              fontWeight: condition.isMet ? 'bold' : 'normal'
            }}>
              {condition.isMet ? '条件適用中' : '条件適用外'}
            </div>
          </div>

          <div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: '#333'
            }}>
              シグナルタイプ
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {condition.isBuyCondition && condition.isSellCondition 
                ? '買い・売り両方' 
                : condition.isBuyCondition 
                  ? '買いシグナル' 
                  : '売りシグナル'}
            </div>
          </div>
        </BasicStack>
      )}
    </BasicDialog>
  );
}