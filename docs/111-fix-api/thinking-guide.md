# Thinking Mode - API V1 (Vertex AI)

Configure thinking/reasoning for Gemini 2.5 and 3.0 models.

---

## Configuration

### Gemini 2.5 (Budget-based)
```typescript
interface ThinkingConfigV1 {
  thinkingBudget?: number;     // 0-24576 tokens
  includeThoughts?: boolean;
}
```

### Gemini 3 (Level-based)
```typescript
interface ThinkingConfigV1 {
  thinkingLevel?: 'low' | 'high';
  includeThoughts?: boolean;
}
```

---

## Request Example

```json
{
  "prompt": "Solve this complex problem...",
  "model": "gemini-2.5-flash",
  "thinkingConfig": {
    "thinkingBudget": 8192,
    "includeThoughts": true
  }
}
```

## Response with Thoughts

```json
{
  "message": { "role": "model", "content": "Final answer..." },
  "thoughts": [
    "First, I need to consider...",
    "Then I'll analyze...",
    "Therefore, the solution is..."
  ]
}
```

---

## Vite + TSX Implementation

### ThinkingSelector Component

```tsx
import React from 'react';

interface Props {
  model: string;
  budget: number;
  level: 'low' | 'high';
  onBudgetChange: (v: number) => void;
  onLevelChange: (v: 'low' | 'high') => void;
}

const PRESETS = [
  { label: 'Off', value: 0 },
  { label: 'Low', value: 1024 },
  { label: 'Medium', value: 8192 },
  { label: 'High', value: 16384 },
  { label: 'Max', value: 24576 },
];

export const ThinkingSelector: React.FC<Props> = ({
  model, budget, level, onBudgetChange, onLevelChange
}) => {
  const isGemini3 = model.includes('gemini-3');

  if (isGemini3) {
    return (
      <div className="thinking-selector">
        <label>Thinking Level</label>
        <select value={level} onChange={e => onLevelChange(e.target.value as any)}>
          <option value="low">Low</option>
          <option value="high">High</option>
        </select>
      </div>
    );
  }

  return (
    <div className="thinking-selector">
      <label>Thinking Budget: {budget} tokens</label>
      <div className="presets">
        {PRESETS.map(p => (
          <button
            key={p.value}
            className={budget === p.value ? 'active' : ''}
            onClick={() => onBudgetChange(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <input
        type="range"
        min="0"
        max="24576"
        step="1024"
        value={budget}
        onChange={e => onBudgetChange(Number(e.target.value))}
      />
    </div>
  );
};
```

### ThoughtDisplay Component

```tsx
import React, { useState } from 'react';

interface Props {
  thoughts: string[];
}

export const ThoughtDisplay: React.FC<Props> = ({ thoughts }) => {
  const [expanded, setExpanded] = useState(false);

  if (!thoughts.length) return null;

  return (
    <div className="thought-display">
      <button onClick={() => setExpanded(!expanded)}>
        💭 Thinking ({thoughts.length} steps)
        {expanded ? ' ▲' : ' ▼'}
      </button>
      {expanded && (
        <div className="thoughts">
          {thoughts.map((t, i) => (
            <div key={i} className="thought-step">
              <span className="step-num">{i + 1}</span>
              <p>{t}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## Model Support

| Model | Thinking Type | Default |
|-------|---------------|---------|
| `gemini-2.5-flash` | Budget (0-24576) | 8192 |
| `gemini-2.5-pro` | Budget (0-24576) | 8192 |
| `gemini-3-pro-preview` | Level (low/high) | low |
| `gemini-2.0-flash` | ❌ | - |

## Budget Guidelines

| Use Case | Budget |
|----------|--------|
| Simple Q&A | 0-1024 |
| Analysis | 4096-8192 |
| Complex reasoning | 16384-24576 |
