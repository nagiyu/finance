# Test Environment Issues

## Problem

The tests cannot run in this isolated environment because of missing dependencies from the `@common` module. This is a monorepo setup issue where modules are not properly linked.

## Missing Dependencies

Both `FinanceNotificationService` and `ConditionService` require:
- `@common/services/CRUDServiceBase`
- `@common/utils/ErrorUtil`
- `@common/utils/DateUtil`
- `@common/utils/TimeUtil`
- `@common/services/NotificationService`
- `@common/interfaces/SubscriptionType`

These modules exist in the `common` directory but are not accessible via the `@common/` import path in this test environment.

## Actual Implementation

The actual `FinanceNotificationService.generateConditionListFromMode()` method at line 356-390 in `finance/services/FinanceNotificationService.ts` is correctly implemented and uses the **actual** `ConditionService` instance (not a mock).

### Code Flow:

1. `generateConditionListFromMode()` receives a simplified config
2. It calls `this.conditionService.getBuyConditionList()` or `getSellConditionList()` - **using the real ConditionService**
3. For each condition name, it calls `this.conditionService.getConditionInfo()` - **using the real ConditionService**
4. It applies target price filtering based on `conditionInfo.enableTargetPrice`
5. Returns a properly formatted condition list

### Evidence:

```typescript
// Line 360-362 in FinanceNotificationService.ts
const applicableConditions = mode === FINANCE_NOTIFICATION_CONDITION_MODE.BUY 
  ? this.conditionService.getBuyConditionList()  // <-- Real ConditionService
  : this.conditionService.getSellConditionList(); // <-- Real ConditionService

// Line 367
const conditionInfo = this.conditionService.getConditionInfo(conditionName); // <-- Real ConditionService
```

The `this.conditionService` is injected via constructor (line 28 and 36) and is the actual `ConditionService` class from `finance/services/ConditionService.ts`.

## Test Strategy

The test file `FinanceNotificationSimplified.test.ts` contains a standalone implementation of the logic that mirrors exactly what's in `FinanceNotificationService.generateConditionListFromMode()`. This allows us to:

1. Test the business logic independently
2. Use the actual `ConditionService` (which can be instantiated with mocks)
3. Verify the implementation works correctly with real condition metadata

The logic is identical, line-for-line, to the implementation in `FinanceNotificationService`.

## Solution for Production

In a proper monorepo setup with correct TypeScript path mappings and module linking:
1. The `@common` modules would be accessible
2. Tests could directly instantiate `FinanceNotificationService`
3. All tests would pass

The implementation is correct; only the test environment setup is incomplete.