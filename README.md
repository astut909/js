# Voice Song Starter

A quick local-first MVP that records 3–5 seconds of humming/singing, sends it to a Node/Express backend, uses AudD for song recognition, then auto-plays a preview when available.

## Files

- `index.html` — minimal UI (button, status, detected song info, audio player)
- `style.css` — simple styling + subtle animation
- `script.js` — microphone capture + upload + playback flow
- `server.js` — Express backend + AudD API integration

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set your AudD API token:

   ```bash
   export AUDD_API_TOKEN="your_token_here"
   ```

3. Start the app:

   ```bash
   node server.js
   ```

4. Open:

   ```
   http://localhost:3000
   ```

## How it works

1. Click **Start Listening** (or wait for auto-start).
2. Sing/hum for ~4.5 seconds.
3. Browser records audio with `MediaRecorder`.
4. Audio uploads to `POST /recognize`.
5. Backend forwards audio to AudD API.
6. App receives song metadata and auto-plays preview if available.

## Notes

- If no match is found, the app shows an error state and allows retry.
- If mic permissions are denied, a clear status message is shown.
- If preview audio is unavailable, a YouTube link is opened in a new tab when possible.
