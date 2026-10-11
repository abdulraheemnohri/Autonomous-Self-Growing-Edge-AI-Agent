'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Radio, Settings2, Sliders, Play, Pause, ChevronDown } from 'lucide-react';
import { RealTimeAudioController, VoiceAgentState, realTimeAudioController } from '../lib/voice/audio-controller';
import { PIPER_VOICE_PROFILES, whisperPiperVoiceSuite } from '../lib/voice/whisper-piper';
import { voiceModelsManager } from '../lib/voice/voice-models-manager';

interface VoiceVisualizerProps {
  voiceState: VoiceAgentState;
  isHandsFree: boolean;
  onToggleHandsFree: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  interimTranscript: string;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  voiceState,
  isHandsFree,
  onToggleHandsFree,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  interimTranscript
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rmsVolume, setRmsVolume] = useState<number>(0);
  const [activeVoiceName, setActiveVoiceName] = useState<string>(() => {
    const active = voiceModelsManager.getActiveTTSModel();
    return active ? active.name.split('(')[0].trim() : 'Piper Ryan';
  });
  const [showVoicePicker, setShowVoicePicker] = useState<boolean>(false);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;

    const render = () => {
      const { frequencyData, volumeRms } = realTimeAudioController.getFrequencyData();
      setRmsVolume(volumeRms);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Determine state color theme
      let primaryColor = '#06b6d4'; // Cyan default
      let glowColor = 'rgba(6, 182, 212, 0.4)';

      if (voiceState === 'listening') {
        primaryColor = '#10b981'; // Emerald
        glowColor = 'rgba(16, 185, 129, 0.5)';
      } else if (voiceState === 'speaking') {
        primaryColor = '#f59e0b'; // Amber
        glowColor = 'rgba(245, 158, 11, 0.6)';
      } else if (voiceState === 'thinking') {
        primaryColor = '#8b5cf6'; // Purple
        glowColor = 'rgba(139, 92, 246, 0.5)';
      }

      tick += 0.05;

      // Draw modern dual-side symmetrical soundbars
      const barCount = 36;
      const barWidth = 3;
      const gap = (width - (barCount * barWidth)) / (barCount + 1);

      ctx.save();
      for (let i = 0; i < barCount; i++) {
        const x = gap + i * (barWidth + gap);
        const freqIndex = Math.floor((i / barCount) * (frequencyData.length / 2));
        const val = frequencyData[freqIndex] || 0;

        // Base height with breathing animation
        const wave = Math.sin(tick + i * 0.2) * 4;
        let barHeight = Math.max(3, (val / 255) * (height * 0.75) * (volumeRms > 0.04 ? 1.4 : 0.6) + wave);

        if (voiceState === 'idle') {
          barHeight = 3 + Math.abs(Math.sin(tick * 0.5 + i * 0.15)) * 6;
        }

        const y = centerY - barHeight / 2;

        ctx.shadowColor = glowColor;
        ctx.shadowBlur = voiceState !== 'idle' ? 8 : 2;
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [voiceState]);

  const handleMicClick = () => {
    if (voiceState === 'listening') {
      onStopListening();
    } else if (voiceState === 'speaking') {
      onStopSpeaking();
    } else {
      onStartListening();
    }
  };

  return (
    <div className="bg-[#0b0f19] border border-slate-800/90 rounded-2xl p-2.5 shadow-lg relative overflow-hidden transition-all">
      {/* Visualizer Canvas & Glow Header */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Interactive Waveform Canvas */}
        <div className="flex-1 relative h-9 rounded-xl bg-slate-950/70 border border-slate-800/60 overflow-hidden flex items-center px-2">
          <canvas
            ref={canvasRef}
            width={240}
            height={36}
            className="w-full h-full block"
          />

          {/* Status Label Overlay */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
            <span className={`w-1.5 h-1.5 rounded-full ${
              voiceState === 'listening'
                ? 'bg-emerald-400 animate-ping'
                : voiceState === 'speaking'
                ? 'bg-amber-400 animate-pulse'
                : voiceState === 'thinking'
                ? 'bg-purple-400 animate-bounce'
                : 'bg-cyan-500/60'
            }`} />
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              {voiceState}
            </span>
          </div>
        </div>

        {/* Center / Right: Quick Voice Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Hands-Free Toggle */}
          <button
            onClick={onToggleHandsFree}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all flex items-center gap-1 ${
              isHandsFree
                ? 'bg-amber-950/80 text-amber-300 border-amber-600/80 shadow-sm shadow-amber-950 animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
            title="Toggle Hands-Free Duplex Voice Mode"
          >
            <Radio className="w-3 h-3" />
            <span>{isHandsFree ? 'Duplex ON' : 'Duplex'}</span>
          </button>

          {/* Push-to-Talk Mic Trigger */}
          <button
            onClick={handleMicClick}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all shadow-md active:scale-95 ${
              voiceState === 'listening'
                ? 'bg-emerald-600 text-slate-950 border-emerald-400 animate-pulse'
                : voiceState === 'speaking'
                ? 'bg-amber-600 text-slate-950 border-amber-400'
                : 'bg-slate-900 hover:bg-slate-800 text-cyan-400 border-slate-800'
            }`}
            title={voiceState === 'listening' ? 'Stop listening' : 'Start Push-to-Talk'}
          >
            {voiceState === 'speaking' ? (
              <VolumeX className="w-4 h-4" />
            ) : voiceState === 'listening' ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Interim Live Transcript Bar */}
      {interimTranscript && (
        <div className="mt-2 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-[10px] font-mono flex items-center gap-1.5 animate-fadeIn">
          <Mic className="w-3 h-3 text-emerald-400 animate-pulse flex-shrink-0" />
          <span className="truncate italic">&quot;{interimTranscript}&quot;</span>
        </div>
      )}
    </div>
  );
};
