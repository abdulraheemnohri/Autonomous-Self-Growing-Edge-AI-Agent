import { VoiceModelItem } from '../litert/types';

const VOICE_DB_NAME = 'LiteRT_Voice_Models_DB_v1';
const VOICE_STORE = 'voice_models';

export const INITIAL_VOICE_MODELS: VoiceModelItem[] = [
  {
    id: 'whisper-tiny-litert',
    name: 'OpenAI Whisper Tiny (LiteRT / WebGPU)',
    type: 'stt',
    engine: 'whisper',
    fileSizeMb: 39,
    downloadStatus: 'active',
    downloadProgress: 100,
    samplePhrase: 'Autonomous edge speech recognition listening offline.',
    language: 'en-US (Multilingual)',
    description: 'Ultra-lightweight 39M parameter encoder-decoder optimized for edge browser inference with sub-50ms latency.',
    sampleRateKhz: 16,
    parameters: '39M · int8 · WebGPU'
  },
  {
    id: 'whisper-base-litert',
    name: 'OpenAI Whisper Base (LiteRT int4)',
    type: 'stt',
    engine: 'whisper',
    fileSizeMb: 142,
    downloadStatus: 'not_downloaded',
    downloadProgress: 0,
    samplePhrase: 'High fidelity continuous speech recognition with technical vocabulary.',
    language: 'en-US (Multilingual)',
    description: 'Enhanced precision 74M parameter speech model with higher accuracy on technical and noisy audio environments.',
    sampleRateKhz: 16,
    parameters: '74M · int4 · SIMD'
  },
  {
    id: 'silero-vad-v5',
    name: 'Silero VAD v5 (LiteRT Zero-Latency)',
    type: 'vad',
    engine: 'silero',
    fileSizeMb: 2.1,
    downloadStatus: 'active',
    downloadProgress: 100,
    samplePhrase: 'Voice activity detection gate active.',
    language: 'Language Agnostic',
    description: 'Enterprise grade voice activity detector running in 1ms to filter ambient silence and prevent false activations.',
    sampleRateKhz: 16,
    parameters: '1.2M · fp16 · Zero-Latency'
  },
  {
    id: 'piper-ryan-high',
    name: 'Piper TTS: Ryan (Natural US English)',
    type: 'tts',
    engine: 'piper',
    fileSizeMb: 65,
    downloadStatus: 'active',
    downloadProgress: 100,
    samplePhrase: 'Hello! I am your autonomous edge AI assistant, running completely offline with LiteRT neural voice synthesis.',
    language: 'en-US',
    description: 'Warm, articulate neutral US English male voice trained on high-fidelity studio recordings with low memory footprint.',
    sampleRateKhz: 22.05,
    parameters: 'VITS Neural · High Quality'
  },
  {
    id: 'piper-amy-conversational',
    name: 'Piper TTS: Amy (Warm Conversational)',
    type: 'tts',
    engine: 'piper',
    fileSizeMb: 62,
    downloadStatus: 'cached_offline',
    downloadProgress: 100,
    samplePhrase: 'Edge intelligence means privacy, speed, and continuous offline self-improvement wherever you are.',
    language: 'en-US',
    description: 'Conversational US English female neural voice with expressive pitch contour and natural conversational pacing.',
    sampleRateKhz: 22.05,
    parameters: 'VITS Neural · Conversational'
  },
  {
    id: 'kokoro-82m-litert',
    name: 'Kokoro-82M LiteRT (Next-Gen Neural Speech)',
    type: 'tts',
    engine: 'kokoro',
    fileSizeMb: 82,
    downloadStatus: 'not_downloaded',
    downloadProgress: 0,
    samplePhrase: 'Kokoro delivers next-generation acoustic depth with studio-quality phoneme articulation.',
    language: 'en-US / en-GB',
    description: 'Next-generation 82M parameter speech synthesis architecture delivering state-of-the-art prosody at edge speed.',
    sampleRateKhz: 24,
    parameters: '82M · int8 · WebGPU'
  },
  {
    id: 'sherpa-onnx-fastspeech2',
    name: 'Sherpa-ONNX FastSpeech2 (Ultra-Fast Edge)',
    type: 'tts',
    engine: 'sherpa',
    fileSizeMb: 48,
    downloadStatus: 'not_downloaded',
    downloadProgress: 0,
    samplePhrase: 'Zero latency non-autoregressive speech synthesis designed for embedded devices.',
    language: 'en-US',
    description: 'Non-autoregressive acoustic model generating complete sentences in parallel with sub-30ms synthesis latency.',
    sampleRateKhz: 16,
    parameters: 'FastSpeech2 · CPU SIMD'
  },
  {
    id: 'piper-alba-natural',
    name: 'Piper TTS: Alba (British English)',
    type: 'tts',
    engine: 'piper',
    fileSizeMb: 68,
    downloadStatus: 'not_downloaded',
    downloadProgress: 0,
    samplePhrase: 'Right, autonomous local systems are fully self-sufficient and never rely on external cloud servers.',
    language: 'en-GB',
    description: 'Crisp, natural British English female voice profile with clear phonetics and natural intonation.',
    sampleRateKhz: 22.05,
    parameters: 'VITS Neural · en-GB'
  }
];

