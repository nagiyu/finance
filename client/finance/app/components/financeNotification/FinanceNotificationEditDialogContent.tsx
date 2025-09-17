/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { useEffect, useState } from 'react';

import { FinanceNotificationCondition } from '@finance/interfaces/FinanceNotificationType';
import { FinanceNotificationDataType } from '@finance/interfaces/data/FinanceNotificationDataType';
import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';
import { FINANCE_NOTIFICATION_CONDITION_MODE, FINANCE_NOTIFICATION_FREQUENCY } from '@finance/consts/FinanceNotificationConst';

import BasicDialog from '@client-common/components/feedback/dialog/BasicDialog';
import BasicSelect from '@client-common/components/inputs/Selects/BasicSelect';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';
import BasicTable, { Column } from '@client-common/components/data/table/BasicTable';
import CommonFetchService from '@client-common/services/CommonFetchService.client';
import ContainedButton from '@client-common/components/inputs/Buttons/ContainedButton';
import DirectionStack from '@client-common/components/Layout/Stacks/DirectionStack';
import ErrorAlert from '@client-common/components/feedback/alert/ErrorAlert';

import ExchangeUtil from '@/utils/ExchangeUtil';
import FinanceNotificationConditionEditDialogContent from '@/app/components/financeNotification/FinanceNotificationConditionEditDialogContent';
import FrequencyUtil from '@/utils/finance-notification/FrequencyUtil';
import ModeUtil from '@/utils/finance-notification/ModeUtil';
import SessionUtil from '@/utils/SessionUtil';
import TickerUtil from '@/utils/TickerUtil';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';
import { TickerDataType } from '@/interfaces/data/TickerDataType';
import { StateType } from '@/app/finance-notification/page';

interface FinanceNotificationConditionTableType extends FinanceNotificationCondition {
    action: React.ReactNode;
}

interface FinanceNotificationEditDialogContentProps {
    item: FinanceNotificationDataType;
    state: StateType;
    onItemChange: (item: FinanceNotificationDataType) => void;
    onStateChange: (state: StateType) => void;
    loading?: boolean;
    exchanges: ExchangeDataType[];
    tickers: TickerDataType[];
};

