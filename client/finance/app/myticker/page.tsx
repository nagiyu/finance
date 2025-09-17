/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { useEffect, useState } from 'react';

import DateUtil from '@common/utils/DateUtil';
import { AuthDataType } from '@common/interfaces/data/AuthDataType';

import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';
import { MY_TICKER_DEAL_TYPE } from '@finance/types/MyTickerType';

import AuthFetchService from '@client-common/services/auth/AuthFetchService.client';
import AdminManagement from '@client-common/components/admin/AdminManagement';
import { Column } from '@client-common/components/data/table/BasicTable';

import Auth from '@/app/components/Auth';
import ExchangeFetchService from '@/services/exchange/ExchangeFetchService.client';
import MyTickerEditDialogContent from '@/app/components/myticker/MyTickerEditDialogContent';
import MyTickerFetchService from '@/services/myticker/MyTickerFetchService.client';
import MyTickerSummary from '@/app/components/myticker/MyTickerSummary';
import MyTickerSummaryUtil from '@/utils/MyTickerSummaryUtil';
import TickerFetchService from '@/services/ticker/TickerFetchService.client';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';
import { MyTickerSummaryDataType } from '@/interfaces/data/MyTickerSummaryDataType';
import { TickerDataType } from '@/interfaces/data/TickerDataType';

interface MyTickerTableType extends MyTickerDataType {
    action: React.ReactNode;
}

export interface StateType extends Record<string, unknown> {
    filteredTickers: TickerDataType[];
}

export default function MyTickerPage() {
    const [exchanges, setExchanges] = useState<ExchangeDataType[]>([]);
    const [tickers, setTickers] = useState<TickerDataType[]>([]);
    const [summary, setSummary] = useState<MyTickerSummaryDataType[]>([]);
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
        {
            id: 'deal',
            label: 'Deal'
        },
        {
            id: 'date',
            label: 'Date',
            format: (cell) => cell ? new Date(cell).toLocaleString() : ''
        },
        { id: 'price', label: 'Price' },
        { id: 'quantity', label: 'Quantity' },
        { id: 'action', label: 'Action' }
    ];

    const defaultItem: MyTickerDataType = {
        id: '',
        userId: '',
        exchangeId: '',
        tickerId: '',
        deal: MY_TICKER_DEAL_TYPE.PURCHASE,
        date: DateUtil.getTodayStartTimestamp(),
        price: 0,
        quantity: 0,
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
        const userTransactions = result.filter(item => item.userId === user.id);

        // Update summary when data is fetched
        const newSummary = MyTickerSummaryUtil.calculateSummary(userTransactions, exchanges, tickers);
        setSummary(newSummary);

        return userTransactions;
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

    const refreshSummary = async (): Promise<void> => {
        const user = await getCurrentUser();
        const allTransactions = await myTickerFetchService.get();
        const userTransactions = allTransactions.filter(t => t.userId === user.id);
        const newSummary = MyTickerSummaryUtil.calculateSummary(userTransactions, exchanges, tickers);
        setSummary(newSummary);
    };

    const onCreate = async (item: MyTickerDataType): Promise<MyTickerDataType> => {
        const fixedItem = await fixItem(item, true);
        const result = await myTickerFetchService.create(fixedItem);

        // Refresh summary after creating new transaction
        await refreshSummary();

        return result;
    };

    const onUpdate = async (item: MyTickerDataType): Promise<MyTickerDataType> => {
        const fixedItem = await fixItem(item, false);
        const result = await myTickerFetchService.update(fixedItem);

        // Refresh summary after updating transaction
        await refreshSummary();

        return result;
    };

    const onDelete = async (id: string): Promise<void> => {
        await myTickerFetchService.delete(id);

        // Refresh summary after deleting transaction
        await refreshSummary();
    };

    const validateItem = (item: MyTickerDataType): string | null => {
        if (!item.exchangeId.trim()) return 'Exchange is required.';
        if (!item.tickerId.trim()) return 'Ticker is required.';
        if (item.price <= 0) return 'Price must be greater than 0.';
        if (item.quantity <= 0) return 'Quantity must be greater than 0.';
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

    // Recalculate summary when exchanges or tickers data is updated
    useEffect(() => {
        if (exchanges.length > 0 && tickers.length > 0 && currentUser) {
            refreshSummary();
        }
    }, [exchanges, tickers]);

    return (
        <Auth
            userContent={
                <div>
                    <MyTickerSummary summary={summary} />
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
            }
        />
    )
}
