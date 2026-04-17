# Python — Numbers SDK Reference

`pip install sinch` (v2.0.0+)

SDK uses snake_case attributes mapping to camelCase JSON (e.g., `phone_number` ↔ `phoneNumber`).
Response models are Pydantic instances with typed fields.

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
response = sinch_client.numbers.search_for_available_numbers(
    region_code="US",
    number_type="LOCAL",
)
for number in response.iterator():
    print(number.phone_number)
```

### Check availability

```python
result = sinch_client.numbers.check_availability(
    phone_number="+12025550134"
)
```

### Rent a specific number

```python
rented = sinch_client.numbers.rent(
    phone_number="+12025550134",
    sms_configuration={"service_plan_id": "YOUR_SERVICE_PLAN_ID"}
)
```

### Rent any matching number

```python
rented = sinch_client.numbers.rent_any(
    region_code="US",
    number_type="LOCAL",
    sms_configuration={"service_plan_id": "YOUR_SERVICE_PLAN_ID"}
)
```

## Active Numbers

### List

```python
response = sinch_client.numbers.list(
    region_code="US",
    number_type="LOCAL",
)
```

### Paginate

```python
all_numbers = []
response = sinch_client.numbers.list(
    region_code="US",
    number_type="LOCAL",
)
for number in response.iterator():
    all_numbers.append(number)
```

Or page-by-page:

```python
page = sinch_client.numbers.list(region_code="US", number_type="LOCAL")
while True:
    print(page)
    if not page.has_next_page:
        break
    page = page.next_page()
```

### Get

```python
number = sinch_client.numbers.get(phone_number="+12025550134")
```

### Update

```python
sinch_client.numbers.update(
    phone_number="+12025550134",
    display_name="Updated Name",
    sms_configuration={"service_plan_id": "NEW_SERVICE_PLAN_ID"}
)
```

### Release

```python
sinch_client.numbers.release(phone_number="+12025550134")
```

## Event Destinations Configuration

```python
# Get current config
config = sinch_client.numbers.event_destinations.get()

# Update HMAC secret
sinch_client.numbers.event_destinations.update(hmac_secret="YOUR_HMAC_SECRET")
```
