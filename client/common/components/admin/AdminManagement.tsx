/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { useEffect, useState } from 'react';

import { DataTypeBase } from '@common/interfaces/data/DataTypeBase';

import BasicTable, { Column } from '@client-common/components/data/table/BasicTable';
import EditDialog from '@client-common/components/feedback/dialog/EditDialog';
import ContainsButton from '@client-common/components/inputs/Buttons/ContainedButton';
import DeleteDialog from '@client-common/components/feedback/dialog/DeleteDialog';
import DirectionStack from '@client-common/components/Layout/Stacks/DirectionStack';

interface AdminManagementTableType {
    action: React.ReactNode;
}

interface AdminManagementProps<ItemType extends DataTypeBase, StateType extends Record<string, unknown> = Record<string, unknown>> {
    columns: Column<ItemType & AdminManagementTableType>[];
    loading?: boolean;
    fetchData: () => Promise<ItemType[]>;
    itemName: string;
    defaultItem: ItemType;
    defaultState?: StateType;
    generateState?: (item: ItemType) => StateType;
    validateItem: (data: ItemType) => string | null;
    onCreate: (item: ItemType) => Promise<ItemType>;
    onUpdate: (item: ItemType) => Promise<ItemType>;
    onDelete: (id: string) => Promise<void>;
    children: (
        item: ItemType,
        state: StateType,
        onItemChange: (updates: ItemType) => void,
        onStateChange: (updates: StateType) => void,
        loading?: boolean,
        runWithLoading?: <T>(func: () => Promise<T>) => Promise<T>
    ) => React.ReactNode;
};

export default function AdminManagement<ItemType extends DataTypeBase, StateType extends Record<string, unknown> = Record<string, unknown>>({
    columns,
    loading = false,
    fetchData,
    itemName,
    defaultItem,
    defaultState = {} as StateType,
    generateState = () => ({} as StateType),
    validateItem,
    onCreate,
    onUpdate,
    onDelete,
    children
}: AdminManagementProps<ItemType, StateType>) {
    const [items, setItems] = useState<(ItemType & AdminManagementTableType)[]>([]);
    const [item, setItem] = useState<ItemType>(defaultItem);
    const [isNew, setIsNew] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const itemToTable = (item: ItemType): ItemType & AdminManagementTableType => {
        return {
            ...item,
            action: (
                <DirectionStack>
                    <ContainsButton label='Edit' onClick={() => onEditClick(item)} />
                    <ContainsButton label='Delete' onClick={() => onDeleteClick(item)} />
                </DirectionStack>
            )
        };
    };

    const onCreateClick = async () => {
        setItem(defaultItem);
        setIsNew(true);
        setEditDialogOpen(true);
    };

    const onEditClick = async (item: ItemType) => {
        setItem(item);
        setIsNew(false);
        setEditDialogOpen(true);
    };

    const onDeleteClick = (item: ItemType) => {
        setItem(item);
        setDeleteDialogOpen(true);
    };

    const handleCreate = async (item: ItemType) => {
        const createdItem = await onCreate(item);
        setItems([...items, itemToTable(createdItem)]);
        setEditDialogOpen(false);
    };

    const handleUpdate = async (item: ItemType) => {
        const updatedItem = await onUpdate(item);
        setItems(items.map(t => (t.id === item.id ? itemToTable(updatedItem) : t)));
        setEditDialogOpen(false);
    };

    const handleDelete = async (id: string) => {
        await onDelete(id);
        setItems(items.filter(t => t.id !== id));
        setDeleteDialogOpen(false);
    };

    useEffect(() => {
        (async () => {
            const data = await fetchData();
            setItems(data.map(itemToTable));
        })();
    }, []);

    return (
        <>
            <ContainsButton label='Create' onClick={onCreateClick} disabled={loading} />
            <BasicTable columns={columns} data={items} loading={loading} />
            <EditDialog
                open={editDialogOpen}
                title={isNew ? `Create ${itemName}` : `Edit ${itemName}`}
                onClose={() => setEditDialogOpen(false)}
                isNew={isNew}
                initItem={item}
                initState={generateState(item)}
                defaultItem={defaultItem}
                defaultState={defaultState}
                validateItem={validateItem}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                children={children}
            />
            <DeleteDialog
                open={deleteDialogOpen}
                title={`Delete ${itemName}`}
                onClose={() => setDeleteDialogOpen(false)}
                itemID={item.id}
                itemName={itemName}
                onDelete={handleDelete}
            />
        </>
    );
}