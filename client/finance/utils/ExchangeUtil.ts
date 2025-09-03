import DynamoDBUtil from '@common/aws/DynamoDBUtil';
import TimeUtil from '@common/utils/TimeUtil';

import { SelectOptionType } from '@client-common/interfaces/SelectOptionType';

import FinanceUtil from '@finance/utils/FinanceUtil';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';
import { ExchangeRecordType } from '@/interfaces/records/ExchangeRecordType';

export default class ExchangeUtil {
    public static ConvertExchange(record: ExchangeRecordType): ExchangeDataType {
        return {
            id: record.ID,
            name: record.Name,
            key: record.Key,
            start: TimeUtil.parseTime(record.Start),
            end: TimeUtil.parseTime(record.End),
            create: record.Create,
            update: record.Update
        };
    }

    public static ConvertExchangeRecord(exchange: ExchangeDataType): ExchangeRecordType {
        return {
            ID: exchange.id,
            DataType: 'Exchange',
            Name: exchange.name,
            Key: exchange.key,
            Start: TimeUtil.formatTime(exchange.start),
            End: TimeUtil.formatTime(exchange.end),
            Create: exchange.create,
            Update: exchange.update
        };
    }

    public static dataToSelectOptions(exchanges: ExchangeDataType[]): SelectOptionType[] {
        return exchanges.map(exchange => ({
            label: exchange.name,
            value: exchange.id
        }));
    }

    public static async GetAll(): Promise<ExchangeDataType[]> {
        const exchangeRecords = await DynamoDBUtil.getAllByDataType<ExchangeRecordType>(FinanceUtil.getFinanceTableName(), 'Exchange');
        return exchangeRecords.map(this.ConvertExchange);
    }

    public static async Create(exchange: ExchangeDataType): Promise<void> {
        const record = this.ConvertExchangeRecord(exchange);
        await DynamoDBUtil.create(FinanceUtil.getFinanceTableName(), record);
    }

    public static async Update(exchange: ExchangeDataType): Promise<void> {
        const record = this.ConvertExchangeRecord(exchange);
        await DynamoDBUtil.update(FinanceUtil.getFinanceTableName(), record.ID, 'Exchange', record);
    }

    public static async Delete(id: string): Promise<void> {
        await DynamoDBUtil.delete(FinanceUtil.getFinanceTableName(), id, 'Exchange');
    }
}
