# Tools & Function Calling Guide (API V2)

Complete tools implementation for Vite + React + TypeScript including Google Search, Function Calling, and Code Execution.

## Available Tools

| Tool | Description | Use Case |
|------|-------------|----------|
| Google Search | Web search grounding | Real-time info, news |
| Code Execution | Run Python code | Calculations, data processing |
| Function Calling | Custom functions | API integrations, actions |

## Request Format

```typescript
interface Tool {
  // Google Search
  googleSearch?: {
    enabled: boolean;
  };
  
  // Code Execution
  codeExecution?: Record<string, never>;  // Empty object to enable
  
  // Custom Function
  functionDeclarations?: FunctionDeclaration[];
}

interface FunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: 'string' | 'number' | 'boolean' | 'array' | 'object';
      description: string;
      enum?: string[];
    }>;
    required?: string[];
  };
}

interface ChatRequest {
  prompt?: string;
  messages?: ChatMessage[];
  model: string;
  tools?: Tool[];
  // ... other fields
}
```

## Response with Tools

```typescript
interface ChatResponse {
  message: ChatMessage;
  // Google Search results
  groundingMetadata?: GroundingMetadata;
  // Function calls to execute
  functionCalls?: FunctionCall[];
  // Code execution result
  codeExecutionResult?: CodeResult;
}

interface GroundingMetadata {
  webSearchQueries?: string[];
  groundingChunks?: Array<{
    web?: { uri: string; title: string };
  }>;
  searchEntryPoint?: { renderedContent: string };
}

interface FunctionCall {
  name: string;
  args: Record<string, unknown>;
}

interface CodeResult {
  outcome: 'OUTCOME_OK' | 'OUTCOME_FAILED';
  output?: string;
}
```

---

## Complete Vite + TSX Implementation

### 1. Tools Types (`src/types/tools.types.ts`)

```typescript
export interface GoogleSearchConfig {
  enabled: boolean;
}

export interface FunctionParameter {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  enum?: string[];
  items?: FunctionParameter;
  properties?: Record<string, FunctionParameter>;
}

export interface FunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, FunctionParameter>;
    required?: string[];
  };
}

export interface Tool {
  googleSearch?: GoogleSearchConfig;
  codeExecution?: Record<string, never>;
  functionDeclarations?: FunctionDeclaration[];
}

export interface FunctionCall {
  name: string;
  args: Record<string, unknown>;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  webSearchQueries?: string[];
  groundingChunks?: GroundingChunk[];
  searchEntryPoint?: {
    renderedContent: string;
  };
  groundingSupports?: Array<{
    segment: { startIndex: number; endIndex: number };
    groundingChunkIndices: number[];
    confidenceScores: number[];
  }>;
}

export interface CodeExecutionResult {
  outcome: 'OUTCOME_OK' | 'OUTCOME_FAILED';
  output?: string;
}

// Pre-built function declarations
export const BUILT_IN_FUNCTIONS: FunctionDeclaration[] = [
  {
    name: 'get_weather',
    description: 'Get the current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name, e.g., "Jakarta" or "New York"',
        },
        unit: {
          type: 'string',
          description: 'Temperature unit',
          enum: ['celsius', 'fahrenheit'],
        },
      },
      required: ['location'],
    },
  },
  {
    name: 'search_products',
    description: 'Search for products in the catalog',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
        category: {
          type: 'string',
          description: 'Product category',
          enum: ['electronics', 'clothing', 'books', 'home'],
        },
        maxPrice: {
          type: 'number',
          description: 'Maximum price filter',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'create_reminder',
    description: 'Create a reminder for the user',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Reminder title',
        },
        date: {
          type: 'string',
          description: 'Reminder date in ISO format',
        },
        priority: {
          type: 'string',
          description: 'Priority level',
          enum: ['low', 'medium', 'high'],
        },
      },
      required: ['title', 'date'],
    },
  },
];
```

### 2. ToolsSelector Component (`src/components/Chat/ToolsSelector.tsx`)

