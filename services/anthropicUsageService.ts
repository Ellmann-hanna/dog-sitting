export interface UsageRecord {
  id: string;
  timestamp: number;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_creation_tokens: number;
  prompt: string;
  response_preview: string;
  cost_usd: number;
}

export interface ModelStats {
  calls: number;
  input: number;
  output: number;
  cost: number;
}

export interface DayStats {
  input: number;
  output: number;
  calls: number;
}

export interface AggregatedStats {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  totalCalls: number;
  byModel: Record<string, ModelStats>;
  byDay: Record<string, DayStats>;
}

// Pricing per 1M tokens (USD) — as of April 2026
export const MODEL_PRICING: Record<string, { input: number; output: number; cache_read: number; cache_write: number; label: string }> = {
  'claude-opus-4-6':   { input: 5.00, output: 25.00, cache_read: 0.50,  cache_write: 6.25,  label: 'Claude Opus 4.6' },
  'claude-sonnet-4-6': { input: 3.00, output: 15.00, cache_read: 0.30,  cache_write: 3.75,  label: 'Claude Sonnet 4.6' },
  'claude-haiku-4-5':  { input: 1.00, output: 5.00,  cache_read: 0.10,  cache_write: 1.25,  label: 'Claude Haiku 4.5' },
};

const STORAGE_KEY = 'claude_usage_records';
const API_KEY_STORAGE = 'claude_api_key';

export function getStoredApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

export function storeApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function clearStoredApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE);
}

export function getUsageRecords(): UsageRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveUsageRecord(record: UsageRecord): void {
  const records = getUsageRecords();
  records.unshift(record);
  if (records.length > 1000) records.splice(1000);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function clearUsageRecords(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens = 0,
  cacheCreationTokens = 0,
): number {
  const pricing = MODEL_PRICING[model] ?? MODEL_PRICING['claude-haiku-4-5'];
  return (
    (inputTokens / 1_000_000) * pricing.input +
    (outputTokens / 1_000_000) * pricing.output +
    (cacheReadTokens / 1_000_000) * pricing.cache_read +
    (cacheCreationTokens / 1_000_000) * pricing.cache_write
  );
}

export async function makeTestCall(
  apiKey: string,
  prompt: string,
  model = 'claude-haiku-4-5',
): Promise<UsageRecord> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message || `API error ${res.status}`);
  }

  const data: any = await res.json();
  const u = data.usage ?? {};
  const inputTokens: number = u.input_tokens ?? 0;
  const outputTokens: number = u.output_tokens ?? 0;
  const cacheReadTokens: number = u.cache_read_input_tokens ?? 0;
  const cacheCreationTokens: number = u.cache_creation_input_tokens ?? 0;

  const textBlock = (data.content ?? []).find((b: any) => b.type === 'text');
  const responsePreview: string = textBlock?.text?.slice(0, 120) ?? '';

  const record: UsageRecord = {
    id: data.id,
    timestamp: Date.now(),
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cache_read_tokens: cacheReadTokens,
    cache_creation_tokens: cacheCreationTokens,
    prompt: prompt.slice(0, 100),
    response_preview: responsePreview,
    cost_usd: calculateCost(model, inputTokens, outputTokens, cacheReadTokens, cacheCreationTokens),
  };

  saveUsageRecord(record);
  return record;
}

export function getAggregatedStats(records: UsageRecord[]): AggregatedStats {
  const totalInputTokens = records.reduce((s, r) => s + r.input_tokens, 0);
  const totalOutputTokens = records.reduce((s, r) => s + r.output_tokens, 0);
  const totalCost = records.reduce((s, r) => s + r.cost_usd, 0);
  const totalCalls = records.length;

  const byModel: Record<string, ModelStats> = {};
  for (const r of records) {
    byModel[r.model] ??= { calls: 0, input: 0, output: 0, cost: 0 };
    byModel[r.model].calls++;
    byModel[r.model].input += r.input_tokens;
    byModel[r.model].output += r.output_tokens;
    byModel[r.model].cost += r.cost_usd;
  }

  // Last 7 days
  const byDay: Record<string, DayStats> = {};
  const now = Date.now();
  for (let i = 6; i >= 0; i--) {
    const key = new Date(now - i * 86_400_000).toISOString().slice(0, 10);
    byDay[key] = { input: 0, output: 0, calls: 0 };
  }
  for (const r of records) {
    const key = new Date(r.timestamp).toISOString().slice(0, 10);
    if (byDay[key]) {
      byDay[key].input += r.input_tokens;
      byDay[key].output += r.output_tokens;
      byDay[key].calls++;
    }
  }

  return { totalInputTokens, totalOutputTokens, totalCost, totalCalls, byModel, byDay };
}

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatCost(usd: number): string {
  if (usd < 0.001) return `< $0.001`;
  return `$${usd.toFixed(4)}`;
}
