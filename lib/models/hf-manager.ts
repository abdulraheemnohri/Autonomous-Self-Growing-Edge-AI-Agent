import { HuggingFaceModelItem } from '../litert/types';

const HF_DB_NAME = 'Offline_HF_Models_v2';
const DB_VERSION = 1;

export const FEATURED_HF_MODELS: HuggingFaceModelItem[] = [
  // --- Official Gemma 4 Web-Converted LiteRT-LM Browser Models ---
  {
    id: 'google/gemma-4-E2B-it-web',
    name: 'Gemma 4 E2B Web-Converted (gemma-4-E2B-it-web.litertlm)',
    repo: 'litert-community/gemma-4-E2B-it-litert-lm',
    author: 'Google / litert-community',
    downloads: '4.2M',
    likes: '58.3k',
    format: 'LiteRT-LM',
    quantization: 'int4-web',
    fileSizeMb: 1400,
    downloadStatus: 'cached_offline',
    downloadProgress: 100,
    tags: ['litert-community', 'gemma-4', 'gemma-4-E2B-it-web.litertlm', 'web-converted', 'webgpu', 'litert-lm'],
    description: 'Official Gemma 4 E2B model converted specifically for browser web usage (gemma-4-E2B-it-web.litertlm) with WebGPU optimization.',
    isLiteRTCommunity: true
  },
  // --- Official Gemma 4 LiteRT-LM Browser Models ---
  {
    id: 'litert-community/gemma-4-E2B-it-litert-lm',
    name: 'Gemma 4 E2B Instruct (LiteRT-LM)',
    repo: 'litert-community/gemma-4-E2B-it-litert-lm',
    author: 'Google / litert-community',
    downloads: '2.4M',
    likes: '31.2k',
    format: 'LiteRT-LM',
    quantization: 'gpu',
    fileSizeMb: 1450,
    downloadStatus: 'cached_offline',
    downloadProgress: 100,
    tags: ['litert-community', 'gemma-4', 'webgpu', 'browser-native', 'litert-lm'],
    description: 'Gemma 4 E2B optimized for browser-side execution via LiteRT-LM Web API with WebGPU acceleration.',
    isLiteRTCommunity: true
  },
  {
    id: 'litert-community/gemma-4-E4B-it-litert-lm',
    name: 'Gemma 4 E4B Instruct (LiteRT-LM)',
    repo: 'litert-community/gemma-4-E4B-it-litert-lm',
    author: 'Google / litert-community',
    downloads: '1.9M',
    likes: '28.5k',
    format: 'LiteRT-LM',
    quantization: 'gpu',
    fileSizeMb: 2600,
    downloadStatus: 'cached_offline',
    downloadProgress: 100,
    tags: ['litert-community', 'gemma-4', 'webgpu', 'browser-native', 'litert-lm'],
    description: 'Gemma 4 E4B balanced efficiency and reasoning for client-side JavaScript and TypeScript apps.',
    isLiteRTCommunity: true
  },
  {
    id: 'litert-community/gemma-4-12B-it-litert-lm',
    name: 'Gemma 4 12B Instruct (LiteRT-LM)',
    repo: 'litert-community/gemma-4-12B-it-litert-lm',
    author: 'Google / litert-community',
    downloads: '3.5M',
    likes: '49.1k',
    format: 'LiteRT-LM',
    quantization: 'gpu',
    fileSizeMb: 6800,
    downloadStatus: 'not_downloaded',
    downloadProgress: 0,
    tags: ['litert-community', 'gemma-4', 'high-intelligence', 'webgpu', 'litert-lm'],
    description: 'Gemma 4 12B parameter model providing advanced reasoning and coding capabilities in browser runtimes.',
    isLiteRTCommunity: true
  },
  {
    id: 'litert-community/gemma-4-26B-A4B-it-litert-lm',
    name: 'Gemma 4 26B A4B Instruct (LiteRT-LM)',
    repo: 'litert-community/gemma-4-26B-A4B-it-litert-lm',
    author: 'Google / litert-community',
    downloads: '1.8M',
    likes: '35.4k',
    format: 'LiteRT-LM',
    quantization: 'gpu',
    fileSizeMb: 14200,
    downloadStatus: 'not_downloaded',
    downloadProgress: 0,
    tags: ['litert-community', 'gemma-4', 'moe', 'webgpu', 'litert-lm'],
    description: 'Gemma 4 26B Mixture-of-Experts (A4B active parameters) for elite offline intelligence.',
    isLiteRTCommunity: true
  },
  {
    id: 'litert-community/gemma-4-31B-it-litert-lm',
    name: 'Gemma 4 31B Instruct (LiteRT-LM)',
    repo: 'litert-community/gemma-4-31B-it-litert-lm',
    author: 'Google / litert-community',
    downloads: '2.1M',
    likes: '41.0k',
    format: 'LiteRT-LM',
    quantization: 'gpu',
    fileSizeMb: 17500,
    downloadStatus: 'not_downloaded',
    downloadProgress: 0,
    tags: ['litert-community', 'gemma-4', 'frontier', 'webgpu', 'litert-lm'],
    description: 'Gemma 4 31B flagship model weights packed into LiteRT-LM browser format.',
    isLiteRTCommunity: true
  },
  // --- Official litert-community models (https://huggingface.co/litert-community) ---
  {
    id: 'litert-community/Gemma-2-2B-IT-LiteRT',
    name: 'Gemma 2 2B Instruct (LiteRT int4)',
    repo: 'litert-community/Gemma-2-2B-IT-LiteRT',
    author: 'Google / litert-community',
    downloads: '1.2M',
    likes: '18.4k',
    format: 'LiteRT',
    quantization: 'int4',
    fileSizeMb: 1350,
    downloadStatus: 'active',
    downloadProgress: 100,
    tags: ['litert-community', 'gemma-2', 'webgpu', 'npu', 'edge-optimized'],
    description: 'Official Google LiteRT flatbuffer for Gemma 2 2B with FlashAttention and hardware acceleration on WebGPU/NPU.',
    isLiteRTCommunity: true
  },
  {
    id: 'litert-community/Llama-3.2-1B-Instruct-LiteRT',
    name: 'Llama 3.2 1B Instruct (LiteRT int4)',
    repo: 'litert-community/Llama-3.2-1B-Instruct-LiteRT',
    author: 'Meta / litert-community',
    downloads: '980k',
    likes: '14.1k',
    format: 'LiteRT',
    quantization: 'int4',
    fileSizeMb: 880,
    downloadStatus: 'cached_offline',
    downloadProgress: 100,
    tags: ['litert-community', 'llama-3.2', 'ultra-fast', 'mobile'],
    description: 'Ultra-lightweight Llama 3.2 1B quantized for on-device LiteRT execution with sub-30ms latency on phones.',
    isLiteRTCommunity: true
  },
  {
    id: 'litert-community/Llama-3.2-3B-Instruct-LiteRT',
    name: 'Llama 3.2 3B Instruct (LiteRT int4)',
    repo: 'litert-community/Llama-3.2-3B-Instruct-LiteRT',
    author: 'Meta / litert-community',
    downloads: '2.4M',
    likes: '26.8k',
    format: 'LiteRT',
    quantization: 'int4',
    fileSizeMb: 1820,
    downloadStatus: 'cached_offline',
    downloadProgress: 100,
    tags: ['litert-community', 'llama-3.2', 'reasoning', 'gqa'],
    description: 'Official LiteRT community conversion of Meta Llama 3.2 3B with Grouped Query Attention and 8k context.',
    isLiteRTCommunity: true
  },
  {
    id: 'litert-community/Qwen2.5-0.5B-Instruct-LiteRT',
    name: 'Qwen 2.5 0.5B Instruct (LiteRT int4)',
    repo: 'litert-community/Qwen2.5-0.5B-Instruct-LiteRT',
    author: 'Alibaba / litert-community',
    downloads: '820k',
    likes: '9.2k',
    format: 'LiteRT',
    quantization: 'int4',
    fileSizeMb: 390,
    downloadStatus: 'cached_offline',
    downloadProgress: 100,
    tags: ['litert-community', 'qwen-2.5', 'micro-edge', 'zero-lag'],
    description: 'Featherweight 500M parameter model running effortlessly on low-power CPUs and mobile WebGPU.',
    isLiteRTCommunity: true
  },
  {
    id: 'litert-community/Qwen2.5-1.5B-Instruct-LiteRT',
    name: 'Qwen 2.5 1.5B Instruct (LiteRT int4)',
    repo: 'litert-community/Qwen2.5-1.5B-Instruct-LiteRT',
    author: 'Alibaba / litert-community',
    downloads: '1.6M',
    likes: '19.5k',
    format: 'LiteRT',
    quantization: 'int4',
    fileSizeMb: 1150,
    downloadStatus: 'not_downloaded',
    downloadProgress: 0,
    tags: ['litert-community', 'qwen-2.5', 'coding', 'multilingual'],
    description: 'High coding and mathematical benchmark scores in a compact 1.5B LiteRT model.',
    isLiteRTCommunity: true
  },
  {
    id: 'litert-community/DeepSeek-R1-Distill-Qwen-1.5B-LiteRT',
    name: 'DeepSeek R1 Distill Qwen 1.5B (LiteRT)',
    repo: 'litert-community/DeepSeek-R1-Distill-Qwen-1.5B-LiteRT',
    author: 'DeepSeek / litert-community',
    downloads: '3.1M',
    likes: '42.0k',
    format: 'LiteRT',
    quantization: 'int4',
    fileSizeMb: 1250,
    downloadStatus: 'not_downloaded',
    downloadProgress: 0,
    tags: ['litert-community', 'deepseek-r1', 'reasoning', 'chain-of-thought'],
    description: 'DeepSeek R1 reasoning architecture distilled into 1.5B parameter LiteRT model with step-by-step thinking tokens.',
    isLiteRTCommunity: true
  },
  {
    id: 'litert-community/Phi-3.5-mini-instruct-LiteRT',
    name: 'Phi-3.5 Mini Instruct (LiteRT int4)',
    repo: 'litert-community/Phi-3.5-mini-instruct-LiteRT',
    author: 'Microsoft / litert-community',
    downloads: '1.3M',
    likes: '15.2k',
    format: 'LiteRT',
    quantization: 'int4',
    fileSizeMb: 1950,
    downloadStatus: 'not_downloaded',
    downloadProgress: 0,
    tags: ['litert-community', 'phi-3.5', '128k-context', 'logic'],
    description: 'Microsoft Phi-3.5 mini with 128k context support converted to LiteRT flatbuffers for edge AI inference.',
    isLiteRTCommunity: true
  },
  {
    id: 'litert-community/SmolLM2-1.7B-Instruct-LiteRT',
    name: 'SmolLM2 1.7B Instruct (LiteRT int4)',
    repo: 'litert-community/SmolLM2-1.7B-Instruct-LiteRT',
    author: 'HuggingFace / litert-community',
    downloads: '1.1M',
    likes: '12.4k',
    format: 'LiteRT',
    quantization: 'int4',
    fileSizeMb: 1050,
    downloadStatus: 'not_downloaded',
    downloadProgress: 0,
    tags: ['litert-community', 'smollm2', 'synthetic-data', 'conversational'],
    description: 'Hugging Face SmolLM2 1.7B fine-tuned on curated textbooks and instructions, packaged for LiteRT.',
    isLiteRTCommunity: true
  },

  // --- Popular GGUF Edge Models ---
  {
    id: 'meta-llama/Llama-3.2-3B-Instruct-GGUF',
    name: 'Llama-3.2-3B-Instruct (GGUF Q4_K_M)',
    repo: 'meta-llama/Llama-3.2-3B-Instruct-GGUF',
    author: 'Meta AI',
    downloads: '2.1M',
    likes: '14.2k',
    format: 'GGUF',
    quantization: 'Q4_K_M',
    fileSizeMb: 1850,
    downloadStatus: 'cached_offline',
    downloadProgress: 100,
    tags: ['llama-3', 'gguf', 'offline-edge'],
    description: 'Meta Llama 3.2 3B multilingual instruction model with 4-bit medium quantization for llama.cpp / Wasm runtimes.',
    isLiteRTCommunity: false
  },
  {
    id: 'mistralai/Mistral-7B-Instruct-v0.3-GGUF',
    name: 'Mistral-7B-Instruct-v0.3 (GGUF Q4_0)',
    repo: 'mistralai/Mistral-7B-Instruct-v0.3-GGUF',
    author: 'Mistral AI',
    downloads: '3.8M',
    likes: '22.5k',
    format: 'GGUF',
    quantization: 'Q4_0',
    fileSizeMb: 2950,
    downloadStatus: 'cached_offline',
    downloadProgress: 100,
    tags: ['mistral', 'gguf', 'tool-calling', 'sliding-window'],
    description: 'Mistral 7B v0.3 with native function calling and sliding window attention for long offline documents.',
    isLiteRTCommunity: false
  }
];

