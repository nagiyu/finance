/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { useEffect, useState } from 'react';

import { ConditionInfo } from '@finance/conditions/ConditionBase';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import { FinanceNotificationCondition } from '@finance/interfaces/FinanceNotificationType';
import { FinanceNotificationConditionModeType, FinanceNotificationFrequencyType } from '@finance/types/FinanceNotificationType';
import { FINANCE_NOTIFICATION_CONDITION_MODE, FINANCE_NOTIFICATION_FREQUENCY } from '@finance/consts/FinanceNotificationConst';

import BasicRadioGroup from '@client-common/components/inputs/RadioGroups/BasicRadioGroup';
import BasicSelect from '@client-common/components/inputs/Selects/BasicSelect';
import CurrencyNumberField from '@client-common/components/inputs/TextFields/CurrencyNumberField';
import OutlinedButton from '@client-common/components/inputs/Buttons/OutlinedButton';
import { SelectOptionType } from '@client-common/interfaces/SelectOptionType';

import FinanceNotificationConditionFetchService from '@/services/financeNotification/FinanceNotificationConditionFetchService.client';
import FrequencyUtil from '@/utils/finance-notification/FrequencyUtil';
import ModeUtil from '@/utils/finance-notification/ModeUtil';
import SessionSelect from '@/app/components/common/SessionSelect';
import SessionUtil from '@/utils/SessionUtil';
import TimeFrameSelect from '@/app/components/common/TimeFrameSelect';
import TimeFrameUtil from '@/utils/TimeFrameUtil';
import TargetPriceCalculationDialog from '@/app/components/financeNotification/TargetPriceCalculationDialog';

interface FinanceNotificationConditionEditDialogContentProps {
    item: FinanceNotificationCondition;
    onItemChange: (item: FinanceNotificationCondition) => void;
    isNew: boolean;
    loading?: boolean;
    exchangeId?: string;
    tickerId?: string;
}

