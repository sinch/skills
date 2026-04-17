# Voice API — Java Examples

## Contents

- [SDK Setup](#sdk-setup)
- [TTS Callout](#tts-callout) | [Conference Callout](#conference-callout)
- [Get Call Info](#get-call-info) | [Update In-Progress Call](#update-in-progress-call)
- [Conference Operations](#conference--get-info): Get Info, Kick All
- [Callback Handler (Spring Boot)](#callback-handler-spring-boot)

## SDK Setup

```java
import com.sinch.sdk.SinchClient;
import com.sinch.sdk.models.Configuration;

Configuration config = Configuration.builder()
    .setApplicationKey("YOUR_APPLICATION_KEY")
    .setApplicationSecret("YOUR_APPLICATION_SECRET")
    .build();

SinchClient sinch = new SinchClient(config);
```

## TTS Callout

```java
import com.sinch.sdk.domains.voice.models.v1.callouts.request.CalloutRequestTTS;
import com.sinch.sdk.domains.voice.models.v1.destination.DestinationPstn;

var response = sinch.voice().v1().callouts().call(
    CalloutRequestTTS.builder()
        .setDestination(DestinationPstn.from("+14045005000"))
        .setCli("+14045001000")
        .setLocale("en-US")
        .setText("Hello! This is a test call from Sinch.")
        .build()
);
System.out.println("Call ID: " + response);
```

## Conference Callout

```java
import com.sinch.sdk.domains.voice.models.v1.callouts.request.CalloutRequestConference;
import com.sinch.sdk.domains.voice.models.v1.destination.DestinationPstn;

var response = sinch.voice().v1().conferences().call(
    CalloutRequestConference.builder()
        .setDestination(DestinationPstn.from("+14045005000"))
        .setCli("+14045001000")
        .setConferenceId("myConference")
        .setEnableAce(true)
        .setEnableDice(true)
        .build()
);
System.out.println("Call ID: " + response);
```

## Get Call Info

```java
import com.sinch.sdk.domains.voice.models.v1.calls.response.CallInformation;

CallInformation callInfo = sinch.voice().v1().calls().get("4398599d1ba84ef3bde0a82dfb61abed");
System.out.println("Status: " + callInfo.getStatus());
System.out.println("Duration: " + callInfo.getDuration());
```

## Update In-Progress Call

```java
import com.sinch.sdk.domains.voice.models.v1.svaml.SvamlControl;
import com.sinch.sdk.domains.voice.models.v1.svaml.action.SvamlActionHangup;
import com.sinch.sdk.domains.voice.models.v1.svaml.instruction.SvamlInstructionSay;

sinch.voice().v1().calls().update(
    "4398599d1ba84ef3bde0a82dfb61abed",
    SvamlControl.builder()
        .setInstructions(List.of(
            SvamlInstructionSay.builder()
                .setText("This call will now end.")
                .setLocale("en-US")
                .build()
        ))
        .setAction(SvamlActionHangup.SVAML_ACTION_HANGUP)
        .build()
);
```

## Conference — Get Info

```java
var conf = sinch.voice().v1().conferences().get("myConference");
System.out.println("Participants: " + conf.getParticipants());
```

## Conference — Kick All

```java
sinch.voice().v1().conferences().kickAll("myConference");
```

## Callback Handler (Spring Boot)

```java
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/voice")
public class VoiceCallbackController {

    @PostMapping("/ice")
    public Map<String, Object> ice(@RequestBody Map<String, Object> body) {
        System.out.println("Incoming call from " + body.get("cli"));

        return Map.of(
            "instructions", List.of(
                Map.of("name", "say", "text", "Welcome! Press 1 for sales.", "locale", "en-US")
            ),
            "action", Map.of(
                "name", "runMenu",
                "mainMenu", "main",
                "menus", List.of(Map.of(
                    "id", "main",
                    "mainPrompt", "#tts[Press 1 for sales or 2 for support.]",
                    "options", List.of(
                        Map.of("dtmf", 1, "action", "return(sales)"),
                        Map.of("dtmf", 2, "action", "return(support)")
                    )
                ))
            )
        );
    }

    @PostMapping("/ace")
    public Map<String, Object> ace(@RequestBody Map<String, Object> body) {
        return Map.of("action", Map.of("name", "continue"));
    }

    @PostMapping("/pie")
    public Map<String, Object> pie(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        var menuResult = (Map<String, Object>) body.get("menuResult");
        String value = (String) menuResult.get("value");
        String number = "sales".equals(value) ? "+14045009001" : "+14045009002";

        return Map.of(
            "instructions", List.of(
                Map.of("name", "say", "text", "Connecting you to " + value + ".", "locale", "en-US")
            ),
            "action", Map.of("name", "connectPstn", "number", number, "cli", "+14045001000")
        );
    }

    @PostMapping("/dice")
    public void dice(@RequestBody Map<String, Object> body) {
        System.out.println("Call ended: " + body.get("reason") + ", duration: " + body.get("duration") + "s");
    }
}
```

## Links

- [Java SDK Reference](https://developers.sinch.com/docs/voice/sdk/java/syntax-reference.md)
- [Maven: sinch-sdk-java](https://central.sonatype.com/artifact/com.sinch.sdk/sinch-sdk-java)
