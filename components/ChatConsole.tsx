'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Terminal, Cpu, Sparkles, Check, CornerDownRight, RotateCcw, Copy, Brain, Zap, ShieldCheck } from 'lucide-react';
import { ChatMessage, ToolCallRecord } from '../lib/litert/types';
import { realTimeAudioController } from '../lib/voice/audio-controller';
import { ClientTime } from './ClientDateTime';

interface ChatConsoleProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingText: string;
  streamingThought: string;
  onSendMessage: (text: string) => void;
  onRecordFeedback: (messageId: string, feedback: 'positive' | 'negative', correction?: string) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  isListening: boolean;
}

export const ChatConsole: React.FC<ChatConsoleProps> = ({
  messages,
  isStreaming,
  streamingText,
  streamingThought,
  onSendMessage,
  onRecordFeedback,
  onStartListening,
  onStopListening,
  isListening
}) => {
  const [inputText, setInputText] = useState('');
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [correctionTargetId, setCorrectionTargetId] = useState<string | null>(null);
  const [correctionInput, setCorrectionInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, streamingThought]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isStreaming) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const toggleThought = (id: string) => {
    setExpandedThoughts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSpeak = (text: string) => {
    realTimeAudioController.speakText(text);
  };

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleFeedback = (msg: ChatMessage, type: 'positive' | 'negative') => {
    if (type === 'negative') {
      setCorrectionTargetId(msg.id);
    } else {
      onRecordFeedback(msg.id, 'positive');
    }
  };

  const submitCorrection = (msgId: string) => {
    if (!correctionInput.trim()) {
      onRecordFeedback(msgId, 'negative');
    } else {
      onRecordFeedback(msgId, 'negative', correctionInput.trim());
    }
    setCorrectionTargetId(null);
    setCorrectionInput('');
  };

  const quickChips = [
    { label: '⚡ Linux Install Guide', text: 'Show complete Linux terminal installation methods for litert-community models and autonomous daemon.' },
    { label: '🤗 LiteRT Community Models', text: 'Which litert-community models can I download from https://huggingface.co/litert-community?' },
    { label: '🌱 Self-Growing Status', text: 'How do you automatically grow with me, and what is your current evolution level?' },
    { label: '🎙️ Voice Pipeline', text: 'Explain the offline Whisper STT, Piper TTS, and Silero VAD voice architecture.' }
  ];

  return (
    <div className="flex flex-col h-full bg-[#080c16] rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl">
      {/* Console Sub-Header */}
      <div className="px-3.5 py-2 bg-[#090e1a]/95 border-b border-slate-800/80 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-[11px] font-mono font-medium text-slate-300">LiteRT-LM Air-Gap Stream</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/60">
          <Brain className="w-3 h-3 text-cyan-400" />
          <span>Continuous Self-Growth Active</span>
        </div>
      </div>

      {/* Messages Scroll Viewport */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const thoughtOpen = expandedThoughts[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full max-w-2xl ${
                isUser ? 'ml-auto' : 'mr-auto'
              }`}
            >
              {/* Metadata Label */}
              <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center gap-1.5 px-1">
                <span className="font-semibold text-slate-300">{isUser ? 'You' : 'LiteRT Agent'}</span>
                <span>·</span>
                <ClientTime timestamp={msg.timestamp} />
                {!isUser && (
                  <>
                    <span className="text-emerald-400">· 100% Offline</span>
                    {msg.tokensGenerated && (
                      <span className="text-cyan-400">· {msg.tokensGenerated} tok</span>
                    )}
                  </>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl p-3.5 text-xs leading-relaxed transition-all relative ${
                  isUser
                    ? 'bg-gradient-to-tr from-cyan-600 to-cyan-500 text-slate-950 font-medium shadow-md rounded-br-sm'
                    : 'bg-[#0f1524] text-slate-200 border border-slate-800 shadow-md rounded-bl-sm w-full space-y-2'
                }`}
              >
                {/* Assistant: Collapsible Thought & Growth Insight */}
                {!isUser && msg.thought && (
                  <div className="rounded-xl bg-slate-950/80 border border-cyan-900/40 p-2 text-[10px] font-mono text-cyan-300/90">
                    <button
                      onClick={() => toggleThought(msg.id)}
                      className="w-full flex items-center justify-between text-left font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                        <span>Edge Reasoning & Self-Growth Reflection</span>
                      </div>
                      {thoughtOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    {thoughtOpen && (
                      <pre className="mt-2 whitespace-pre-wrap text-slate-300 border-t border-slate-800/80 pt-2 font-mono text-[9px] leading-relaxed">
                        {msg.thought}
                      </pre>
                    )}
                  </div>
                )}

                {/* Message Body Content */}
                <div className="whitespace-pre-wrap leading-relaxed select-text font-sans">
                  {msg.content}
                </div>

                {/* Vector Citations */}
                {!isUser && msg.vectorCitations && msg.vectorCitations.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[9px] font-mono text-slate-400">
                    <span className="text-cyan-400">FAISS Memory Citations:</span>
                    {msg.vectorCitations.map((cite, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {cite}
                      </span>
                    ))}
                  </div>
                )}

                {/* Assistant Footer Actions: TTS, Copy, Feedback */}
                {!isUser && (
                  <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-800/70 text-[10px]">
                    <div className="flex items-center gap-1">
                      {/* Audition / Speak message */}
                      <button
                        onClick={() => handleSpeak(msg.content)}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors"
                        title="Speak message using offline Piper TTS"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Copy Text */}
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Self-Learning Reinforcement Feedback */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleFeedback(msg, 'positive')}
                        className={`p-1 rounded-lg transition-colors ${
                          msg.feedback === 'positive'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-emerald-400'
                        }`}
                        title="Reinforce (+1 Synapse score)"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleFeedback(msg, 'negative')}
                        className={`p-1 rounded-lg transition-colors ${
                          msg.feedback === 'negative'
                            ? 'bg-red-950 text-red-400 border border-red-700'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-red-400'
                        }`}
                        title="Provide corrective calibration"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Correction Input Drawer */}
              {correctionTargetId === msg.id && (
                <div className="w-full mt-2 p-2.5 rounded-xl bg-slate-900 border border-red-900/60 space-y-2 animate-fadeIn">
                  <span className="text-[10px] text-red-300 font-semibold block">
                    Synthesize Behavioral Guardrail (Self-Learning Calibration):
                  </span>
                  <input
                    type="text"
                    value={correctionInput}
                    onChange={(e) => setCorrectionInput(e.target.value)}
                    placeholder="Enter what the agent should have answered..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-slate-200 text-xs focus:outline-none focus:border-red-500"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setCorrectionTargetId(null)}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => submitCorrection(msg.id)}
                      className="px-2.5 py-0.5 rounded text-[10px] bg-red-600 text-white font-bold"
                    >
                      Store Policy Rule
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Live Streaming Assistant Message */}
        {isStreaming && (
          <div className="flex flex-col items-start w-full max-w-2xl mr-auto animate-fadeIn">
            <div className="text-[10px] font-mono text-cyan-400 mb-1 flex items-center gap-1.5 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span>LiteRT-LM Streaming Tokens Locally...</span>
            </div>
            <div className="rounded-2xl p-3.5 bg-[#0f1524] text-slate-200 border border-cyan-800/80 shadow-md rounded-bl-sm w-full space-y-2">
              {streamingThought && (
                <div className="rounded-xl bg-slate-950/80 border border-cyan-900/40 p-2 text-[10px] font-mono text-cyan-300/90 whitespace-pre-wrap">
                  <div className="flex items-center gap-1 text-cyan-400 mb-1">
                    <Sparkles className="w-3 h-3 animate-spin" />
                    <span>Active Chain of Thought:</span>
                  </div>
                  {streamingThought}
                </div>
              )}
              <div className="whitespace-pre-wrap leading-relaxed select-text font-sans">
                {streamingText}
                <span className="inline-block w-1.5 h-3.5 bg-cyan-400 animate-pulse ml-0.5" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips Bar */}
      <div className="px-3 py-1.5 bg-[#090e1a]/90 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto text-[10px] select-none">
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(chip.text)}
            disabled={isStreaming}
            className="px-2 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors flex-shrink-0 disabled:opacity-50"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Bottom Input Dock */}
      <form
        onSubmit={handleSubmit}
        className="p-2.5 bg-[#090e1a] border-t border-slate-800/90 flex items-center gap-2"
      >
        {/* Mic Push-to-Talk Toggle */}
        <button
          type="button"
          onClick={isListening ? onStopListening : onStartListening}
          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all flex-shrink-0 shadow-md ${
            isListening
              ? 'bg-emerald-600 text-slate-950 border-emerald-400 animate-pulse'
              : 'bg-slate-900 hover:bg-slate-800 text-cyan-400 border-slate-800'
          }`}
          title={isListening ? 'Stop recording voice' : 'Start voice input'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isListening ? 'Listening to voice...' : 'Ask LiteRT agent or give instructions...'}
          disabled={isStreaming}
          className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500/80 disabled:opacity-60 placeholder:text-slate-500"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || isStreaming}
          className="w-9 h-9 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-slate-950 disabled:text-slate-600 flex items-center justify-center font-bold transition-all flex-shrink-0 shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
