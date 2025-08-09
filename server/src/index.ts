import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { basicAuth } from './middleware/auth';
import { chatRouter } from './routes/chat';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:3000';

app.use(cors({ origin: ORIGIN }));
app.use(express.json());

// protected health
app.get('/api/health', basicAuth, (_req: Request, res: Response) => res.json({ ok: true }));

// protected routes
app.use('/api', basicAuth, chatRouter);
// Surface missing config early
app.get('/api/config-check', basicAuth, (_req: Request, res: Response) => {
  res.json({
    hasApiKey: Boolean(process.env.OPENAI_API_KEY),
    hasAssistantId: Boolean(process.env.OPENAI_ASSISTANT_ID),
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});


