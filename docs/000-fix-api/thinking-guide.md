# Thinking Mode Guide (API V2)

Complete thinking mode implementation for Vite + React + TypeScript.

## Overview

Thinking Mode enables Gemini models to "think through" complex problems before responding. Available in Gemini 2.5+ and Gemini 3 models.

## Supported Models

| Model | Config Type | Range | Default |
|-------|-------------|-------|---------|
| `gemini-2.5-flash` | thinkingBudget | 0-24576 | 0 (off) |
| `gemini-2.5-pro` | thinkingBudget | 128-32768 | 0 (off) |
| `gemini-2.5-flash-lite` | thinkingBudget | 0-8192 | 0 (off) |
| `gemini-3-pro-preview` | thinkingLevel | 'low' \| 'high' | 'low' |

## Request Format

```typescript
interface ThinkingConfig {
  // For Gemini 2.5 models (budget-based)
  thinkingBudget?: number;            // Token budget for thinking
                                      // -1 = dynamic (model decides)
  
  // For Gemini 3 models (level-based)
  thinkingLevel?: 'low' | 'high';
  
  // Common
  includeThoughts?: boolean;          // Return thoughts in response
}

interface ChatRequest {
  prompt?: string;
  messages?: ChatMessage[];
  model: string;
  thinkingConfig?: ThinkingConfig;
  // ... other fields
}
```

## Response with Thoughts

```typescript
interface ChatResponse {
  message: ChatMessage;
  thoughts?: string[];                // Thinking process
  usageMetadata?: UsageMetadata;
}

interface UsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
  thoughtsTokenCount?: number;        // Tokens used for thinking
}
```

---

## Complete Vite + TSX Implementation

### 1. Types (`src/types/thinking.types.ts`)

```typescript
export type ThinkingLevel = 'low' | 'high';

export interface ThinkingConfig {
  thinkingBudget?: number;
  thinkingLevel?: ThinkingLevel;
  includeThoughts?: boolean;
}

export interface ThinkingPreset {
  id: string;
  name: string;
  description: string;
  config: ThinkingConfig;
  models: string[];
}

// Recommended presets
export const THINKING_PRESETS: ThinkingPreset[] = [
  {
    id: 'off',
    name: 'Off',
    description: 'No thinking mode',
    config: {},
    models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Quick reasoning (512 tokens)',
    config: { thinkingBudget: 512, includeThoughts: true },
    models: ['gemini-2.5-flash', 'gemini-2.5-pro'],
  },
  {
    id: 'medium',
    name: 'Medium',
    description: 'Standard reasoning (2048 tokens)',
    config: { thinkingBudget: 2048, includeThoughts: true },
    models: ['gemini-2.5-flash', 'gemini-2.5-pro'],
  },
  {
    id: 'deep',
    name: 'Deep',
    description: 'Complex reasoning (8192 tokens)',
    config: { thinkingBudget: 8192, includeThoughts: true },
    models: ['gemini-2.5-flash', 'gemini-2.5-pro'],
  },
  {
    id: 'maximum',
    name: 'Maximum',
    description: 'Extensive reasoning (24576 tokens)',
    config: { thinkingBudget: 24576, includeThoughts: true },
    models: ['gemini-2.5-flash'],
  },
  {
    id: 'dynamic',
    name: 'Dynamic',
    description: 'Model decides budget (-1)',
    config: { thinkingBudget: -1, includeThoughts: true },
    models: ['gemini-2.5-flash', 'gemini-2.5-pro'],
  },
  {
    id: 'gemini3-low',
    name: 'Gemini 3 Low',
    description: 'Low thinking level',
    config: { thinkingLevel: 'low', includeThoughts: true },
    models: ['gemini-3-pro-preview'],
  },
  {
    id: 'gemini3-high',
    name: 'Gemini 3 High',
    description: 'High thinking level',
    config: { thinkingLevel: 'high', includeThoughts: true },
    models: ['gemini-3-pro-preview'],
  },
];

export function getPresetsForModel(model: string): ThinkingPreset[] {
  return THINKING_PRESETS.filter((preset) => preset.models.includes(model));
}

export function getDefaultPresetForModel(model: string): ThinkingPreset {
  const presets = getPresetsForModel(model);
  return presets.find((p) => p.id === 'medium') || presets[0];
}
```

### 2. ThinkingSelector Component (`src/components/Chat/ThinkingSelector.tsx`)

