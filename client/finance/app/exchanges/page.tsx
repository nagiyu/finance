'use client';

import React from 'react';

import TimeUtil from '@common/utils/TimeUtil';

import { Column } from '@client-common/components/data/table/BasicTable';

import FeatureGuard from '@/app/components/FeatureGuard';
import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';
import ExchangeEditDialogContent from '@/app/components/exchange/ExchangeEditDialogContent';
import ExchangeFetchService from '@/services/exchange/ExchangeFetchService.client';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';

interface ExchangeTableType extends ExchangeDataType {
    action: React.ReactNode;
}

export default function ExchangesPage() {
    const exchangeFetchService = new ExchangeFetchService();

    const columns: Column<ExchangeTableType>[] = [
        { id: 'name', label: 'Name' },
        { id: 'key', label: 'Key' },
        { id: 'start', label: 'Start Time', format: TimeUtil.formatTime },
        { id: 'end', label: 'End Time', format: TimeUtil.formatTime },
        { id: 'action', label: 'Actions' }
    ];

    const defaultItem: ExchangeDataType = {
        id: '',
        name: '',
        key: '',
        start: { hour: 0, minute: 0 },
        end: { hour: 0, minute: 0 },
        create: Date.now(),
        update: Date.now()
    };

    const fetchData = async (): Promise<ExchangeDataType[]> => {
        return await exchangeFetchService.get();
    };

    const fixItem = (item: ExchangeDataType, isNew: boolean): ExchangeDataType => {
        const now = Date.now();

        if (isNew) {
            item.create = now;
        }

        item.update = now;

        return item;
    };

    const onCreate = async (item: ExchangeDataType): Promise<ExchangeDataType> => {
        const fixedItem = fixItem(item, true);
        return await exchangeFetchService.create(fixedItem);
    };

    const onUpdate = async (item: ExchangeDataType): Promise<ExchangeDataType> => {
        const fixedItem = fixItem(item, false);
        return await exchangeFetchService.update(fixedItem);
    };

    const onDelete = async (id: string): Promise<void> => {
        await exchangeFetchService.delete(id);
    };

    const onRefresh = async (): Promise<void> => {
        await exchangeFetchService.syncCache();
    };

    const validateItem = (item: ExchangeDataType): string | null => {
        if (!item.name.trim()) return 'Name is required.';
        if (!item.key.trim()) return 'Key is required.';
        if (item.start.hour < 0 || item.start.hour > 23) return 'Start hour must be between 0 and 23.';
        if (item.start.minute < 0 || item.start.minute > 59) return 'Start minute must be between 0 and 59.';
        if (item.end.hour < 0 || item.end.hour > 23) return 'End hour must be between 0 and 23.';
        if (item.end.minute < 0 || item.end.minute > 59) return 'End minute must be between 0 and 59.';
        return null;
    };

    return (
        <FeatureGuard 
            feature={Feature.EXCHANGE} 
            level={PermissionLevel.ADMIN}
            fallback={<div>権限がありません。</div>}
        >
            <AdminManagement<ExchangeDataType>
                columns={columns}
                fetchData={fetchData}
                itemName='Exchange'
                defaultItem={defaultItem}
                validateItem={validateItem}
                onCreate={onCreate}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onRefresh={onRefresh}
            >
                {(item, _, onItemChange) => (
                    <ExchangeEditDialogContent item={item} onItemChange={onItemChange} />
                )}
            </AdminManagement>
        </FeatureGuard>
    );
}
