/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { useEffect, useState } from 'react';

import { AuthDataType } from '@common/interfaces/data/AuthDataType';

import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';

import AuthFetchService from '@client-common/services/auth/AuthFetchService.client';
import AdminManagement from '@client-common/components/admin/AdminManagement';
import { Column } from '@client-common/components/data/table/BasicTable';

import FeatureGuard from '@/app/components/FeatureGuard';
import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';
import ExchangeFetchService from '@/services/exchange/ExchangeFetchService.client';
import MyTickerEditDialogContent from '@/app/components/myticker/MyTickerEditDialogContent';
import MyTickerFetchService from '@/services/myticker/MyTickerFetchService.client';
import TickerFetchService from '@/services/ticker/TickerFetchService.client';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';
import { TickerDataType } from '@/interfaces/data/TickerDataType';

interface MyTickerTableType extends MyTickerDataType {
    totalCost?: number;
    action: React.ReactNode;
}

export interface StateType extends Record<string, unknown> {
    filteredTickers: TickerDataType[];
}

export default function MyTickerPage() {
    const [exchanges, setExchanges] = useState<ExchangeDataType[]>([]);
    const [tickers, setTickers] = useState<TickerDataType[]>([]);
    const [currentUser, setCurrentUser] = useState<AuthDataType | null>(null);

    const myTickerFetchService = new MyTickerFetchService();
    const authFetchService = new AuthFetchService();
    const exchangeFetchService = new ExchangeFetchService();
    const tickerFetchService = new TickerFetchService();

    const columns: Column<MyTickerTableType>[] = [
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
        { id: 'quantity', label: 'Quantity' },
        { id: 'averagePrice', label: 'Avg Price' },
        {
            id: 'totalCost',
            label: 'Total Cost',
            format: (cell) => cell ? Number(cell).toFixed(2) : '0.00'
        },
        { id: 'action', label: 'Action' }
    ];

    const defaultItem: MyTickerDataType = {
        id: '',
        userId: '',
        exchangeId: '',
        tickerId: '',
        quantity: 0,
        averagePrice: 0,
        create: Date.now(),
        update: Date.now()
    }

    const defaultState: StateType = {
        filteredTickers: []
    }

    const generateState = (item: MyTickerDataType): StateType => {
        const filteredTickers = tickers.filter(t => t.exchange === item.exchangeId);

        return {
            filteredTickers
        };
    };

    const getCurrentUser = async (): Promise<AuthDataType> => {
        if (currentUser) {
            return currentUser;
        }

        try {
            const user = await authFetchService.getUserByGoogle();
            setCurrentUser(user);
            return user;
        } catch (error) {
            console.error('Failed to get current user:', error);
            throw new Error('Unable to get user information. Please make sure you are logged in.');
        }
    };

    const fetchData = async (): Promise<MyTickerDataType[]> => {
        const user = await getCurrentUser();
        const result = await myTickerFetchService.get();
        const userHoldings = result.filter(item => item.userId === user.id);

        // Add calculated totalCost to each holding
        return userHoldings.map(item => ({
            ...item,
            totalCost: item.quantity * item.averagePrice
        })) as MyTickerDataType[];
    };

    const fixItem = async (item: MyTickerDataType, isNew: boolean): Promise<MyTickerDataType> => {
        const user = await getCurrentUser();
        item.userId = user.id;

        const now = Date.now();

        if (isNew) {
            item.create = now;
        }

        item.update = now;

        return item;
    };

    const onCreate = async (item: MyTickerDataType): Promise<MyTickerDataType> => {
        const fixedItem = await fixItem(item, true);
        const result = await myTickerFetchService.create(fixedItem);

        return result;
    };

    const onUpdate = async (item: MyTickerDataType): Promise<MyTickerDataType> => {
        const fixedItem = await fixItem(item, false);
        const result = await myTickerFetchService.update(fixedItem);

        return result;
    };

    const onDelete = async (id: string): Promise<void> => {
        await myTickerFetchService.delete(id);
    };

    const validateItem = (item: MyTickerDataType): string | null => {
        if (!item.exchangeId.trim()) return 'Exchange is required.';
        if (!item.tickerId.trim()) return 'Ticker is required.';
        if (item.quantity <= 0) return 'Quantity must be greater than 0.';
        if (item.averagePrice <= 0) return 'Average Price must be greater than 0.';
        return null;
    };

    useEffect(() => {
        (async () => {
            try {
                // Initialize user information first
                await getCurrentUser();

                const [exchangeData, tickerData] = await Promise.all([
                    exchangeFetchService.get(),
                    tickerFetchService.get()
                ]);
                setExchanges(exchangeData);
                setTickers(tickerData);
            } catch (error) {
                console.error('Failed to initialize component:', error);
                // You might want to show an error message to the user here
            }
        })();
    }, []);

    return (
        <FeatureGuard 
            feature={Feature.MY_TICKER} 
            level={PermissionLevel.VIEW}
        >
            <div>
                <AdminManagement<MyTickerDataType, StateType>
                    columns={columns}
                    fetchData={fetchData}
                    itemName='My Ticker'
                    defaultItem={defaultItem}
                    defaultState={defaultState}
                    generateState={generateState}
                    validateItem={validateItem}
                    onCreate={onCreate}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                >
                    {(item, state, onItemChange, onStateChange) => {
                        return (
                            <MyTickerEditDialogContent
                                item={item}
                                state={state}
                                onItemChange={onItemChange}
                                onStateChange={onStateChange}
                                exchanges={exchanges}
                                tickers={tickers}
                            />
                        );
                    }}
                </AdminManagement>
            </div>
        </FeatureGuard>
    )
}
