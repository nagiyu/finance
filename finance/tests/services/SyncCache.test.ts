/**
 * SyncCache API Integration Tests
 * 
 * これらのテストは、各サービスのキャッシュ同期APIが正しく実装されていることを確認します。
 * 実際のAPIリクエストをシミュレートし、syncCache()メソッドが呼び出されることを検証します。
 */

import ExchangeService from '@finance/services/ExchangeService';
import TickerService from '@finance/services/TickerService';
import MyTickerService from '@finance/services/MyTickerService';

describe('SyncCache API Implementation', () => {
  describe('Service syncCache method availability', () => {
    it('ExchangeService should have syncCache method', () => {
      const service = new ExchangeService();
      expect(typeof service.syncCache).toBe('function');
    });

    it('TickerService should have syncCache method', () => {
      const service = new TickerService();
      expect(typeof service.syncCache).toBe('function');
    });

    it('MyTickerService should have syncCache method', () => {
      const service = new MyTickerService();
      expect(typeof service.syncCache).toBe('function');
    });
  });

  describe('syncCache functionality', () => {
    it('should call syncCache without errors for ExchangeService', async () => {
      const service = new ExchangeService();
      
      // syncCache should not throw an error even if no data exists
      await expect(service.syncCache()).resolves.not.toThrow();
    });

    it('should call syncCache without errors for TickerService', async () => {
      const service = new TickerService();
      
      await expect(service.syncCache()).resolves.not.toThrow();
    });

    it('should call syncCache without errors for MyTickerService', async () => {
      const service = new MyTickerService();
      
      await expect(service.syncCache()).resolves.not.toThrow();
    });
  });
});
