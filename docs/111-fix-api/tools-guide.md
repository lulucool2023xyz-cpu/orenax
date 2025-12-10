# Tools & Grounding - API V1 (Vertex AI)

Google Search grounding and URL context for enhanced responses.

---

## Configuration

```typescript
interface GroundingConfigV1 {
  googleSearch?: boolean;
  urlContext?: {
    enabled: boolean;
    urls?: string[];
  };
  searchRegion?: string;  // e.g., 'id' for Indonesia
}
```

---

## Request Example

```json
{
  "prompt": "What are the latest news about AI?",
  "model": "gemini-2.5-flash",
  "groundingConfig": {
    "googleSearch": true,
    "searchRegion": "us"
  }
}
```

## Response with Grounding

```json
{
  "message": { "role": "model", "content": "..." },
  "groundingMetadata": {
    "webSearchQueries": ["latest AI news 2024"],
    "groundingChunks": [
      { "web": { "uri": "https://...", "title": "AI News" } }
    ]
  }
}
```

---

## Vite + TSX Implementation

### ToolsSelector Component

```tsx
import React from 'react';

interface Props {
  googleSearch: boolean;
  urlContext: boolean;
  urls: string[];
  onGoogleSearchChange: (v: boolean) => void;
  onUrlContextChange: (v: boolean) => void;
  onUrlsChange: (v: string[]) => void;
}

export const ToolsSelector: React.FC<Props> = ({
  googleSearch, urlContext, urls,
  onGoogleSearchChange, onUrlContextChange, onUrlsChange
}) => {
  const addUrl = () => {
    const url = prompt('Enter URL:');
    if (url) onUrlsChange([...urls, url]);
  };

  return (
    <div className="tools-selector">
      <h4>🔧 Tools</h4>
      
      <label>
        <input
          type="checkbox"
          checked={googleSearch}
          onChange={e => onGoogleSearchChange(e.target.checked)}
        />
        Google Search Grounding
      </label>

      <label>
        <input
          type="checkbox"
          checked={urlContext}
          onChange={e => onUrlContextChange(e.target.checked)}
        />
        URL Context
      </label>

      {urlContext && (
        <div className="url-list">
          {urls.map((url, i) => (
            <div key={i} className="url-item">
              <span>{url}</span>
              <button onClick={() => onUrlsChange(urls.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
          <button onClick={addUrl}>+ Add URL</button>
        </div>
      )}
    </div>
  );
};
```

### GroundingDisplay Component

```tsx
import React from 'react';

interface GroundingMetadata {
  webSearchQueries?: string[];
  groundingChunks?: Array<{ web?: { uri: string; title: string } }>;
}

interface Props {
  metadata: GroundingMetadata | null;
}

export const GroundingDisplay: React.FC<Props> = ({ metadata }) => {
  if (!metadata) return null;

  return (
    <div className="grounding-display">
      <h4>🔍 Sources</h4>
      
      {metadata.webSearchQueries?.length > 0 && (
        <div className="queries">
          <strong>Queries:</strong>
          {metadata.webSearchQueries.map((q, i) => (
            <span key={i} className="query-tag">{q}</span>
          ))}
        </div>
      )}

      {metadata.groundingChunks?.map((chunk, i) => (
        chunk.web && (
          <a
            key={i}
            href={chunk.web.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="source-link"
          >
            {chunk.web.title || chunk.web.uri}
          </a>
        )
      ))}
    </div>
  );
};
```

---

## CSS Styles

```css
.tools-selector label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}

.url-list {
  margin-left: 24px;
}

.url-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
  background: #2a2a2a;
  border-radius: 4px;
  margin: 4px 0;
}

.grounding-display {
  background: #1a1a2e;
  padding: 12px;
  border-radius: 8px;
  border-left: 3px solid #667eea;
}

.query-tag {
  background: #667eea;
  padding: 2px 8px;
  border-radius: 12px;
  margin: 0 4px;
  font-size: 12px;
}

.source-link {
  display: block;
  color: #74b9ff;
  margin: 4px 0;
}
```

---

## Model Support

All chat models support grounding:
- `gemini-2.5-flash` ✅
- `gemini-2.5-pro` ✅
- `gemini-3-pro-preview` ✅
- `gemini-2.0-flash` ✅
- `gemini-1.5-pro` ✅

## Notes

- **V1 vs V2**: V1 has Google Search & URL Context. V2 adds Function Calling & Code Execution.
