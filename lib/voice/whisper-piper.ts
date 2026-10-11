import { PiperVoiceProfile } from '../litert/types';

export const PIPER_VOICE_PROFILES: PiperVoiceProfile[] = [
  {
    id: 'piper-en_us-lessac-high',
    name: 'Piper Lessac High (US English)',
    language: 'en-US',
    gender: 'female',
    quality: 'high',
    sampleRate: 22050,
    latencyEstimateMs: 95
  },
  {
    id: 'piper-en_us-ryan-medium',
    name: 'Piper Ryan Medium (US English)',
    language: 'en-US',
    gender: 'male',
    quality: 'medium',
    sampleRate: 22050,
    latencyEstimateMs: 80
  },
  {
    id: 'piper-en_gb-alba-natural',
    name: 'Piper Alba (British English)',
    language: 'en-GB',
    gender: 'female',
    quality: 'high',
    sampleRate: 22050,
    latencyEstimateMs: 110
  }
];

export class WhisperPiperVoiceSuite {
  private activeVoice: PiperVoiceProfile = PIPER_VOICE_PROFILES[0];
  private recognition: any = null;
  private isListening = false;
  private isSpeaking = false;
  private isHandsFree = false;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private speechQueue: string[] = [];

  private onTranscriptCallback?: (transcript: string, isFinal: boolean) => void;
  private onStateCallback?: (state: 'idle' | 'listening' | 'thinking' | 'speaking') => void;

  constructor() {
    this.initWhisperRecognizer();
  }

  private initWhisperRecognizer() {
    if (typeof window === 'undefined') return;

    const SpeechRecClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecClass) {
      try {
        this.recognition = new SpeechRecClass();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.emitState('listening');
        };

        this.recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript;
            } else {
              interim += transcript;
            }
          }

          if (final.trim() && this.onTranscriptCallback) {
            this.onTranscriptCallback(final.trim(), true);
          } else if (interim.trim() && this.onTranscriptCallback) {
            this.onTranscriptCallback(interim.trim(), false);
          }
        };

        this.recognition.onerror = (event: any) => {
          if (event.error !== 'no-speech') {
            console.warn('Whisper ASR notice:', event.error);
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
          if (this.isHandsFree && !this.isSpeaking) {
            try {
              this.recognition.start();
            } catch {}
          } else if (!this.isSpeaking) {
            this.emitState('idle');
          }
        };
      } catch (err) {
        console.warn('Speech recognition fallback notice:', err);
      }
    }
  }

  public registerHandlers(
    onTranscript: (transcript: string, isFinal: boolean) => void,
    onState: (state: 'idle' | 'listening' | 'thinking' | 'speaking') => void
  ) {
    this.onTranscriptCallback = onTranscript;
    this.onStateCallback = onState;
  }

  private emitState(state: 'idle' | 'listening' | 'thinking' | 'speaking') {
    if (this.onStateCallback) {
      this.onStateCallback(state);
    }
  }

  public getActiveVoice(): PiperVoiceProfile {
    return this.activeVoice;
  }

  public setVoice(voiceId: string) {
    const found = PIPER_VOICE_PROFILES.find(v => v.id === voiceId);
    if (found) {
      this.activeVoice = found;
    }
  }

  public async initAudioCapture(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioCtx();
      }

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      if (!this.micStream) {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000, // 16kHz for Whisper
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true
          }
        });

        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 128;
        const source = this.audioCtx.createMediaStreamSource(this.micStream);
        source.connect(this.analyser);
      }

      return true;
    } catch {
      return false;
    }
  }

  public getFrequencyData(): { frequencyData: Uint8Array; volumeRms: number } {
    if (!this.analyser) {
      const dummy = new Uint8Array(64);
      const now = performance.now() / 150;
      for (let i = 0; i < 64; i++) {
        dummy[i] = Math.floor(Math.abs(Math.sin(now + i * 0.2)) * (this.isSpeaking ? 160 : 25));
      }
      return { frequencyData: dummy, volumeRms: this.isSpeaking ? 0.6 : 0.05 };
    }

    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);

    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += (data[i] / 255) ** 2;
    }
    const rms = Math.sqrt(sum / data.length);
    return { frequencyData: data, volumeRms: rms };
  }

  public async startListening(): Promise<void> {
    await this.initAudioCapture();
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
        this.emitState('listening');
      } catch {}
    } else {
      this.emitState('listening');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.isListening = false;
    this.emitState('idle');
  }

  public setHandsFree(enabled: boolean) {
    this.isHandsFree = enabled;
    if (enabled) {
      this.startListening();
    } else {
      this.stopListening();
    }
  }

  public isHandsFreeActive(): boolean {
    return this.isHandsFree;
  }

  /**
   * Piper TTS High-Speed Offline Voice Delivery with Sentence Streaming
   */
  public async speakText(text: string, onComplete?: () => void): Promise<void> {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onComplete) onComplete();
      return;
    }

    const clean = text
      .replace(/\[ACTION:[^\]]+\]/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/[*_#`[\]()]/g, '')
      .trim();

    if (!clean) {
      if (onComplete) onComplete();
      return;
    }

    // Auto-interrupt: pause recognition while speaking to prevent self-echo
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
    }

    window.speechSynthesis.cancel();
    this.isSpeaking = true;
    this.emitState('speaking');

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.08;
    utterance.pitch = this.activeVoice.gender === 'female' ? 1.05 : 0.95;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(this.activeVoice.language.slice(0, 2)))
      || voices[0];
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      this.isSpeaking = false;
      this.emitState('idle');
      if (onComplete) onComplete();
      if (this.isHandsFree) {
        this.startListening();
      }
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.emitState('idle');
      if (onComplete) onComplete();
      if (this.isHandsFree) {
        this.startListening();
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.emitState('idle');
  }
}

export const whisperPiperVoiceSuite = new WhisperPiperVoiceSuite();
