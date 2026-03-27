# Voice API — Python Examples

## Contents

- [SDK Setup](#sdk-setup)
- [TTS Callout](#tts-callout) | [Conference Callout](#conference-callout) | [Custom Callout](#custom-callout)
- [Get Call Info](#get-call-info) | [Update In-Progress Call](#update-in-progress-call)
- [Conference Operations](#conference--get-info): Get Info, Kick All
- [Callback Handler (Flask)](#callback-handler-flask)

## SDK Setup

```python
from sinch import SinchClient

sinch = SinchClient(
    application_key="YOUR_APPLICATION_KEY",
    application_secret="YOUR_APPLICATION_SECRET",
)
```

## TTS Callout

```python
response = sinch.voice.callouts.text_to_speech(
    destination={"type": "number", "endpoint": "+14045005000"},
    cli="+14045001000",
    locale="en-US",
    text="Hello! This is a test call from Sinch.",
)
print(f"Call ID: {response.call_id}")
```

## Conference Callout

```python
response = sinch.voice.callouts.conference(
    destination={"type": "number", "endpoint": "+14045005000"},
    cli="+14045001000",
    conference_id="myConference",
    enable_ace=True,
    enable_dice=True,
)
print(f"Call ID: {response.call_id}")
```

## Custom Callout

```python
import json

response = sinch.voice.callouts.custom(
    destination={"type": "number", "endpoint": "+14045005000"},
    cli="+14045001000",
    ice=json.dumps({
        "action": {
            "name": "connectPstn",
            "number": "+14045009000",
            "cli": "+14045001000",
        }
    }),
    ace=json.dumps({
        "action": {"name": "continue"}
    }),
)
```

## Get Call Info

```python
call_info = sinch.voice.calls.get(call_id="4398599d1ba84ef3bde0a82dfb61abed")
print(f"Status: {call_info.status}, Duration: {call_info.duration}s")
```

## Update In-Progress Call

```python
sinch.voice.calls.update(
    call_id="4398599d1ba84ef3bde0a82dfb61abed",
    instructions=[
        {"name": "say", "text": "This call will now end.", "locale": "en-US"}
    ],
    action={"name": "hangup"},
)
```

## Conference — Get Info

```python
conf = sinch.voice.conferences.get(conference_id="myConference")
print(f"Participants: {conf.participants}")
```

## Conference — Kick All

```python
sinch.voice.conferences.kick_all(conference_id="myConference")
```

## Callback Handler (Flask)

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.post("/voice/ice")
def ice():
    data = request.json
    print(f"Incoming call from {data['cli']} to {data['to']['endpoint']}")
    return jsonify({
        "instructions": [
            {"name": "say", "text": "Welcome! Press 1 for sales.", "locale": "en-US"}
        ],
        "action": {
            "name": "runMenu",
            "mainMenu": "main",
            "menus": [{
                "id": "main",
                "mainPrompt": "#tts[Press 1 for sales or 2 for support.]",
                "options": [
                    {"dtmf": 1, "action": "return(sales)"},
                    {"dtmf": 2, "action": "return(support)"},
                ],
            }],
        },
    })

@app.post("/voice/ace")
def ace():
    return jsonify({"action": {"name": "continue"}})

@app.post("/voice/pie")
def pie():
    menu_result = request.json["menuResult"]
    number = "+14045009001" if menu_result["value"] == "sales" else "+14045009002"
    return jsonify({
        "instructions": [
            {"name": "say", "text": f"Connecting you to {menu_result['value']}.", "locale": "en-US"}
        ],
        "action": {"name": "connectPstn", "number": number, "cli": "+14045001000"},
    })

@app.post("/voice/dice")
def dice():
    data = request.json
    print(f"Call ended: {data['reason']}, duration: {data['duration']}s")
    return "", 200

if __name__ == "__main__":
    app.run(port=3000)
```

## Links

- [Python SDK Reference](https://developers.sinch.com/docs/voice/sdk/py/syntax-reference)
- [PyPI: sinch](https://pypi.org/project/sinch/)
