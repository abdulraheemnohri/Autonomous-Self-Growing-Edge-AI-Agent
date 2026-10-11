'use client';

import React from 'react';
import { Cpu, Wifi, WifiOff, Zap, Sparkles, Mic, Layers, Database, Sliders } from 'lucide-react';
import { AVAILABLE_MODELS } from '../lib/litert/engine';
import { HardwareBackend, LiteRTModelConfig, EngineTelemetry } from '../lib/litert/types';

export type AppTab = 'chat' | 'autonomous' | 'finetune' | 'vectordb' | 'learning' | 'runtime';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  telemetry: EngineTelemetry;
  activeModel: LiteRTModelConfig;
  onModelChange: (modelId: string) => void;
  onBackendChange: (backend: HardwareBackend) => void;
  isForceOffline: boolean;
  onToggleForceOffline: () => void;
  isHandsFree: boolean;
  onToggleHandsFree: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  telemetry,
  activeModel,
  onModelChange,
  onBackendChange,
  isForceOffline,
  onToggleForceOffline,
  isHandsFree,
  onToggleHandsFree
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#0b101b]/95 backdrop-blur-md sticky top-0 z-50">
      {/* Top Bar: Brand, Hardware Badges, Model Selector */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-emerald-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-950">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">Autonomous Edge Agent</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                100% Offline
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <span>Llama 3 / Mistral / LiteRT</span>
              <span className="text-slate-600">·</span>
              <span>ChromaDB / FAISS</span>
              <span className="text-slate-600">·</span>
              <span>Whisper / Piper</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400 font-medium">LoRA Retraining</span>
            </p>
          </div>
        </div>

        {/* Runtime Status Badges & Offline Switch */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Model Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md px-2 py-1">
            <span className="text-slate-400 text-[11px] mr-1.5 font-mono">Model:</span>
            <select
              value={activeModel.id}
              onChange={(e) => onModelChange(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none cursor-pointer max-w-[170px] truncate"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                  {m.name} ({m.parameterCount})
                </option>
              ))}
            </select>
          </div>

          {/* Backend Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md px-1.5 py-1">
            <button
              onClick={() => onBackendChange('webgpu')}
              title="Execute via WebGPU Compute Shaders"
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                telemetry.hardwareBackend === 'webgpu'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              WebGPU
            </button>
            <button
              onClick={() => onBackendChange('wasm_simd')}
              title="Execute via WebAssembly SIMD CPU"
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                telemetry.hardwareBackend === 'wasm_simd'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Wasm SIMD
            </button>
          </div>

          {/* Offline Mode Button */}
          <button
            onClick={onToggleForceOffline}
            title={isForceOffline ? 'Air-gap mode active (Zero network)' : 'Toggle offline flight isolation'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border transition-all ${
              isForceOffline
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-950'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {isForceOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
                <span>Offline Air-Gap</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                <span>Connected</span>
              </>
            )}
          </button>

          {/* Hands-Free Voice Button */}
          <button
            onClick={onToggleHandsFree}
            title="Toggle full-duplex hands-free voice loop"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border transition-all ${
              isHandsFree
                ? 'bg-amber-950/70 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-950 animate-pulse'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Mic className={`w-3.5 h-3.5 ${isHandsFree ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>{isHandsFree ? 'Hands-Free LIVE' : 'Voice Standby'}</span>
          </button>

          {/* Telemetry pill */}
          <div className="hidden lg:flex items-center gap-2.5 px-2 py-1 rounded bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              <strong className="text-slate-200">{telemetry.tokensPerSecond}</strong> tok/s
            </span>
            <span className="text-slate-700">·</span>
            <span>
              TTFT: <strong className="text-slate-200">{telemetry.timeToFirstTokenMs}ms</strong>
            </span>
            <span className="text-slate-700">·</span>
            <span>
              Growth: <strong className="text-emerald-400">Lv.{telemetry.growthLevel}</strong> {telemetry.activeSkill ? `(${telemetry.activeSkill})` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 border-t border-slate-900/60 overflow-x-auto">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'chat'
              ? 'border-cyan-400 text-cyan-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          Real-Time Voice & Chat
        </button>

        <button
          onClick={() => setActiveTab('autonomous')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'autonomous'
              ? 'border-cyan-400 text-cyan-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Autonomous Mission Runner
        </button>

        <button
          onClick={() => setActiveTab('finetune')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'finetune'
              ? 'border-cyan-400 text-cyan-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          LoRA Fine-Tuning & Retraining
        </button>

        <button
          onClick={() => setActiveTab('vectordb')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'vectordb'
              ? 'border-cyan-400 text-cyan-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          ChromaDB & FAISS Studio
        </button>

        <button
          onClick={() => setActiveTab('learning')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'learning'
              ? 'border-cyan-400 text-cyan-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Self-Learning Memory Brain
        </button>

        <button
          onClick={() => setActiveTab('runtime')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'runtime'
              ? 'border-cyan-400 text-cyan-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Hardware & Model Inspector
        </button>
      </div>
    </header>
  );
};
