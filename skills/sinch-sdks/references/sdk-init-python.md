> **Not a schema.** This file shows Python SDK installation and client-initialization examples.
> For SDK method signatures and initialization options, fetch the owning product's SDK syntax reference on `developers.sinch.com` (route via the product skill or [llms.txt](https://developers.sinch.com/llms.txt)) before writing code or prose that states payload structure.

# SDK Installation (Python)

`pip install sinch` (latest 2.4.0; Voice API v2 needs 2.2.0+). Supported runtimes: Python 3.9–3.14. Synchronous client only — the async client was removed in 2.0.0.

> **2.x is project-scoped only.** Voice API v1 and Verification were removed in 2.0.0, so the SDK takes no `application_key`/`application_secret`. For Verification, use direct HTTP (or stay on `sinch<2` to maintain an existing integration). For voice, use Voice API v2.

## Project-Scoped Auth (Conversation, Numbers, Number Lookup, Voice API v2)

```python
import os
from sinch import SinchClient

sinch = SinchClient(
    project_id=os.environ["SINCH_PROJECT_ID"],
    key_id=os.environ["SINCH_KEY_ID"],
    key_secret=os.environ["SINCH_KEY_SECRET"],
)
```

### Setting the Conversation API Region

> Since SDK v2.0.0, `conversation_region` is **required** when using the Conversation API. Calls will fail at runtime if the region is not set.

```python
from sinch import SinchClient

sinch = SinchClient(
    project_id="YOUR_PROJECT_ID",
    key_id="YOUR_KEY_ID",
    key_secret="YOUR_KEY_SECRET",
    conversation_region="eu",  # "us", "eu", or "br" (or ConversationRegionEnum from sinch.core.enums, 2.3.0+)
)
```

### SMS API (end-of-sale since 15 April 2026)

`sms_region` (`us`, `eu`, `au`, `br`, `ca`) is required — there are no silent defaults since 2.0.0. Project access keys work only in `us`/`eu` and not for projects created after 2026-04-15; otherwise use a service plan:

```python
sinch = SinchClient(
    service_plan_id=os.environ["SINCH_SERVICE_PLAN_ID"],
    sms_api_token=os.environ["SINCH_SMS_API_TOKEN"],
    sms_region="us",
)
```

### Voice API v2 (2.2.0+, preview)

Uses the project-scoped client above with no extra parameters. Methods are on `sinch.voice.v2`. SVAML helpers (`CommandsSequenceCreator`, `Destination`, `CallBehavior`, `VoiceName`) arrived in 2.3.0.

## Client options

```python
from sinch import SinchClient
from sinch.core.clients.retry_configuration import RetryConfiguration
from sinch.core.enums import RetryPolicy

sinch = SinchClient(
    project_id=os.environ["SINCH_PROJECT_ID"],
    key_id=os.environ["SINCH_KEY_ID"],
    key_secret=os.environ["SINCH_KEY_SECRET"],
    retry_configuration=RetryConfiguration(  # HTTP 429 retries, 2.2.0+
        retry_policy=RetryPolicy.BACKOFF,    # DEFAULT | RETRY_AFTER | BACKOFF | NONE
        max_retries=5,                       # default 3
        backoff_growth=2,                    # default 4
    ),
    transform_kwargs_casing=False,  # 2.2.0+: pass extra fields through unchanged; recommended for new code (default in 3.0)
)
```
