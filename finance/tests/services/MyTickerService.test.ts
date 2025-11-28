import MyTickerService from '@finance/services/MyTickerService';
import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';
import { MyTickerRecordType } from '@finance/interfaces/record/MyTickerRecordType';

describe('MyTickerService', () => {
  let service: MyTickerService;

  beforeEach(() => {
    service = new MyTickerService();
  });

  describe('dataToRecord', () => {
    it('should convert DataType to RecordType correctly', () => {
      const data: Partial<MyTickerDataType> = {
        userId: 'user123',
        exchangeId: 'NYSE',
        tickerId: 'AAPL',
        quantity: 10,
        averagePrice: 150.5,
      };

      // Using type assertion to access protected method for testing
      const record = (service as any).dataToRecord(data);

      expect(record.UserID).toBe('user123');
      expect(record.ExchangeID).toBe('NYSE');
      expect(record.TickerID).toBe('AAPL');
      expect(record.Quantity).toBe(10);
      expect(record.AveragePrice).toBe(150.5);
    });

    it('should handle partial data correctly', () => {
      const data: Partial<MyTickerDataType> = {
        userId: 'user456',
        quantity: 5.5,
      };

      const record = (service as any).dataToRecord(data);

      expect(record.UserID).toBe('user456');
      expect(record.Quantity).toBe(5.5);
      expect(record.ExchangeID).toBeUndefined();
      expect(record.TickerID).toBeUndefined();
      expect(record.AveragePrice).toBeUndefined();
    });

    it('should handle fractional values correctly', () => {
      const data: Partial<MyTickerDataType> = {
        userId: 'user789',
        exchangeId: 'NASDAQ',
        tickerId: 'GOOGL',
        quantity: 0.25,
        averagePrice: 2850.75,
      };

      const record = (service as any).dataToRecord(data);

      expect(record.Quantity).toBe(0.25);
      expect(record.AveragePrice).toBe(2850.75);
    });
  });

  describe('recordToData', () => {
    it('should convert RecordType to DataType correctly', () => {
      const record = {
        ID: 'id123',
        DataType: 'MyTicker' as const,
        UserID: 'user123',
        ExchangeID: 'NYSE',
        TickerID: 'AAPL',
        Quantity: 10,
        AveragePrice: 150.5,
        Create: 1234567890,
        Update: 1234567900,
      } as MyTickerRecordType;

      const data = (service as any).recordToData(record);

      expect(data.id).toBe('id123');
      expect(data.userId).toBe('user123');
      expect(data.exchangeId).toBe('NYSE');
      expect(data.tickerId).toBe('AAPL');
      expect(data.quantity).toBe(10);
      expect(data.averagePrice).toBe(150.5);
      expect(data.create).toBe(1234567890);
      expect(data.update).toBe(1234567900);
    });

    it('should handle all fields correctly', () => {
      const record = {
        ID: 'abc-def-ghi',
        DataType: 'MyTicker' as const,
        UserID: 'user456',
        ExchangeID: 'NASDAQ',
        TickerID: 'MSFT',
        Quantity: 25.5,
        AveragePrice: 380.25,
        Create: 1609459200000,
        Update: 1609545600000,
      } as MyTickerRecordType;

      const data = (service as any).recordToData(record);

      expect(data.id).toBe('abc-def-ghi');
      expect(data.userId).toBe('user456');
      expect(data.exchangeId).toBe('NASDAQ');
      expect(data.tickerId).toBe('MSFT');
      expect(data.quantity).toBe(25.5);
      expect(data.averagePrice).toBe(380.25);
      expect(data.create).toBe(1609459200000);
      expect(data.update).toBe(1609545600000);
    });

    it('should preserve data types correctly', () => {
      const record = {
        ID: 'test-id',
        DataType: 'MyTicker' as const,
        UserID: 'test-user',
        ExchangeID: 'TEST',
        TickerID: 'TEST',
        Quantity: 0.001,
        AveragePrice: 99999.99,
        Create: 0,
        Update: 0,
      } as MyTickerRecordType;

      const data = (service as any).recordToData(record);

      expect(typeof data.id).toBe('string');
      expect(typeof data.userId).toBe('string');
      expect(typeof data.exchangeId).toBe('string');
      expect(typeof data.tickerId).toBe('string');
      expect(typeof data.quantity).toBe('number');
      expect(typeof data.averagePrice).toBe('number');
      expect(typeof data.create).toBe('number');
      expect(typeof data.update).toBe('number');
    });
  });

  describe('data conversion round-trip', () => {
    it('should maintain data integrity through dataToRecord and recordToData', () => {
      const originalData: Partial<MyTickerDataType> = {
        userId: 'user999',
        exchangeId: 'TSE',
        tickerId: 'SONY',
        quantity: 15,
        averagePrice: 12500.5,
      };

      const record = (service as any).dataToRecord(originalData);

      // Add required fields that would be added by the database
      const completeRecord = {
        ID: 'generated-id',
        DataType: 'MyTicker' as const,
        Create: Date.now(),
        Update: Date.now(),
        ...record,
      } as MyTickerRecordType;

      const convertedData = (service as any).recordToData(completeRecord);

      expect(convertedData.userId).toBe(originalData.userId);
      expect(convertedData.exchangeId).toBe(originalData.exchangeId);
      expect(convertedData.tickerId).toBe(originalData.tickerId);
      expect(convertedData.quantity).toBe(originalData.quantity);
      expect(convertedData.averagePrice).toBe(originalData.averagePrice);
    });
  });
});