```tsx
import React from 'react';
import type { Tool, FunctionDeclaration } from '../../types/tools.types';
import { BUILT_IN_FUNCTIONS } from '../../types/tools.types';
import './ToolsSelector.css';

interface ToolsSelectorProps {
  value: Tool[];
  onChange: (tools: Tool[]) => void;
}

export const ToolsSelector: React.FC<ToolsSelectorProps> = ({
  value,
  onChange,
}) => {
  // Check which tools are enabled
  const isGoogleSearchEnabled = value.some((t) => t.googleSearch?.enabled);
  const isCodeExecutionEnabled = value.some((t) => t.codeExecution);
  const enabledFunctions = value.flatMap((t) => t.functionDeclarations || []);

  const toggleGoogleSearch = () => {
    if (isGoogleSearchEnabled) {
      onChange(value.filter((t) => !t.googleSearch));
    } else {
      onChange([...value, { googleSearch: { enabled: true } }]);
    }
  };

  const toggleCodeExecution = () => {
    if (isCodeExecutionEnabled) {
      onChange(value.filter((t) => !t.codeExecution));
    } else {
      onChange([...value, { codeExecution: {} }]);
    }
  };

  const toggleFunction = (func: FunctionDeclaration) => {
    const isEnabled = enabledFunctions.some((f) => f.name === func.name);
    
    if (isEnabled) {
      // Remove this function
      const newTools = value.map((t) => {
        if (t.functionDeclarations) {
          return {
            ...t,
            functionDeclarations: t.functionDeclarations.filter(
              (f) => f.name !== func.name
            ),
          };
        }
        return t;
      }).filter((t) => !t.functionDeclarations || t.functionDeclarations.length > 0);
      onChange(newTools);
    } else {
      // Add this function
      const existingFuncTool = value.find((t) => t.functionDeclarations);
      if (existingFuncTool) {
        onChange(
          value.map((t) =>
            t === existingFuncTool
              ? {
                  ...t,
                  functionDeclarations: [...(t.functionDeclarations || []), func],
                }
              : t
          )
        );
      } else {
        onChange([...value, { functionDeclarations: [func] }]);
      }
    }
  };

  return (
    <div className="tools-selector">
      <label>Tools</label>

      <div className="tools-grid">
        {/* Google Search */}
        <div
          className={`tool-card ${isGoogleSearchEnabled ? 'active' : ''}`}
          onClick={toggleGoogleSearch}
        >
          <div className="tool-icon">🔍</div>
          <div className="tool-name">Google Search</div>
          <div className="tool-desc">Real-time web search</div>
        </div>

        {/* Code Execution */}
        <div
          className={`tool-card ${isCodeExecutionEnabled ? 'active' : ''}`}
          onClick={toggleCodeExecution}
        >
          <div className="tool-icon">💻</div>
          <div className="tool-name">Code Execution</div>
          <div className="tool-desc">Run Python code</div>
        </div>
      </div>

      {/* Function Declarations */}
      <div className="functions-section">
        <label>Functions</label>
        <div className="functions-list">
          {BUILT_IN_FUNCTIONS.map((func) => {
            const isEnabled = enabledFunctions.some((f) => f.name === func.name);
            return (
              <div
                key={func.name}
                className={`function-item ${isEnabled ? 'active' : ''}`}
                onClick={() => toggleFunction(func)}
              >
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => {}}
                />
                <div className="function-info">
                  <div className="function-name">{func.name}</div>
                  <div className="function-desc">{func.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ToolsSelector;
```

### 3. GroundingDisplay Component (`src/components/Chat/GroundingDisplay.tsx`)

```tsx
import React from 'react';
import type { GroundingMetadata } from '../../types/tools.types';
import './GroundingDisplay.css';

interface GroundingDisplayProps {
  metadata: GroundingMetadata;
}

export const GroundingDisplay: React.FC<GroundingDisplayProps> = ({
  metadata,
}) => {
  if (!metadata.groundingChunks?.length && !metadata.webSearchQueries?.length) {
    return null;
  }

  return (
    <div className="grounding-display">
      <div className="grounding-header">
        <span className="grounding-icon">🔗</span>
        <span className="grounding-title">Sources</span>
      </div>

      {/* Search Queries */}
      {metadata.webSearchQueries && metadata.webSearchQueries.length > 0 && (
        <div className="search-queries">
          <span className="label">Searched:</span>
          {metadata.webSearchQueries.map((query, i) => (
            <span key={i} className="query-badge">
              {query}
            </span>
          ))}
        </div>
      )}

      {/* Source Links */}
      {metadata.groundingChunks && metadata.groundingChunks.length > 0 && (
        <div className="source-links">
          {metadata.groundingChunks.map((chunk, i) => (
            chunk.web && (
              <a
                key={i}
                href={chunk.web.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="source-link"
              >
                <span className="source-number">{i + 1}</span>
                <span className="source-title">{chunk.web.title}</span>
              </a>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default GroundingDisplay;
```

### 4. FunctionCallDisplay Component (`src/components/Chat/FunctionCallDisplay.tsx`)

