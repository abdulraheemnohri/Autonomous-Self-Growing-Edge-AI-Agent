export type VoiceAgentState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface AudioFrequencyData {
  frequencyData: Uint8Array;
  volumeRms: number; // 0 to 1
}

export class RealTimeAudioController {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private recognition: any = null;
  private isRecognitionActive = false;
  private isHandsFree = false;
  private currentState: VoiceAgentState = 'idle';

  private onTranscriptCallback?: (transcript: string, isFinal: boolean) => void;
  private onStateChangeCallback?: (state: VoiceAgentState) => void;

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isRecognitionActive = true;
          this.setState('listening');
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
          // Ignore harmless 'no-speech' event
          if (event.error !== 'no-speech') {
            console.warn('Speech recognition warning:', event.error);
          }
        };

        this.recognition.onend = () => {
          this.isRecognitionActive = false;
          // If hands free and not speaking/thinking, restart listening loop
          if (this.isHandsFree && this.currentState !== 'speaking' && this.currentState !== 'thinking') {
            try {
              this.recognition.start();
            } catch {}
          } else if (this.currentState === 'listening') {
            this.setState('idle');
          }
        };
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
      }
    }
  }

  public setState(state: VoiceAgentState) {
    this.currentState = state;
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(state);
    }
  }

  public getState(): VoiceAgentState {
    return this.currentState;
  }

  public registerCallbacks(
    onTranscript: (transcript: string, isFinal: boolean) => void,
    onStateChange: (state: VoiceAgentState) => void
  ) {
    this.onTranscriptCallback = onTranscript;
    this.onStateChangeCallback = onStateChange;
  }

  /**
   * Initializes Web Audio Context and microphone stream for real-time visualizer
   */
  public async initAudioCapture(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      if (!this.micStream) {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 128;
        this.analyser.smoothingTimeConstant = 0.8;

        this.sourceNode = this.audioCtx.createMediaStreamSource(this.micStream);
        this.sourceNode.connect(this.analyser);
      }

      return true;
    } catch (err) {
      console.warn('Microphone access not available or denied:', err);
      return false;
    }
  }

  /**
   * Retrieves real-time frequency buffer for canvas visualizer
   */
  public getFrequencyData(): AudioFrequencyData {
    if (!this.analyser) {
      // Synthesize subtle breathing data if mic not active
      const dummy = new Uint8Array(64);
      const isSpeaking = this.currentState === 'speaking';
      const isThinking = this.currentState === 'thinking';
      const now = performance.now() / 150;

      for (let i = 0; i < 64; i++) {
        if (isSpeaking) {
          dummy[i] = Math.floor(Math.abs(Math.sin(now + i * 0.3)) * 160 + 40);
        } else if (isThinking) {
          dummy[i] = Math.floor(Math.abs(Math.cos(now * 0.5 + i * 0.1)) * 90 + 20);
        } else {
          dummy[i] = Math.floor(Math.sin(now * 0.2 + i * 0.05) * 15 + 15);
        }
      }
      return { frequencyData: dummy, volumeRms: isSpeaking ? 0.6 : (isThinking ? 0.3 : 0.05) };
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

  /**
   * Starts listening to user voice
   */
  public async startListening(): Promise<boolean> {
    await this.initAudioCapture();
    if (this.recognition && !this.isRecognitionActive) {
      try {
        this.recognition.start();
        this.setState('listening');
        return true;
      } catch (e) {
        console.warn('Could not start recognition:', e);
      }
    }
    this.setState('listening');
    return false;
  }

  /**
   * Stops listening
   */
  public stopListening() {
    if (this.recognition && this.isRecognitionActive) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.isRecognitionActive = false;
    if (this.currentState === 'listening') {
      this.setState('idle');
    }
  }

  public setHandsFree(enabled: boolean) {
    this.isHandsFree = enabled;
    if (enabled) {
      this.startListening();
    } else {
      this.stopListening();
    }
  }

  public getHandsFree(): boolean {
    return this.isHandsFree;
  }

  /**
   * Speaks agent text using offline SpeechSynthesis
   */
  public async speakText(text: string, onComplete?: () => void): Promise<void> {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onComplete) onComplete();
      return;
    }

    // Clean text of markdown formatting and internal tags
    const cleanText = text
      .replace(/\[ACTION:[^\]]+\]/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/[*_#`[\]()]/g, '')
      .trim();

    if (!cleanText) {
      if (onComplete) onComplete();
      return;
    }

    // Stop recognition during speech to avoid self-pickup
    if (this.isRecognitionActive) {
      try {
        this.recognition.stop();
      } catch {}
    }

    window.speechSynthesis.cancel();
    this.setState('speaking');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick best natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Edge')) && v.lang.startsWith('en'))
      || voices.find(v => v.lang.startsWith('en'));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => {
      this.setState('idle');
      if (onComplete) onComplete();
      if (this.isHandsFree) {
        this.startListening();
      }
    };

    utterance.onerror = () => {
      this.setState('idle');
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
      this.setState('idle');
    }
  }
}

export const realTimeAudioController = new RealTimeAudioController();
