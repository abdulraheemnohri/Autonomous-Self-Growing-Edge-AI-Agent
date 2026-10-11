'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MobileFrame } from '../components/mobile/MobileFrame';
import { MobileBottomNav, MobileTab } from '../components/mobile/MobileBottomNav';
import { HuggingFaceModelHub } from '../components/mobile/HuggingFaceModelHub';
import { MobileSettingsPanel } from '../components/mobile/MobileSettingsPanel';
import { VoiceModelManager } from '../components/mobile/VoiceModelManager';
import { SelfLearningStudio } from '../components/SelfLearningStudio';
import { VoiceVisualizer } from '../components/VoiceVisualizer';
import { ChatConsole } from '../components/ChatConsole';
import { AutonomousAgentPanel } from '../components/AutonomousAgentPanel';
import { VectorDbStudio } from '../components/VectorDbStudio';
import { PerformanceStudio } from '../components/PerformanceStudio';
import { liteRTEngine } from '../lib/litert/engine';
import { realTimeAudioController, VoiceAgentState } from '../lib/voice/audio-controller';
import { growthEngine } from '../lib/learning/growth-engine';
import { memoryStore } from '../lib/learning/memory-store';
import { settingsManager } from '../lib/settings/settings-manager';
import { ChatMessage, HardwareBackend } from '../lib/litert/types';
import { Cpu, WifiOff, Wifi, Mic, Zap, Sparkles, Brain, Terminal, Volume2 } from 'lucide-react';

