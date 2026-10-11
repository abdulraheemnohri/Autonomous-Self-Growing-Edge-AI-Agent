import { MemoryNode, LearnedRule, ExperienceReplayItem } from '../litert/types';

const DB_NAME = 'LiteRT_Agent_OfflineDB_v1';
const DB_VERSION = 1;

// Seed memories so the offline agent starts with rich baseline knowledge
const DEFAULT_INITIAL_MEMORIES: MemoryNode[] = [
  {
    id: 'mem_seed_1',
    type: 'concept',
    title: 'LiteRT-LM On-Device Acceleration',
    content: 'Google LiteRT (formerly TensorFlow Lite) optimizes Large Language Models like Gemma on edge devices via int4 quantization, KV-cache caching, and WebGPU compute shaders with zero internet dependence.',
    importance: 0.95,
    reinforcementScore: 12,
    timestamp: Date.now() - 86400000 * 3,
    tags: ['litert', 'edge-ai', 'quantization', 'offline']
  },
  {
    id: 'mem_seed_2',
    type: 'rule',
    title: 'ReAct Autonomous Cycle Integrity',
    content: 'When decomposing multi-step goals, strictly separate Perception (Observation) from Execution (Action). Validate tool execution status before marking subtasks as completed.',
    importance: 0.9,
    reinforcementScore: 8,
    timestamp: Date.now() - 86400000 * 2,
    tags: ['react', 'autonomous', 'planning', 'tools']
  },
  {
    id: 'mem_seed_3',
    type: 'concept',
    title: 'In-Browser JavaScript Sandbox Safety',
    content: 'Local code execution runs inside an isolated iframe or Function sandbox with window and DOM access guarded, returning console logs, return values, and execution runtime in milliseconds.',
    importance: 0.85,
    reinforcementScore: 6,
    timestamp: Date.now() - 86400000 * 1,
    tags: ['sandbox', 'security', 'execution']
  },
  {
    id: 'mem_seed_4',
    type: 'user_preference',
    title: 'Concise Scientific Communication',
    content: 'User prefers crisp analytical responses with quantitative telemetry, explicit step tracking, and mathematical or code solutions over fluffy pleasantries.',
    importance: 0.8,
    reinforcementScore: 9,
    timestamp: Date.now() - 3600000 * 12,
    tags: ['preference', 'tone', 'telemetry']
  }
];

const DEFAULT_INITIAL_RULES: LearnedRule[] = [
  {
    id: 'rule_1',
    rule: 'Prioritize local sandbox computation for mathematical or data verification rather than hallucinating estimates.',
    rationale: 'Observed 100% precision improvement when calculating statistical metrics through code sandbox.',
    confidence: 0.96,
    timesApplied: 14,
    isActive: true,
    timestamp: Date.now() - 86400000 * 2
  },
  {
    id: 'rule_2',
    rule: 'Synthesize voice chat responses concisely (under 3 sentences) when spoken output is active to reduce auditory fatigue.',
    rationale: 'Real-time voice streaming delivers better conversational cadence when speech chunks are compact.',
    confidence: 0.92,
    timesApplied: 19,
    isActive: true,
    timestamp: Date.now() - 86400000 * 1
  },
  {
    id: 'rule_3',
    rule: 'Store newly discovered algorithmic insights into episodic memory immediately after a successful task run.',
    rationale: 'Enables continuous edge self-learning across autonomous agent execution sessions.',
    confidence: 0.89,
    timesApplied: 7,
    isActive: true,
    timestamp: Date.now() - 3600000 * 4
  }
];

// Offline Local Vector Generation (TF-IDF + Hashing Trick Embedding Vector)
export function computeLocalEmbedding(text: string, dimensions: number = 64): number[] {
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = clean.split(/\s+/).filter(w => w.length > 2);
  const vector = new Array(dimensions).fill(0);

  if (words.length === 0) return vector;

  // Simple deterministic hash mapping with word length weighting
  words.forEach((word) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % dimensions;
    vector[index] += 1;
  });

  // Normalize L2 norm
  let sumSq = 0;
  for (let i = 0; i < dimensions; i++) {
    sumSq += vector[i] * vector[i];
  }
  const norm = Math.sqrt(sumSq);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return Math.max(0, Math.min(1, dot));
}

