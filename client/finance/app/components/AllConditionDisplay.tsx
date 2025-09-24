'use client';

import React, { useEffect, useState } from 'react';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';
import DirectionStack from '@client-common/components/Layout/Stacks/DirectionStack';
import LoadingPage from '@client-common/pages/LoadingPage';
import BasicDialog from '@client-common/components/feedback/dialog/BasicDialog';
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
    return <LoadingPage />;
  }

  if (conditions.length === 0) {
    return (
      <BasicStack>
        <div style={{ 
          borderTop: '1px solid #e0e0e0', 
          paddingTop: '16px', 
          marginTop: '16px' 
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            marginBottom: '12px',
            color: '#333'
          }}>
            条件一覧
          </h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            利用可能な条件がない、またはデータを取得できませんでした。
          </p>
        </div>
      </BasicStack>
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
    <BasicStack>
      <div style={{ 
        borderTop: '1px solid #e0e0e0', 
        paddingTop: '16px', 
        marginTop: '16px' 
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          marginBottom: '12px',
          color: '#333'
        }}>
          条件一覧
        </h3>
        
        <DirectionStack>
          {buyConditions.length > 0 && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#e8f5e8', 
              border: '1px solid #4caf50',
              borderRadius: '4px',
              marginRight: '8px',
              minWidth: '200px'
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
              minWidth: '200px'
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
        </DirectionStack>

        <div style={{ 
          marginTop: '8px', 
          fontSize: '12px', 
          color: '#666' 
        }}>
          ● 条件適用中、○ 条件適用外 （条件をクリックで詳細表示）
        </div>
      </div>

      {/* Condition Detail Dialog */}
      <BasicDialog
        open={dialogOpen}
        title={selectedCondition?.name || ''}
        onClose={handleDialogClose}
        closeText='閉じる'
      >
        {() => (
          <BasicStack>
            {selectedCondition && (
              <>
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
                    {selectedCondition.isBuyCondition && selectedCondition.isSellCondition 
                      ? '買い・売り両方' 
                      : selectedCondition.isBuyCondition 
                        ? '買いシグナル' 
                        : '売りシグナル'}
                  </div>
                </div>
              </>
            )}
          </BasicStack>
        )}
      </BasicDialog>
    </BasicStack>
  );
}