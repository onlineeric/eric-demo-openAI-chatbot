import { v4 as uuidv4 } from 'uuid';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import type { BaseMessage } from '@langchain/core/messages';

type ThreadId = string;

interface ModelConfig {
  model?: string | undefined;
  temperature?: number | undefined;
}

const threadIdToHistory: Map<ThreadId, BaseMessage[]> = new Map();

export function createThread(): ThreadId {
  const id = uuidv4();
  threadIdToHistory.set(id, []);
  return id;
}

export async function sendMessage(
  threadId: ThreadId,
  userText: string,
  config: ModelConfig = {}
): Promise<{ reply: string; threadId: ThreadId }> {
  const { model = 'gpt-4o-mini', temperature = 0.6 } = config;
  const history = threadIdToHistory.get(threadId);
  if (!history) {
    throw new Error('invalid_thread');
  }

  const llm = new ChatOpenAI({
    model,
    temperature,
    apiKey: process.env.OPENAI_API_KEY ?? '',
  });

  const messages: BaseMessage[] = [...history, new HumanMessage(userText)];
  const response = await llm.invoke(messages);
  const replyText = response.content?.toString?.() ?? '';

  // persist updated history
  history.push(new HumanMessage(userText));
  history.push(new AIMessage(replyText));
  threadIdToHistory.set(threadId, history);

  return { reply: replyText, threadId };
}


