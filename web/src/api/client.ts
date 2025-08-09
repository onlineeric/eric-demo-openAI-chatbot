export interface ChatRequest {
  message: string;
  threadId?: string;
}

export interface ChatResponse {
  reply: string;
  threadId: string;
}

export function makeAuthHeader(username: string, password: string): string {
  const token = btoa(`${username}:${password}`);
  return `Basic ${token}`;
}

export async function initThread(baseUrl: string, authHeader: string): Promise<string> {
  const res = await fetch(`${baseUrl}/api/init`, {
    method: 'POST',
    headers: { 'Authorization': authHeader },
  });
  if (!res.ok) throw new Error('init_failed');
  const data = await res.json();
  return data.threadId as string;
}

export async function chat(
  baseUrl: string,
  authHeader: string,
  body: ChatRequest
): Promise<ChatResponse> {
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error('unauthorized');
  if (!res.ok) throw new Error('chat_failed');
  return res.json();
}


