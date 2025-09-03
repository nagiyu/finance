import DynamoDBUtil from '@common/aws/DynamoDBUtil';

import FinanceUtil from '@finance/utils/FinanceUtil';
import TickerUtil from '@/utils/TickerUtil';
import { TickerDataType } from "@/interfaces/data/TickerDataType";
import { TickerRecordType } from "@/interfaces/records/TickerRecordType";

export default class TickerDataAccessor {
  private static readonly recordType = 'Ticker';

  public static async get(): Promise<TickerDataType[]> {
    const tickerRecords = await DynamoDBUtil.getAllByDataType<TickerRecordType>(FinanceUtil.getFinanceTableName(), this.recordType);
    return tickerRecords.map(TickerUtil.recordToData);
  }

  public static async create(ticker: TickerDataType): Promise<void> {
    const record = TickerUtil.dataToRecord(ticker);
    await DynamoDBUtil.create(FinanceUtil.getFinanceTableName(), record);
  }

  public static async update(ticker: TickerDataType): Promise<void> {
    const record = TickerUtil.dataToRecord(ticker);
    await DynamoDBUtil.update(FinanceUtil.getFinanceTableName(), record.ID, this.recordType, record);
  }

  public static async delete(id: string): Promise<void> {
    await DynamoDBUtil.delete(FinanceUtil.getFinanceTableName(), id, this.recordType);
  }
}
