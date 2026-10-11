'use client';

import React, { useState, useEffect } from 'react';
import { Database, Search, Plus, Trash2, Eye, FileText, CheckCircle2, ShieldCheck, Layers, Hash } from 'lucide-react';
import { VectorDocument, VectorSearchResult, ChromaCollection } from '../lib/litert/types';
import { offlineVectorDB, generateDenseVector } from '../lib/vectordb/faiss-chroma';
import { ClientDate } from './ClientDateTime';

export const VectorDbStudio: React.FC = () => {
  const [collections, setCollections] = useState<ChromaCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('system_knowledge');
  const [documents, setDocuments] = useState<VectorDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VectorSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [metric, setMetric] = useState<'cosine' | 'l2'>('cosine');

  // Add document modal/form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [inspectDoc, setInspectDoc] = useState<VectorDocument | null>(null);

  const loadData = async () => {
    await offlineVectorDB.init();
    const cols = await offlineVectorDB.getCollections();
    const docs = await offlineVectorDB.getAllDocuments();
    setCollections(cols);
    setDocuments(docs);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await offlineVectorDB.init();
      const cols = await offlineVectorDB.getCollections();
      const docs = await offlineVectorDB.getAllDocuments();
      if (mounted) {
        setCollections(cols);
        setDocuments(docs);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await offlineVectorDB.query(searchQuery, {
        topK: 4,
        collection: selectedCollection === 'all' ? undefined : selectedCollection,
        metric
      });
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const doc: VectorDocument = {
      id: `doc_${Date.now()}`,
      collection: selectedCollection === 'all' ? 'custom_documents' : selectedCollection,
      title: newTitle.trim(),
      content: newContent.trim(),
      embedding: generateDenseVector(`${newTitle} ${newContent}`),
      metadata: { source: 'user-input', ingestedAt: new Date().toISOString() },
      createdAt: Date.now()
    };

    await offlineVectorDB.addDocument(doc);
    setNewTitle('');
    setNewContent('');
    setShowAddForm(false);
    await loadData();
  };

  const handleDelete = async (id: string) => {
    await offlineVectorDB.deleteDocument(id);
    await loadData();
  };

  const filteredDocs = selectedCollection === 'all'
    ? documents
    : documents.filter(d => d.collection === selectedCollection);

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto font-sans">
      {/* Top Banner */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-200">Offline Vector Database (ChromaDB & FAISS)</h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Cloud Network Dependencies</span>
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          All document embeddings, collections, and nearest-neighbor vector searches (IndexFlatIP Cosine & IndexFlatL2) execute 100% locally in IndexedDB without external API calls.
        </p>

        {/* Collections Selector Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {collections.map((col) => (
            <button
              key={col.name}
              onClick={() => setSelectedCollection(col.name)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedCollection === col.name
                  ? 'bg-cyan-950/40 border-cyan-500/80 text-cyan-200 shadow-sm shadow-cyan-950'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs truncate">{col.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                  {col.documentCount}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 mb-1">
                {col.description}
              </p>
              <div className="text-[10px] font-mono text-slate-500">
                {col.dimension}-dim · {col.metric.toUpperCase()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Semantic Search Tester & Ingestion Bar */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>FAISS Semantic Vector Query Tester</span>
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs font-mono">
              <span className="text-slate-500 text-[10px] mr-1.5">Metric:</span>
              <button
                onClick={() => setMetric('cosine')}
                className={`px-1.5 py-0.5 rounded text-[10px] ${metric === 'cosine' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400'}`}
              >
                Cosine
              </button>
              <button
                onClick={() => setMetric('l2')}
                className={`px-1.5 py-0.5 rounded text-[10px] ${metric === 'l2' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400'}`}
              >
                Euclidean L2
              </button>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingest Document</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type query to compute embedding and search nearest vector neighbors (e.g., 'How does sliding window attention work?')..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!searchQuery.trim() || isSearching}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1 border border-slate-700"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Vectors</span>
          </button>
        </form>

        {/* Live Search Results */}
        {searchResults.length > 0 && (
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg mb-3 space-y-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-semibold">
              Top Nearest Neighbors Retrieved from FAISS Index:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {searchResults.map((res, idx) => (
                <div key={idx} className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">{res.document.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                      Sim: {(res.similarity * 100).toFixed(1)}% ({res.distance.toFixed(3)})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {res.document.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Document Inline Form */}
        {showAddForm && (
          <form onSubmit={handleAddDocument} className="p-3 bg-slate-950 rounded-lg border border-cyan-900/60 mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-400">+ Ingest New Document to Vector DB</span>
              <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-500 hover:text-slate-300 text-xs">
                ✕
              </button>
            </div>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Document title (e.g., 'Custom System Prompt Guidelines')..."
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
              placeholder="Paste content or notes to generate 64-dim embedding vector offline..."
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                disabled={!newTitle.trim() || !newContent.trim()}
                className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs"
              >
                Embed & Save
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Indexed Documents Table / Cards */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-200">
            Indexed Documents in <span className="text-cyan-400 font-mono">[{selectedCollection}]</span> ({filteredDocs.length})
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            Persistent in IndexedDB
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors text-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                    {doc.collection}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setInspectDoc(doc)}
                      className="text-slate-500 hover:text-cyan-400 p-1"
                      title="Inspect dense embedding array"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h4 className="font-semibold text-slate-200 text-xs mb-1">{doc.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                  {doc.content}
                </p>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>{doc.embedding?.length || 64}-dim vector</span>
                <ClientDate timestamp={doc.createdAt} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Embedding Inspector Modal */}
      {inspectDoc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl max-w-xl w-full p-4 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <span className="text-cyan-400 font-semibold">FAISS Dense Embedding Vector</span>
              <button onClick={() => setInspectDoc(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="mb-2 text-slate-300 font-sans font-semibold">{inspectDoc.title}</div>
            <div className="text-[11px] text-slate-400 mb-3 max-h-24 overflow-y-auto bg-slate-950 p-2 rounded">
              {inspectDoc.content}
            </div>
            <span className="text-[10px] text-slate-500 block mb-1">
              64-Dimensional L2 Normalized Float32 Array:
            </span>
            <div className="max-h-40 overflow-y-auto bg-slate-950 p-2.5 rounded border border-slate-800 text-[10px] text-cyan-300/80 break-words leading-relaxed">
              [{inspectDoc.embedding?.map(v => v.toFixed(4)).join(', ')}]
            </div>
            <div className="flex justify-end mt-3">
              <button
                onClick={() => setInspectDoc(null)}
                className="px-3 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
