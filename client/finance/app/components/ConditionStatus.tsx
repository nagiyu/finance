'use client';

import React, { useEffect, useState } from 'react';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';
import DirectionStack from '@client-common/components/Layout/Stacks/DirectionStack';
import LoadingPage from '@client-common/pages/LoadingPage';
import ConditionCheckService from '@/services/condition/ConditionCheckService.client';

interface ConditionCheckResult {
  name: string;
  key: string;
  isBuyCondition: boolean;
  isSellCondition: boolean;
}

interface ConditionStatusProps {
  exchangeId: string;
  tickerId: string;
  timeframe: string;
  session: string;
}

export default function ConditionStatus({
  exchangeId,
  tickerId,
  timeframe,
  session
}: ConditionStatusProps) {
  const [conditions, setConditions] = useState<ConditionCheckResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!exchangeId || !tickerId) {
      setConditions([]);
      return;
    }

    const checkConditions = async () => {
      setLoading(true);
      try {
        const conditionCheckService = new ConditionCheckService();
        const result = await conditionCheckService.checkConditions(
          exchangeId,
          tickerId,
          timeframe,
          session
        );
        setConditions(result);
      } catch (error) {
        console.error('Failed to check conditions:', error);
        setConditions([]);
      } finally {
        setLoading(false);
      }
    };

    checkConditions();
  }, [exchangeId, tickerId, timeframe, session]);

  if (loading) {
    return <LoadingPage />;
  }

  if (conditions.length === 0) {
    return null; // Don't show anything if no conditions are met
  }

  const buyConditions = conditions.filter(c => c.isBuyCondition);
  const sellConditions = conditions.filter(c => c.isSellCondition);

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
          適用される条件
        </h3>
        
        <DirectionStack>
          {buyConditions.length > 0 && (
            <div style={{ 
              padding: '8px 12px', 
              backgroundColor: '#e8f5e8', 
              border: '1px solid #4caf50',
              borderRadius: '4px',
              marginRight: '8px'
            }}>
              <div style={{ 
                fontWeight: 'bold', 
                color: '#2e7d32', 
                marginBottom: '4px',
                fontSize: '14px'
              }}>
                買いシグナル
              </div>
              {buyConditions.map(condition => (
                <div key={condition.key} style={{ 
                  fontSize: '12px', 
                  color: '#2e7d32' 
                }}>
                  • {condition.name}
                </div>
              ))}
            </div>
          )}

          {sellConditions.length > 0 && (
            <div style={{ 
              padding: '8px 12px', 
              backgroundColor: '#ffebee', 
              border: '1px solid #f44336',
              borderRadius: '4px'
            }}>
              <div style={{ 
                fontWeight: 'bold', 
                color: '#d32f2f', 
                marginBottom: '4px',
                fontSize: '14px'
              }}>
                売りシグナル
              </div>
              {sellConditions.map(condition => (
                <div key={condition.key} style={{ 
                  fontSize: '12px', 
                  color: '#d32f2f' 
                }}>
                  • {condition.name}
                </div>
              ))}
            </div>
          )}
        </DirectionStack>
      </div>
    </BasicStack>
  );
}