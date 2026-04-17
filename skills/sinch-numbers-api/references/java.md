# Java — Numbers SDK Reference

Maven: `com.sinch.sdk:sinch-sdk-java` (v2.0.0+)

## Initialization

```java
import com.sinch.sdk.SinchClient;
import com.sinch.sdk.models.Configuration;

Configuration config = Configuration.builder()
    .setProjectId(System.getenv("SINCH_PROJECT_ID"))
    .setKeyId(System.getenv("SINCH_KEY_ID"))
    .setKeySecret(System.getenv("SINCH_KEY_SECRET"))
    .build();

SinchClient sinch = new SinchClient(config);
```

## Key Imports

```java
import com.sinch.sdk.domains.numbers.api.v1.NumbersService;
import com.sinch.sdk.domains.numbers.models.v1.*;
import com.sinch.sdk.domains.numbers.models.v1.request.*;
import com.sinch.sdk.domains.numbers.models.v1.response.*;
```

## Available Numbers

### Search

```java
NumbersService numbersService = sinch.numbers().v1();

AvailableNumberListResponse available = numbersService.searchForAvailableNumbers(
    AvailableNumbersListQueryParameters.builder()
        .setRegionCode("US")
        .setType(NumberType.LOCAL)
        .build()
);
available.iterator().forEachRemaining(n -> System.out.println(n.getPhoneNumber()));
```

Other methods: `checkAvailability("+12025550134")`, `rentAny(RentAnyNumberRequest)`.

### Rent

```java
sinch.numbers().v1().rent("+12025550134",
    RentNumberRequest.builder()
        .setSmsConfiguration(SmsConfiguration.builder()
            .setServicePlanId("YOUR_SERVICE_PLAN_ID").build())
        .build());
```

## Active Numbers

### List

```java
ActiveNumberListResponse response = sinch.numbers().v1().list(
    ActiveNumbersListQueryParameters.builder()
        .setRegionCode("US")
        .setType(NumberType.LOCAL)
        .build()
);
```

### Paginate

The response iterator handles pagination automatically:

```java
List<ActiveNumber> allNumbers = new ArrayList<>();
response.iterator().forEachRemaining(allNumbers::add);
```

### Get

```java
ActiveNumber number = sinch.numbers().v1().get("+12025550134");
```

### Update

```java
sinch.numbers().v1().update("+12025550134",
    ActiveNumberUpdateRequest.builder()
        .setDisplayName("Updated Name")
        .build());
```

### Release

```java
sinch.numbers().v1().release("+12025550134");
```

## Available Regions

```java
sinch.numbers().v1().regions().list(
    AvailableRegionsListQueryParameters.builder().build());
```

## Event Destinations Configuration

```java
import com.sinch.sdk.domains.numbers.models.v1.eventdestinations.request.EventDestinationUpdateRequest;

// Get current config
sinch.numbers().v1().eventDestinations().get();

// Update HMAC secret
sinch.numbers().v1().eventDestinations().update(
    EventDestinationUpdateRequest.builder()
        .setHmacSecret("YOUR_HMAC_SECRET")
        .build());
```