class MemoryStore {
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  public async init(): Promise<void> {
    if (this.isInitialized && this.db) return;

    if (typeof window === 'undefined' || !window.indexedDB) {
      // Server-side fallback or SSR
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.warn('LiteRT Agent IndexedDB init failed, using in-memory store');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('memories')) {
          const memStore = db.createObjectStore('memories', { keyPath: 'id' });
          memStore.createIndex('type', 'type', { unique: false });
          memStore.createIndex('importance', 'importance', { unique: false });
        }
        if (!db.objectStoreNames.contains('learned_rules')) {
          db.createObjectStore('learned_rules', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('replay_buffer')) {
          db.createObjectStore('replay_buffer', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('runtime_cache')) {
          db.createObjectStore('runtime_cache', { keyPath: 'key' });
        }
      };

      request.onsuccess = async (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.isInitialized = true;
        await this.seedDefaultsIfEmpty();
        resolve();
      };
    });
  }

  private async seedDefaultsIfEmpty(): Promise<void> {
    const existing = await this.getAllMemories();
    if (existing.length === 0) {
      for (const mem of DEFAULT_INITIAL_MEMORIES) {
        mem.embeddingVector = computeLocalEmbedding(`${mem.title} ${mem.content} ${mem.tags.join(' ')}`);
        await this.saveMemory(mem);
      }
    }
    const existingRules = await this.getAllRules();
    if (existingRules.length === 0) {
      for (const rule of DEFAULT_INITIAL_RULES) {
        await this.saveRule(rule);
      }
    }
  }

  public async getAllMemories(): Promise<MemoryNode[]> {
    if (!this.db) return DEFAULT_INITIAL_MEMORIES;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction('memories', 'readonly');
        const store = tx.objectStore('memories');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(DEFAULT_INITIAL_MEMORIES);
      } catch {
        resolve(DEFAULT_INITIAL_MEMORIES);
      }
    });
  }

  public async saveMemory(memory: MemoryNode): Promise<void> {
    if (!memory.embeddingVector) {
      memory.embeddingVector = computeLocalEmbedding(`${memory.title} ${memory.content} ${memory.tags.join(' ')}`);
    }
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction('memories', 'readwrite');
        const store = tx.objectStore('memories');
        store.put(memory);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async deleteMemory(id: string): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction('memories', 'readwrite');
        const store = tx.objectStore('memories');
        store.delete(id);
        tx.oncomplete = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async searchMemories(query: string, limit: number = 3): Promise<{ memory: MemoryNode; score: number }[]> {
    const memories = await this.getAllMemories();
    const queryVec = computeLocalEmbedding(query);

    const scored = memories.map((mem) => {
      const vec = mem.embeddingVector || computeLocalEmbedding(`${mem.title} ${mem.content}`);
      const cosSim = cosineSimilarity(queryVec, vec);
      // Combine cosine similarity with memory importance
      const finalScore = cosSim * 0.7 + (mem.importance * 0.3);
      return { memory: mem, score: finalScore };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }

  public async getAllRules(): Promise<LearnedRule[]> {
    if (!this.db) return DEFAULT_INITIAL_RULES;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction('learned_rules', 'readonly');
        const store = tx.objectStore('learned_rules');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(DEFAULT_INITIAL_RULES);
      } catch {
        resolve(DEFAULT_INITIAL_RULES);
      }
    });
  }

  public async saveRule(rule: LearnedRule): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction('learned_rules', 'readwrite');
        const store = tx.objectStore('learned_rules');
        store.put(rule);
        tx.oncomplete = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async toggleRule(ruleId: string): Promise<void> {
    const rules = await this.getAllRules();
    const target = rules.find(r => r.id === ruleId);
    if (target) {
      target.isActive = !target.isActive;
      await this.saveRule(target);
    }
  }

  public async addExperienceReplay(item: ExperienceReplayItem): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction('replay_buffer', 'readwrite');
        const store = tx.objectStore('replay_buffer');
        store.put(item);
        tx.oncomplete = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async getReplayBuffer(): Promise<ExperienceReplayItem[]> {
    if (!this.db) return [];
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction('replay_buffer', 'readonly');
        const store = tx.objectStore('replay_buffer');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  public async resetAll(): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(['memories', 'learned_rules', 'replay_buffer'], 'readwrite');
        tx.objectStore('memories').clear();
        tx.objectStore('learned_rules').clear();
        tx.objectStore('replay_buffer').clear();
        tx.oncomplete = async () => {
          await this.seedDefaultsIfEmpty();
          resolve();
        };
      } catch {
        resolve();
      }
    });
  }
}

export const memoryStore = new MemoryStore();
