# Conditions System

## Overview

The Conditions System provides a modular and extensible way to check various financial notification conditions. The system separates concerns by providing individual condition classes for each condition type, managed through the `ConditionService`.

## Architecture

### Base Components

#### ConditionBase
Abstract base class that all conditions extend. Provides common functionality and ensures consistent implementation patterns.

```typescript
abstract class ConditionBase {
  constructor(
    exchangeService: ExchangeService,
    tickerService: TickerService
  );

  abstract checkCondition(
    exchangeId: string,
    tickerId: string,
    session?: ExchangeSessionType,
    targetPrice?: number | null,
    timeframe?: TimeFrame | null
  ): Promise<boolean>;

  // Helper methods for data access
  protected getStockPriceData(exchangeId: string, tickerId: string, options?: GetStockPriceDataOptions): Promise<any>;
  protected getCurrentStockPrice(exchangeId: string, tickerId: string, session?: string): Promise<number | null>;
}
```

#### ConditionInfo
Interface that defines metadata about each condition:

```typescript
interface ConditionInfo {
  name: string;                    // Human-readable name
  description: string;             // Detailed description
  isBuyCondition: boolean;         // Whether it's a buy signal
  isSellCondition: boolean;        // Whether it's a sell signal
  enableTargetPrice: boolean;      // Whether target price is required
  enableTimeFrame: boolean;        // Whether timeframe is configurable
}
```

#### ConditionResult
Interface representing the result of a condition check:

```typescript
interface ConditionResult {
  met: boolean;     // Whether the condition was satisfied
  message?: string; // Optional descriptive message for notifications
}
```

### ConditionService

The `ConditionService` manages all conditions and provides a unified interface for condition checking.

```typescript
const conditionService = new ConditionService(exchangeService, tickerService);

// Check a condition
const result = await conditionService.checkCondition(
  conditionName,
  exchangeId,
  tickerId,
  session,
  targetPrice,
  frequency,
  timeframe
);
```

## Available Conditions

### Price-based Conditions

#### GreaterThanCondition
Checks if the current stock price is greater than a specified threshold.
- Requires target price
- Supports all timeframes

#### LessThanCondition
Checks if the current stock price is less than a specified threshold.
- Requires target price
- Supports all timeframes

### Pattern-based Conditions

#### SansenAkenomyojoCondition (三川明けの明星)
Detects the "Morning Star" pattern - a bullish reversal pattern with three candles:
1. Long bearish candle
2. Small bullish candle with gap up
3. Another bullish candle

This pattern indicates selling pressure is weakening and buying pressure is strengthening.

#### SansenYoinomyojoCondition (三川宵の明星)
Detects the "Evening Star" pattern - a bearish reversal pattern similar to Morning Star but inverted.

## Creating New Conditions

To add a new condition:

1. Create a new class extending `ConditionBase`
2. Export a `ConditionInfo` object with metadata
3. Implement the `checkCondition` method
4. Add the condition to `ConditionService.conditionMap`
5. Update this documentation

Example:

```typescript
export const MyPatternConditionInfo: ConditionInfo = {
  name: 'My Pattern',
  description: 'Description of the pattern...',
  isBuyCondition: true,
  isSellCondition: false,
  enableTargetPrice: false,
  enableTimeFrame: true,
};

export default class MyPatternCondition extends ConditionBase {
  async checkCondition(
    exchangeId: string,
    tickerId: string,
    session?: ExchangeSessionType,
    targetPrice?: number | null,
    timeframe?: TimeFrame | null
  ): Promise<boolean> {
    try {
      const stockData = await this.getStockPriceData(exchangeId, tickerId, {
        count: 3,
        session,
        timeframe: timeframe || '1'
      });

      if (!stockData || stockData.length < 3) {
        return false;
      }

      // Implement pattern detection logic
      return this.detectPattern(stockData);
    } catch (error) {
      console.error('Error checking pattern:', error);
      return false;
    }
  }
}
```

## Integration with FinanceNotificationService

The `FinanceNotificationService` uses the `ConditionService` to check conditions:

1. **Timing Filter**: Conditions are filtered based on frequency constraints
2. **Parallel Execution**: All qualifying conditions are checked simultaneously using `Promise.allSettled()`
3. **Result Processing**: Results are processed to find the first met condition
4. **Notification**: If a condition is met, a push notification is sent

## Benefits

- **Separation of Concerns**: Each condition type has its own dedicated class
- **Extensibility**: Easy to add new condition types without modifying core service
- **Testability**: Individual conditions can be tested in isolation
- **Maintainability**: Condition logic is organized and easier to maintain
- **Consistency**: Standardized interfaces ensure consistent behavior across conditions
- **Performance**: Parallel execution reduces overall condition checking time
- **Flexibility**: Supports both price-based and pattern-based conditions with configurable parameters