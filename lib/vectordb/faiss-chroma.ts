import { VectorDocument, VectorSearchResult, ChromaCollection } from '../litert/types';

const VECTOR_DB_NAME = 'Offline_FAISS_ChromaDB_v1';
const DB_VERSION = 1;

// Seed documents for the offline vector database
const SEED_DOCUMENTS: Omit<VectorDocument, 'id' | 'embedding' | 'createdAt'>[] = [
  {
    collection: 'system_knowledge',
    title: 'Meta Llama 3.0 & 3.2 Architecture',
    content: 'Llama 3 uses a standard dense autoregressive Transformer decoder with grouped-query attention (GQA), rotary positional embeddings (RoPE), and an expanded 128k token vocabulary. On-device 4-bit quantization (Q4_K_M) enables execution in under 2GB VRAM.',
    metadata: { source: 'meta-ai-llama-spec', category: 'architecture', params: '3B' }
  },
  {
    collection: 'system_knowledge',
    title: 'Mistral 7B & Sliding Window Attention',
    content: 'Mistral 7B incorporates Sliding Window Attention (SWA) with cache size of 4096 tokens, reducing KV-cache memory consumption by 2x while maintaining high context retrieval fidelity across long documents.',
    metadata: { source: 'mistral-ai-whitepaper', category: 'attention', params: '7B' }
  },
  {
    collection: 'system_knowledge',
    title: 'LoRA (Low-Rank Adaptation) Mathematical Formulation',
    content: 'LoRA freezes pretrained weights W0 (d x k) and injects trainable rank decomposition matrices: W = W0 + Delta W, where Delta W = B x A (B in d x r, A in r x k) with rank r << min(d, k). Reduces trainable parameters by 99.8%.',
    metadata: { source: 'hu-et-al-lora-2021', category: 'fine-tuning', rank: 'r=8/16' }
  },
  {
    collection: 'system_knowledge',
    title: 'Whisper Offline ASR & Mel-Spectrogram Processing',
    content: 'Whisper transforms 16kHz audio into 80-channel log-magnitude Mel-spectrograms with 25ms windows and 10ms hops. An encoder-decoder Transformer processes audio representations into subword byte-pair encoded tokens without internet latency.',
    metadata: { source: 'openai-whisper-spec', category: 'speech-to-text', sampling: '16kHz' }
  },
  {
    collection: 'system_knowledge',
    title: 'Piper TTS High-Speed Offline Voice Synthesis',
    content: 'Piper is a fast, local neural text-to-speech engine based on VITS (Variational Inference for Text-to-Speech) with monotonic alignment search (MAS). Generates 22.05kHz waveform chunks with real-time factors below 0.1x on consumer hardware.',
    metadata: { source: 'rhasspy-piper-engine', category: 'text-to-speech', latency: '<100ms' }
  },
  {
    collection: 'learned_patterns',
    title: 'Client-Side Sandbox Safe Math Evaluation Rule',
    content: 'Always wrap code execution inside pure sandbox functions. For mathematical optimizations, evaluate asymptotic bounds and verify matrix dimensions prior to gradient updates.',
    metadata: { source: 'agent-evolution', confidence: 0.96 }
  }
];

// Offline Vector Embedding Generator (64 dimensions)
export function generateDenseVector(text: string, dim: number = 64): number[] {
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = clean.split(/\s+/).filter(t => t.length > 1);
  const vec = new Array(dim).fill(0);

  if (tokens.length === 0) return vec;

  tokens.forEach((token, pos) => {
    // Generate two distinct hashes per token to distribute dense energy
    let h1 = 5381;
    let h2 = 0;
    for (let i = 0; i < token.length; i++) {
      const code = token.charCodeAt(i);
      h1 = ((h1 << 5) + h1) ^ code;
      h2 = (h2 * 33) ^ code;
    }

    const idx1 = Math.abs(h1) % dim;
    const idx2 = Math.abs(h2) % dim;

    // Position & length weighting
    const weight = 1 + Math.log(token.length);
    vec[idx1] += weight;
    vec[idx2] += weight * 0.5;
  });

  // L2 Normalization
  let sumSq = 0;
  for (let i = 0; i < dim; i++) {
    sumSq += vec[i] * vec[i];
  }
  const norm = Math.sqrt(sumSq);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) {
      vec[i] /= norm;
    }
  }

  return vec;
}

// Distance Functions
export function computeEuclideanL2(a: number[], b: number[]): number {
  if (a.length !== b.length) return 999;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export function computeCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return Math.max(0, Math.min(1, dot));
}

export class OfflineVectorDatabase {
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private inMemoryDocs: VectorDocument[] = [];

