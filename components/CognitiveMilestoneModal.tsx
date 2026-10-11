'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Trophy, Award, Zap, ShieldCheck, X, Flame, Star, Cpu } from 'lucide-react';

interface CognitiveMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  title: string;
}

export const CognitiveMilestoneModal: React.FC<CognitiveMilestoneModalProps> = ({
  isOpen,
  onClose,
  level,
  title
}) => {
  useEffect(() => {
    if (isOpen) {
      // Play celebratory chime or audio synth if available
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
        osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.45); // C6
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      } catch (e) {
        // Ignore audio restrictions
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-fadeIn">
      <div className="w-full max-w-md bg-gradient-to-b from-[#0f172a] via-[#0b0f19] to-slate-950 border border-cyan-500/60 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(6,182,212,0.3)] relative overflow-hidden">
        
        {/* Glowing background burst */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all border border-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Trophy / Icon Icon Badge */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-emerald-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mb-5 shadow-inner shadow-cyan-500/30 animate-bounce">
          <Trophy className="w-10 h-10 text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center border border-amber-300 shadow">
            ★
          </div>
        </div>

        {/* Milestone Title */}
        <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
          Cognitive Milestone Achieved
        </span>
        <h2 className="text-2xl font-black text-slate-100 tracking-tight mb-2">
          Evolution Level {level} Unlocked!
        </h2>
        <p className="text-xs text-slate-300 font-mono mb-6 bg-slate-900/90 py-1.5 px-3 rounded-full border border-slate-800 inline-block">
          {title}
        </p>

        {/* Achievement Details */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 mb-6 space-y-2.5 text-left text-xs font-sans">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Synaptic Capacity:
            </span>
            <strong className="text-cyan-300 font-mono">+500k Neural Weights</strong>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Inference Acceleration:
            </span>
            <strong className="text-amber-300 font-mono">WebGPU FlashAttention</strong>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Autonomy Clearance:
            </span>
            <strong className="text-emerald-300 font-mono">Tier-1 Autonomous Entity</strong>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 hover:opacity-90 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-950 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Continue Autonomous Evolution</span>
        </button>

      </div>
    </div>
  );
};
