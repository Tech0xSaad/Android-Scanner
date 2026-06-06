# APK Privacy Analyzer

A React + Vite single-page app that analyzes Android APK files directly in the browser. Users can drag and drop an APK, extract app metadata, review permissions, and inspect privacy risk signals without any backend.

## Features

- Drag-and-drop APK upload
- Browser-side APK parsing with `app-info-parser`
- App name, icon, version, package name, and permission extraction
- Permission categorization into Normal, Dangerous, and Critical
- Privacy score from 0 to 100
- Risk labels: Low, Medium, High
- Risky combination detection:
  - `CAMERA + INTERNET`
  - `CONTACTS + INTERNET`
  - `LOCATION + STORAGE`
- Glassmorphism UI with dark mode and framer-motion animations
- Responsive layout for desktop and mobile

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Notes

- The APK parser is loaded in the browser via the `app-info-parser` browser build from a CDN because the package README explicitly notes Vite module imports are not supported for that library.
- This tool performs static analysis only and cannot detect runtime malware.