import ExchangeService from '@finance/services/ExchangeService';
import { ExchangeDataType } from '@finance/interfaces/data/ExchangeDataType';
import TimeUtil from '@common/utils/TimeUtil';

jest.unmock('@finance/services/ExchangeService');

export default class ExchangeServiceMock extends ExchangeService {
  public static MockExchangeName = 'Mock Exchange';

  public override async getById(id: string): Promise<ExchangeDataType | null> {
    return {
      id: id,
      name: ExchangeServiceMock.MockExchangeName,
      key: 'MOCK_EXCHANGE',
      start: TimeUtil.parseTime('09:00'),
      end: TimeUtil.parseTime('15:00'),
      create: Date.now(),
      update: Date.now(),
    };
  }
}
