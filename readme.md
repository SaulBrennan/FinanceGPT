# OpenAI Finance Advisor Chatbot

This project is a finance advisor chatbot powered by OpenAI's language models. It provides financial advice and information to users through a conversational interface.

## Prerequisites

- Node.js (v14 or later recommended)
- OpenAI API key
- Perplexity API key

## Installation

1. Clone this repository:

2. Create a `.env` file in the root directory of the project and add your API keys:

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_API_BASE_URL="https://api.openai.com"
   PERP_API_KEY=your_perp_api_key_here
   ```

   Replace `your_openai_api_key_here` and `your_perp_api_key_here` with your actual API keys.

3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the development server:

```
npm run dev
```

This will start the server, typically on `http://localhost:3000` (check the console output for the exact URL).
