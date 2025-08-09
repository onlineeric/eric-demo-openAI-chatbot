import { useEffect, useMemo, useState } from 'react';
import { Container, Paper, Box, Typography, TextField, IconButton, List, ListItem, ListItemText } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { chat, initThread, makeAuthHeader } from './api/client';

type Message = { role: 'user' | 'assistant'; text: string };

// Model selection removed; assistant-configured model is used on server

function App() {
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo123');
  const [authed, setAuthed] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('Hello');
  const [loading, setLoading] = useState(false);
  // Temperature/model controls removed; server uses assistant defaults

  const baseUrl = useMemo(() => 'http://localhost:3001', []);
  const authHeader = useMemo(() => makeAuthHeader(username, password), [username, password]);

  useEffect(() => {
    if (authed && !threadId) {
      initThread(baseUrl, authHeader)
        .then(setThreadId)
        .catch(() => setAuthed(false));
    }
  }, [authed, threadId, baseUrl, authHeader]);

  const login = async () => {
    try {
      const ok = await fetch(`${baseUrl}/api/health`, { headers: { Authorization: authHeader } });
      if (ok.status === 401) {
        setAuthed(false);
        return;
      }
      setAuthed(true);
    } catch {
      setAuthed(false);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !threadId) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await chat(baseUrl, authHeader, { message: text, threadId });
      setMessages((prev) => [...prev, { role: 'assistant', text: res.reply }]);
    } finally {
      setLoading(false);
    }
  };

  if (!authed) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Login</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Box>
              <IconButton color="primary" onClick={login}>
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Chat</Typography>
        {/* Controls removed: model and temperature are driven by the assistant configuration */}
        <Box sx={{ height: 360, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1, mb: 2 }}>
          <List>
            {messages.map((m, i) => (
              <ListItem key={i} alignItems="flex-start">
                <ListItemText primary={m.role === 'user' ? 'You' : 'Assistant'} secondary={<span style={{ whiteSpace: 'pre-wrap' }}>{m.text}</span>} />
              </ListItem>
            ))}
            {loading && (
              <ListItem>
                <ListItemText primary="Assistant" secondary="Thinking..." />
              </ListItem>
            )}
          </List>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField fullWidth size="small" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())} />
          <IconButton color="primary" onClick={send} disabled={loading || !threadId}>
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Container>
  );
}

export default App;
