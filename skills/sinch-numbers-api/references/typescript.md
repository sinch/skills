# TypeScript/Node.js — Numbers SDK Reference

`npm install @sinch/sdk-core`

## Initialization

```typescript
import { SinchClient } from '@sinch/sdk-core';
const sinch = new SinchClient({
  projectId: process.env.SINCH_PROJECT_ID!,
  keyId: process.env.SINCH_KEY_ID!,
  keySecret: process.env.SINCH_KEY_SECRET!,
});
```

## Available Numbers

### Search

```typescript
const response = await sinch.numbers.availableNumber.list({
  projectId: config.projectId,
  regionCode: 'US',
  type: 'LOCAL',
  capabilities: ['SMS'],
  size: 10,
});
const available = response.availableNumbers || [];
```

Pattern matching: add `'numberPattern.pattern': '2020'` and `'numberPattern.searchPattern': 'CONTAINS'`.

### Check availability

```typescript
const number = await sinch.numbers.availableNumber.checkAvailability({
  projectId: config.projectId,
  phoneNumber: '+12025550134',
});
```

### Rent a specific number

```typescript
await sinch.numbers.availableNumber.rent({
  projectId: config.projectId,
  phoneNumber: '+12025550134',
  rentNumberRequestBody: {
    smsConfiguration: { servicePlanId: 'YOUR_SERVICE_PLAN_ID' },
  },
});
```

### Rent any matching number

```typescript
const rented = await sinch.numbers.availableNumber.rentAny({
  projectId: config.projectId,
  rentAnyNumberRequestBody: {
    regionCode: 'US',
    type: 'LOCAL',
    capability: ['SMS'],
    smsConfiguration: { servicePlanId: 'YOUR_SERVICE_PLAN_ID' },
  },
});
```

> **Note:** `rentAny` uses `capability` (singular), unlike `list` which uses `capabilities` (plural).

## Active Numbers

### List

```typescript
const response = await sinch.numbers.activeNumber.list({
  projectId: config.projectId,
  regionCode: 'US',
  type: 'LOCAL',
  pageSize: 100,
});
const numbers = response.activeNumbers || [];
```

### Paginate

```typescript
const allNumbers: Numbers.ActiveNumber[] = [];
for await (const number of sinch.numbers.activeNumber.list({
  projectId: config.projectId,
  regionCode: 'US',
  type: 'LOCAL',
  pageSize: 100,
})) {
  allNumbers.push(number);
}
```

### Get

```typescript
const number = await sinch.numbers.activeNumber.get({
  projectId: config.projectId,
  phoneNumber: '+12025550134',
});
```

### Update

```typescript
await sinch.numbers.activeNumber.update({
  projectId: config.projectId,
  phoneNumber: '+12025550134',
  updateActiveNumberRequestBody: {
    displayName: 'Updated Name',
    smsConfiguration: { servicePlanId: 'NEW_SERVICE_PLAN_ID' },
  },
});
```

### Release

```typescript
await sinch.numbers.activeNumber.release({
  projectId: config.projectId,
  phoneNumber: '+12025550134',
});
```

## Available Regions

```typescript
const regions = await sinch.numbers.availableRegions.list({
  projectId: config.projectId,
});
```

## Callback Configuration

```typescript
// Get current config
const cbConfig = await sinch.numbers.callbackConfiguration.get({
  projectId: config.projectId,
});

// Update HMAC secret
await sinch.numbers.callbackConfiguration.update({
  projectId: config.projectId,
  callbackConfigurationUpdateRequest: {
    hmacSecret: 'YOUR_HMAC_SECRET',
  },
});
```
