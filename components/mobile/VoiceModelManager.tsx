'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Mic, Play, Pause, Download, Trash2, CheckCircle2, ShieldCheck, Radio, Sparkles, Sliders, RefreshCw, VolumeX } from 'lucide-react';
import { VoiceModelItem } from '../../lib/litert/types';
import { voiceModelsManager, INITIAL_VOICE_MODELS } from '../../lib/voice/voice-models-manager';
import { settingsManager } from '../../lib/settings/settings-manager';

export const VoiceModelManager: React.FC = () => {
  const [models, setModels] = useState<VoiceModelItem[]>(INITIAL_VOICE_MODELS);
  const [activeTab, setActiveTab] = useState<'all' | 'tts' | 'stt' | 'vad'>('all');
  const [playingModelId, setPlayingModelId] = useState<string | null>(null);
  const [testText, setTestText] = useState('Hello! LiteRT edge neural speech pipeline is running completely offline.');
  const [downloadProgressMap, setDownloadProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      await voiceModelsManager.init();
      if (mounted) {
        setModels(voiceModelsManager.getModels());
      }
    })();

    const unsubscribe = voiceModelsManager.subscribe(() => {
      setModels(voiceModelsManager.getModels());
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleDownload = async (modelId: string) => {
    setDownloadProgressMap(prev => ({ ...prev, [modelId]: 0 }));
    await voiceModelsManager.downloadVoiceModel(modelId, (pct) => {
      setDownloadProgressMap(prev => ({ ...prev, [modelId]: pct }));
    });
    setDownloadProgressMap(prev => {
      const next = { ...prev };
      delete next[modelId];
      return next;
    });
  };

  const handleAudition = (model: VoiceModelItem) => {
    if (playingModelId === model.id) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setPlayingModelId(null);
      return;
    }

    setPlayingModelId(model.id);
    voiceModelsManager.auditionVoice(model, () => {
      setPlayingModelId(null);
    });
  };

  const handleSetActive = async (modelId: string) => {
    await voiceModelsManager.setActiveModel(modelId);
    const updated = voiceModelsManager.getModels();
    setModels(updated);
    const active = updated.find(m => m.id === modelId);
    if (active) {
      if (active.type === 'tts') {
        settingsManager.updateSettings({ voice: { ...settingsManager.getSettings().voice, piperVoice: active.id } });
      } else if (active.type === 'stt') {
        settingsManager.updateSettings({ voice: { ...settingsManager.getSettings().voice, activeSttModel: active.id } });
      }
    }
  };

  const handleDelete = async (modelId: string) => {
    if (confirm('Remove cached voice model weights from local storage?')) {
      await voiceModelsManager.deleteFromCache(modelId);
    }
  };

  const handleTestCustomSpeak = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(testText);
      const settings = settingsManager.getSettings();
      utt.rate = settings.voice.speechRate;
      utt.pitch = settings.voice.speechPitch;
      window.speechSynthesis.speak(utt);
    }
  };

  const filtered = models.filter(m => {
    if (activeTab === 'all') return true;
    return m.type === activeTab;
  });

  const activeTTS = voiceModelsManager.getActiveTTSModel();
  const activeSTT = voiceModelsManager.getActiveSTTModel();

  return (
    <div className="h-full flex flex-col gap-3 p-3 overflow-y-auto font-sans text-xs">
      {/* Top Banner Card */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-3.5 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-100">Voice Models Hub & Downloader</h2>
              <span className="text-[10px] text-slate-400 font-mono">Whisper STT · Piper TTS · Kokoro 82M · Silero VAD</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono text-[10px] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Air-Gap Voice
          </span>
        </div>

        {/* Current Voice Pipeline Status */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
            <span className="text-slate-400 block mb-0.5">Active TTS Voice:</span>
            <span className="text-amber-300 font-semibold truncate block">{activeTTS?.name.split('(')[0] || 'Piper Ryan'}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
            <span className="text-slate-400 block mb-0.5">Active STT Engine:</span>
            <span className="text-cyan-300 font-semibold truncate block">{activeSTT?.name.split('(')[0] || 'Whisper Tiny'}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
        {[
          { id: 'all', label: 'All Models' },
          { id: 'tts', label: 'TTS Synthesis (Piper/Kokoro)' },
          { id: 'stt', label: 'STT Recognition (Whisper)' },
          { id: 'vad', label: 'VAD Gating (Silero)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-600 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Models Grid */}
      <div className="space-y-2.5">
        {filtered.map(model => {
          const isDownloading = downloadProgressMap[model.id] !== undefined;
          const progress = downloadProgressMap[model.id] || 0;
          const isPlaying = playingModelId === model.id;
          const isModelActive = model.downloadStatus === 'active';
          const isCached = model.downloadStatus === 'cached_offline' || isModelActive;

          return (
            <div
              key={model.id}
              className={`p-3 rounded-2xl border transition-all ${
                isModelActive
                  ? 'bg-gradient-to-br from-amber-950/20 via-[#0b0f19] to-slate-900 border-amber-500/50 shadow-md'
                  : 'bg-[#0b0f19] border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold uppercase ${
                      model.type === 'tts'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : model.type === 'stt'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {model.type}
                    </span>
                    <h3 className="font-semibold text-slate-200 text-xs">{model.name}</h3>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{model.description}</p>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {isModelActive ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 animate-pulse" /> Active
                    </span>
                  ) : isCached ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Cached
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-500 border border-slate-800 text-[9px] font-mono">
                      Not Downloaded
                    </span>
                  )}
                </div>
              </div>

              {/* Specs Bar */}
              <div className="flex items-center gap-3 py-1.5 px-2 bg-slate-950/70 rounded-lg text-[9px] font-mono text-slate-400 mb-2">
                <span>Size: <strong className="text-slate-300">{model.fileSizeMb} MB</strong></span>
                <span>·</span>
                <span>Rate: <strong className="text-slate-300">{model.sampleRateKhz} kHz</strong></span>
                <span>·</span>
                <span>Lang: <strong className="text-slate-300">{model.language}</strong></span>
                <span>·</span>
                <span>{model.parameters}</span>
              </div>

              {/* Download Progress Bar */}
              {isDownloading && (
                <div className="mb-2 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-cyan-400">
                    <span>Downloading offline weights...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-amber-500 transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  {/* Audition Button (Plays Sample Phrase) */}
                  <button
                    onClick={() => handleAudition(model)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 border transition-all ${
                      isPlaying
                        ? 'bg-amber-600 text-slate-950 border-amber-500 animate-pulse'
                        : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-800'
                    }`}
                    title="Audition model with sample speech phrase"
                  >
                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isPlaying ? 'Playing...' : 'Audition Voice'}</span>
                  </button>

                  {/* Set as Active */}
                  {isCached && !isModelActive && (
                    <button
                      onClick={() => handleSetActive(model.id)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-[10px] font-medium transition-all"
                    >
                      Use as Active
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {!isCached && !isDownloading && (
                    <button
                      onClick={() => handleDownload(model.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-[10px] flex items-center gap-1 transition-all"
                    >
                      <Download className="w-3 h-3" /> Download ({model.fileSizeMb}MB)
                    </button>
                  )}

                  {isCached && !isModelActive && (
                    <button
                      onClick={() => handleDelete(model.id)}
                      className="p-1 rounded-lg hover:bg-red-950/60 text-slate-500 hover:text-red-400 transition-all"
                      title="Delete local weights"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Custom Speech Playground */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-3.5 space-y-2.5 mt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Speech Playground</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">100% Offline WebAudio</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500/80"
            placeholder="Type any phrase to audition..."
          />
          <button
            onClick={handleTestCustomSpeak}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all flex-shrink-0"
          >
            <Play className="w-3.5 h-3.5" /> Audition
          </button>
        </div>
      </div>
    </div>
  );
};
