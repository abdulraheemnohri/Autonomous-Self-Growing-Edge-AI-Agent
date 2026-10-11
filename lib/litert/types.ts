export type HardwareBackend = 'webgpu' | 'wasm_simd' | 'webnn';

export interface LiteRTModelConfig {
  id: string;
  name: string;
  family: 'gemma' | 'smollm' | 'phi' | 'llama' | 'mistral' | 'qwen' | 'deepseek';
  parameterCount: string;
  quantization: 'int4' | 'int8' | 'fp16' | 'q4_k_m';
  contextWindow: number;
  weightSizeBytes: number; // in bytes
  description: string;
  isCachedLocally: boolean;
  recommendedBackend: HardwareBackend;
  communityRepo?: string; // e.g. litert-community/Gemma-2-2B-IT-LiteRT
  huggingFaceUrl?: string;
  downloadStatus?: 'not_downloaded' | 'downloading' | 'cached_offline' | 'active';
}

export interface EngineTelemetry {
  tokensPerSecond: number;
  timeToFirstTokenMs: number;
  totalTokensGenerated: number;
  activeContextTokens: number;
  maxContextTokens: number;
  kvCacheUtilizationPct: number;
  memoryUsageMb: number;
  hardwareBackend: HardwareBackend;
  isOfflineMode: boolean;
  modelLoaded: string;
  inferenceStatus: 'idle' | 'compiling' | 'thinking' | 'streaming' | 'executing_tool' | 'reflecting' | 'evolving';
  growthLevel: number;
  growthXp: number;
  activeSkill?: string;
  autonomyScore: number;
  vectorDbHits?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thought?: string;
  toolCalls?: ToolCallRecord[];
  timestamp: number;
  model: string;
  isOffline: boolean;
  tokensGenerated?: number;
  latencyMs?: number;
  feedback?: 'positive' | 'negative';
  userCorrection?: string;
  learnedInsight?: string;
  learnedFactsCount?: number;
  skillTriggered?: string;
  vectorCitations?: string[];
}

export interface ToolCallRecord {
  id: string;
  toolName: string;
  input: Record<string, any>;
  output: Record<string, any> | string;
  status: 'pending' | 'success' | 'error';
  executionTimeMs: number;
  reflection?: string;
}

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  stepIndex: number;
  toolRequired?: string;
  result?: string;
}

export interface AutonomousMission {
  id: string;
  goal: string;
  status: 'idle' | 'decomposing' | 'running' | 'paused' | 'completed' | 'failed';
  tasks: AgentTask[];
  currentTaskIndex: number;
  stepsExecuted: number;
  maxSteps: number;
  history: ToolCallRecord[];
  learnedSummary?: string;
  startTime?: number;
  endTime?: number;
}

// -------------------------------------------------------------
// Autonomous Self-Learning & Growing Engine Types
// -------------------------------------------------------------
export interface MemoryNode {
  id: string;
  type: 'concept' | 'rule' | 'episodic' | 'user_preference' | 'synthesized_fact';
  title: string;
  content: string;
  importance: number;
  reinforcementScore: number;
  timestamp: number;
  tags: string[];
  embeddingVector?: number[];
  source?: 'dialogue' | 'mission' | 'reflection' | 'manual';
}

export interface LearnedRule {
  id: string;
  rule: string;
  rationale: string;
  confidence: number;
  timesApplied: number;
  createdFromTaskId?: string;
  isActive: boolean;
  timestamp: number;
}

export interface AutonomousSkill {
  id: string;
  name: string;
  category: 'linux_terminal' | 'system_diagnostics' | 'reasoning' | 'knowledge_extraction' | 'voice_control' | 'offline_compute';
  description: string;
  triggerPhrases: string[];
  codeTemplate: string;
  language: 'bash' | 'python' | 'javascript';
  timesUsed: number;
  successRate: number;
  isAutoSynthesized: boolean;
  createdAt: number;
}