```tsx
import React, { useState } from 'react';
import type { FunctionCall } from '../../types/tools.types';
import './FunctionCallDisplay.css';

interface FunctionCallDisplayProps {
  functionCall: FunctionCall;
  onExecute?: (result: unknown) => void;
}

export const FunctionCallDisplay: React.FC<FunctionCallDisplayProps> = ({
  functionCall,
  onExecute,
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      // Simulate function execution
      // In real app, call your actual function implementations
      const mockResult = await executeMockFunction(functionCall);
      setResult(mockResult);
      onExecute?.(mockResult);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="function-call-display">
      <div className="function-call-header">
        <span className="function-icon">⚡</span>
        <span className="function-name">{functionCall.name}</span>
      </div>

      <div className="function-args">
        <pre>{JSON.stringify(functionCall.args, null, 2)}</pre>
      </div>

      {!result && (
        <button
          className="execute-btn"
          onClick={handleExecute}
          disabled={isExecuting}
        >
          {isExecuting ? 'Executing...' : 'Execute Function'}
        </button>
      )}

      {result && (
        <div className="function-result">
          <label>Result:</label>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

// Mock function executor
async function executeMockFunction(call: FunctionCall): Promise<unknown> {
  await new Promise((r) => setTimeout(r, 500)); // Simulate delay

  switch (call.name) {
    case 'get_weather':
      return {
        location: call.args.location,
        temperature: Math.floor(Math.random() * 20) + 20,
        condition: 'Partly cloudy',
        humidity: Math.floor(Math.random() * 30) + 60,
      };
    case 'search_products':
      return {
        results: [
          { id: 1, name: 'Product A', price: 99.99 },
          { id: 2, name: 'Product B', price: 149.99 },
        ],
        total: 2,
      };
    case 'create_reminder':
      return {
        id: Date.now(),
        title: call.args.title,
        date: call.args.date,
        created: true,
      };
    default:
      return { executed: true, args: call.args };
  }
}

export default FunctionCallDisplay;
```

### 5. CodeExecutionDisplay Component (`src/components/Chat/CodeExecutionDisplay.tsx`)

```tsx
import React from 'react';
import type { CodeExecutionResult } from '../../types/tools.types';
import './CodeExecutionDisplay.css';

interface CodeExecutionDisplayProps {
  result: CodeExecutionResult;
}

export const CodeExecutionDisplay: React.FC<CodeExecutionDisplayProps> = ({
  result,
}) => {
  const isSuccess = result.outcome === 'OUTCOME_OK';

  return (
    <div className={`code-execution-display ${isSuccess ? 'success' : 'error'}`}>
      <div className="code-header">
        <span className="code-icon">{isSuccess ? '✅' : '❌'}</span>
        <span className="code-title">Code Execution</span>
        <span className={`status-badge ${isSuccess ? 'success' : 'error'}`}>
          {isSuccess ? 'Success' : 'Failed'}
        </span>
      </div>

      {result.output && (
        <div className="code-output">
          <label>Output:</label>
          <pre>{result.output}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeExecutionDisplay;
```

### 6. CSS Files

**ToolsSelector.css:**
```css
.tools-selector {
  margin: 1rem 0;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.tool-card {
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.tool-card:hover {
  border-color: #007bff;
}

.tool-card.active {
  border-color: #007bff;
  background: #e7f1ff;
}

.tool-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.tool-name {
  font-weight: 600;
}

.tool-desc {
  font-size: 0.75rem;
  color: #666;
}

.functions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.function-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
}

.function-item.active {
  border-color: #007bff;
  background: #f0f7ff;
}

.function-name {
  font-weight: 600;
  font-family: monospace;
}

.function-desc {
  font-size: 0.875rem;
  color: #666;
}
```

---

## Usage Examples

### Google Search
```typescript
const request: ChatRequest = {
  prompt: "What are the latest news about AI today?",
  model: 'gemini-2.5-flash',
  tools: [
    { googleSearch: { enabled: true } }
  ],
};
```

### Code Execution
```typescript
const request: ChatRequest = {
  prompt: "Calculate the first 20 prime numbers using Python",
  model: 'gemini-2.5-flash',
  tools: [
    { codeExecution: {} }
  ],
};
```

### Function Calling
```typescript
const request: ChatRequest = {
  prompt: "What's the weather in Jakarta?",
  model: 'gemini-2.5-flash',
  tools: [
    {
      functionDeclarations: [{
        name: 'get_weather',
        description: 'Get weather for a location',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'string', description: 'City name' },
          },
          required: ['location'],
        },
      }],
    }
  ],
};
```
