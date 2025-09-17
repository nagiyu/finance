import TickerService from '@finance/services/TickerService';
import { TickerDataType } from '@finance/interfaces/data/TickerDataType';

jest.unmock('@finance/services/TickerService');

export default class TickerServiceMock extends TickerService {
  public static MockTickerName = 'Mock Ticker';

  public override async getById(id: string): Promise<TickerDataType | null> {
    return {
      id: id,
      name: TickerServiceMock.MockTickerName,
      key: 'MOCK_TICKER',
      exchange: 'MOCK_EXCHANGE',
      create: Date.now(),
      update: Date.now(),
    };
  }
}
