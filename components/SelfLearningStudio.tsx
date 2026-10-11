'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, BookOpen, Sliders, Download, Upload, RotateCcw, Check, Plus, Search, ShieldCheck, Flame } from 'lucide-react';
import { MemoryNode, LearnedRule } from '../lib/litert/types';
import { memoryStore } from '../lib/learning/memory-store';
import { selfLearningEngine, LearningMetrics } from '../lib/learning/self-learning';
import { ClientDate } from './ClientDateTime';

export const SelfLearningStudio: React.FC = () => {
  const [memories, setMemories] = useState<MemoryNode[]>([]);
  const [rules, setRules] = useState<LearnedRule[]>([]);
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null);
  const [lossCurve, setLossCurve] = useState<{ step: number; loss: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isReflecting, setIsReflecting] = useState(false);
  const [newRuleInput, setNewRuleInput] = useState('');
  const [newRuleRationale, setNewRuleRationale] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const refreshData = async () => {
    await memoryStore.init();
    const mems = await memoryStore.getAllMemories();
    const rls = await memoryStore.getAllRules();
    const met = await selfLearningEngine.getMetrics();
    const curve = selfLearningEngine.getLossCurve();

    setMemories(mems);
    setRules(rls);
    setMetrics(met);
    setLossCurve(curve);
  };

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      await memoryStore.init();
      const mems = await memoryStore.getAllMemories();
      const rls = await memoryStore.getAllRules();
      const met = await selfLearningEngine.getMetrics();
      const curve = selfLearningEngine.getLossCurve();
      if (isMounted) {
        setMemories(mems);
        setRules(rls);
        setMetrics(met);
        setLossCurve(curve);
      }
    };
    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleRule = async (ruleId: string) => {
    await memoryStore.toggleRule(ruleId);
    await refreshData();
  };

  const handleTriggerReflection = async () => {
    setIsReflecting(true);
    setStatusMessage('Running autonomous reflection routine on local logs...');
    try {
      await new Promise(r => setTimeout(r, 600));
      const res = await selfLearningEngine.performSelfReflection([
        'Edge execution session verified.',
        'Continuous offline alignment check: No network degradation detected.'
      ]);
      await refreshData();
      setStatusMessage(`Reflection complete: Distilled ${res.newRules.length} new rule and ${res.newMemories.length} episodic memory node.`);
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setIsReflecting(false);
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleInput.trim()) return;

    const rule: LearnedRule = {
      id: `rule_manual_${Date.now()}`,
      rule: newRuleInput.trim(),
      rationale: newRuleRationale.trim() || 'Manual developer calibration for on-device agent.',
      confidence: 0.98,
      timesApplied: 0,
      isActive: true,
      timestamp: Date.now()
    };

    await memoryStore.saveRule(rule);
    setNewRuleInput('');
    setNewRuleRationale('');
    await refreshData();
    setStatusMessage('New policy rule saved to IndexedDB.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleExportBrain = async () => {
    const jsonStr = await selfLearningEngine.exportKnowledgeGraph();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `litert-agent-brain-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBrain = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await selfLearningEngine.importKnowledgeGraph(content);
      if (success) {
        await refreshData();
        setStatusMessage('Knowledge brain successfully restored from JSON!');
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        alert('Invalid brain backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetBrain = async () => {
    if (confirm('Reset agent memory and rules to factory default?')) {
      await memoryStore.resetAll();
      await refreshData();
      setStatusMessage('Brain reset to initial factory seed.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Filter memories
  const filteredMemories = memories.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || m.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto">
      {/* Top Banner / Metrics Overview */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-200">On-Device Self-Learning & Memory Engine</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerReflection}
              disabled={isReflecting}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isReflecting ? 'Synthesizing...' : 'Trigger Self-Reflection'}</span>
            </button>
            <button
              onClick={handleExportBrain}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700"
              title="Download IndexedDB knowledge backup"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <label className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
              <input type="file" accept=".json" onChange={handleImportBrain} className="hidden" />
            </label>
            <button
              onClick={handleResetBrain}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 text-xs border border-slate-700"
              title="Reset memory"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="mb-3 p-2 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono">
            {statusMessage}
          </div>
        )}

        {/* Learning Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Indexed Memory Nodes
            </span>
            <div className="text-lg font-bold text-slate-200 mt-1 font-mono">
              {metrics?.totalMemories ?? memories.length}
            </div>
            <span className="text-[10px] text-emerald-400">100% IndexedDB Air-Gapped</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Active Behavioral Rules
            </span>
            <div className="text-lg font-bold text-cyan-400 mt-1 font-mono">
              {metrics?.totalActiveRules ?? rules.filter(r => r.isActive).length}
            </div>
            <span className="text-[10px] text-slate-400">Heuristic steering policies</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Knowledge Retention
            </span>
            <div className="text-lg font-bold text-emerald-400 mt-1 font-mono">
              {metrics?.knowledgeRetentionPct.toFixed(1) ?? '98.2'}%
            </div>
            <span className="text-[10px] text-slate-400">Episodic recall fidelity</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Simulated Policy Loss
            </span>
            <div className="text-lg font-bold text-amber-400 mt-1 font-mono">
              {metrics?.simulatedPolicyLoss.toFixed(4) ?? '0.1820'}
            </div>
            <span className="text-[10px] text-amber-500/90 flex items-center gap-1">
              <Flame className="w-3 h-3" /> Gradient descent
            </span>
          </div>
        </div>
      </div>

      {/* Policy Loss Chart & Rule Evolution Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Dynamic Loss Curve & Rule Synthesis Form */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-200">Policy Loss Convergence Curve</h3>
              <span className="text-[10px] font-mono text-slate-400">Step 1 to {lossCurve.length}</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3 leading-tight">
              Simulates edge preference updates when human feedback is provided or autonomous tasks succeed.
            </p>

            {/* SVG Loss Chart */}
            <div className="h-28 w-full bg-slate-950 rounded-lg p-2 border border-slate-800 relative flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid line */}
                <line x1="0" y1="25" x2="100" y2="25" stroke="#1e293b" strokeDasharray="2,2" strokeWidth="0.5" />
                
                {/* Area under curve */}
                {lossCurve.length > 1 && (
                  <path
                    d={`M 0,${50 - (lossCurve[0].loss * 40)} ${lossCurve.map((pt, i) => `L ${(i / (lossCurve.length - 1)) * 100},${50 - (pt.loss * 40)}`).join(' ')} L 100,50 L 0,50 Z`}
                    fill="url(#lossGrad)"
                  />
                )}
                {/* Line */}
                {lossCurve.length > 1 && (
                  <path
                    d={`M 0,${50 - (lossCurve[0].loss * 40)} ${lossCurve.map((pt, i) => `L ${(i / (lossCurve.length - 1)) * 100},${50 - (pt.loss * 40)}`).join(' ')}`}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                  />
                )}
              </svg>
            </div>
          </div>

          {/* Manual Rule Synthesis Form */}
          <form onSubmit={handleAddRule} className="mt-4 pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-mono text-cyan-400 block font-semibold">
              + Inject Evolved Policy Rule:
            </span>
            <input
              type="text"
              value={newRuleInput}
              onChange={(e) => setNewRuleInput(e.target.value)}
              placeholder="e.g. Always format mathematical formulas with steps..."
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
            <input
              type="text"
              value={newRuleRationale}
              onChange={(e) => setNewRuleRationale(e.target.value)}
              placeholder="Rationale / observation source..."
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
            <button
              type="submit"
              disabled={!newRuleInput.trim()}
              className="w-full py-1.5 rounded bg-slate-800 hover:bg-cyan-600 disabled:opacity-40 text-slate-200 hover:text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Commit Rule to Active Policy</span>
            </button>
          </form>
        </div>

        {/* Right: Active Learned Rules List (2 columns wide) */}
        <div className="lg:col-span-2 bg-[#0b0f19] border border-slate-800 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-slate-200">Active Evolved Behavioral Rules</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {rules.filter(r => r.isActive).length} Active Policies
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3 leading-tight">
            These rules are injected into every prompt context on-device to steer behavior without retraining model weights.
          </p>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-3 rounded-lg border text-xs transition-all ${
                  rule.isActive
                    ? 'bg-slate-900/80 border-slate-700/80 text-slate-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-medium text-xs leading-snug">{rule.rule}</div>
                  <button
                    onClick={() => handleToggleRule(rule.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      rule.isActive
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {rule.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight mb-2">
                  <strong className="text-slate-500">Rationale:</strong> {rule.rationale}
                </p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                  <span>Confidence: <strong className="text-cyan-400">{(rule.confidence * 100).toFixed(0)}%</strong></span>
                  <span>·</span>
                  <span>Times Applied: <strong className="text-slate-300">{rule.timesApplied}</strong></span>
                  <span>·</span>
                  <span>Updated: <ClientDate timestamp={rule.timestamp} /></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Semantic Memory & Vector Knowledge Graph */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-slate-200">On-Device Semantic & Episodic Knowledge Graph</h3>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search local embeddings..."
                className="bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-md px-2 py-1 font-mono focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="concept">Concepts</option>
              <option value="rule">Rules</option>
              <option value="episodic">Episodic</option>
              <option value="user_preference">Preferences</option>
            </select>
          </div>
        </div>

        {/* Memory Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/90 text-xs flex flex-col justify-between hover:border-cyan-500/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                    {mem.type}
                  </span>
                  <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span>Reinf: {mem.reinforcementScore || 0}</span>
                  </div>
                </div>
                <h4 className="font-semibold text-slate-200 text-xs mb-1">{mem.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                  {mem.content}
                </p>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-1 truncate max-w-[140px]">
                  {mem.tags.map((t, idx) => (
                    <span key={idx} className="text-slate-400">#{t}</span>
                  ))}
                </div>
                <span>{(mem.importance * 100).toFixed(0)}% Weight</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