export default function FinanceNotificationConditionEditDialogContent({
    item,
    onItemChange,
    isNew,
    loading,
    exchangeId,
    tickerId,
}: FinanceNotificationConditionEditDialogContentProps) {
    const [conditions, setConditions] = useState<SelectOptionType[]>([]);
    const [conditionInfo, setConditionInfo] = useState<ConditionInfo>({
        name: '',
        description: '',
        isBuyCondition: false,
        isSellCondition: false,
        enableTargetPrice: false,
        enableTimeFrame: false,
        enableSimplifiedMode: false,
    });
    const [calculationDialogOpen, setCalculationDialogOpen] = useState(false);

    const conditionFetchService = new FinanceNotificationConditionFetchService();

    const initializeConditions = (): void => {
        onItemChange({
            ...item,
            conditionName: conditions[0].value,
            frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
            session: SessionUtil.getDefaultSession(),
            timeframe: TimeFrameUtil.getDefaultTimeFrame(),
            targetPrice: null,
            firstNotificationSent: false,
        });
    }

    useEffect(() => {
        (async () => {
            const fetchedConditions = await conditionFetchService.getConditionList(item.mode);
            setConditions(fetchedConditions);
        })();
    }, [item.mode]);

    useEffect(() => {
        if (!isNew) return;

        if (conditions.length === 0) return;

        if (conditions[0].value === item.conditionName) return;

        initializeConditions();
    }, [conditions]);

    useEffect(() => {
        if (!item.conditionName) return;

        (async () => {
            const info = await conditionFetchService.getConditionInfo(item.conditionName);
            setConditionInfo(info);
        })();
    }, [item.conditionName]);

    useEffect(() => {
        if (!item.conditionName) return;
        if (conditionInfo.name !== item.conditionName) return;

        if (!conditionInfo.enableTargetPrice) {
            onItemChange({
                ...item,
                targetPrice: null,
            });
        } else {
            // Only set targetPrice to 1 if it's a new item and targetPrice is null
            // For existing items, preserve the current targetPrice value
            if (isNew && item.targetPrice === null) {
                onItemChange({
                    ...item,
                    targetPrice: 1,
                });
            }
        }

        if (!conditionInfo.enableTimeFrame) {
            onItemChange({
                ...item,
                timeframe: null,
            });
        } else {
            // Only set timeframe to default if it's a new item and timeframe is null
            // For existing items, preserve the current timeframe value
            if (isNew && !item.timeframe) {
                onItemChange({
                    ...item,
                    timeframe: TimeFrameUtil.getDefaultTimeFrame(),
                });
            }
        }
    }, [conditionInfo]);

    return (
        <>
            <BasicRadioGroup
                label="モード"
                name="notificationMode"
                value={item.mode || FINANCE_NOTIFICATION_CONDITION_MODE.BUY}
                options={ModeUtil.getModeOptions()}
                row={true}
                disabled={!isNew || loading}
                onChange={(e) => {
                    const newMode = e.target.value as FinanceNotificationConditionModeType;
                    onItemChange({
                        ...item,
                        mode: newMode,
                    });
                }}
            />
            <BasicSelect
                label='条件'
                options={conditions}
                value={item.conditionName}
                disabled={!isNew || loading || conditions.length === 0}
                onChange={(value) => {
                    onItemChange({
                        ...item,
                        conditionName: value,
                    });
                }}
            />
            {item.conditionName && conditionInfo.description && (
                <div style={{
                    marginTop: '8px',
                    padding: '12px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    lineHeight: '1.4',
                    color: '#666'
                }}>
                    <strong>条件の説明:</strong> {conditionInfo.description}
                </div>
            )}
            <BasicSelect
                label='通知頻度'
                options={FrequencyUtil.getFrequencyOptions()}
                value={item.frequency}
                disabled={loading}
                onChange={(value) => {
                    onItemChange({
                        ...item,
                        frequency: value as FinanceNotificationFrequencyType,
                    });
                }}
            />
            <SessionSelect
                value={item.session}
                disabled={loading}
                onChange={(value) => {
                    onItemChange({
                        ...item,
                        session: value as ExchangeSessionType,
                    });
                }}
            />
            {conditionInfo.enableTimeFrame && (
                <TimeFrameSelect
                    value={item.timeframe !== null ? item.timeframe : TimeFrameUtil.getDefaultTimeFrame()}
                    disabled={loading}
                    onChange={(value) => {
                        onItemChange({
                            ...item,
                            timeframe: value,
                        });
                    }}
                />
            )}
            {conditionInfo.enableTargetPrice && (
                <div>
                    <CurrencyNumberField
                        label='目標価格'
                        value={item.targetPrice !== null ? item.targetPrice : 0}
                        disabled={loading}
                        onChange={(value) => {
                            onItemChange({
                                ...item,
                                targetPrice: Number(value.target.value)
                            })
                        }}
                        onValueChange={(value) => {
                            // Ensure the target price is not negative
                            const validValue = Math.max(0, value);
                            onItemChange({
                                ...item,
                                targetPrice: validValue
                            })
                        }}
                    />
                    {conditionInfo.isSellCondition && item.mode === FINANCE_NOTIFICATION_CONDITION_MODE.SELL && (
                        <>
                            <OutlinedButton
                                label="算出ツールを使用"
                                onClick={() => setCalculationDialogOpen(true)}
                                disabled={loading}
                                size="small"
                                sx={{ mt: 1 }}
                            />
                            <TargetPriceCalculationDialog
                                open={calculationDialogOpen}
                                onClose={() => setCalculationDialogOpen(false)}
                                onApply={(targetPrice) => {
                                    onItemChange({
                                        ...item,
                                        targetPrice: targetPrice
                                    });
                                }}
                                exchangeId={exchangeId}
                                tickerId={tickerId}
                            />
                        </>
                    )}
                </div>
            )}
        </>
    );
}