export default function FinanceNotificationEditDialogContent({
    item,
    state,
    onItemChange,
    onStateChange,
    loading,
    exchanges,
    tickers,
}: FinanceNotificationEditDialogContentProps) {
    const commonFetchService = new CommonFetchService();

    const defaultCondition: FinanceNotificationCondition = {
        id: null,
        mode: FINANCE_NOTIFICATION_CONDITION_MODE.BUY,
        conditionName: '',
        frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
        session: EXCHANGE_SESSION.EXTENDED,
        targetPrice: null,
        firstNotificationSent: false,
    };

    const [condition, setCondition] = useState<FinanceNotificationCondition>(defaultCondition);
    const [conditionError, setConditionError] = useState<string | null>(null);
    const [isNewCondition, setIsNewCondition] = useState(false);
    const [editConditionDialogOpen, setEditConditionDialogOpen] = useState(false);
    const [deleteConditionDialogOpen, setDeleteConditionDialogOpen] = useState(false);

    const columns: Column<FinanceNotificationConditionTableType>[] = [
        {
            id: 'mode',
            label: 'Mode',
            format: (cell) => ModeUtil.formatMode(cell),
        },
        {
            id: 'conditionName',
            label: 'Condition',
        },
        {
            id: 'frequency',
            label: 'Frequency',
            format: (cell) => FrequencyUtil.formatFrequency(cell),
        },
        {
            id: 'session',
            label: 'Session',
            format: (cell) => SessionUtil.formatSession(cell),
        },
        {
            id: 'targetPrice',
            label: 'Target Price',
        },
        {
            id: 'action',
            label: 'Action',
        }
    ];

    const onConditionCreateClick = () => {
        setCondition(defaultCondition);
        setIsNewCondition(true);
        setEditConditionDialogOpen(true);
    };

    const onConditionEditClick = (condition: FinanceNotificationCondition) => {
        setCondition(condition);
        setIsNewCondition(false);
        setEditConditionDialogOpen(true);
    };

    const onConditionDeleteClick = (condition: FinanceNotificationCondition) => {
        setCondition(condition);
        setDeleteConditionDialogOpen(true);
    };

    const handleCreateCondition = async (condition: FinanceNotificationCondition) => {
        if (!condition.id) {
            condition.id = await commonFetchService.getUUID();
        }
        onItemChange({
            ...item,
            conditionList: [
                ...item.conditionList,
                condition
            ]
        });
        setEditConditionDialogOpen(false);
    };

    const handleUpdateCondition = async (condition: FinanceNotificationCondition) => {
        const conditionList = item.conditionList.map(c =>
            c.id === condition.id ? condition : c
        );
        onItemChange({
            ...item,
            conditionList: conditionList
        });
        setEditConditionDialogOpen(false);
    };

    const handleDeleteCondition = async (condition: FinanceNotificationCondition) => {
        const conditionList = item.conditionList.filter(c =>
            c.id !== condition.id
        );
        onItemChange({
            ...item,
            conditionList: conditionList
        });
        setDeleteConditionDialogOpen(false);
    };

    const conditionListToTable = (conditions: FinanceNotificationCondition[]): FinanceNotificationConditionTableType[] => {
        return conditions.map((condition) => ({
            ...condition,
            action: (
                <DirectionStack>
                    <ContainedButton label='Edit' onClick={() => onConditionEditClick(condition)} />
                    <ContainedButton label='Delete' onClick={() => onConditionDeleteClick(condition)} />
                </DirectionStack>
            )
        }));
    };

    useEffect(() => {
        if (exchanges.length === 0 || tickers.length === 0) {
            return;
        }

        const exchangeId = item.exchangeId.trim() === '' ? exchanges[0].id : item.exchangeId;
        const filteredTickers = tickers.filter(t => t.exchange === exchangeId);
        const tickerId = filteredTickers.find(t => t.id === item.tickerId)
            ? item.tickerId
            : (filteredTickers.length > 0 ? filteredTickers[0].id : '');

        onItemChange({
            ...item,
            exchangeId: exchangeId,
            tickerId: tickerId
        });
        onStateChange({ ...state, filteredTickers });
    }, [exchanges, tickers]);

    return (
        <>
            <BasicSelect
                label='Exchange'
                options={ExchangeUtil.dataToSelectOptions(exchanges)}
                value={item.exchangeId}
                disabled={loading}
                onChange={(value) => {
                    const filteredTickers = tickers.filter(t => t.exchange === value);
                    onItemChange({ ...item, exchangeId: value, tickerId: filteredTickers.length > 0 ? filteredTickers[0].id : '' });
                    onStateChange({ ...state, filteredTickers });
                }}
            />
            <BasicSelect
                label='Ticker'
                options={TickerUtil.dataToSelectOptions(state.filteredTickers)}
                value={item.tickerId}
                disabled={loading || !item.exchangeId}
                onChange={(value) => onItemChange({ ...item, tickerId: value })}
            />

            {/* Create Condition Button */}
            <ContainedButton label='Create' onClick={onConditionCreateClick} disabled={loading} />

            {/* Condition List Table */}
            <BasicTable columns={columns} data={conditionListToTable(item.conditionList)} loading={loading} />

            {/* Edit Condition Dialog */}
            <BasicDialog
                open={editConditionDialogOpen}
                title={isNewCondition ? 'Create Condition' : 'Edit Condition'}
                onClose={() => setEditConditionDialogOpen(false)}
                onConfirm={isNewCondition ? () => handleCreateCondition(condition) : () => handleUpdateCondition(condition)}
                confirmText={isNewCondition ? 'Create' : 'Update'}
                closeText='Cancel'
            >
                {(loading) => (
                    <>
                        {conditionError && <ErrorAlert message={conditionError} />}
                        <BasicStack>
                            <FinanceNotificationConditionEditDialogContent
                                item={condition}
                                onItemChange={setCondition}
                                isNew={isNewCondition}
                                loading={loading}
                            />
                        </BasicStack>
                    </>
                )}
            </BasicDialog>

            {/* Delete Condition Dialog */}
            <BasicDialog
                open={deleteConditionDialogOpen}
                title='Delete Condition'
                onClose={() => setDeleteConditionDialogOpen(false)}
                onConfirm={() => handleDeleteCondition(condition)}
                confirmText='Delete'
                closeText='Cancel'
            >
                {() => (
                    <>
                        {conditionError && <ErrorAlert message={conditionError} />}
                        <div>{condition.conditionName}を削除しますか？</div>
                    </>
                )}
            </BasicDialog>
        </>
    );
}
