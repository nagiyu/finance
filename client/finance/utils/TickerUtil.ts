import { SelectOptionType } from '@client-common/interfaces/SelectOptionType';

import { TickerDataType } from "@/interfaces/data/TickerDataType";
import { TickerRecordType } from "@/interfaces/records/TickerRecordType";

export default class TickerUtil {
  public static dataToRecord(data: TickerDataType): TickerRecordType {
    return {
      ID: data.id,
      DataType: 'Ticker',
      Name: data.name,
      Key: data.key,
      Exchange: data.exchange,
      Create: data.create,
      Update: data.update,
    };
  }

  public static recordToData(record: TickerRecordType): TickerDataType {
    return {
      id: record.ID,
      name: record.Name,
      key: record.Key,
      exchange: record.Exchange,
      create: record.Create,
      update: record.Update,
    };
  }

  public static dataToSelectOptions(tickers: TickerDataType[]): SelectOptionType[] {
    return tickers.map(ticker => ({
      label: ticker.name,
      value: ticker.id
    }));
  }
}
