# SDK Initialization (Python)

## Project-Scoped Auth (Conversation, Numbers, Fax, EST, etc.)

```python
from sinch import SinchClient

sinch = SinchClient(
    project_id="YOUR_PROJECT_ID",
    key_id="YOUR_KEY_ID",
    key_secret="YOUR_KEY_SECRET",
)
```

### Setting the Conversation API Region

> With SDK v2 (upcoming), region will be required for Conversation usage. Set region explicitly now to stay forward-compatible.

```python
from sinch import SinchClient

sinch = SinchClient(
    project_id="YOUR_PROJECT_ID",
    key_id="YOUR_KEY_ID",
    key_secret="YOUR_KEY_SECRET",
)
sinch.configuration.conversation_region = "eu"  # "us", "eu", or "br"
```

## Application-Scoped Auth (Voice, Verification)

App credentials only:

```python
from sinch import SinchClient

sinch = SinchClient(
    application_key="YOUR_APP_KEY",
    application_secret="YOUR_APP_SECRET",
)
```

Combined project + app credentials (multi-product):

```python
from sinch import SinchClient

sinch = SinchClient(
    project_id="YOUR_PROJECT_ID",
    key_id="YOUR_KEY_ID",
    key_secret="YOUR_KEY_SECRET",
    application_key="YOUR_APP_KEY",
    application_secret="YOUR_APP_SECRET",
)
```
