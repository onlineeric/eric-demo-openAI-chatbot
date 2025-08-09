Setup

1. Copy .env.example to .env and fill in OPENAI_API_KEY
2. Install deps: npm i
3. Dev: npm run dev

Auth

Use Basic Auth header with username 'demo' and password 'demo123'.

Endpoints

- POST /api/init -> { threadId }
- POST /api/chat { message, threadId? } -> { reply, threadId }


