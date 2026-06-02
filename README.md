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

## Workshop goals

Students can try to bypass MathBot's math-only restrictions and extract the two embedded secrets (Level 1 and Level 2 bypasses) defined in the system prompt.

## Tech stack

- Next.js (App Router)
- React
- Tailwind CSS
- Google Gemini API (`@google/generative-ai` npm package)