  public async init(): Promise<void> {
    if (this.isInitialized && this.db) return;

    if (typeof window === 'undefined' || !window.indexedDB) {
      return;
    }

    return new Promise((resolve) => {
      const req = indexedDB.open(VECTOR_DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('collection', 'collection', { unique: false });
        }
        if (!db.objectStoreNames.contains('collections')) {
          db.createObjectStore('collections', { keyPath: 'name' });
        }
      };

      req.onsuccess = async (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        this.isInitialized = true;
        await this.seedDefaultsIfEmpty();
        await this.loadIntoMemoryCache();
        resolve();
      };

      req.onerror = () => {
        console.warn('FAISS/ChromaDB IndexedDB fallback to memory');
        resolve();
      };
    });
  }

  private async seedDefaultsIfEmpty(): Promise<void> {
    const count = await this.getDocumentCount();
    if (count === 0) {
      for (const item of SEED_DOCUMENTS) {
        const doc: VectorDocument = {
          id: `vec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          collection: item.collection,
          title: item.title,
          content: item.content,
          embedding: generateDenseVector(`${item.title} ${item.content}`),
          metadata: item.metadata,
          createdAt: Date.now()
        };
        await this.addDocument(doc);
      }
    }
  }

  private async loadIntoMemoryCache(): Promise<void> {
    const all = await this.getAllDocuments();
    this.inMemoryDocs = all;
  }

  public async getCollections(): Promise<ChromaCollection[]> {
    const docs = await this.getAllDocuments();
    const map: Record<string, number> = {};

    docs.forEach(d => {
      map[d.collection] = (map[d.collection] || 0) + 1;
    });

    const defaults: ChromaCollection[] = [
      {
        name: 'system_knowledge',
        description: 'Llama 3, Mistral, LoRA, and local runtime architecture specs',
        documentCount: map['system_knowledge'] || 0,
        dimension: 64,
        metric: 'cosine'
      },
      {
        name: 'agent_interactions',
        description: 'Logged dialogues, user feedback ratings, and self-learning trajectories',
        documentCount: map['agent_interactions'] || 0,
        dimension: 64,
        metric: 'cosine'
      },
      {
        name: 'custom_documents',
        description: 'Locally indexed notes, files, and user knowledge bases',
        documentCount: map['custom_documents'] || 0,
        dimension: 64,
        metric: 'l2'
      },
      {
        name: 'learned_patterns',
        description: 'Synthesized heuristics and verified algorithmic theorems',
        documentCount: map['learned_patterns'] || 0,
        dimension: 64,
        metric: 'cosine'
      }
    ];

    return defaults;
  }

  public async addDocument(doc: VectorDocument): Promise<void> {
    if (!doc.embedding || doc.embedding.length === 0) {
      doc.embedding = generateDenseVector(`${doc.title} ${doc.content}`);
    }

    this.inMemoryDocs.push(doc);

    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction('documents', 'readwrite');
        const store = tx.objectStore('documents');
        store.put(doc);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async getAllDocuments(collectionName?: string): Promise<VectorDocument[]> {
    if (!this.db) return this.inMemoryDocs;

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction('documents', 'readonly');
        const store = tx.objectStore('documents');
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result || []) as VectorDocument[];
          if (collectionName) {
            resolve(list.filter(d => d.collection === collectionName));
          } else {
            resolve(list);
          }
        };
        req.onerror = () => resolve(this.inMemoryDocs);
      } catch {
        resolve(this.inMemoryDocs);
      }
    });
  }

  public async getDocumentCount(): Promise<number> {
    const all = await this.getAllDocuments();
    return all.length;
  }

  /**
   * FAISS-style Vector Search with Exact IndexFlatIP / IndexFlatL2
   */
  public async query(
    queryText: string,
    options: {
      topK?: number;
      collection?: string;
      metric?: 'cosine' | 'l2';
    } = {}
  ): Promise<VectorSearchResult[]> {
    const topK = options.topK || 4;
    const metric = options.metric || 'cosine';
    const queryVec = generateDenseVector(queryText);

    let docs = this.inMemoryDocs;
    if (docs.length === 0) {
      docs = await this.getAllDocuments();
    }

    if (options.collection) {
      docs = docs.filter(d => d.collection === options.collection);
    }

    const scored: VectorSearchResult[] = docs.map((doc) => {
      const docVec = doc.embedding || generateDenseVector(`${doc.title} ${doc.content}`);
      if (metric === 'l2') {
        const l2Dist = computeEuclideanL2(queryVec, docVec);
        const similarity = Math.max(0, 1 - (l2Dist / 2));
        return { document: doc, distance: l2Dist, similarity };
      } else {
        const cosSim = computeCosineSimilarity(queryVec, docVec);
        const distance = 1 - cosSim;
        return { document: doc, distance, similarity: cosSim };
      }
    });

    // Sort by highest similarity
    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, topK);
  }

  public async deleteDocument(id: string): Promise<void> {
    this.inMemoryDocs = this.inMemoryDocs.filter(d => d.id !== id);
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction('documents', 'readwrite');
        const store = tx.objectStore('documents');
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
}

export const offlineVectorDB = new OfflineVectorDatabase();