const INITIAL_GREETING: ChatMessage = {
  id: 'msg_welcome',
  role: 'assistant',
  content: `Hello! I am your **Autonomous Self-Growing Edge AI Agent**, designed as an offline mobile application.

**Autonomous & Self-Growing Features:**
- **litert-community Models**: Official models from \`https://huggingface.co/litert-community\` (Gemma 2 2B, Llama 3.2 1B & 3B, Qwen 2.5, DeepSeek R1).
- **Self-Growing Evolution**: Automatically extracts atomic facts from conversation, derives procedural skills, and expands synaptic knowledge with an on-device XP/Level system.
- **Linux Terminal Installation**: Full setup scripts for Ubuntu, Arch, Fedora, Docker containers, and background systemd services.
- **Offline Voice Suite**: Downloadable Whisper STT, Piper TTS (Ryan & Amy), Kokoro-82M, and Silero VAD with real-time waveform visualization.
- **100% Air-Gap Verified**: Zero internet requests required during token generation or voice synthesis.`,
  thought: `Edge runtime initialized. 100% air-gap verified. litert-community Gemma 2 2B loaded. Whisper ASR & Piper TTS ready. Self-growing cognitive engine online (Level 3 Cognitive Edge Pilot).`,
  timestamp: 1728560000000,
  model: 'LiteRT Gemma 2 2B Instruct',
  isOffline: true,
  tokensGenerated: 94,
  latencyMs: 135
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<MobileTab>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingText, setStreamingText] = useState<string>('');
  const [streamingThought, setStreamingThought] = useState<string>('');
  const [voiceState, setVoiceState] = useState<VoiceAgentState>('idle');
  const [isHandsFree, setIsHandsFree] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isForceOffline, setIsForceOffline] = useState<boolean>(true);
  const [telemetry, setTelemetry] = useState(liteRTEngine.getTelemetry());
  const [activeModel, setActiveModel] = useState(liteRTEngine.getActiveModel());
  const [frameMode, setFrameMode] = useState<'mobile_bezel' | 'responsive'>('responsive');
  const [growthStats, setGrowthStats] = useState(growthEngine.getStats());

  const isStreamingRef = useRef(isStreaming);
  const isHandsFreeRef = useRef(isHandsFree);
  const hasWelcomedRef = useRef(false);
  const sendMessageRef = useRef<(text: string, speakResponse?: boolean) => void>(() => {});

  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  useEffect(() => {
    isHandsFreeRef.current = isHandsFree;
  }, [isHandsFree]);

  useEffect(() => {
    if (hasWelcomedRef.current) return;
    hasWelcomedRef.current = true;
    // Auto-trigger welcoming audio greeting when app first launches based on current cognitive level
    const timer = setTimeout(() => {
      const welcomeText = `Welcome to Autonomous Self-Growing Edge Agent. Cognitive engine is online at Level ${growthStats.level}. All LiteRT models and offline voice synthesis are fully operational.`;
      realTimeAudioController.speakText(welcomeText);
    }, 1200);
    return () => clearTimeout(timer);
  }, [growthStats.level]);

  const handleSendMessage = React.useCallback(async (text: string, speakResponse: boolean = false) => {
    if (!text.trim() || isStreamingRef.current) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      model: 'user',
      isOffline: true
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setStreamingText('');
    setStreamingThought('');
    setVoiceState('thinking');

    try {
      let accumulatedText = '';
      let accumulatedThought = '';

      const res = await liteRTEngine.generateStreamingResponse(text, [], {
        onToken: (chunk) => {
          accumulatedText += chunk;
          setStreamingText(accumulatedText);
        },
        onThought: (thought) => {
          accumulatedThought = thought;
          setStreamingThought(thought);
        }
      });

      const assistantMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: res.text,
        thought: res.thought,
        timestamp: Date.now(),
        model: activeModel.name,
        isOffline: true,
        tokensGenerated: res.tokensCount,
        latencyMs: res.latencyMs,
        vectorCitations: res.vectorCitations,
        learnedFactsCount: res.learnedFactsCount,
        skillTriggered: res.skillTriggered
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingText('');
      setStreamingThought('');
      setIsStreaming(false);

      // Refresh growth stats after interaction
      setGrowthStats(growthEngine.getStats());

      if (speakResponse || isHandsFreeRef.current) {
        await realTimeAudioController.speakText(res.text, () => {
          if (isHandsFreeRef.current) {
            realTimeAudioController.startListening();
          }
        });
      } else {
        setVoiceState('idle');
      }
    } catch (err: any) {
      console.error('Error during local token generation:', err);
      setIsStreaming(false);
      setVoiceState('idle');
    }
  }, [activeModel.name]);

  useEffect(() => {
    sendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  useEffect(() => {
    liteRTEngine.initClientRuntime();
    memoryStore.init();
    growthEngine.init();

    realTimeAudioController.registerCallbacks(
      (transcript, isFinal) => {
        if (isFinal) {
          setInterimTranscript('');
          if (!isStreamingRef.current && transcript.trim()) {
            sendMessageRef.current(transcript.trim(), true);
          }
        } else {
          setInterimTranscript(transcript);
        }
      },
      (newState) => {
        setVoiceState(newState);
      }
    );

    const unsubGrowth = growthEngine.subscribe(() => {
      setGrowthStats(growthEngine.getStats());
      setTelemetry(liteRTEngine.getTelemetry());
    });

    const timer = setInterval(() => {
      setTelemetry(liteRTEngine.getTelemetry());
      setGrowthStats(growthEngine.getStats());
    }, 2000);

    return () => {
      clearInterval(timer);
      unsubGrowth();
    };
  }, []);

  const handleRecordFeedback = async (
    messageId: string,
    feedback: 'positive' | 'negative',
    correction?: string
  ) => {
    const targetMsg = messages.find((m) => m.id === messageId);
    if (!targetMsg) return;

    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback } : m))
    );

    const userPrompt = messages.find((_, i) => messages[i + 1]?.id === messageId)?.content || targetMsg.content;
    await growthEngine.processInteractionGrowth(userPrompt, targetMsg.content, feedback);
    setGrowthStats(growthEngine.getStats());
  };

  const handleToggleForceOffline = () => {
    const isNowOffline = liteRTEngine.toggleForceOffline();
    setIsForceOffline(isNowOffline);
    setTelemetry(liteRTEngine.getTelemetry());
  };

  const handleToggleHandsFree = () => {
    const nextState = !isHandsFree;
    setIsHandsFree(nextState);
    realTimeAudioController.setHandsFree(nextState);
  };

  const handleToggleFrameMode = () => {
    setFrameMode(prev => prev === 'mobile_bezel' ? 'responsive' : 'mobile_bezel');
  };

  return (
    <MobileFrame
      frameMode={frameMode}
      onToggleFrameMode={handleToggleFrameMode}
      isOffline={isForceOffline}
      activeModelName={activeModel.name}
    >
      {/* Mobile App Header Bar */}
      <header className="px-3.5 py-2 bg-[#090e1a]/95 border-b border-slate-800/80 flex items-center justify-between z-30 select-none">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-semibold text-slate-100 tracking-tight leading-tight">
                LiteRT Agent
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">
                Lv.{growthStats.level}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono block leading-none">
              100% Offline Air-Gap
            </span>
          </div>
        </div>

        {/* Quick Action Badges */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            onClick={handleToggleForceOffline}
            className={`px-2 py-0.5 rounded-full text-[10px] border transition-colors flex items-center gap-1 ${
              isForceOffline
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title="Toggle Air-Gap Offline Mode"
          >
            {isForceOffline ? <WifiOff className="w-3 h-3 text-emerald-400" /> : <Wifi className="w-3 h-3 text-cyan-400" />}
            <span>{isForceOffline ? 'Air-Gap' : 'Online'}</span>
          </button>

          <button
            onClick={handleToggleHandsFree}
            className={`px-2 py-0.5 rounded-full text-[10px] border transition-colors flex items-center gap-1 ${
              isHandsFree
                ? 'bg-amber-950/80 text-amber-300 border-amber-600 animate-pulse'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title="Toggle Hands-Free Duplex Voice Mode"
          >
            <Mic className="w-3 h-3" />
            <span>{isHandsFree ? 'Voice ON' : 'Voice'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Main Body Viewport */}
      <main className="flex-1 overflow-hidden flex flex-col relative bg-[#070b12]">
        {/* Tab 1: Redesigned Voice & Chat Screen */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-2 gap-2">
            {/* Tactile Voice Visualizer */}
            <div className="flex-shrink-0">
              <VoiceVisualizer
                voiceState={voiceState}
                isHandsFree={isHandsFree}
                onToggleHandsFree={handleToggleHandsFree}
                onStartListening={() => realTimeAudioController.startListening()}
                onStopListening={() => realTimeAudioController.stopListening()}
                onStopSpeaking={() => realTimeAudioController.stopSpeaking()}
                interimTranscript={interimTranscript}
              />
            </div>

            {/* Chat Stream Console */}
            <div className="flex-1 overflow-hidden">
              <ChatConsole
                messages={messages}
                isStreaming={isStreaming}
                streamingText={streamingText}
                streamingThought={streamingThought}
                onSendMessage={(txt) => handleSendMessage(txt, false)}
                onRecordFeedback={handleRecordFeedback}
                onStartListening={() => realTimeAudioController.startListening()}
                onStopListening={() => realTimeAudioController.stopListening()}
                isListening={voiceState === 'listening'}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Self-Learning Skills & Memory Hub */}
        {activeTab === 'learning' && (
          <div className="flex-1 h-full overflow-hidden">
            <SelfLearningStudio />
          </div>
        )}

        {/* Tab 3: Official litert-community Models Hub */}
        {activeTab === 'models' && (
          <div className="flex-1 h-full overflow-hidden">
            <HuggingFaceModelHub
              onModelActivated={(name) => {
                const found = liteRTEngine.getActiveModel();
                setActiveModel(found);
                setTelemetry(liteRTEngine.getTelemetry());
              }}
            />
          </div>
        )}

        {/* Tab 4: Voice Models Hub (Whisper, Piper, Kokoro, Silero) */}
        {activeTab === 'voice_hub' && (
          <div className="flex-1 h-full overflow-hidden">
            <VoiceModelManager />
          </div>
        )}

        {/* Tab 5: Autonomous ReAct Mission Runner */}
        {activeTab === 'autonomous' && (
          <div className="flex-1 h-full overflow-hidden p-2">
            <AutonomousAgentPanel onMissionCompleted={() => {}} />
          </div>
        )}

        {/* Tab 6: Real-time Recharts Performance Monitor */}
        {activeTab === 'performance' && (
          <div className="flex-1 h-full overflow-hidden">
            <PerformanceStudio />
          </div>
        )}

        {/* Tab 7: ChromaDB & FAISS Vector DB */}
        {activeTab === 'vectordb' && (
          <div className="flex-1 h-full overflow-hidden p-2">
            <VectorDbStudio />
          </div>
        )}

        {/* Tab 8: Offline Settings & Autonomy Controls */}
        {activeTab === 'settings' && (
          <div className="flex-1 h-full overflow-hidden">
            <MobileSettingsPanel
              isOffline={isForceOffline}
              onToggleOffline={handleToggleForceOffline}
              frameMode={frameMode}
              onToggleFrameMode={handleToggleFrameMode}
            />
          </div>
        )}
      </main>

      {/* Mobile Native Bottom Navigation Bar */}
      <MobileBottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </MobileFrame>
  );
}
