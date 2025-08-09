import OpenAI from 'openai';
import type { TextContentBlock } from 'openai/resources/beta/threads/messages';
import type { AssistantUpdateParams } from 'openai/resources/beta/assistants';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: { 'OpenAI-Beta': 'assistants=v2' },
});

export async function createAssistantThread(): Promise<string> {
  const thread = await openai.beta.threads.create();
  return thread.id;
}

export async function sendAssistantMessage(
  threadId: string,
  userText: string,
  options?: { model?: string; temperature?: number }
): Promise<{ reply: string; threadId: string }> {
  const assistantId = process.env.OPENAI_ASSISTANT_ID;
  if (!assistantId) {
    throw new Error('missing_assistant_id');
  }

  // Do not mutate assistant configuration here to avoid incompatibilities across models
  const requestedModel = options?.model;

  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: userText,
  });

  const runParams: any = { assistant_id: assistantId };
  const run = await openai.beta.threads.runs.createAndPoll(threadId, runParams);

  if (run.status !== 'completed') {
    throw new Error(`run_status_${run.status}`);
  }

  const messages = await openai.beta.threads.messages.list(run.thread_id);
  // API returns newest-first; find the newest assistant message
  const assistantMessage = messages.data.find((m) => m.role === 'assistant');
  const block = assistantMessage?.content?.[0] as TextContentBlock | undefined;
  const reply = block?.text?.value ?? '';
  return { reply, threadId };
}