export interface GrowthEvent {
  id: string;
  type: 'fact_extracted' | 'skill_synthesized' | 'rule_formulated' | 'memory_consolidated' | 'level_up' | 'feedback_reinforced';
  title: string;
  detail: string;
  xpEarned: number;
  timestamp: number;
}

export interface GrowthStats {
  level: number;
  title: string;
  xp: number;
  xpToNextLevel: number;
  synapsesGrown: number;
  totalMemories: number;
  activeRules: number;
  skillsMastered: number;
  autonomyScore: number; // 0 to 100
  recentEvents: GrowthEvent[];
}

export interface ExperienceReplayItem {
  id: string;
  prompt: string;
  agentResponse: string;
  userCorrection?: string;
  reward: number;
  timestamp: number;
  lossDelta: number;
}

// -------------------------------------------------------------
// Offline Vector Database Types (ChromaDB / FAISS Architecture)
// -------------------------------------------------------------
export interface VectorDocument {
  id: string;
  collection: string;
  title: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
  createdAt: number;
}

export interface VectorSearchResult {
  document: VectorDocument;
  distance: number;
  similarity: number;
}

export interface ChromaCollection {
  name: string;
  description: string;
  documentCount: number;
  dimension: number;
  metric: 'cosine' | 'l2';
}

// -------------------------------------------------------------
// Offline Voice Engine Models (Whisper STT & Piper/Kokoro TTS)
// -------------------------------------------------------------
export interface PiperVoiceProfile {
  id: string;
  name: string;
  language: string;
  gender: 'female' | 'male';
  quality: 'high' | 'medium' | 'low';
  sampleRate: number;
  latencyEstimateMs: number;
}

export interface VoiceModelItem {
  id: string;
  name: string;
  type: 'stt' | 'tts' | 'vad';
  engine: 'whisper' | 'piper' | 'silero' | 'kokoro' | 'sherpa';
  fileSizeMb: number;
  downloadStatus: 'not_downloaded' | 'downloading' | 'cached_offline' | 'active';
  downloadProgress: number;
  samplePhrase: string;
  language: string;
  description: string;
  sampleRateKhz: number;
  parameters: string;
}

// -------------------------------------------------------------
// Hugging Face Model Hub & litert-community Types
// -------------------------------------------------------------
export interface HuggingFaceModelItem {
  id: string;
  name: string;
  repo: string;
  author: string;
  downloads: string;
  likes: string;
  format: 'LiteRT' | 'GGUF' | 'ONNX' | 'WebGPU';
  quantization: string;
  fileSizeMb: number;
  downloadStatus: 'not_downloaded' | 'downloading' | 'cached_offline' | 'active';
  downloadProgress: number;
  downloadSpeedMbS?: number;
  tags: string[];
  description: string;
  isLiteRTCommunity?: boolean;
}

// -------------------------------------------------------------
// Comprehensive Mobile Offline Settings Types
// -------------------------------------------------------------
export interface GrowthSettings {
  growthMode: 'passive' | 'adaptive' | 'hyper_autonomous';
  continuousFactExtraction: boolean;
  skillAutoSynthesisThreshold: 'conservative' | 'balanced' | 'aggressive';
  growthTickIntervalSec: number;
  proactiveSuggestions: boolean;
  autoConsolidateMemories: boolean;
}

export interface AppSettings {
  inference: {
    temperature: number;
    topP: number;
    repetitionPenalty: number;
    contextLimit: number;
    backend: HardwareBackend;
    threadCount: number;
  };
  voice: {
    whisperSensitivity: number;
    vadSilenceMs: number;
    piperVoice: string;
    speechRate: number;
    speechPitch: number;
    autoInterruption: boolean;
    activeSttModel: string;
  };
  growth: GrowthSettings;
  display: {
    frameMode: 'mobile_bezel' | 'responsive';
    deviceSkin: 'iphone' | 'pixel';
    theme: 'oled_dark' | 'titanium';
    hapticFeedback: boolean;
  };
}
