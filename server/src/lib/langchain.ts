import { v4 as uuidv4 } from 'uuid';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import type { BaseMessage } from '@langchain/core/messages';

type ThreadId = string;

interface ModelConfig {}

const threadIdToHistory: Map<ThreadId, BaseMessage[]> = new Map();

export function createThread(): ThreadId {
  const id = uuidv4();
  threadIdToHistory.set(id, []);
  return id;
}

export async function sendMessage(
  threadId: ThreadId,
  userText: string
): Promise<{ reply: string; threadId: ThreadId }> {
  const history = threadIdToHistory.get(threadId);
  if (!history) {
    throw new Error('invalid_thread');
  }

  const llm = new ChatOpenAI({
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


