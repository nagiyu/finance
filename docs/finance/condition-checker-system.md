# Condition Checker System

## Overview

The Condition Checker System provides a modular and extensible way to check various financial notification conditions. Instead of having all condition checking logic embedded in the `FinanceNotificationService`, the system separates concerns by providing individual checker classes for each condition type.

## Architecture

### Base Components

#### BaseConditionChecker
Abstract base class that all condition checkers extend. Provides common functionality and ensures consistent implementation patterns.

```typescript
abstract class BaseConditionChecker {
  abstract readonly conditionType: FinanceNotificationConditionType;
  abstract check(params: ConditionCheckParams): Promise<Condition>;
  
  // Helper methods for creating standardized condition responses
  protected createCondition(met: boolean, message: string): Condition;
  protected createSuccessCondition(target: string, patternName: string): Condition;
  protected createFailureCondition(): Condition;
  // ... other helper methods
}
```

#### ConditionCheckParams
Interface that standardizes the parameters passed to condition checkers:

```typescript
interface ConditionCheckParams {
  target: string;           // Human-readable target name
  exchangeKey: string;      // Exchange identifier
  tickerKey: string;        // Ticker symbol
  conditionValue?: number;  // Threshold value (for price conditions)
  session?: string;         // Trading session (regular/extended)
}
```

#### Condition
Interface representing the result of a condition check:

```typescript
interface Condition {
  met: boolean;    // Whether the condition was satisfied
  message: string; // Descriptive message for notifications
}
```

### Condition Checker Provider

The `ConditionCheckerProvider` manages all condition checkers and provides a unified interface for condition checking.

```typescript
const provider = new ConditionCheckerProvider({
  fallbackHandler: (conditionType, params) => {
    // Handle conditions not yet migrated to new system
  }
});

// Check a condition
const result = await provider.checkCondition(conditionType, params);
```

## Available Condition Checkers

### Price-based Checkers

#### GreaterThanConditionChecker
Checks if the current stock price is greater than a specified threshold.

#### LessThanConditionChecker  
Checks if the current stock price is less than a specified threshold.

### Pattern-based Checkers

#### ThreeRedSoldiersConditionChecker
Detects the "Three Red Soldiers" candlestick pattern - three consecutive bullish candles that indicate strong upward momentum.

#### TwoTakuriLinesConditionChecker
Detects the "Two Takuri Lines" pattern - two candles with long lower shadows and small bodies, indicating potential bullish reversal.

#### ThreeRiverEveningStarConditionChecker
Detects the "Three River Evening Star" pattern - a bearish reversal pattern with a long bearish candle, small bullish candle with gap up, and bullish candle.

#### SwallowReturnConditionChecker
Detects the "Swallow Return" pattern - a bullish reversal pattern where two gap-up bearish candles are followed by a bullish candle.

#### FireworksConditionChecker
Detects the "Fireworks" pattern - a bearish reversal pattern characterized by a candle with long upper shadow, short body, and minimal lower shadow.

#### OkajiThreeCrowsConditionChecker
Detects the "Okaji Three Crows" pattern - three consecutive bearish candles with no gaps between them, indicating strong bearish momentum.

#### FallingStonesConditionChecker
Detects the "Falling Stones" pattern - a descending wedge bearish pattern starting with a large bullish candle followed by small candles with lower lows.

#### BullishHaramiCrossConditionChecker
Detects the "Bullish Harami Cross" pattern - a bullish reversal pattern where a small bullish candle is contained within a large bullish candle.

#### BearishHaramiCrossConditionChecker
Detects the "Bearish Harami Cross" pattern - a bearish reversal pattern where a small bearish candle is contained within a large bearish candle.

#### HawkReversalConditionChecker
Detects the "Hawk Reversal" pattern - a bearish engulfing pattern where the second candle completely engulfs the first candle's body.

#### ThreeDarkStarsConditionChecker
Detects the "Three Dark Stars" pattern - three consecutive bearish candles with small bodies, indicating bearish continuation.

#### ShootingStarConditionChecker
Detects the "Shooting Star" pattern - a bearish reversal pattern with long upper shadow, short bearish body, and small lower shadow.

## Creating New Condition Checkers

To add a new condition checker:

1. Create a new class extending `BaseConditionChecker`
2. Implement the required `conditionType` and `check` methods
3. Add the checker to the `ConditionCheckerProvider`
4. Update this documentation

Example:

```typescript
export class MyPatternConditionChecker extends BaseConditionChecker {
  readonly conditionType = FINANCE_NOTIFICATION_CONDITION_TYPE.MY_PATTERN;

  async check(params: ConditionCheckParams): Promise<Condition> {
    const { target, exchangeKey, tickerKey, session } = params;
    
    try {
      // Implement pattern detection logic
      const hasPattern = await this.detectPattern(exchangeKey, tickerKey, session);
      
      if (hasPattern) {
        return this.createSuccessCondition(target, 'My Pattern');
      }
      
      return this.createFailureCondition();
    } catch (error) {
      return this.createErrorCondition(target, error);
    }
  }
}
```

## Migration Strategy

The system uses a fallback mechanism to ensure backward compatibility during migration:

1. New condition checkers are added to the provider
2. Legacy methods in `FinanceNotificationService` remain as fallbacks
3. Gradual migration of patterns from legacy methods to dedicated checkers
4. Once all patterns are migrated, legacy methods can be removed

## Benefits

- **Separation of Concerns**: Each condition type has its own dedicated checker
- **Extensibility**: Easy to add new condition types without modifying core service
- **Testability**: Individual checkers can be tested in isolation
- **Maintainability**: Condition logic is organized and easier to maintain
- **Consistency**: Standardized interfaces ensure consistent behavior across checkers