# Gemini Clone

A React + Vite web app that clones the Gemini chat experience with a custom UI, dynamic model selection, and chat response rendering.

## 🚀 What this app does

- Connects to Google Gemini / Generative AI through the `@google/generative-ai` client and direct API fetches.
- Fetches available models dynamically and lets users choose which model to use for chat generation.
- Sends prompts to Gemini and displays responses in a modern chat-style interface.
- Supports markdown rendering and visual formatting for chat output.
- Handles request errors gracefully and shows model-related guidance when problems occur.

## 🧩 Tech stack

- React 18
- Vite
- JavaScript (JSX)
- `@google/generative-ai` for Gemini chat API access
- `react-markdown` + `remark-gfm` + `rehype-raw` for markdown rendering
- `chart.js` + `react-chartjs-2` for chart rendering inside responses
- CSS modules in simple component styles
- Environment variables via `import.meta.env.VITE_API_KEY`

## 🛠️ Key app flow and code structure

### 1. `src/Config/gemini.js`

This file contains the API integration logic.

- `getLatestModels()`
  - Calls `https://generativelanguage.googleapis.com/v1/models`
  - Uses the API key from `VITE_API_KEY`
  - Returns a list of available Gemini model names for the dropdown
  - Falls back to a default list if the fetch fails

- `runChat(prompt, modelName)`
  - Creates a `GoogleGenerativeAI` client using the API key
  - Builds a model configuration with safety settings and generation settings
  - Uses `modelName` when provided, otherwise falls back to the default model
  - Invokes `generateContent(prompt)` and returns text content from Gemini

### 2. `src/Context/Context.jsx`

This is the application state provider.

- Creates a React context for shared app state
- Stores:
  - `input` and `resultData`
  - `models` and `selectedModel`
  - `loading`, `showResult`, `recentPrompt`, and `chatError`
- Loads model options on mount using `getLatestModels()`
- Sets the first returned model as the default selected model
- Handles chat submission in `onSent()`:
  - Sends the user prompt using `runChat()` and the selected model
  - Animates response text into the chat area
  - Normalizes response shapes for compatibility with Gemini output
  - Catches errors and sets `chatError` plus a user-facing hint

### 3. `src/components/Main/Main.jsx`

This component renders the main chat page and the prompt input.

- Displays a greeting screen when no chat result is present
- Shows the current prompt result inside a chat bubble
- Provides a model picker dropdown using `models` from context
- Sends the prompt when the user hits Enter or clicks the send icon
- Shows a loader while Gemini response is pending
- Applies an error style when a chat error occurs

### 4. `src/components/Chat/MessageRenderer.jsx`

This component is responsible for rendering Gemini response content.

- Parses markdown in the response text
- Supports tables, code blocks, and inline formatting
- Renders JSON / CSV blocks as charts when appropriate
- Allows the app to display richer response content without manual HTML injection

### 5. `src/assets/assets.js`

Contains asset paths and icon references used across the app UI.

### 6. Styling and layout

- `src/index.css` provides the base full-height application layout
- `src/components/Main/Main.css` styles chat layout, model picker, input box, and result bubble
- `src/components/sidebar/Sidebar.css` handles the sidebar layout and responsive behavior

## 💡 Runtime behavior

1. User opens the app
2. `ContextProvider` loads model names from Gemini
3. User types a prompt and selects a model from the dropdown
4. `Main` calls `onSent()` from context when sending
5. `onSent()` calls `runChat(prompt, selectedModel)`
6. Gemini returns a response
7. The response text is animated and displayed in the chat bubble
8. If an error happens, the app shows the error message and suggests switching models

## ⚙️ Setup

1. Install dependencies
   ```bash
   npm install
   ```
2. Create `.env.local` in the project root
   ```env
   VITE_API_KEY=your_google_gemini_api_key_here
   ```
3. Start the dev server
   ```bash
   npm run dev
   ```

## 📁 Important files

- `src/Config/gemini.js` — Gemini API integration
- `src/Context/Context.jsx` — chat state and submission flow
- `src/components/Main/Main.jsx` — main UI and model selector
- `src/components/Chat/MessageRenderer.jsx` — response rendering
- `src/index.css` — base layout styling

## 📝 Notes

- The app depends on a valid Gemini API key.
- If the selected model fails, the error UI encourages the user to try another model.
- The app is built for Vite with fast refresh and a React-driven SPA architecture.
