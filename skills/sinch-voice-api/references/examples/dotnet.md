# Voice API — .NET Examples

## Contents

- [SDK Setup](#sdk-setup)
- [TTS Callout](#tts-callout) | [Conference Callout](#conference-callout) | [Custom Callout](#custom-callout)
- [Get Call Info](#get-call-info) | [Update In-Progress Call](#update-in-progress-call)
- [Conference Operations](#conference--get-info): Get Info, Kick All
- [Callback Handler (ASP.NET Core)](#callback-handler-aspnet-core)

## SDK Setup

The .NET SDK requires both project-level credentials and Voice application credentials:

```csharp
using Sinch;

var sinch = new SinchClient("YOUR_ACCESS_KEY", "YOUR_ACCESS_SECRET", "YOUR_PROJECT_ID");
var voice = sinch.Voice("YOUR_APPLICATION_KEY", "YOUR_APPLICATION_SECRET");
```

If you only need the Voice API, you can skip project credentials:

```csharp
var sinch = new SinchClient(default, default, default);
var voice = sinch.Voice("YOUR_APPLICATION_KEY", "YOUR_APPLICATION_SECRET");
```

> **Note:** .NET SDK uses PascalCase for all field names (API uses camelCase).

## TTS Callout

```csharp
using Sinch.Voice.Callouts.Callout;

var response = await voice.Callouts.Tts(new TextToSpeechCalloutRequest
{
    Destination = new Destination
    {
        Type = DestinationType.Number,
        Endpoint = "+14045005000"
    },
    Cli = "+14045001000",
    Locale = "en-US",
    Text = "Hello! This is a test call from Sinch."
});
Console.WriteLine($"Call ID: {response.CallId}");
```

## Conference Callout

```csharp
using Sinch.Voice.Callouts.Callout;

var response = await voice.Callouts.Conference(new ConferenceCalloutRequest
{
    Destination = new Destination
    {
        Type = DestinationType.Number,
        Endpoint = "+14045005000"
    },
    Cli = "+14045001000",
    ConferenceId = "myConference",
    EnableAce = true,
    EnableDice = true
});
Console.WriteLine($"Call ID: {response.CallId}");
```

## Custom Callout

```csharp
using Sinch.Voice.Callouts.Callout;

var response = await voice.Callouts.Custom(new CustomCalloutRequest
{
    Destination = new Destination
    {
        Type = DestinationType.Number,
        Endpoint = "+14045005000"
    },
    Cli = "+14045001000",
    Ice = """{"action":{"name":"connectPstn","number":"+14045009000","cli":"+14045001000"}}""",
    Ace = """{"action":{"name":"continue"}}"""
});
```

## Get Call Info

```csharp
var callInfo = await voice.Calls.Get("4398599d1ba84ef3bde0a82dfb61abed");
Console.WriteLine($"Status: {callInfo.Status}, Duration: {callInfo.Duration}s");
```

## Update In-Progress Call

```csharp
await voice.Calls.Update("4398599d1ba84ef3bde0a82dfb61abed", new SvamlControl
{
    Instructions = new List<object>
    {
        new { Name = "say", Text = "This call will now end.", Locale = "en-US" }
    },
    Action = new { Name = "hangup" }
});
```

## Conference — Get Info

```csharp
var conf = await voice.Conferences.Get("myConference");
Console.WriteLine($"Participants: {conf.Participants.Count}");
```

## Conference — Kick All

```csharp
await voice.Conferences.KickAll("myConference");
```

## Conference — Kick Participant

```csharp
await voice.Conferences.KickParticipant("myConference", "4398599d1ba84ef3bde0a82dfb61abed");
```

## Conference — Manage Participant

```csharp
await voice.Conferences.ManageParticipant("myConference", "4398599d1ba84ef3bde0a82dfb61abed",
    new ManageParticipantRequest { Command = "mute" });
```

## Callback Handler (ASP.NET Core)

```csharp
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapPost("/voice/ice", ([FromBody] Dictionary<string, object> body) =>
{
    Console.WriteLine($"Incoming call from {body["cli"]}");
    return Results.Json(new
    {
        instructions = new object[]
        {
            new { name = "say", text = "Welcome! Press 1 for sales.", locale = "en-US" }
        },
        action = new
        {
            name = "runMenu",
            mainMenu = "main",
            menus = new object[]
            {
                new
                {
                    id = "main",
                    mainPrompt = "#tts[Press 1 for sales or 2 for support.]",
                    options = new object[]
                    {
                        new { dtmf = 1, action = "return(sales)" },
                        new { dtmf = 2, action = "return(support)" }
                    }
                }
            }
        }
    });
});

app.MapPost("/voice/ace", ([FromBody] Dictionary<string, object> body) =>
    Results.Json(new { action = new { name = "continue" } }));

app.MapPost("/voice/pie", ([FromBody] Dictionary<string, object> body) =>
{
    var menuResult = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(body["menuResult"].ToString()!);
    var value = menuResult!["value"].ToString();
    var number = value == "sales" ? "+14045009001" : "+14045009002";

    return Results.Json(new
    {
        instructions = new object[]
        {
            new { name = "say", text = $"Connecting you to {value}.", locale = "en-US" }
        },
        action = new { name = "connectPstn", number, cli = "+14045001000" }
    });
});

app.MapPost("/voice/dice", ([FromBody] Dictionary<string, object> body) =>
{
    Console.WriteLine($"Call ended: {body["reason"]}, duration: {body["duration"]}s");
    return Results.Ok();
});

app.Run("http://localhost:3000");
```

## Links

- [.NET SDK Reference](https://developers.sinch.com/docs/voice/sdk/dotnet/syntax-reference)
- [NuGet: Sinch](https://www.nuget.org/packages/Sinch)
