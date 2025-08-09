import { Router, Request, Response } from 'express';
import { createAssistantThread, sendAssistantMessage } from '../lib/assistants';

export const chatRouter = Router();

chatRouter.post('/init', async (_req: Request, res: Response) => {
  const threadId = await createAssistantThread();
  res.json({ threadId });
});

chatRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, threadId, model, temperature } = req.body as {
      message?: string;
      threadId?: string;
      model?: string;
      temperature?: number;
    };
    if (!message) {
      res.status(400).json({ error: 'message_required' });
      return;
    }
    let id = threadId;
    if (!id) {
      id = await createAssistantThread();
    }
    const opts: { model?: string; temperature?: number } = {};
    if (typeof model === 'string' && model.length > 0) {
      opts.model = model;
    }
    if (typeof temperature === 'number') {
      opts.temperature = temperature;
    }
    const result = await sendAssistantMessage(id, message, opts);
    res.json(result);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('chat error', err);
    const message = err instanceof Error ? err.message : 'unknown_error';
    res.status(500).json({ error: 'chat_failed', message });
  }
});


