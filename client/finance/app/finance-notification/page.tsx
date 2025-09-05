/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { useEffect, useState } from 'react';

import { FINANCE_NOTIFICATION_CONDITION_TYPE, FINANCE_NOTIFICATION_TIME_FRAME, FINANCE_NOTIFICATION_MODE, FINANCE_NOTIFICATION_FREQUENCY } from '@finance/types/FinanceNotificationType';
import { FinanceNotificationDataType } from '@finance/interfaces/data/FinanceNotificationDataType';

import AdminManagement from '@client-common/components/admin/AdminManagement';
import NotificationUtil from '@client-common/utils/NotificationUtil.client';
import TerminalUtil from '@client-common/utils/TerminalUtil.client';
import { Column } from '@client-common/components/data/table/BasicTable';

import ErrorUtil from '@common/utils/ErrorUtil';
import ExchangeFetchService from '@/services/exchange/ExchangeFetchService.client';
import FinanceNotificationEditDialogContent from '@/app/components/financeNotification/FinanceNotificationEditDialogContent';
import FinanceNotificationFetchService from '@/services/financeNotification/FinanceNotificationFetchService.client';
import LoadingAuthPage from '@/app/components/pages/LoadingAuthPage';
import TickerFetchService from '@/services/ticker/TickerFetchService.client';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';
import { TickerDataType } from '@/interfaces/data/TickerDataType';

interface FinanceNotificationTableType extends FinanceNotificationDataType {
    action: React.ReactNode;
}

export interface StateType extends Record<string, unknown> {
    filteredTickers: TickerDataType[];
}

