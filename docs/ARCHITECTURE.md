# Architecture & Design Specifications

## Overview

The **Autonomous Self-Growing Edge AI Agent & LiteRT Runtime** is an enterprise-grade, offline-first, browser-native and server-backed AI execution environment. It leverages **Google LiteRT-LM** (via WebAssembly and WebGPU) to run frontier open weights models (`gemma-4-E2B-it-web.litertlm`, `gemma-4-E4B-it-gpu.litertlm`, etc.) directly in the client browser with near-native hardware acceleration.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                        Client UI                       │
│  (Next.js App Router, Tailwind CSS, Recharts, Lucide)  │
└───────────┬────────────────────────────────┬───────────┘
            │                                │
            ▼                                ▼
┌───────────────────────┐        ┌───────────────────────┐
│   LiteRT-LM Engine    │        │ Autonomous ReAct Loop │
│  (WebGPU / Wasm SIMD) │        │ (Goal Decomposition)  │
└───────────┬───────────┘        └───────────┬───────────┘
            │                                │
            ▼                                ▼
┌───────────────────────┐        ┌───────────────────────┤
│ OPFS & IndexedDB Cache│        │ Cognitive Memory Graph│
│  (.litertlm weights)  │        │ (Learned Facts & XP)  │
└───────────────────────┘        └───────────────────────┘
```

### 1. Client-Side Inference Runtime (`@litert-lm/core` & MediaPipe Compatibility)
- **WebGPU Execution**: Direct GPU shader compilation for high-throughput token generation.
- **OPFS Caching**: Origin Private File System caching of large multi-gigabyte `.litertlm` model weights to prevent redundant network downloads across sessions.
- **Model Management System**: Live Hugging Face registry supporting Gemma 4 (E2B, E4B, 12B, 26B, 31B) with SHA-256 integrity verification.

### 2. Autonomous Agent & ReAct Engine
- **Goal Decomposition**: Breaks high-level user directives into sequential subtasks.
- **Deep Thought Trace**: Captures complete chain-of-thought buffers, tool calls, observation logs, and self-reflection metrics.
- **Cognitive Memory Graph**: Persistent semantic storage tracking atomic knowledge extraction, XP accumulation, and level milestones (Level 10, 25, 50).

### 3. Settings & OTA Firmware Updater
- **Manifest Versioning**: Automated check for firmware and model manifest updates (`v4.8.2-edge-release` to `v4.9.0-litert-lm-stable`).
- **Telemetry-Free Security**: Air-gapped execution ensuring 100% data privacy.
