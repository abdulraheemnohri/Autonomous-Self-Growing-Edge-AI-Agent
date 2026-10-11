# LiteRT-LM JavaScript & TypeScript API Reference

## Introduction

The LiteRT-LM JavaScript API provides robust primitives for running large language models entirely on-device in browser environments using WebGPU and WebAssembly.

---

## Installation

```bash
npm install @litert-lm/core
```

Or via CDN (ES Module):

```js
import { Engine } from 'https://cdn.jsdelivr.net/npm/@litert-lm/core/+esm';
```

---

## Core API Reference

### `Engine.create(settings)`

Initializes the LLM inference engine. Returns a promise resolving to an `Engine` instance.

#### Parameters
- `settings` (`EngineSettings`):
  - `model` (`string | Blob | File | ReadableStream<Uint8Array>`): Model source URL or blob.
  - `mainExecutorSettings` (`object`):
    - `maxNumTokens` (`number`): Maximum context length (e.g., `8192`, `16384`).
    - `temperature` (`number`): Sampling temperature (default: `0.7`).

#### Example

```ts
import { Engine, EngineSettings } from '@litert-lm/core';

const settings: EngineSettings = {
  model: 'https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it-gpu.litertlm',
  mainExecutorSettings: {
    maxNumTokens: 8192,
  }
};

const engine = await Engine.create(settings);
```

---

### `engine.createConversation()`

Creates an active multi-turn chat session bound to the engine instance.

#### Example

```ts
const chat = await engine.createConversation();
```

---

### `chat.sendMessageStreaming(prompt)`

Sends a prompt to the conversation and returns an async generator streaming token chunks.

#### Example

```ts
for await (const chunk of chat.sendMessageStreaming("Explain quantum computing in 3 sentences.")) {
  process.stdout.write(chunk.content[0].text);
}
```

---

### `engine.delete()`

Releases all GPU buffers, WebAssembly memory, and OPFS file locks associated with the model.

```ts
await engine.delete();
```
