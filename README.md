# MidJourney Cloud Function

This is a Google Cloud Function used to access the MidJourney Discord channel on my Discord Server and query the MidJourney bot to generate stuff. This function is triggered when a new document (generation) is created.

## How it works

```mermaid
graph TB;
    weather_journey_app[Weather Journey App] -->|User selects a location| generation_process[Initiate Generation Process]
    generation_process -->|API request| weather_journey_image_api[Weather Journey Image API]
    weather_journey_image_api -->|Fetch weather data & craft ChatGPT prompt| midJourneyPrompt[Create Generation Document in Firestore]
    midJourneyPrompt -->|Document creation triggers| cloudFunction[Cloud Function]
    cloudFunction -->|Function invokes| midJourney[MidJourney Bot]

    classDef classDefault fill:#fff,stroke:#333,stroke-width:1px;
    classDef classLink stroke:#333,stroke-width:1px;
    class weather_journey_app,generation_process,weather_journey_image_api,midJourneyPrompt,cloudFunction,midJourney classDefault;
    linkStyle default classLink;
```