export default function FinanceNotificationPage() {
    const [exchanges, setExchanges] = useState<ExchangeDataType[]>([]);
    const [tickers, setTickers] = useState<TickerDataType[]>([]);

    const financeNotificationFetchService = new FinanceNotificationFetchService();
    const exchangeFetchService = new ExchangeFetchService();
    const tickerFetchService = new TickerFetchService();

    const columns: Column<FinanceNotificationTableType>[] = [
        {
            id: 'exchangeId',
            label: 'Exchange',
            format: (cell) => cell ? exchanges.find(exchange => exchange.id === cell)?.name : ''
        },
        {
            id: 'tickerId',
            label: 'Ticker',
            format: (cell) => cell ? tickers.find(ticker => ticker.id === cell)?.name : ''
        },
        {
            id: 'mode',
            label: 'Mode',
            format: (cell) => {
                if (cell) {
                    return cell === 'Buy' ? '買い' : '売り';
                }
                return 'シンプル';
            }
        },
        {
            id: 'conditionType',
            label: 'Conditions',
            // We'll need to modify this later when we can access the full row
        },
        {
            id: 'conditionValue',
            label: 'Target Price'
        },
        {
            id: 'action',
            label: 'Action'
        }
    ];

    const defaultItem: FinanceNotificationDataType = {
        id: '',
        terminalId: '',
        subscriptionEndpoint: '',
        subscriptionKeysP256dh: '',
        subscriptionKeysAuth: '',
        exchangeId: '',
        tickerId: '',
        mode: FINANCE_NOTIFICATION_MODE.BUY,
        conditions: JSON.stringify([]),
        conditionType: FINANCE_NOTIFICATION_CONDITION_TYPE.GREATER_THAN,
        conditionValue: 0,
        timeFrame: FINANCE_NOTIFICATION_TIME_FRAME.ONE_MINUTE,
        session: 'extended', // Default to extended (時間外取引含む) as specified
        frequency: FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL,
        create: Date.now(),
        update: Date.now(),
    };

    const defaultState: StateType = {
        filteredTickers: []
    };

    const generateState = (item: FinanceNotificationDataType): StateType => {
        return {
            filteredTickers: tickers.filter(t => t.exchange === item.exchangeId)
        };
    };

    const fetchData = async () => {
        const terminalId = await TerminalUtil.getTerminalId();
        const result = await financeNotificationFetchService.get();
        return result.filter(item => item.terminalId === terminalId);
    };

    const fixItem = async (item: FinanceNotificationDataType, isNew: boolean): Promise<FinanceNotificationDataType> => {
        item.terminalId = await TerminalUtil.getTerminalId();

        const subscription = NotificationUtil.getSubscription();

        if (!subscription) {
            ErrorUtil.throwError('No push subscription found. Please subscribe to notifications first.');
        }

        item.subscriptionEndpoint = subscription.endpoint;
        item.subscriptionKeysP256dh = subscription.keys.p256dh;
        item.subscriptionKeysAuth = subscription.keys.auth;

        // TODO: 実装するまでは固定値
        item.timeFrame = FINANCE_NOTIFICATION_TIME_FRAME.ONE_MINUTE;

        const now = Date.now();

        if (isNew) {
            item.create = now;
        }

        item.update = now;

        return item;
    };

    const onCreate = async (item: FinanceNotificationDataType): Promise<FinanceNotificationDataType> => {
        const fixedItem = await fixItem(item, true);
        return await financeNotificationFetchService.create(fixedItem);
    };

    const onUpdate = async (item: FinanceNotificationDataType): Promise<FinanceNotificationDataType> => {
        const fixedItem = await fixItem(item, false);
        return await financeNotificationFetchService.update(fixedItem);
    };

    const onDelete = async (id: string): Promise<void> => {
        await financeNotificationFetchService.delete(id);
    };

    const validateItem = (item: FinanceNotificationDataType): string | null => {
        if (!item.exchangeId.trim()) {
            return 'Exchange is required.';
        }

        if (!item.tickerId.trim()) {
            return 'Ticker is required.';
        }

        // Validate based on mode (always in mode-based system now)
        if (!item.conditions) {
            return 'At least one condition must be selected.';
        }
        
        try {
            const conditions = JSON.parse(item.conditions);
            if (!Array.isArray(conditions) || conditions.length === 0) {
                return 'At least one condition must be selected.';
            }
            
            // Check if price-based conditions are selected and require condition value
            const needsValue = conditions.some((c: string) => 
                c === FINANCE_NOTIFICATION_CONDITION_TYPE.GREATER_THAN || 
                c === FINANCE_NOTIFICATION_CONDITION_TYPE.LESS_THAN);
            
            if (needsValue && item.conditionValue <= 0) {
                return 'Target price must be greater than 0 for price-based conditions.';
            }
        } catch (error) {
            return 'Invalid conditions format.';
        }

        return null;
    };

    useEffect(() => {
        (async () => {
            const [exchangesData, tickersData] = await Promise.all([
                exchangeFetchService.get(),
                tickerFetchService.get()
            ]);
            setExchanges(exchangesData);
            setTickers(tickersData);
        })();
    }, []);

    return (
        <LoadingAuthPage
            userContent={(loading, runWithLoading) => (
                <AdminManagement<FinanceNotificationDataType, StateType>
                    columns={columns}
                    loading={loading}
                    fetchData={() => runWithLoading(fetchData)}
                    itemName='Finance Notification'
                    defaultItem={defaultItem}
                    defaultState={defaultState}
                    generateState={generateState}
                    validateItem={validateItem}
                    onCreate={(item) => runWithLoading(() => onCreate(item))}
                    onUpdate={(item) => runWithLoading(() => onUpdate(item))}
                    onDelete={(id) => runWithLoading(() => onDelete(id))}
                >
                    {(item, state, onItemChange, onStateChange, loading) => {
                        return (
                            <FinanceNotificationEditDialogContent
                                item={item}
                                state={state}
                                onItemChange={onItemChange}
                                onStateChange={onStateChange}
                                loading={loading}
                                exchanges={exchanges}
                                tickers={tickers}
                            />
                        );
                    }}
                </AdminManagement>
            )}
        />
    )
}
