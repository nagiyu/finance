import ErrorUtil from '@common/utils/ErrorUtil';

import ExchangeService from '@finance/services/ExchangeService';
import FinanceUtil, { GetStockPriceDataOptions } from '@finance/utils/FinanceUtil';
import TickerService from '@finance/services/TickerService';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';

/**
 * Interface for condition information.
 */
export interface ConditionInfo {
  /**
   * Name of the condition.
   */
  name: string;

  /**
   * Description of the condition.
   */
  description: string;

  /**
   * Indicates if the condition is a buy condition.
   */
  isBuyCondition: boolean;

  /**
   * Indicates if the condition is a sell condition.
   */
  isSellCondition: boolean;

  /**
   * Indicates if the condition requires a target price.
   */
  enableTargetPrice: boolean;
}

/**
 * Base class for all conditions.
 */
export default abstract class ConditionBase {
  private exchangeService: ExchangeService;
  private tickerService: TickerService;

  constructor(
    exchangeService: ExchangeService = new ExchangeService(),
    tickerService: TickerService = new TickerService()
  ) {
    this.exchangeService = exchangeService;
    this.tickerService = tickerService;
  }

  /**
   * Checks if the condition is met.
   * @param exchangeId Exchange ID
   * @param tickerId Ticker ID
   * @param session Exchange session (optional)
   * @param targetPrice Target price (optional)
   * @returns True if the condition is met, false otherwise
   */
  public abstract checkCondition(
    exchangeId: string,
    tickerId: string,
    session?: ExchangeSessionType,
    targetPrice?: number | null
  ): Promise<boolean>;

  /**
   * Gets stock price data.
   * @param exchangeId Exchange ID
   * @param tickerId Ticker ID
   * @param options Options for getting stock price data
   * @returns Stock price data or an error
   */
  protected async getStockPriceData(exchangeId: string, tickerId: string, options?: GetStockPriceDataOptions): Promise<any> {
    const exchange = await this.exchangeService.getById(exchangeId);
    if (!exchange) {
      ErrorUtil.throwError(`Exchange with ID ${exchangeId} not found`);
    }

    const ticker = await this.tickerService.getById(tickerId);
    if (!ticker) {
      ErrorUtil.throwError(`Ticker with ID ${tickerId} not found`);
    }

    return FinanceUtil.getStockPriceData(exchange.key, ticker.key, options);
  }

  /**
   * Gets the current stock price.
   * @param exchangeId Exchange ID
   * @param tickerId Ticker ID
   * @param session Exchange session (optional)
   * @returns Current stock price or null if not available
   */
  protected async getCurrentStockPrice(exchangeId: string, tickerId: string, session?: string): Promise<number | null> {
    const exchange = await this.exchangeService.getById(exchangeId);
    if (!exchange) {
      ErrorUtil.throwError(`Exchange with ID ${exchangeId} not found`);
    }

    const ticker = await this.tickerService.getById(tickerId);
    if (!ticker) {
      ErrorUtil.throwError(`Ticker with ID ${tickerId} not found`);
    }

    return FinanceUtil.getCurrentStockPrice(exchange.key, ticker.key, session);
  }
}
