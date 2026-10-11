'use client';

import React, { useState } from 'react';
import { Play, Pause, Square, Sparkles, CheckCircle2, Clock, AlertCircle, Terminal, Layers, ArrowRight, ShieldCheck, Activity, BarChart3, X, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { AutonomousMission, AgentTask } from '../lib/litert/types';
import { autonomousAgentRunner } from '../lib/litert/agent-loop';
import { MissionSuccessCharts } from './MissionSuccessCharts';

interface AutonomousAgentPanelProps {
  onMissionCompleted?: () => void;
}

export const AutonomousAgentPanel: React.FC<AutonomousAgentPanelProps> = ({ onMissionCompleted }) => {
  const [goalInput, setGoalInput] = useState('');
  const [mission, setMission] = useState<AutonomousMission | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [expandedCalls, setExpandedCalls] = useState<Record<string, boolean>>({});
  const [showSummaryOverlay, setShowSummaryOverlay] = useState(false);

  const [completedMissions, setCompletedMissions] = useState<AutonomousMission[]>([
    {
      id: 'mission_demo_1',
      goal: 'Audit Linux hardware acceleration and CPU SIMD flags, synthesize diagnostics script, and expand synaptic memory.',
      status: 'completed',
      tasks: [
        { id: 't1', title: 'Audit SIMD', description: 'Check WebAssembly SIMD and WebGPU features', status: 'completed', stepIndex: 0, toolRequired: 'code_sandbox' },
        { id: 't2', title: 'Memory Recall', description: 'Search vector store for relevant diagnostics history', status: 'completed', stepIndex: 1, toolRequired: 'memory_recall' },
        { id: 't3', title: 'Rule Formulation', description: 'Formulate hardware acceleration rule', status: 'completed', stepIndex: 2, toolRequired: 'rule_synthesizer' }
      ],
      currentTaskIndex: 3,
      stepsExecuted: 3,
      maxSteps: 5,
      history: [
        {
          id: 'h1',
          toolName: 'code_sandbox',
          input: { code: 'return { simd: true, threads: navigator.hardwareConcurrency || 8 };' },
          output: { returnValue: '{"simd":true,"threads":8}', logs: [], status: 'executed_successfully' },
          status: 'success',
          executionTimeMs: 14.2,
          reflection: 'Verified hardware SIMD support and core concurrency successfully.'
        },
        {
          id: 'h2',
          toolName: 'memory_recall',
          input: { query: 'hardware acceleration SIMD', limit: 2 },
          output: { count: 1, hits: [{ id: 'm1', title: 'SIMD Optimal Profile', similarity: 0.94, content: 'WebAssembly SIMD enabled on Chrome/Edge.' }] },
          status: 'success',
          executionTimeMs: 8.5,
          reflection: 'Retrieved previous hardware profile matching current node.'
        }
      ],
      learnedSummary: 'Successfully audited hardware acceleration and verified Wasm SIMD performance with 94% vector relevance.',
      startTime: 1710000000000,
      endTime: 1710003600000
    }
  ]);

  const [isDeepThoughtOpen, setIsDeepThoughtOpen] = useState(true);
  const [expandedTraceMissions, setExpandedTraceMissions] = useState<Record<string, boolean>>({ mission_demo_1: true });

  const missionPresets = [
    {
      title: 'ChromaDB & FAISS Vector Audit',
      goal: 'Query local vector store for nearest neighbors, calculate L2 metrics, and commit verified theorem to FAISS index.'
    },
    {
      title: 'Linux Diagnostics & Autonomous Self-Growth',
      goal: 'Audit Linux hardware acceleration and CPU SIMD flags, synthesize diagnostics script, and expand synaptic memory.'
    },
    {
      title: 'Algorithmic Sandbox & Self-Correction',
      goal: 'Execute mathematical series calculation in safe JS sandbox, verify convergence, and commit theorem to memory.'
    }
  ];

  const historicalMissionData = [
    { goal: 'ChromaDB Audit', successRate: 100, avgSteps: 4.2 },
    { goal: 'Linux Diagnostics', successRate: 92, avgSteps: 5.8 },
    { goal: 'Algorithmic Sandbox', successRate: 88, avgSteps: 3.5 },
    { goal: 'Tensor Quantization', successRate: 95, avgSteps: 6.1 },
    { goal: 'Semantic Memory', successRate: 90, avgSteps: 4.0 },
  ];

  const handleLaunch = async (customGoal?: string) => {
    const goalToRun = customGoal || goalInput;
    if (!goalToRun.trim() || isExecuting) return;

    setIsExecuting(true);
    try {
      await autonomousAgentRunner.startMission(goalToRun, (updated) => {
        setMission({ ...updated });
        if (updated.status === 'completed') {
          setCompletedMissions(prev => [updated, ...prev.filter(m => m.id !== updated.id)]);
          setExpandedTraceMissions(prev => ({ ...prev, [updated.id]: true }));
        }
      });
      if (onMissionCompleted) {
        onMissionCompleted();
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const handlePause = () => {
    autonomousAgentRunner.pause();
    if (mission) setMission({ ...mission, status: 'paused' });
  };

  const handleResume = () => {
    autonomousAgentRunner.resume();
    if (mission) setMission({ ...mission, status: 'running' });
  };

  const handleAbort = () => {
    autonomousAgentRunner.abort();
    setIsExecuting(false);
    if (mission) setMission({ ...mission, status: 'failed' });
  };

  const toggleCall = (id: string) => {
    setExpandedCalls(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto relative">
      {/* Top Banner / Goal Dispatcher */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-200">Autonomous ReAct Mission Control</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSummaryOverlay(true)}
              className="px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Mission Success Summary</span>
            </button>
            <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Client-Authoritative Edge Sandbox</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Provide a high-level operational goal. The LiteRT agent will autonomously decompose it into subtasks, execute sandboxed computations, observe outcomes, self-correct errors, and distill new knowledge completely offline.
        </p>

        {/* Preset Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-4">
          {missionPresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setGoalInput(preset.goal);
                handleLaunch(preset.goal);
              }}
              disabled={isExecuting}
              className="text-left p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 transition-all group disabled:opacity-50"
            >
              <span className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 mb-1 flex items-center justify-between">
                <span>{preset.title}</span>
                <Play className="w-3 h-3 text-slate-600 group-hover:text-cyan-400" />
              </span>
              <span className="block text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {preset.goal}
              </span>
            </button>
          ))}
        </div>

        {/* Input Bar & Controls */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="Or type a custom autonomous goal (e.g., 'Analyze prime factorization in sandbox and store rule')..."
            disabled={isExecuting}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
          />

          {!isExecuting ? (
            <button
              onClick={() => handleLaunch()}
              disabled={!goalInput.trim()}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm shadow-cyan-950"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Launch Mission</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {mission?.status === 'paused' ? (
                <button
                  onClick={handleResume}
                  className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1"
                >
                  <Play className="w-3 h-3" /> Resume
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center gap-1"
                >
                  <Pause className="w-3 h-3" /> Pause
                </button>
              )}
              <button
                onClick={handleAbort}
                className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs flex items-center gap-1"
              >
                <Square className="w-3 h-3" /> Abort
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mission Execution Timeline */}
      {mission && (
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 flex-1">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <span className="text-[10px] uppercase font-mono text-cyan-400 tracking-wider block">
                Active Mission Objective
              </span>
              <h3 className="text-xs font-semibold text-slate-200">{mission.goal}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase font-semibold ${
                  mission.status === 'completed'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : mission.status === 'running'
                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse'
                    : mission.status === 'paused'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-red-950 text-red-400 border border-red-800'
                }`}
              >
                {mission.status}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Steps: {mission.stepsExecuted}/{mission.maxSteps}
              </span>
            </div>
          </div>

          {/* Subtask Pipeline Graph */}
          <div className="mb-6">
            <span className="text-[11px] font-mono text-slate-400 block mb-2 uppercase tracking-wider">
              Sub-Task Dependency Graph:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {mission.tasks.map((task, idx) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border text-xs flex flex-col justify-between transition-all ${
                    task.status === 'completed'
                      ? 'bg-emerald-950/20 border-emerald-800/60 text-slate-200'
                      : task.status === 'in_progress'
                      ? 'bg-cyan-950/40 border-cyan-500/80 text-cyan-100 shadow-sm shadow-cyan-950 animate-pulse'
                      : task.status === 'failed'
                      ? 'bg-red-950/30 border-red-800/60 text-slate-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-slate-400">
                      Phase 0{idx + 1}
                    </span>
                    {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {task.status === 'in_progress' && <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
                    {task.status === 'failed' && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
                  </div>
                  <h4 className="font-semibold text-xs mb-1">{task.title}</h4>
                  <p className="text-[11px] text-slate-400 mb-2 leading-tight">
                    {task.description}
                  </p>
                  <div className="text-[10px] font-mono text-cyan-400/90 pt-1.5 border-t border-slate-800/80">
                    Tool: {task.toolRequired}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Tool Execution Logs */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
              ReAct Action & Observation Trail ({mission.history.length}):
            </span>

            {mission.history.length === 0 && (
              <div className="p-4 rounded-lg bg-slate-950 text-center text-xs text-slate-500 font-mono">
                Awaiting tool invocation dispatch...
              </div>
            )}

            {mission.history.map((record) => (
              <div
                key={record.id}
                className="bg-slate-950 rounded-lg border border-slate-800/80 overflow-hidden font-mono text-xs"
              >
                <div
                  onClick={() => toggleCall(record.id)}
                  className="p-2.5 bg-slate-900/90 flex items-center justify-between cursor-pointer hover:bg-slate-800/90 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-cyan-300 font-semibold">ACTION: {record.toolName}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">{record.executionTimeMs}ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        record.status === 'success'
                          ? 'bg-emerald-950 text-emerald-400'
                          : 'bg-red-950 text-red-400'
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>
                </div>

                <div className="p-3 space-y-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Parameters:</span>
                    <pre className="p-2 rounded bg-slate-900 text-slate-300 overflow-x-auto">
                      {JSON.stringify(record.input, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Observation Result:</span>
                    <pre className="p-2 rounded bg-slate-900 text-emerald-300/90 overflow-x-auto whitespace-pre-wrap">
                      {typeof record.output === 'object' ? JSON.stringify(record.output, null, 2) : record.output}
                    </pre>
                  </div>
                  {record.reflection && (
                    <div className="p-2 rounded bg-cyan-950/30 border border-cyan-800/40 text-cyan-200">
                      <span className="font-semibold text-cyan-400 block mb-0.5">Reflection & Validation:</span>
                      {record.reflection}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {mission.learnedSummary && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-cyan-950/40 border border-emerald-500/40 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Autonomous Mission Completed & Knowledge Distilled</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">
                {mission.learnedSummary}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Deep Thought Trace Section for Completed ReAct Missions */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden">
        <div
          onClick={() => setIsDeepThoughtOpen(!isDeepThoughtOpen)}
          className="p-4 bg-slate-900/90 flex items-center justify-between cursor-pointer hover:bg-slate-800/90 transition-colors border-b border-slate-800"
        >
          <div className="flex items-center gap-2.5">
            <Brain className="w-4 h-4 text-purple-400" />
            <div>
              <h3 className="text-xs font-semibold text-slate-200">Deep Thought Trace & ReAct Buffers</h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Full chain-of-thought buffer for all completed ReAct missions ({completedMissions.length})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 font-mono border border-purple-800/60">
              {completedMissions.length} Recorded
            </span>
            {isDeepThoughtOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>

        {isDeepThoughtOpen && (
          <div className="p-4 space-y-4">
            {completedMissions.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 font-mono">
                No completed ReAct missions recorded yet. Launch a mission above to capture thought traces.
              </div>
            ) : (
              completedMissions.map((cm) => {
                const isExpanded = expandedTraceMissions[cm.id] !== false;
                return (
                  <div key={cm.id} className="bg-slate-950 border border-slate-800/90 rounded-xl overflow-hidden">
                    <div
                      onClick={() => setExpandedTraceMissions(prev => ({ ...prev, [cm.id]: !isExpanded }))}
                      className="p-3 bg-slate-900/60 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <div>
                          <span className="text-xs font-semibold text-slate-200 block">{cm.goal}</span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Executed {cm.stepsExecuted} steps · Completed {new Date(cm.endTime || 1710003600000).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">
                          Success
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 space-y-3 text-xs border-t border-slate-800/60">
                        {/* Subtasks */}
                        <div>
                          <span className="text-[11px] font-mono text-slate-400 block mb-1.5 uppercase tracking-wider">
                            Decomposed Subtasks:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {cm.tasks.map((t, idx) => (
                              <div key={t.id} className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                                <span className="text-[10px] font-mono text-slate-500 block mb-0.5">Phase 0{idx + 1}</span>
                                <span className="text-xs font-semibold text-slate-300 block mb-1">{t.title}</span>
                                <span className="text-[11px] text-slate-400 block">{t.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Chain of Thought History / Tool Calls */}
                        <div>
                          <span className="text-[11px] font-mono text-slate-400 block mb-1.5 uppercase tracking-wider">
                            Chain-of-Thought & Tool Invocation Trace ({cm.history.length}):
                          </span>
                          <div className="space-y-2">
                            {cm.history.map((record, hIdx) => (
                              <div key={record.id || hIdx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px]">
                                <div className="flex items-center justify-between mb-1.5 text-cyan-300">
                                  <span className="font-semibold">Step {hIdx + 1}: {record.toolName}</span>
                                  <span className="text-slate-500">{record.executionTimeMs}ms</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                  <div>
                                    <span className="text-[10px] text-slate-500 block">Input Payload:</span>
                                    <pre className="p-1.5 rounded bg-slate-950 text-slate-300 overflow-x-auto text-[10px]">
                                      {JSON.stringify(record.input, null, 2)}
                                    </pre>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-500 block">Observation Output:</span>
                                    <pre className="p-1.5 rounded bg-slate-950 text-emerald-300 overflow-x-auto text-[10px]">
                                      {typeof record.output === 'object' ? JSON.stringify(record.output, null, 2) : record.output}
                                    </pre>
                                  </div>
                                </div>
                                {record.reflection && (
                                  <div className="p-2 rounded bg-cyan-950/30 border border-cyan-800/40 text-cyan-200 font-sans text-xs">
                                    <span className="font-semibold text-cyan-400 block mb-0.5 font-mono text-[10px]">Reflection & Self-Correction:</span>
                                    {record.reflection}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {cm.learnedSummary && (
                          <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-950/30 to-purple-950/30 border border-emerald-500/30">
                            <span className="text-[10px] font-mono text-emerald-400 font-semibold block mb-0.5">Distilled Knowledge Summary:</span>
                            <p className="text-slate-300 font-sans text-xs">{cm.learnedSummary}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Mission Success Summary Overlay / Modal */}
      {showSummaryOverlay && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-100">Mission Success Summary & ReAct Analytics</h3>
              </div>
              <button
                onClick={() => setShowSummaryOverlay(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">Overall Completion Rate</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">93.0%</span>
                  <span className="text-[10px] text-emerald-500 block mt-1">+4.5% vs last cycle</span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">Avg Reasoning Steps</span>
                  <span className="text-2xl font-bold font-mono text-cyan-400">4.7</span>
                  <span className="text-[10px] text-cyan-500 block mt-1">Optimal ReAct Efficiency</span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">Total Missions Run</span>
                  <span className="text-2xl font-bold font-mono text-purple-400">142</span>
                  <span className="text-[10px] text-purple-500 block mt-1">100% Air-Gapped</span>
                </div>
              </div>

              {/* Charts Component */}
              <MissionSuccessCharts data={historicalMissionData} />
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowSummaryOverlay(false)}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs transition-colors"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
