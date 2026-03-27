# Python — Numbers SDK Reference

`pip install sinch`

SDK uses snake_case attributes mapping to camelCase JSON (e.g., `phone_number` ↔ `phoneNumber`).

## Initialization

```python
import os
from sinch import SinchClient

sinch_client = SinchClient(
    project_id=os.environ["SINCH_PROJECT_ID"],
    key_id=os.environ["SINCH_KEY_ID"],
    key_secret=os.environ["SINCH_KEY_SECRET"]
)
```

## Available Numbers

### Search

```python
response = sinch_client.numbers.available.list(
    region_code="US",
    number_type="LOCAL",
    capabilities=["SMS"],
    size=10
)
available = response.available_numbers or []
```

### Check availability

```python
result = sinch_client.numbers.available.check_availability(
    phone_number="+12025550134"
)
```

### Rent a specific number

The Python SDK uses `activate()` (equivalent to `rent()` in other SDKs).

```python
rented = sinch_client.numbers.available.activate(
    phone_number="+12025550134",
    sms_configuration={"servicePlanId": "YOUR_SERVICE_PLAN_ID"}
)
```

### Rent any matching number

```python
rented = sinch_client.numbers.available.rent_any(
    region_code="US",
    type_="LOCAL",
    capabilities=["SMS"],
    sms_configuration={"servicePlanId": "YOUR_SERVICE_PLAN_ID"}
)
```

## Active Numbers

### List

```python
response = sinch_client.numbers.active.list(
    region_code="US",
    number_type="LOCAL",
    page_size=100
)
numbers = response.active_numbers or []
```

### Paginate

```python
all_numbers = []
page_token = None
while True:
    response = sinch_client.numbers.active.list(
        page_size=100, page_token=page_token
    )
    all_numbers.extend(response.active_numbers or [])
    if not response.next_page_token:
        break
    page_token = response.next_page_token
```

### Get

```python
number = sinch_client.numbers.active.get(phone_number="+12025550134")
```

### Update

```python
sinch_client.numbers.active.update(
    phone_number="+12025550134",
    display_name="Updated Name",
    sms_configuration={"servicePlanId": "NEW_SERVICE_PLAN_ID"}
)
```

### Release

```python
sinch_client.numbers.active.release(phone_number="+12025550134")
```

## Available Regions

```python
regions = sinch_client.numbers.regions.list()
```