```tsx
import React from 'react';
import type { ThinkingConfig, ThinkingPreset } from '../../types/thinking.types';
import { getPresetsForModel, THINKING_PRESETS } from '../../types/thinking.types';
import './ThinkingSelector.css';

interface ThinkingSelectorProps {
  model: string;
  value: ThinkingConfig | undefined;
  onChange: (config: ThinkingConfig | undefined) => void;
  showCustom?: boolean;
}

export const ThinkingSelector: React.FC<ThinkingSelectorProps> = ({
  model,
  value,
  onChange,
  showCustom = false,
}) => {
  const presets = getPresetsForModel(model);
  const [isCustom, setIsCustom] = React.useState(false);
  const [customBudget, setCustomBudget] = React.useState(1024);

  const handlePresetChange = (presetId: string) => {
    if (presetId === 'custom') {
      setIsCustom(true);
      onChange({ thinkingBudget: customBudget, includeThoughts: true });
      return;
    }

    setIsCustom(false);
    const preset = THINKING_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      onChange(preset.config.thinkingBudget !== undefined || preset.config.thinkingLevel !== undefined
        ? preset.config
        : undefined);
    }
  };

  const handleCustomBudgetChange = (budget: number) => {
    setCustomBudget(budget);
    onChange({ thinkingBudget: budget, includeThoughts: true });
  };

  // Determine current preset
  const currentPresetId = isCustom
    ? 'custom'
    : presets.find(
        (p) =>
          (p.config.thinkingBudget === value?.thinkingBudget &&
           p.config.thinkingLevel === value?.thinkingLevel) ||
          (!value && p.id === 'off')
      )?.id || 'off';

  // Get max budget for model
  const maxBudget = model.includes('pro') ? 32768 : 24576;

  return (
    <div className="thinking-selector">
      <label>Thinking Mode</label>
      
      {/* Preset Buttons */}
      <div className="preset-buttons">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`preset-btn ${currentPresetId === preset.id ? 'active' : ''}`}
            onClick={() => handlePresetChange(preset.id)}
            title={preset.description}
          >
            {preset.name}
          </button>
        ))}
        {showCustom && (
          <button
            type="button"
            className={`preset-btn ${currentPresetId === 'custom' ? 'active' : ''}`}
            onClick={() => handlePresetChange('custom')}
          >
            Custom
          </button>
        )}
      </div>

      {/* Custom Budget Slider */}
      {isCustom && (
        <div className="custom-budget">
          <label>
            Budget: {customBudget} tokens
          </label>
          <input
            type="range"
            min={0}
            max={maxBudget}
            step={256}
            value={customBudget}
            onChange={(e) => handleCustomBudgetChange(parseInt(e.target.value))}
          />
          <div className="budget-markers">
            <span>0</span>
            <span>{maxBudget / 2}</span>
            <span>{maxBudget}</span>
          </div>
        </div>
      )}

      {/* Current Config Display */}
      {value && (
        <div className="current-config">
          {value.thinkingBudget !== undefined && (
            <span className="config-badge">
              Budget: {value.thinkingBudget === -1 ? 'Dynamic' : value.thinkingBudget}
            </span>
          )}
          {value.thinkingLevel && (
            <span className="config-badge">
              Level: {value.thinkingLevel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ThinkingSelector;
```

### 3. CSS (`src/components/Chat/ThinkingSelector.css`)

```css
.thinking-selector {
  margin: 1rem 0;
}

.thinking-selector > label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preset-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.preset-btn:hover {
  border-color: #007bff;
}

.preset-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.custom-budget {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.custom-budget input[type="range"] {
  width: 100%;
  margin: 0.5rem 0;
}

.budget-markers {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #666;
}

.current-config {
  margin-top: 0.5rem;
}

.config-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #e9ecef;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-right: 0.5rem;
}
```

### 4. ThoughtDisplay Component (`src/components/Chat/ThoughtDisplay.tsx`)

```tsx
import React, { useState } from 'react';
import './ThoughtDisplay.css';

interface ThoughtDisplayProps {
  thoughts: string[];
  isStreaming?: boolean;
  currentThought?: string;
}

export const ThoughtDisplay: React.FC<ThoughtDisplayProps> = ({
  thoughts,
  isStreaming = false,
  currentThought = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const allThoughts = currentThought
    ? [...thoughts, currentThought]
    : thoughts;

  if (allThoughts.length === 0) {
    return null;
  }

  return (
    <div className={`thought-display ${isStreaming ? 'streaming' : ''}`}>
      <div
        className="thought-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="thought-icon">🧠</span>
        <span className="thought-title">
          {isStreaming ? 'Thinking...' : 'Thought Process'}
        </span>
        <span className="thought-toggle">
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>

      {isExpanded && (
        <div className="thought-content">
          {allThoughts.map((thought, index) => (
            <div key={index} className="thought-item">
              <span className="thought-number">{index + 1}.</span>
              <span className="thought-text">{thought}</span>
            </div>
          ))}
          {isStreaming && (
            <div className="thought-cursor">▌</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThoughtDisplay;
```

---

## Usage in Chat

```tsx
import { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { ThinkingSelector } from './ThinkingSelector';
import { ThoughtDisplay } from './ThoughtDisplay';
import type { ThinkingConfig } from '../types/thinking.types';

function ChatWithThinking() {
  const [model, setModel] = useState('gemini-2.5-flash');
  const [thinkingConfig, setThinkingConfig] = useState<ThinkingConfig | undefined>();

  const {
    messages,
    isStreaming,
    currentThought,
    sendMessageStream,
  } = useChat({
    model,
    thinkingConfig,
    onThought: (thought) => {
      console.log('Received thought:', thought);
    },
  });

  return (
    <div>
      {/* Model Selector */}
      <select value={model} onChange={(e) => setModel(e.target.value)}>
        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
        <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
        <option value="gemini-3-pro-preview">Gemini 3 Pro Preview</option>
      </select>

      {/* Thinking Selector */}
      <ThinkingSelector
        model={model}
        value={thinkingConfig}
        onChange={setThinkingConfig}
        showCustom
      />

      {/* Messages with Thoughts */}
      {messages.map((msg, i) => (
        <div key={i}>
          {msg.role === 'model' && msg.thoughts && (
            <ThoughtDisplay thoughts={msg.thoughts} />
          )}
          <div className="message">{msg.content}</div>
        </div>
      ))}

      {/* Streaming Thoughts */}
      {isStreaming && currentThought && (
        <ThoughtDisplay
          thoughts={[]}
          isStreaming
          currentThought={currentThought}
        />
      )}
    </div>
  );
}
```

---

## Budget Guidelines

| Task Type | Recommended Budget |
|-----------|-------------------|
| Simple Q&A | 0 (off) |
| Basic math | 512-1024 |
| Multi-step problems | 1024-2048 |
| Code analysis | 2048-4096 |
| Complex reasoning | 4096-8192 |
| Research tasks | 8192+ |
| Let model decide | -1 (dynamic) |
