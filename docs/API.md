# API Reference

Base URL: `http://localhost:3001/api` (development)

All protected endpoints require `Authorization: Bearer <supabase_jwt>` header.

## Health Check

```
GET /health
```

**Response:** `{ status: "ok", service: "cyra-api", timestamp: "..." }`

---

## Symptoms

### List symptom entries

```
GET /api/symptoms?startDate=2026-01-01&endDate=2026-06-01
```

**Response:**
```json
[
  {
    "id": "uuid",
    "logged_date": "2026-06-20",
    "mood": "anxious",
    "energy_level": 4,
    "sleep_hours": 6.5,
    "cycle_phase": "luteal",
    "symptom_details": [
      { "symptom_name": "Bloating", "category": "digestive", "severity": "moderate" }
    ]
  }
]
```

### Create / upsert symptom entry

```
POST /api/symptoms
```

**Body:**
```json
{
  "loggedDate": "2026-06-20",
  "mood": "anxious",
  "cyclePhase": "luteal",
  "energyLevel": 4,
  "sleepHours": 6.5,
  "sleepQuality": 5,
  "notes": "Felt worse after lunch",
  "triggers": ["caffeine", "stress"],
  "symptoms": [
    { "symptomName": "Bloating", "category": "digestive", "severity": "moderate" }
  ]
}
```

**Response:** `201` with created entry (includes symptom_details)

### Update symptom entry

```
PATCH /api/symptoms/:id
```

**Body:** Partial fields from create schema.

### Delete symptom entry

```
DELETE /api/symptoms/:id
```

**Response:** `204 No Content`

---

## Insights

### Symptom trends

```
GET /api/insights/trends?days=30
```

**Response:**
```json
{
  "dailyTrends": [
    { "date": "2026-06-01", "mood": "calm", "energyLevel": 7, "avgSeverity": 0.5, "symptomCount": 2 }
  ],
  "topSymptoms": [
    { "name": "Bloating", "frequency": 12, "avgSeverity": 1.8 }
  ],
  "period": { "days": 30, "startDate": "2026-05-22" }
}
```

### Summary statistics

```
GET /api/insights/summary?days=30
```

**Response:**
```json
{
  "daysLogged": 22,
  "dominantMood": "anxious",
  "avgEnergy": 5.2,
  "avgSleep": 6.8,
  "topSymptoms": [{ "name": "Bloating", "frequency": 12, "avgSeverity": 1.8 }],
  "streakDays": 5
}
```

### Cycle insights

```
GET /api/insights/cycle
```

**Response:**
```json
{
  "recentCycles": [],
  "avgCycleLength": 28,
  "avgPeriodLength": 5,
  "totalCyclesLogged": 0
}
```

---

## AI

Rate limited: 30 requests per 15 minutes.

### Chat

```
POST /api/ai/chat
```

**Body:**
```json
{
  "message": "What is PMOS?",
  "conversationId": "uuid (optional, for continuing conversation)"
}
```

**Response:**
```json
{
  "conversationId": "uuid",
  "message": "PMOS refers to..."
}
```

### Generate report summary

```
POST /api/ai/report-summary
```

**Body:**
```json
{
  "dateRangeStart": "2026-05-01",
  "dateRangeEnd": "2026-06-01",
  "symptoms": [{ "name": "Bloating", "severity": "moderate", "frequency": 12 }],
  "moodTrend": "anxious",
  "notes": "Worse during luteal phase"
}
```

**Response:**
```json
{ "summary": "Overview: Over the past 30 days..." }
```

---

## Reports

### List reports

```
GET /api/reports
```

### Create report (auto-generates AI summary)

```
POST /api/reports
```

**Body:**
```json
{
  "title": "Doctor Visit Summary",
  "dateRangeStart": "2026-05-01",
  "dateRangeEnd": "2026-06-01"
}
```

**Response:** `201` with full report object including AI-generated summary.

### Get report

```
GET /api/reports/:id
```

### Update report

```
PATCH /api/reports/:id
```

**Body:**
```json
{
  "title": "Updated title",
  "status": "shared",
  "questionsForDoctor": ["Question 1", "Question 2"]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Human-readable message",
  "details": {}
}
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error |
| 401 | Missing or invalid auth token |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
| 503 | AI service unavailable |
