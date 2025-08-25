/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';
import AuthFetchService from '@client-common/services/auth/AuthFetchService.client';
import MyTickerFetchService from '@/services/myticker/MyTickerFetchService.client';
import ExchangeUtil from '@/utils/ExchangeUtil';
import TickerUtil from '@/utils/TickerUtil';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';
import { TickerDataType } from '@/interfaces/data/TickerDataType';

import AdminEditDialog, { FieldConfig } from '../common/AdminEditDialog';

type MyTickerEditDialogProps = {
    open: boolean;
    onClose: () => void;
    isNew: boolean;
    myTicker: MyTickerDataType | null;
    exchanges: ExchangeDataType[];
    allTickers: TickerDataType[];
    createMyTicker: (data: MyTickerDataType) => void;
    updateMyTicker: (data: MyTickerDataType) => void;
}

export default function MyTickerEditDialog({
    open,
    onClose,
    isNew,
    myTicker,
    exchanges,
    allTickers,
    createMyTicker,
    updateMyTicker
}: MyTickerEditDialogProps) {

    const fieldConfigs: FieldConfig[] = [
        {
            name: 'exchangeId',
            label: 'Exchange',
            type: 'select',
            required: true,
            options: ExchangeUtil.dataToSelectOptions(exchanges)
        },
        {
            name: 'tickerId',
            label: 'Ticker',
            type: 'select',
            required: true,
            dependsOn: 'exchangeId',
            options: [] // Will be populated dynamically based on exchange
        },
        {
            name: 'purchaseDate',
            label: 'Purchase Date',
            type: 'date',
            required: true
        },
        {
            name: 'purchasePrice',
            label: 'Purchase Price',
            type: 'number',
            required: true,
            validation: (value: number) => {
                if (value < 0) return 'Purchase price must be non-negative';
                return null;
            }
        },
        {
            name: 'quantity',
            label: 'Quantity',
            type: 'number',
            required: true,
            validation: (value: number) => {
                if (value <= 0) return 'Quantity must be greater than zero';
                return null;
            }
        },
        {
            name: 'isSell',
            label: 'Sell',
            type: 'checkbox'
        },
        {
            name: 'sellDate',
            label: 'Sell Date',
            type: 'date',
            conditional: 'isSell'
        },
        {
            name: 'sellPrice',
            label: 'Sell Price',
            type: 'number',
            conditional: 'isSell'
        }
    ];

    const handleConfirm = async (formData: Record<string, any>) => {
        // Remove isSell helper field and prepare data for API
        const { isSell, ...apiData } = formData;
        
        // If not selling, clear sell fields
        if (!isSell) {
            apiData.sellDate = null;
            apiData.sellPrice = null;
        }

        const fetchService = new MyTickerFetchService();
        const authFetchService = new AuthFetchService();
        const user = await authFetchService.getUserByGoogle();
        const userId = user.id;
        const now = Date.now();

        if (isNew) {
            const fetchRequest: MyTickerDataType = {
                id: '',
                userId,
                create: now,
                update: now,
                exchangeId: apiData.exchangeId,
                tickerId: apiData.tickerId,
                purchaseDate: apiData.purchaseDate,
                purchasePrice: apiData.purchasePrice,
                quantity: apiData.quantity,
                sellDate: apiData.sellDate,
                sellPrice: apiData.sellPrice
            };

            const returnMyTicker = await fetchService.create(fetchRequest);
            createMyTicker(returnMyTicker);
        } else {
            if (!myTicker) {
                throw new Error('MyTicker not found');
            }

            const fetchRequest: MyTickerDataType = {
                id: myTicker.id,
                userId,
                create: myTicker.create,
                update: now,
                exchangeId: apiData.exchangeId,
                tickerId: apiData.tickerId,
                purchaseDate: apiData.purchaseDate,
                purchasePrice: apiData.purchasePrice,
                quantity: apiData.quantity,
                sellDate: apiData.sellDate,
                sellPrice: apiData.sellPrice
            };

            const returnMyTicker = await fetchService.update(fetchRequest);
            updateMyTicker(returnMyTicker);
        }
    };

    // Prepare additional data for the dialog including computed isSell state
    const additionalData = {
        allTickers,
        // Compute isSell state from existing data
        computedValues: {
            isSell: myTicker && (myTicker.sellDate || myTicker.sellPrice) ? true : false
        }
    };

    return (
        <AdminEditDialog
            open={open}
            onClose={onClose}
            isNew={isNew}
            title="My Ticker"
            data={myTicker}
            fields={fieldConfigs}
            onConfirm={handleConfirm}
            additionalData={additionalData}
        />
    );
}
