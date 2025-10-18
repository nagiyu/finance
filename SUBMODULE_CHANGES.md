# Submodule Changes Required

## Overview
This PR includes changes to the `nextjs-common` submodule that need to be applied to enable cache-free fetch operations.

## Changes Made
Modified file: `nextjs-common/common/services/FetchServiceBase.client.ts`

### Changes:
1. Added `cache: 'no-store'` option to the `get()` method
2. Added `cache: 'no-store'` option to the `getById()` method

## Integration Steps
These changes need to be integrated into the `nagiyu-nextjs-common` repository:

1. Create a PR in `nagiyu/nagiyu-nextjs-common` with the changes to `FetchServiceBase.client.ts`
2. Once merged, update the submodule reference in this repository to point to the new commit

## Modified Code
```typescript
// In FetchServiceBase.client.ts

public async get(): Promise<T[]> {
  try {
    const response = await fetch(this.endpoint, {
      method: 'GET',
      cache: 'no-store'  // Added this line
    });
    // ... rest of the method
  }
}

public async getById(id: string): Promise<T | null> {
  try {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'GET',
      cache: 'no-store'  // Added this line
    });
    // ... rest of the method
  }
}
```

## Why This is Needed
Next.js 15 caches fetch requests by default. By adding `cache: 'no-store'` to all GET requests in the `FetchServiceBase`, we ensure that:
- The Refresh button in admin screens always fetches the latest data
- Users see current data without needing to perform hard refreshes
- The cache synchronization APIs work as expected

## Testing
After these changes are applied:
1. Open any admin screen (exchanges, tickers, myticker, finance-notification, permission-admin)
2. Click the "Refresh" button
3. Verify that the latest data is fetched from the server (not from cache)
