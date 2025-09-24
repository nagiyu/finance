'use client';

import React, { useEffect, useState } from 'react';
import AllConditionsService, { AllConditionResult } from '@/services/condition/AllConditionsService.client';

interface AllConditionDisplayProps {
  exchangeId: string;
  tickerId: string;
  timeframe: string;
  session: string;
}

export default function AllConditionDisplay({
  exchangeId,
  tickerId,
  timeframe,
  session
}: AllConditionDisplayProps) {
  const [conditions, setConditions] = useState<AllConditionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<AllConditionResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!exchangeId || !tickerId) {
      setConditions([]);
      return;
    }

    const getAllConditions = async () => {
      setLoading(true);
      try {
        const allConditionsService = new AllConditionsService();
        const result = await allConditionsService.getAllConditions(
          exchangeId,
          tickerId,
          timeframe,
          session
        );
        setConditions(result);
      } catch (error) {
        console.error('Failed to get all conditions:', error);
        setConditions([]);
      } finally {
        setLoading(false);
      }
    };

    getAllConditions();
  }, [exchangeId, tickerId, timeframe, session]);

  const handleConditionClick = (condition: AllConditionResult) => {
    setSelectedCondition(condition);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedCondition(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '20px' 
      }}>
        <div>読み込み中...</div>
      </div>
    );
  }

  if (conditions.length === 0) {
    return (
      <div style={{
        borderTop: '1px solid #e0e0e0', 
        paddingTop: '16px', 
        marginTop: '16px' 
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          marginBottom: '12px',
          color: '#333',
          margin: '0 0 12px 0'
        }}>
          条件一覧
        </h3>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
          利用可能な条件がない、またはデータを取得できませんでした。
        </p>
      </div>
    );
  }

  const buyConditions = conditions.filter(c => c.isBuyCondition);
  const sellConditions = conditions.filter(c => c.isSellCondition);

  const renderConditionItem = (condition: AllConditionResult) => (
    <div 
      key={condition.key} 
      onClick={() => handleConditionClick(condition)}
      style={{ 
        fontSize: '12px',
        padding: '4px 8px',
        marginBottom: '2px',
        borderRadius: '3px',
        cursor: 'pointer',
        opacity: condition.isMet ? 1 : 0.5,
        backgroundColor: condition.isMet ? 'transparent' : '#f5f5f5',
        transition: 'all 0.2s ease',
        border: condition.isMet ? 'none' : '1px solid #ddd'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = condition.isMet ? '#e3f2fd' : '#e8e8e8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = condition.isMet ? 'transparent' : '#f5f5f5';
      }}
    >
      {condition.isMet ? '●' : '○'} {condition.name}
    </div>
  );

  return (
    <div>
      <div style={{ 
        borderTop: '1px solid #e0e0e0', 
        paddingTop: '16px', 
        marginTop: '16px' 
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          marginBottom: '12px',
          color: '#333',
          margin: '0 0 12px 0'
        }}>
          条件一覧
        </h3>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {buyConditions.length > 0 && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#e8f5e8', 
              border: '1px solid #4caf50',
              borderRadius: '4px',
              minWidth: '200px',
              flex: '1'
            }}>
              <div style={{ 
                fontWeight: 'bold', 
                color: '#2e7d32', 
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                買いシグナル
              </div>
              {buyConditions.map(renderConditionItem)}
            </div>
          )}

          {sellConditions.length > 0 && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#ffebee', 
              border: '1px solid #f44336',
              borderRadius: '4px',
              minWidth: '200px',
              flex: '1'
            }}>
              <div style={{ 
                fontWeight: 'bold', 
                color: '#d32f2f', 
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                売りシグナル
              </div>
              {sellConditions.map(renderConditionItem)}
            </div>
          )}
        </div>

        <div style={{ 
          marginTop: '8px', 
          fontSize: '12px', 
          color: '#666' 
        }}>
          ● 条件適用中、○ 条件適用外 （条件をクリックで詳細表示）
        </div>
      </div>

      {/* Condition Detail Dialog */}
      {dialogOpen && selectedCondition && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={handleDialogClose}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80%',
              overflow: 'auto',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#333',
                margin: '0 0 16px 0'
              }}>
                {selectedCondition.name}
              </h2>

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
                  {selectedCondition.name}
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
                  {selectedCondition.description}
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
                  color: selectedCondition.isMet ? '#2e7d32' : '#666',
                  fontWeight: selectedCondition.isMet ? 'bold' : 'normal'
                }}>
                  {selectedCondition.isMet ? '条件適用中' : '条件適用外'}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  color: '#333'
                }}>
                  シグナルタイプ
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {selectedCondition.isBuyCondition && selectedCondition.isSellCondition 
                    ? '買い・売り両方' 
                    : selectedCondition.isBuyCondition 
                      ? '買いシグナル' 
                      : '売りシグナル'}
                </div>
              </div>

              <button
                onClick={handleDialogClose}
                style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1565c0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1976d2';
                }}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}