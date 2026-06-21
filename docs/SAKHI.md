# Sakhi AI

Sakhi (सखी — "trusted friend") is Cyra's multilingual AI companion powered by Groq.

## Architecture

```
Client (SSE)  →  POST /api/sakhi/chat  →  Sakhi Service
                                              ├── Language detection
                                              ├── Health context injection
                                              ├── Conversation memory (DB)
                                              └── Groq streaming (llama-3.3-70b)
```

## API Endpoints

### Stream chat (SSE)

```
POST /api/sakhi/chat
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "message": "Period se pehle anxiety kyun hoti hai?",
  "conversationId": "uuid (optional)",
  "language": "Hindi (optional hint)",
  "stream": true
}
```

**SSE events:**

| Event | Payload |
|-------|---------|
| `start` | `{ conversationId, language }` |
| `token` | `{ content }` — incremental text |
| `done` | `{ conversationId, language, tokenCount? }` |
| `error` | `{ message }` |

Set `"stream": false` for a standard JSON response (fallback).

### Conversations

```
GET  /api/sakhi/conversations
POST /api/sakhi/conversations
GET  /api/sakhi/conversations/:id/messages
```

## Supported Languages

English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi

Detection uses Unicode script analysis with Hindi/Marathi disambiguation in Devanagari.

## Prompt Engineering Strategy

Four-layer prompt assembly (`server/src/config/sakhi.prompt.ts`):

1. **Identity layer** — Sakhi persona, cultural awareness, PMOS expertise
2. **Language layer** — Detected language injected; must reply in same language
3. **Safety layer** — No diagnosis, no certainty, encourage medical consultation
4. **Context layer** — Dynamic health logs (symptoms, mood, cycle, notes from last 14 days)

Safety rails are embedded in layers 1 and 3 to reduce drift during long conversations.

## Health Context Injection

`buildHealthContext()` pulls from Supabase:

- Profile conditions & health goals
- Last 14 days of symptom entries + details
- Mood frequency, energy averages
- Recent user notes
- Cycle phase

Injected into the system prompt — never sent to the client.

## Rate Limiting

40 messages per 15 minutes per user (JWT-scoped key).

## Persistence

Uses existing `ai_conversations` and `ai_messages` tables. Conversation metadata (preferred language) stored in `context_summary` as JSON.

## Safety Boundaries

- Never diagnoses conditions
- Never claims certainty
- Uses hedging language ("might", "could", "some women find")
- Urges emergency care for crisis symptoms
- Multilingual fallback messages if generation fails
