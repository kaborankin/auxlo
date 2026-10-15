export type AITask = string;
export type AIPriority = 'cheap' | 'balanced' | 'quality';

export interface AIRequest {
  task: AITask;
  prompt?: string;
  content?: string;
  metadata?: Record<string, unknown>;
  priority?: AIPriority;
}

export interface AIResponse {
  provider: 'openrouter' | 'ollama' | 'fallback';
  model: string;
  text: string;
  fallbackUsed?: boolean;
}

function normalizePriority(priority?: AIPriority): AIPriority {
  if (priority === 'quality' || priority === 'balanced') {
    return priority;
  }
  return 'cheap';
}

export function selectModelForTask(task: string, priority: AIPriority = 'cheap'): string {
  const qualityModel = process.env.AI_QUALITY_MODEL || 'anthropic/claude-sonnet-4';
  const defaultModel = process.env.AI_DEFAULT_MODEL || 'deepseek/deepseek-chat';

  if (priority === 'quality' || ['proposal', 'planning', 'architecture', 'coding'].includes(task)) {
    return qualityModel;
  }

  switch (task) {
    case 'classification':
    case 'summary':
    case 'json-extraction':
    case 'lead_summary':
      return defaultModel;
    default:
      return defaultModel;
  }
}

async function tryOpenRouter(model: string, prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Auxlo',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter returned ${response.status}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '';
    return text || null;
  } catch (error) {
    console.warn('[AI] OpenRouter call failed:', error);
    return null;
  }
}

async function tryOllama(model: string, prompt: string): Promise<string | null> {
  const baseUrl = process.env.OLLAMA_URL || process.env.OLLAMA_BASE_URL || process.env.OLLAMA_HOST || 'http://localhost:11434';

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    const data = await response.json();
    return data?.response || null;
  } catch (error) {
    console.warn('[AI] Ollama call failed:', error);
    return null;
  }
}

export async function generateText(request: AIRequest): Promise<AIResponse> {
  const prompt = request.prompt || request.content || JSON.stringify(request.metadata || {});
  const priority = normalizePriority(request.priority);
  const model = selectModelForTask(request.task, priority);
  const preferredProvider = (process.env.AI_PROVIDER || 'openrouter').toLowerCase();
  const fallbackProvider = (process.env.AI_FALLBACK || 'ollama').toLowerCase();
  const providerOrder = preferredProvider === 'ollama'
    ? (['ollama', fallbackProvider] as const)
    : (['openrouter', fallbackProvider] as const);

  for (const provider of providerOrder) {
    if (provider === 'openrouter') {
      const text = await tryOpenRouter(model, prompt);
      if (text) {
        return { provider: 'openrouter', model, text };
      }
    }

    if (provider === 'ollama') {
      const text = await tryOllama(model, prompt);
      if (text) {
        return { provider: 'ollama', model, text, fallbackUsed: provider === fallbackProvider };
      }
    }
  }

  return {
    provider: 'fallback',
    model,
    text: buildFallbackText(request.task, prompt),
    fallbackUsed: true,
  };
}

function buildFallbackText(task: string, prompt: string): string {
  if (task === 'summary' || task === 'lead_summary') {
    return `Summary: ${prompt.slice(0, 180)}`;
  }

  if (task === 'classification') {
    return 'new';
  }

  if (task === 'json-extraction') {
    return JSON.stringify({ extracted: prompt.slice(0, 120) });
  }

  return `Handled via fallback routing for ${task}: ${prompt.slice(0, 180)}`;
}

export const aiService = {
  generate: generateText,
  selectModelForTask,
};
