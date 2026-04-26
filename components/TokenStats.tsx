import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart2,
  Zap,
  DollarSign,
  MessageSquare,
  Trash2,
  Key,
  Send,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  getUsageRecords,
  clearUsageRecords,
  getAggregatedStats,
  makeTestCall,
  getStoredApiKey,
  storeApiKey,
  clearStoredApiKey,
  MODEL_PRICING,
  formatTokens,
  formatCost,
  UsageRecord,
} from '../services/anthropicUsageService';

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex items-start gap-4">
      <div className={`p-2 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-zinc-400 text-sm">{label}</p>
        <p className="text-white text-2xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-zinc-500 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function DailyChart({ byDay }: { byDay: Record<string, { input: number; output: number; calls: number }> }) {
  const entries = Object.entries(byDay);
  const maxTokens = Math.max(...entries.map(([, v]) => v.input + v.output), 1);

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <BarChart2 size={16} className="text-violet-400" />
        Last 7 Days — Token Usage
      </h3>
      <div className="flex items-end gap-2 h-32">
        {entries.map(([day, stats]) => {
          const total = stats.input + stats.output;
          const heightPct = total / maxTokens;
          const inputPct = total > 0 ? stats.input / total : 0;
          const label = new Date(day + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' });
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end" style={{ height: '96px' }}>
                {total > 0 ? (
                  <div
                    className="w-full rounded-t-md overflow-hidden flex flex-col-reverse"
                    style={{ height: `${heightPct * 96}px` }}
                    title={`${label}: ${formatTokens(stats.input)} in, ${formatTokens(stats.output)} out`}
                  >
                    <div className="bg-violet-500/70" style={{ height: `${inputPct * 100}%` }} />
                    <div className="bg-emerald-500/70 flex-1" />
                  </div>
                ) : (
                  <div className="w-full h-1 bg-zinc-800 rounded" />
                )}
              </div>
              <span className="text-zinc-500 text-xs">{label}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-3 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-violet-500/70 inline-block" /> Input
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/70 inline-block" /> Output
        </span>
      </div>
    </div>
  );
}

function ModelTable({ byModel }: { byModel: Record<string, { calls: number; input: number; output: number; cost: number }> }) {
  const rows = Object.entries(byModel);
  if (rows.length === 0) return null;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Zap size={16} className="text-yellow-400" />
        Usage by Model
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 text-left">
              <th className="pb-2 font-medium">Model</th>
              <th className="pb-2 font-medium text-right">Calls</th>
              <th className="pb-2 font-medium text-right">Input</th>
              <th className="pb-2 font-medium text-right">Output</th>
              <th className="pb-2 font-medium text-right">Est. Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rows.map(([model, stats]) => {
              const label = MODEL_PRICING[model]?.label ?? model;
              return (
                <tr key={model} className="text-zinc-300">
                  <td className="py-2 font-mono text-xs text-zinc-300">{label}</td>
                  <td className="py-2 text-right">{stats.calls}</td>
                  <td className="py-2 text-right text-violet-400">{formatTokens(stats.input)}</td>
                  <td className="py-2 text-right text-emerald-400">{formatTokens(stats.output)}</td>
                  <td className="py-2 text-right text-yellow-400">{formatCost(stats.cost)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecentCalls({ records }: { records: UsageRecord[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const shown = records.slice(0, 20);

  if (shown.length === 0) return null;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <MessageSquare size={16} className="text-sky-400" />
        Recent API Calls
      </h3>
      <div className="space-y-2">
        {shown.map((r) => {
          const isExpanded = expanded === r.id;
          const modelLabel = MODEL_PRICING[r.model]?.label ?? r.model;
          return (
            <div key={r.id} className="bg-zinc-800/40 rounded-xl border border-zinc-800 overflow-hidden">
              <button
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-zinc-800/60 transition-colors"
                onClick={() => setExpanded(isExpanded ? null : r.id)}
              >
                <span className="text-zinc-500 text-xs min-w-[88px]">
                  {new Date(r.timestamp).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-zinc-400 text-xs bg-zinc-800 px-2 py-0.5 rounded-full">{modelLabel}</span>
                <span className="text-violet-400 text-xs">{formatTokens(r.input_tokens)} in</span>
                <span className="text-emerald-400 text-xs">{formatTokens(r.output_tokens)} out</span>
                <span className="text-yellow-400 text-xs ml-auto">{formatCost(r.cost_usd)}</span>
                {isExpanded ? <ChevronUp size={14} className="text-zinc-500 shrink-0" /> : <ChevronDown size={14} className="text-zinc-500 shrink-0" />}
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2 border-t border-zinc-800/60">
                  <div>
                    <p className="text-zinc-500 text-xs mt-2">Prompt</p>
                    <p className="text-zinc-300 text-xs mt-0.5 font-mono">{r.prompt}{r.prompt.length >= 100 ? '…' : ''}</p>
                  </div>
                  {r.response_preview && (
                    <div>
                      <p className="text-zinc-500 text-xs">Response preview</p>
                      <p className="text-zinc-300 text-xs mt-0.5 font-mono">{r.response_preview}{r.response_preview.length >= 120 ? '…' : ''}</p>
                    </div>
                  )}
                  {(r.cache_read_tokens > 0 || r.cache_creation_tokens > 0) && (
                    <p className="text-zinc-500 text-xs">
                      Cache: {formatTokens(r.cache_read_tokens)} read · {formatTokens(r.cache_creation_tokens)} write
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export const TokenStats: React.FC = () => {
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keyStored, setKeyStored] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-haiku-4-5');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<UsageRecord | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    const r = getUsageRecords();
    setRecords(r);
  }, []);

  useEffect(() => {
    load();
    const stored = getStoredApiKey();
    if (stored) {
      setApiKey(stored);
      setKeyStored(true);
    }
  }, [load]);

  const handleSaveKey = () => {
    storeApiKey(apiKey);
    setKeyStored(true);
  };

  const handleClearKey = () => {
    clearStoredApiKey();
    setApiKey('');
    setKeyStored(false);
  };

  const handleClearData = () => {
    if (!confirm('Clear all usage history?')) return;
    clearUsageRecords();
    setRecords([]);
    setLastResult(null);
  };

  const handleSend = async () => {
    if (!apiKey || !prompt.trim()) return;
    setLoading(true);
    setError('');
    setLastResult(null);
    try {
      const record = await makeTestCall(apiKey, prompt, selectedModel);
      setLastResult(record);
      load();
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const stats = getAggregatedStats(records);

  return (
    <div className="space-y-6">
      {/* API Key section */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Key size={16} className="text-pink-400" />
          Anthropic API Key
        </h3>
        <p className="text-zinc-500 text-xs mb-3 flex items-start gap-1.5">
          <Info size={12} className="mt-0.5 shrink-0 text-zinc-600" />
          Your key is stored in your browser (localStorage) and sent directly to the Anthropic API.
          It is never sent to any third-party server.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setKeyStored(false); }}
              placeholder="sk-ant-api03-..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 pr-10 focus:outline-none focus:border-pink-500"
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              onClick={() => setShowKey((v) => !v)}
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {!keyStored ? (
            <button
              onClick={handleSaveKey}
              disabled={!apiKey}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Save
            </button>
          ) : (
            <button
              onClick={handleClearKey}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-xl transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        {keyStored && (
          <p className="text-emerald-500 text-xs mt-2">✓ Key saved to localStorage</p>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<MessageSquare size={18} className="text-sky-400" />}
          label="Total Calls"
          value={String(stats.totalCalls)}
          color="bg-sky-900/30"
        />
        <StatCard
          icon={<Zap size={18} className="text-violet-400" />}
          label="Input Tokens"
          value={formatTokens(stats.totalInputTokens)}
          sub="prompt tokens"
          color="bg-violet-900/30"
        />
        <StatCard
          icon={<Zap size={18} className="text-emerald-400" />}
          label="Output Tokens"
          value={formatTokens(stats.totalOutputTokens)}
          sub="completion tokens"
          color="bg-emerald-900/30"
        />
        <StatCard
          icon={<DollarSign size={18} className="text-yellow-400" />}
          label="Est. API Cost"
          value={formatCost(stats.totalCost)}
          sub="based on public pricing"
          color="bg-yellow-900/30"
        />
      </div>

      {/* Daily chart */}
      <DailyChart byDay={stats.byDay} />

      {/* Model table */}
      {Object.keys(stats.byModel).length > 0 && (
        <ModelTable byModel={stats.byModel} />
      )}

      {/* Test call */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Send size={16} className="text-pink-400" />
          Make a Test API Call
        </h3>
        <p className="text-zinc-500 text-xs mb-4">
          Send a message to Claude and see the token usage recorded instantly.
        </p>
        <div className="space-y-3">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
          >
            {Object.entries(MODEL_PRICING).map(([id, { label }]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt to send to Claude…"
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-pink-500"
          />
          <button
            onClick={handleSend}
            disabled={!apiKey || !prompt.trim() || loading}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all
              disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed
              bg-white text-black hover:bg-pink-500 hover:text-white"
          >
            {loading ? (
              <><RefreshCw size={14} className="animate-spin" /> Sending…</>
            ) : (
              <><Send size={14} /> Send & Track</>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-900/50 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {lastResult && (
          <div className="mt-3 p-4 bg-emerald-900/20 border border-emerald-900/50 rounded-xl space-y-2">
            <p className="text-emerald-400 font-medium text-sm">✓ Call recorded!</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-zinc-500">Input tokens</p>
                <p className="text-violet-400 font-semibold">{formatTokens(lastResult.input_tokens)}</p>
              </div>
              <div>
                <p className="text-zinc-500">Output tokens</p>
                <p className="text-emerald-400 font-semibold">{formatTokens(lastResult.output_tokens)}</p>
              </div>
              <div>
                <p className="text-zinc-500">Cost</p>
                <p className="text-yellow-400 font-semibold">{formatCost(lastResult.cost_usd)}</p>
              </div>
            </div>
            {lastResult.response_preview && (
              <p className="text-zinc-400 text-xs font-mono border-t border-emerald-900/40 pt-2">
                {lastResult.response_preview}{lastResult.response_preview.length >= 120 ? '…' : ''}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Recent calls */}
      <RecentCalls records={records} />

      {/* Clear data */}
      {records.length > 0 && (
        <button
          onClick={handleClearData}
          className="flex items-center gap-2 text-zinc-600 hover:text-red-400 text-sm transition-colors mx-auto"
        >
          <Trash2 size={14} />
          Clear all usage history ({records.length} records)
        </button>
      )}

      {records.length === 0 && (
        <div className="text-center text-zinc-700 py-12">
          <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No usage data yet.</p>
          <p className="text-xs mt-1">Add your API key and make a test call to start tracking.</p>
        </div>
      )}
    </div>
  );
};
