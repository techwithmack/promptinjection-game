# MathBot Educator

Educational Next.js demo for teaching **prompt injection** vulnerabilities in AI chat applications.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment file and add your Gemini API key:

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and set `GEMINI_API_KEY` to your key from [Google AI Studio](https://aistudio.google.com/apikey).

   Optional: set `GEMINI_MODEL` if you hit quota errors (default is `gemini-2.5-flash`).

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy on AWS Amplify

1. In the Amplify console, set **Environment variables** (Hosting → Environment variables) for your branch:
   - `GEMINI_API_KEY` — your key from [Google AI Studio](https://aistudio.google.com/apikey)
   - `GEMINI_MODEL` (optional) — e.g. `gemini-2.5-flash`

   If you only use **Secret management**, also add `GEMINI_API_KEY` under Environment variables so it is available during the build (the repo’s `amplify.yml` copies it into `.env.production` for Next.js SSR).

2. Commit and push; Amplify uses `amplify.yml` in the repo root to inject those variables for server-side API routes.

3. After changing variables, trigger a **new deployment** (full build).

## Workshop goals

Students can try to bypass MathBot's math-only restrictions and extract the two embedded secrets (Level 1 and Level 2 bypasses) defined in the system prompt.

## Tech stack

- Next.js (App Router)
- React
- Tailwind CSS
- Google Gemini API (`@google/generative-ai` npm package)