export class VoiceModelsManager {
  private models: VoiceModelItem[] = [...INITIAL_VOICE_MODELS];
  private isInitialized = false;
  private activeDownloads: Map<string, boolean> = new Map();
  private listeners: Set<() => void> = new Set();

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try { cb(); } catch (e) { console.warn(e); }
    });
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('litert_voice_models_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.models = parsed;
        }
      }
    } catch (e) {
      console.warn('Voice models init error:', e);
    }

    this.isInitialized = true;
    this.notify();
  }

  private saveState() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('litert_voice_models_v1', JSON.stringify(this.models));
    } catch (e) {
      console.warn('Error saving voice models:', e);
    }
  }

  public getModels(): VoiceModelItem[] {
    return [...this.models];
  }

  public getActiveTTSModel(): VoiceModelItem | undefined {
    return this.models.find(m => m.type === 'tts' && m.downloadStatus === 'active') ||
           this.models.find(m => m.type === 'tts' && m.downloadStatus === 'cached_offline');
  }

  public getActiveSTTModel(): VoiceModelItem | undefined {
    return this.models.find(m => m.type === 'stt' && m.downloadStatus === 'active') ||
           this.models.find(m => m.type === 'stt');
  }

  public async downloadVoiceModel(
    modelId: string,
    onProgress?: (pct: number) => void
  ): Promise<boolean> {
    const model = this.models.find(m => m.id === modelId);
    if (!model) return false;

    model.downloadStatus = 'downloading';
    model.downloadProgress = 0;
    this.activeDownloads.set(modelId, true);
    this.notify();

    const totalSteps = 15;
    for (let step = 1; step <= totalSteps; step++) {
      if (!this.activeDownloads.get(modelId)) {
        model.downloadStatus = 'not_downloaded';
        model.downloadProgress = 0;
        this.saveState();
        this.notify();
        return false;
      }

      await new Promise(r => setTimeout(r, 100));
      const pct = Math.round((step / totalSteps) * 100);
      model.downloadProgress = pct;
      if (onProgress) onProgress(pct);
      this.notify();
    }

    model.downloadStatus = 'cached_offline';
    model.downloadProgress = 100;
    this.activeDownloads.delete(modelId);
    this.saveState();
    this.notify();
    return true;
  }

  public cancelDownload(modelId: string) {
    this.activeDownloads.set(modelId, false);
  }

  public async setActiveModel(modelId: string): Promise<void> {
    const target = this.models.find(m => m.id === modelId);
    if (!target) return;

    for (const m of this.models) {
      if (m.type === target.type) {
        if (m.id === modelId) {
          m.downloadStatus = 'active';
        } else if (m.downloadStatus === 'active') {
          m.downloadStatus = 'cached_offline';
        }
      }
    }

    this.saveState();
    this.notify();
  }

  public async deleteFromCache(modelId: string): Promise<void> {
    const target = this.models.find(m => m.id === modelId);
    if (target) {
      target.downloadStatus = 'not_downloaded';
      target.downloadProgress = 0;
      this.saveState();
      this.notify();
    }
  }

  /**
   * Audition / Test Sample: Synthesizes live audio preview
   */
  public auditionVoice(model: VoiceModelItem, onFinish?: () => void) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onFinish) onFinish();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(model.samplePhrase);

    // Apply voice-specific pitch and cadence
    if (model.id.includes('ryan')) {
      utterance.pitch = 0.95;
      utterance.rate = 1.05;
    } else if (model.id.includes('amy')) {
      utterance.pitch = 1.1;
      utterance.rate = 1.05;
    } else if (model.id.includes('kokoro')) {
      utterance.pitch = 1.02;
      utterance.rate = 1.02;
    } else if (model.id.includes('alba')) {
      utterance.pitch = 1.05;
      utterance.rate = 1.0;
    } else {
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
    }

    const voices = window.speechSynthesis.getVoices();
    const langCode = model.language.includes('GB') ? 'en-GB' : 'en-US';
    const matched = voices.find(v => v.lang.startsWith(langCode.slice(0, 2))) || voices[0];
    if (matched) {
      utterance.voice = matched;
    }

    utterance.onend = () => { if (onFinish) onFinish(); };
    utterance.onerror = () => { if (onFinish) onFinish(); };

    window.speechSynthesis.speak(utterance);
  }
}

export const voiceModelsManager = new VoiceModelsManager();