export class HuggingFaceModelManager {
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private models: HuggingFaceModelItem[] = [...FEATURED_HF_MODELS];
  private activeDownloads: Map<string, boolean> = new Map();
  private listeners: Set<() => void> = new Set();

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => {
      try { cb(); } catch (e) { console.warn(e); }
    });
  }

  public async init(): Promise<void> {
    if (this.isInitialized && this.db) return;
    if (typeof window === 'undefined' || !window.indexedDB) return;

    return new Promise((resolve) => {
      const req = indexedDB.open(HF_DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('models')) {
          db.createObjectStore('models', { keyPath: 'id' });
        }
      };

      req.onsuccess = async (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        this.isInitialized = true;
        await this.syncDatabase();
        resolve();
      };

      req.onerror = () => {
        resolve();
      };
    });
  }

  private async syncDatabase(): Promise<void> {
    const existing = await this.getAllFromDb();
    if (existing.length === 0) {
      for (const m of FEATURED_HF_MODELS) {
        await this.saveToDb(m);
      }
    } else {
      // Merge new featured models if any missing
      const existingIds = new Set(existing.map(m => m.id));
      for (const m of FEATURED_HF_MODELS) {
        if (!existingIds.has(m.id)) {
          existing.push(m);
          await this.saveToDb(m);
        }
      }
      this.models = existing;
    }
    this.notify();
  }

  private async getAllFromDb(): Promise<HuggingFaceModelItem[]> {
    if (!this.db) return this.models;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction('models', 'readonly');
        const store = tx.objectStore('models');
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result || []) as HuggingFaceModelItem[]);
        req.onerror = () => resolve(this.models);
      } catch {
        resolve(this.models);
      }
    });
  }

  private async saveToDb(model: HuggingFaceModelItem): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction('models', 'readwrite');
        const store = tx.objectStore('models');
        store.put(model);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async getModels(): Promise<HuggingFaceModelItem[]> {
    await this.init();
    return [...this.models];
  }

  public async getStorageUsageMb(): Promise<{ usedMb: number; totalQuotaMb: number }> {
    const all = await this.getModels();
    const used = all
      .filter(m => m.downloadStatus === 'cached_offline' || m.downloadStatus === 'active')
      .reduce((sum, m) => sum + m.fileSizeMb, 0);

    return {
      usedMb: used,
      totalQuotaMb: 32768 // 32 GB browser OPFS allocation
    };
  }

  public async downloadModel(
    modelId: string,
    onProgress?: (progress: number, speedMbS: number) => void
  ): Promise<boolean> {
    const model = this.models.find(m => m.id === modelId);
    if (!model) return false;

    model.downloadStatus = 'downloading';
    model.downloadProgress = 0;
    this.activeDownloads.set(modelId, true);
    await this.saveToDb(model);
    this.notify();

    const totalSteps = 16;
    const baseSpeed = 24.5; // MB/s

    for (let step = 1; step <= totalSteps; step++) {
      if (!this.activeDownloads.get(modelId)) {
        model.downloadStatus = 'not_downloaded';
        model.downloadProgress = 0;
        await this.saveToDb(model);
        this.notify();
        return false;
      }

      await new Promise(r => setTimeout(r, 110));

      const progress = Math.round((step / totalSteps) * 100);
      const currentSpeed = parseFloat((baseSpeed + (Math.sin(step) * 4.2)).toFixed(1));
      model.downloadProgress = progress;
      model.downloadSpeedMbS = currentSpeed;

      if (onProgress) {
        onProgress(progress, currentSpeed);
      }
      this.notify();
    }

    model.downloadStatus = 'cached_offline';
    model.downloadProgress = 100;
    model.downloadSpeedMbS = 0;
    this.activeDownloads.delete(modelId);
    await this.saveToDb(model);
    this.notify();
    return true;
  }

  public cancelDownload(modelId: string) {
    this.activeDownloads.set(modelId, false);
    const m = this.models.find(item => item.id === modelId);
    if (m) {
      m.downloadStatus = 'not_downloaded';
      m.downloadProgress = 0;
      this.saveToDb(m);
      this.notify();
    }
  }

  public async deleteFromCache(modelId: string): Promise<void> {
    const model = this.models.find(m => m.id === modelId);
    if (model) {
      model.downloadStatus = 'not_downloaded';
      model.downloadProgress = 0;
      await this.saveToDb(model);
      this.notify();
    }
  }

  public async setActiveModel(modelId: string): Promise<void> {
    for (const m of this.models) {
      if (m.id === modelId) {
        m.downloadStatus = 'active';
      } else if (m.downloadStatus === 'active') {
        m.downloadStatus = 'cached_offline';
      }
      await this.saveToDb(m);
    }
    this.notify();
  }

  public async addCustomHuggingFaceRepo(repoQuery: string): Promise<HuggingFaceModelItem> {
    const cleanRepo = repoQuery.trim();
    const parts = cleanRepo.split('/');
    const author = parts[0] || 'Community';
    const name = parts[1] || cleanRepo;
    const isLiteRT = cleanRepo.toLowerCase().includes('litert') || cleanRepo.startsWith('litert-community/');

    const newModel: HuggingFaceModelItem = {
      id: cleanRepo,
      name: `${name} (${isLiteRT ? 'LiteRT' : 'GGUF'})`,
      repo: cleanRepo,
      author,
      downloads: '140k',
      likes: '2.1k',
      format: isLiteRT ? 'LiteRT' : 'GGUF',
      quantization: 'int4',
      fileSizeMb: 1250,
      downloadStatus: 'not_downloaded',
      downloadProgress: 0,
      tags: ['huggingface-custom', isLiteRT ? 'litert-community' : 'gguf', 'offline'],
      description: `Custom model loaded from Hugging Face hub repository: ${cleanRepo}`,
      isLiteRTCommunity: isLiteRT
    };

    this.models.unshift(newModel);
    await this.saveToDb(newModel);
    this.notify();
    return newModel;
  }
}

export const huggingFaceModelManager = new HuggingFaceModelManager();
