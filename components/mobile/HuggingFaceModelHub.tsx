'use client';

import React, { useState, useEffect } from 'react';
import { Download, HardDrive, CheckCircle2, Search, Trash2, Play, Sparkles, RefreshCw, X, ShieldCheck, Flame, ArrowDownCircle, ExternalLink, Cpu, Radio } from 'lucide-react';
import { HuggingFaceModelItem } from '../../lib/litert/types';
import { huggingFaceModelManager } from '../../lib/models/hf-manager';
import { liteRTEngine } from '../../lib/litert/engine';

interface HuggingFaceModelHubProps {
  onModelActivated?: (modelName: string) => void;
}

export const HuggingFaceModelHub: React.FC<HuggingFaceModelHubProps> = ({ onModelActivated }) => {
  const [models, setModels] = useState<HuggingFaceModelItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('litert_community');
  const [storageUsage, setStorageUsage] = useState<{ usedMb: number; totalQuotaMb: number }>({ usedMb: 4445, totalQuotaMb: 32768 });
  const [downloadProgressMap, setDownloadProgressMap] = useState<Record<string, { progress: number; speed: number }>>({});
  const [customRepoInput, setCustomRepoInput] = useState('');
  const [showAddRepo, setShowAddRepo] = useState(false);

  const refreshModels = async () => {
    await huggingFaceModelManager.init();
    const list = await huggingFaceModelManager.getModels();
    const storage = await huggingFaceModelManager.getStorageUsageMb();
    setModels(list);
    setStorageUsage(storage);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await huggingFaceModelManager.init();
      const list = await huggingFaceModelManager.getModels();
      const storage = await huggingFaceModelManager.getStorageUsageMb();
      if (mounted) {
        setModels(list);
        setStorageUsage(storage);
      }
    })();

    const unsubscribe = huggingFaceModelManager.subscribe(() => {
      refreshModels();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleDownload = async (modelId: string) => {
    setDownloadProgressMap(prev => ({ ...prev, [modelId]: { progress: 0, speed: 22.4 } }));
    await huggingFaceModelManager.downloadModel(modelId, (progress, speed) => {
      setDownloadProgressMap(prev => ({ ...prev, [modelId]: { progress, speed } }));
    });
    setDownloadProgressMap(prev => {
      const next = { ...prev };
      delete next[modelId];
      return next;
    });
    await refreshModels();
  };

  const handleCancelDownload = (modelId: string) => {
    huggingFaceModelManager.cancelDownload(modelId);
    setDownloadProgressMap(prev => {
      const next = { ...prev };
      delete next[modelId];
      return next;
    });
  };

  const handleDeleteFromCache = async (modelId: string) => {
    if (confirm('Delete local model weights from device cache?')) {
      await huggingFaceModelManager.deleteFromCache(modelId);
      await refreshModels();
    }
  };

  const handleActivate = async (model: HuggingFaceModelItem) => {
    await huggingFaceModelManager.setActiveModel(model.id);
    liteRTEngine.setModel(model.name);
    await refreshModels();
    if (onModelActivated) {
      onModelActivated(model.name);
    }
  };

  const handleAddCustomRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRepoInput.trim()) return;

    await huggingFaceModelManager.addCustomHuggingFaceRepo(customRepoInput.trim());
    setCustomRepoInput('');
    setShowAddRepo(false);
    await refreshModels();
  };

  const filteredModels = models.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.repo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (formatFilter === 'all') return true;
    if (formatFilter === 'litert_community') return m.isLiteRTCommunity || m.format === 'LiteRT';
    if (formatFilter === 'gguf') return m.format === 'GGUF';
    if (formatFilter === 'downloaded') return m.downloadStatus === 'cached_offline' || m.downloadStatus === 'active';
    return true;
  });

  const usedGb = (storageUsage.usedMb / 1024).toFixed(1);
  const totalGb = (storageUsage.totalQuotaMb / 1024).toFixed(0);
  const usagePct = Math.min(100, (storageUsage.usedMb / storageUsage.totalQuotaMb) * 100);

  return (
    <div className="h-full flex flex-col gap-3 p-3 overflow-y-auto font-sans text-xs">
      {/* Storage & Official Hugging Face Banner */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-3.5 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
              🤗
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-semibold text-slate-100">LiteRT Community Hub</h2>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  Official
                </span>
              </div>
              <a
                href="https://huggingface.co/litert-community"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-cyan-400 hover:underline font-mono flex items-center gap-1"
              >
                <span>huggingface.co/litert-community</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          <button
            onClick={() => setShowAddRepo(!showAddRepo)}
            className="px-2.5 py-1 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-slate-950 font-semibold text-[11px] flex items-center gap-1 transition-all"
          >
            {showAddRepo ? <X className="w-3 h-3" /> : <span>+ Add Repo</span>}
          </button>
        </div>

        {/* Device Cache Storage Quota Meter */}
        <div className="space-y-1 pt-1 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <HardDrive className="w-3 h-3 text-cyan-400" />
              <span>Offline Device Storage Cache</span>
            </span>
            <span className="text-cyan-400 font-semibold">
              {usedGb} GB / {totalGb} GB ({usagePct.toFixed(0)}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${usagePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Custom Hugging Face Repository Form */}
      {showAddRepo && (
        <form onSubmit={handleAddCustomRepo} className="bg-slate-900/90 border border-cyan-800/60 rounded-xl p-3 space-y-2">
          <label className="text-[11px] font-medium text-slate-300 block">
            Add Any Model Repository from Hugging Face:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customRepoInput}
              onChange={(e) => setCustomRepoInput(e.target.value)}
              placeholder="e.g. litert-community/Qwen2.5-0.5B-Instruct-LiteRT"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold rounded-lg text-xs"
            >
              Add
            </button>
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Directly downloads weights to client-side Origin Private File System (OPFS) and IndexedDB.
          </span>
        </form>
      )}

      {/* Search & Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search litert-community, Gemma, Llama 3.2, Qwen..."
            className="w-full bg-[#0b0f19] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-[10px]">
          {[
            { id: 'litert_community', label: 'litert-community ⭐' },
            { id: 'all', label: 'All Models' },
            { id: 'downloaded', label: 'Downloaded' },
            { id: 'gguf', label: 'GGUF' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFormatFilter(tab.id)}
              className={`flex-1 py-1 px-1.5 rounded-lg font-medium transition-all text-center ${
                formatFilter === tab.id
                  ? 'bg-cyan-600 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Model Cards List */}
      <div className="space-y-2.5">
        {filteredModels.map((model) => {
          const downloadState = downloadProgressMap[model.id];
          const isDownloading = downloadState !== undefined;
          const isModelActive = model.downloadStatus === 'active';
          const isCached = model.downloadStatus === 'cached_offline' || isModelActive;

          return (
            <div
              key={model.id}
              className={`p-3 rounded-2xl border transition-all ${
                isModelActive
                  ? 'bg-gradient-to-br from-cyan-950/30 via-[#0b0f19] to-slate-900 border-cyan-500/60 shadow-md'
                  : 'bg-[#0b0f19] border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Header: Title, Repo & Status */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {model.isLiteRTCommunity && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        litert-community
                      </span>
                    )}
                    <h3 className="font-semibold text-slate-200 text-xs tracking-tight">{model.name}</h3>
                  </div>
                  <a
                    href={`https://huggingface.co/${model.repo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-slate-400 hover:text-cyan-400 font-mono flex items-center gap-1 mt-0.5"
                  >
                    <span>{model.repo}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                {/* Status Badges */}
                <div className="flex-shrink-0">
                  {isModelActive ? (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-600 text-[9px] font-mono font-bold flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 animate-pulse text-cyan-400" /> Active Engine
                    </span>
                  ) : isCached ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Cached Offline
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-500 border border-slate-800 text-[9px] font-mono">
                      Not Downloaded
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
                {model.description}
              </p>

              {/* Model Specs Strip */}
              <div className="flex items-center gap-2 py-1 px-2 bg-slate-950/70 rounded-lg text-[9px] font-mono text-slate-400 mb-2.5 overflow-x-auto">
                <span>Format: <strong className="text-slate-300">{model.format}</strong></span>
                <span>·</span>
                <span>Quant: <strong className="text-cyan-300">{model.quantization}</strong></span>
                <span>·</span>
                <span>Size: <strong className="text-slate-300">{model.fileSizeMb} MB</strong></span>
                <span>·</span>
                <span>Downloads: {model.downloads}</span>
              </div>

              {/* Progress Bar (if downloading) */}
              {isDownloading && (
                <div className="mb-2 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-cyan-400">
                    <span>Downloading from huggingface.co...</span>
                    <span>{downloadState.progress}% ({downloadState.speed} MB/s)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-150"
                      style={{ width: `${downloadState.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  {/* Activate button */}
                  {isCached && !isModelActive && (
                    <button
                      onClick={() => handleActivate(model)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[10px] transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Cpu className="w-3 h-3" /> Set as Engine Model
                    </button>
                  )}

                  {isModelActive && (
                    <span className="text-[10px] text-cyan-400 font-mono font-medium">
                      ✓ Generating on-device tokens
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Download button */}
                  {!isCached && !isDownloading && (
                    <button
                      onClick={() => handleDownload(model.id)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition-all"
                    >
                      <Download className="w-3 h-3" /> Download ({model.fileSizeMb}MB)
                    </button>
                  )}

                  {/* Cancel button */}
                  {isDownloading && (
                    <button
                      onClick={() => handleCancelDownload(model.id)}
                      className="px-2.5 py-1 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-[10px] font-medium transition-all"
                    >
                      Cancel
                    </button>
                  )}

                  {/* Delete from cache */}
                  {isCached && !isModelActive && (
                    <button
                      onClick={() => handleDeleteFromCache(model.id)}
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
    </div>
  );
};
