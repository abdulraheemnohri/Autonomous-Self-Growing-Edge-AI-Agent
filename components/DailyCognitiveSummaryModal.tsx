'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Brain, CheckCircle2, TrendingUp, Award, Zap, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GrowthStats } from '../lib/litert/types';

interface DailyCognitiveSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GrowthStats;
}

const dailyKnowledgeData = [
  { time: '08:00', learnedFacts: 4, xpGained: 45 },
  { time: '10:00', learnedFacts: 12, xpGained: 120 },
  { time: '12:00', learnedFacts: 21, xpGained: 210 },
  { time: '14:00', learnedFacts: 35, xpGained: 340 },
  { time: '16:00', learnedFacts: 48, xpGained: 490 },
  { time: '18:00', learnedFacts: 64, xpGained: 680 },
  { time: '20:00', learnedFacts: 85, xpGained: 890 }
];

const completedGoalsToday = [
  { goal: 'Linux Kernel & CPU SIMD Hardware Audit', category: 'Linux Terminal', steps: 4, status: 'Success' },
  { goal: 'ChromaDB & FAISS Vector Index Nearest Neighbor Query', category: 'Vector DB', steps: 5, status: 'Success' },
  { goal: 'Gemma 4 LiteRT-LM WebGPU Acceleration Benchmark', category: 'Inference', steps: 3, status: 'Success' },
  { goal: 'Episodic Fact Synthesizer S-P-O Knowledge Extraction', category: 'Self-Learning', steps: 6, status: 'Success' }
];

export const DailyCognitiveSummaryModal: React.FC<DailyCognitiveSummaryModalProps> = ({
  isOpen,
  onClose,
  stats
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0b0f19] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-gradient-to-r from-cyan-950/40 via-[#0b0f19] to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100 tracking-tight">Daily Cognitive Summary</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Lv. {stats.level} • {stats.title}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Autonomous Knowledge Acquisition & Goal Completion Report
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 font-sans text-xs">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-4 gap-2.5">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="block text-[10px] text-slate-400 font-mono">Today&apos;s XP</span>
              <strong className="text-cyan-400 text-base font-bold">+{stats.xp} XP</strong>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="block text-[10px] text-slate-400 font-mono">Learned Facts</span>
              <strong className="text-emerald-400 text-base font-bold">85</strong>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="block text-[10px] text-slate-400 font-mono">Goals Completed</span>
              <strong className="text-amber-400 text-base font-bold">4 / 4</strong>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="block text-[10px] text-slate-400 font-mono">Autonomy Rating</span>
              <strong className="text-purple-400 text-base font-bold">{stats.autonomyScore}%</strong>
            </div>
          </div>

          {/* Recharts Knowledge Growth Over Time */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 font-mono">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Knowledge Growth & XP Accumulation Curve</span>
              </h4>
              <span className="text-[10px] text-cyan-400 font-mono">Real-time Synaptic Sync</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyKnowledgeData}>
                  <defs>
                    <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#1e293b', fontSize: '11px', borderRadius: '8px' }}
                  />
                  <Area type="monotone" dataKey="learnedFacts" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#xpGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Completed Goals for the Day */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Completed Autonomous Goals Today</span>
            </h4>
            <div className="space-y-2">
              {completedGoalsToday.map((goal, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-200 font-medium block text-xs">{goal.goal}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Category: {goal.category} • {goal.steps} ReAct Steps</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 flex-shrink-0">
                    {goal.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" /> Threshold Triggered by Synaptic XP Milestone
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-sm transition-all"
          >
            Acknowledge & Continue
          </button>
        </div>

      </div>
    </div>
  );
};
