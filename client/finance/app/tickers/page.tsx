
/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { useEffect, useState } from 'react';

import AdminManagement from '@client-common/components/admin/AdminManagement';
import { Column } from '@client-common/components/data/table/BasicTable';

import Auth from '@/app/components/Auth';
import ExchangeFetchService from '@/services/exchange/ExchangeFetchService.client';
import TickerEditDialogContent from '@/app/components/ticker/TickerEditDialogContent';
import TickerFetchService from '@/services/ticker/TickerFetchService.client';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';
import { TickerDataType } from '@/interfaces/data/TickerDataType';

interface TickerTableType extends TickerDataType {
    action: React.ReactNode;
}

export default function TickersPage() {
    const [exchanges, setExchanges] = useState<ExchangeDataType[]>([]);

    const tickerFetchService = new TickerFetchService();
    const exchangeFetchService = new ExchangeFetchService();

    const columns: Column<TickerTableType>[] = [
        { id: 'name', label: 'Name' },
        { id: 'key', label: 'Key' },
        {
            id: 'exchange',
            label: 'Exchange',
            format: (cell) => cell ? exchanges.find(exchange => exchange.id === cell)?.name : ''
        },
        { id: 'action', label: 'Action' }
    ];

    const defaultItem: TickerDataType = {
        id: '',
        name: '',
        key: '',
        exchange: '',
        create: Date.now(),
        update: Date.now()
    };

    const fetchData = async (): Promise<TickerDataType[]> => {
        return await tickerFetchService.get();
    };

    const onCreate = async (item: TickerDataType): Promise<TickerDataType> => {
        return await tickerFetchService.create(item);
    };

    const onUpdate = async (item: TickerDataType): Promise<TickerDataType> => {
        return await tickerFetchService.update(item);
    };

    const onDelete = async (id: string): Promise<void> => {
        await tickerFetchService.delete(id);
    };

    const validateItem = (item: TickerDataType): string | null => {
        if (!item.name.trim()) return 'Name is required.';
        if (!item.key.trim()) return 'Key is required.';
        if (!item.exchange.trim()) return 'Exchange is required.';
        return null;
    };

    useEffect(() => {
        (async () => {
            const exchangeData = await exchangeFetchService.get();
            setExchanges(exchangeData);
        })();
    }, []);

    return (
        <Auth
            adminContent={
                <AdminManagement<TickerDataType>
                    columns={columns}
                    fetchData={fetchData}
                    itemName='Ticker'
                    defaultItem={defaultItem}
                    validateItem={validateItem}
                    onCreate={onCreate}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                >
                    {(item, _, onItemChange) => (
                        <TickerEditDialogContent
                            item={item}
                            onItemChange={onItemChange}
                            exchanges={exchanges}
                        />
                    )}
                </AdminManagement>
            }
            userContent={
                <div>権限がありません。</div>
            }
        />
    );
}
