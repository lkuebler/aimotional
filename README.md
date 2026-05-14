# Live Emotion Analysis

A dynamic, real-time web application that uses your device's camera to analyze your facial expressions and dynamically adapts the UI to match your current emotion.

## Features
- **Real-time On-Device AI**: Utilizes `@vladmandic/face-api` to detect faces and analyze expressions locally. No data is sent to external servers.
- **Dynamic LetterGlitch Background**: Features the `LetterGlitch` component from React Bits, automatically reacting to your detected emotion with shifting color palettes.
- **Responsive Layout**: Designed to work seamlessly on both mobile devices and desktop computers.
- **Glassmorphism Aesthetic**: A clean, premium dashboard overlaying your webcam feed.

## Tech Stack
- **Framework**: React 18 + Vite (TypeScript)
- **Styling**: Tailwind CSS + custom glassmorphism
- **AI Engine**: `face-api.js`
- **UI Components**: `lucide-react`, `shadcn` (LetterGlitch)

## Local Setup

To run this project locally on your machine, follow these steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or newer) installed.

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone git@github.com:lkuebler/aimotional.git
   cd aimotional
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:5173` in your web browser. 
   *(Note: You must grant the browser permission to access your camera for the emotion detection to work).*

## Deployment

This repository is configured with a GitHub Actions CI/CD pipeline (`.github/workflows/pages.yml`). 
Whenever code is pushed to the `main` branch, the action automatically builds the React application and deploys it to your **GitHub Pages** site.
