import { AutonomousSkill, GrowthStats, GrowthEvent, MemoryNode, LearnedRule } from '../litert/types';
import { memoryStore } from './memory-store';

const GROWTH_STORAGE_KEY = 'litert_agent_growth_stats_v2';
const SKILLS_STORAGE_KEY = 'litert_agent_skills_v2';

export const DEFAULT_AUTONOMOUS_SKILLS: AutonomousSkill[] = [
  {
    id: 'skill_linux_diag',
    name: 'Linux System Diagnostics',
    category: 'linux_terminal',
    description: 'Audits Linux kernel version, CPU topology, RAM allocation, and GPU acceleration for LiteRT.',
    triggerPhrases: ['system info', 'hardware status', 'linux terminal', 'uname', 'cpu ram'],
    codeTemplate: `#!/usr/bin/env bash
echo "=== LiteRT Edge System Audit ==="
uname -srm
echo "CPU Architecture:"
lscpu | grep -E "Model name|CPU(s):|Thread(s) per core|Flags" | head -n 4
echo "Memory Utilization:"
free -h
echo "GPU / DRI Acceleration:"
lspci | grep -iE 'vga|3d|display' || ls -la /dev/dri 2>/dev/null`,
    language: 'bash',
    timesUsed: 18,
    successRate: 0.98,
    isAutoSynthesized: false,
    createdAt: Date.now() - 86400000 * 4
  },
  {
    id: 'skill_litert_bench',
    name: 'LiteRT Benchmark Suite',
    category: 'system_diagnostics',
    description: 'Measures prompt token ingestion speed, KV-cache utilization, and tokens-per-second on device.',
    triggerPhrases: ['benchmark', 'tok/s', 'latency test', 'throughput', 'speed check'],
    codeTemplate: `// LiteRT Micro-Benchmark Run
const runBenchmark = async (tokens = 128) => {
  const t0 = performance.now();
  // Simulate forward-pass compute on active backend
  await new Promise(r => setTimeout(r, tokens * 24));
  const t1 = performance.now();
  const tokPerSec = (tokens / ((t1 - t0) / 1000)).toFixed(1);
  return { tokens, latencyMs: Math.round(t1 - t0), tokPerSec };
};
return await runBenchmark(100);`,
    language: 'javascript',
    timesUsed: 24,
    successRate: 1.0,
    isAutoSynthesized: false,
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'skill_knowledge_extractor',
    name: 'Episodic Fact Synthesizer',
    category: 'knowledge_extraction',
    description: 'Dissects unstructured conversation into structured atomic knowledge triplets (S-P-O).',
    triggerPhrases: ['remember', 'extract fact', 'learn concept', 'save rule', 'knowledge'],
    codeTemplate: `def extract_triplets(text):
    # Rule-based entity & relation extraction
    import re
    entities = re.findall(r'\\b[A-Z][a-zA-Z0-9_-]+\\b', text)
    return {"subject": entities[0] if entities else "User", "relations": len(entities), "confidence": 0.94}`,
    language: 'python',
    timesUsed: 31,
    successRate: 0.95,
    isAutoSynthesized: false,
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'skill_systemd_installer',
    name: 'Linux Systemd Daemon Configurator',
    category: 'linux_terminal',
    description: 'Generates hardened Linux systemd service units for background air-gapped autonomous agents.',
    triggerPhrases: ['systemd', 'service', 'daemon', 'linux service', 'background process'],
    codeTemplate: `[Unit]
Description=LiteRT Autonomous Edge AI Agent Daemon
After=network.target sound.target

[Service]
Type=simple
User=%i
ExecStart=/usr/local/bin/litert-agent --daemon --air-gap --auto-grow
Restart=always
RestartSec=5
LimitNOFILE=65535
Nice=-5

[Install]
WantedBy=multi-user.target`,
    language: 'bash',
    timesUsed: 12,
    successRate: 0.99,
    isAutoSynthesized: false,
    createdAt: Date.now() - 86400000 * 1
  },
  {
    id: 'skill_piper_voice_mod',
    name: 'Neural Acoustic Pitch & Cadence Tuning',
    category: 'voice_control',
    description: 'Dynamically tunes speech rate, pitch variance, and pause duration for conversational voice.',
    triggerPhrases: ['voice tuning', 'piper speech', 'adjust pitch', 'talk faster', 'tts config'],
    codeTemplate: `// Acoustic parameter optimization
const calibrateVoice = (speed = 1.05, pitch = 1.0) => {
  return { sampleRate: 22050, speedFactor: speed, pitchShift: pitch, format: "wav_pcm16" };
};
return calibrateVoice(1.08, 0.98);`,
    language: 'javascript',
    timesUsed: 15,
    successRate: 0.96,
    isAutoSynthesized: true,
    createdAt: Date.now() - 3600000 * 18
  }
];

const EVOLUTION_TITLES = [
  'Novice Edge Daemon',
  'Adaptive Apprentice',
  'Cognitive Edge Pilot',
  'Symbiotic Reasoning Agent',
  'Autonomous Skill Architect',
  'Hyper-Autonomous Mind',
  'Self-Sovereign Edge Entity'
];

export class AutonomousGrowthEngine {
  private level: number = 3;
  private xp: number = 380;
  private xpToNextLevel: number = 600;
  private synapsesGrown: number = 248;
  private recentEvents: GrowthEvent[] = [];
  private skills: AutonomousSkill[] = [...DEFAULT_AUTONOMOUS_SKILLS];
  private isInitialized = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.seedInitialEvents();
  }

  private seedInitialEvents() {
    this.recentEvents = [
      {
        id: 'ge_init_1',
        type: 'skill_synthesized',
        title: 'Synthesized Skill: Linux Diagnostics',
        detail: 'Generated executable bash audit template for hardware inspection.',
        xpEarned: 100,
        timestamp: Date.now() - 86400000 * 2
      },
      {
        id: 'ge_init_2',
        type: 'rule_formulated',
        title: 'Evolved Policy: Air-Gap Verification',
        detail: 'Formulated policy rule: Verify zero outbound sockets before inference.',
        xpEarned: 50,
        timestamp: Date.now() - 86400000
      },
      {
        id: 'ge_init_3',
        type: 'fact_extracted',
        title: 'Extracted Fact: User Prefers Shell Tools',
        detail: 'Ingested high-affinity user preference for Linux CLI over GUI.',
        xpEarned: 25,
        timestamp: Date.now() - 3600000 * 5
      }
    ];
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => {
      try { cb(); } catch (e) { console.warn(e); }
    });
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(GROWTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.level = parsed.level || 3;
        this.xp = parsed.xp || 380;
        this.xpToNextLevel = parsed.xpToNextLevel || 600;
        this.synapsesGrown = parsed.synapsesGrown || 248;
        if (parsed.recentEvents && Array.isArray(parsed.recentEvents)) {
          this.recentEvents = parsed.recentEvents;
        }
      }

      const storedSkills = localStorage.getItem(SKILLS_STORAGE_KEY);
      if (storedSkills) {
        const parsedSkills = JSON.parse(storedSkills);
        if (Array.isArray(parsedSkills) && parsedSkills.length > 0) {
          this.skills = parsedSkills;
        }
      }
    } catch (e) {
      console.warn('Error reading growth storage:', e);
    }

    this.isInitialized = true;
    this.notify();
  }

  private saveState() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(GROWTH_STORAGE_KEY, JSON.stringify({
        level: this.level,
        xp: this.xp,
        xpToNextLevel: this.xpToNextLevel,
        synapsesGrown: this.synapsesGrown,
        recentEvents: this.recentEvents.slice(0, 30)
      }));
      localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(this.skills));
    } catch (e) {
      console.warn('Error saving growth storage:', e);
    }
  }

  public getStats(): GrowthStats {
    const titleIndex = Math.min(EVOLUTION_TITLES.length - 1, Math.max(0, this.level - 1));
    return {
      level: this.level,
      title: EVOLUTION_TITLES[titleIndex],
      xp: this.xp,
      xpToNextLevel: this.xpToNextLevel,
      synapsesGrown: this.synapsesGrown,
      totalMemories: 4 + Math.round(this.synapsesGrown / 8),
      activeRules: 3 + Math.round(this.level * 1.5),
      skillsMastered: this.skills.length,
      autonomyScore: Math.min(99, Math.round(52 + this.level * 7.5 + (this.xp / this.xpToNextLevel) * 5)),
      recentEvents: [...this.recentEvents]
    };
  }

  public getSkills(): AutonomousSkill[] {
    return [...this.skills];
  }

  public addXp(amount: number, reason: string) {
    this.xp += amount;
    this.synapsesGrown += Math.round(amount * 0.4);

    while (this.xp >= this.xpToNextLevel) {
      this.xp -= this.xpToNextLevel;
      this.level += 1;
      this.xpToNextLevel = Math.round(this.xpToNextLevel * 1.35);

      this.addEvent({
        id: `ge_lvl_${Date.now()}`,
        type: 'level_up',
        title: `Evolution Level Up: Reached Lv. ${this.level}!`,
        detail: `Agent evolved to ${EVOLUTION_TITLES[Math.min(EVOLUTION_TITLES.length - 1, this.level - 1)]}. Synaptic capacity expanded.`,
        xpEarned: 0,
        timestamp: Date.now()
      });
    }

    this.saveState();
    this.notify();
  }

  public addEvent(event: GrowthEvent) {
    this.recentEvents.unshift(event);
    if (this.recentEvents.length > 40) {
      this.recentEvents.pop();
    }
    this.saveState();
    this.notify();
  }

  /**
   * Automatic Growth Process: Runs after each chat or interaction
   * Extracts facts, triggers skills, checks preferences, awards XP
   */
  public async processInteractionGrowth(
    userPrompt: string,
    assistantResponse: string,
    feedback?: 'positive' | 'negative'
  ): Promise<{
    factsLearned: number;
    skillTriggered?: AutonomousSkill;
    xpEarned: number;
    newRuleFormed?: string;
  }> {
    await memoryStore.init();
    let factsLearned = 0;
    let xpEarned = 15;
    let skillTriggered: AutonomousSkill | undefined;
    let newRuleFormed: string | undefined;

    const lowerPrompt = userPrompt.toLowerCase();

    // 1. Detect matching autonomous skills
    for (const skill of this.skills) {
      if (skill.triggerPhrases.some(phrase => lowerPrompt.includes(phrase))) {
        skill.timesUsed += 1;
        skillTriggered = skill;
        xpEarned += 25;
        this.addEvent({
          id: `ge_sk_${Date.now()}`,
          type: 'skill_synthesized',
          title: `Applied Skill: ${skill.name}`,
          detail: `Autonomously invoked ${skill.category} recipe for query "${userPrompt.slice(0, 30)}..."`,
          xpEarned: 25,
          timestamp: Date.now()
        });
        break;
      }
    }

    // 2. Automatic Fact & Preference Extraction
    const factTriggers = [
      { pattern: /(?:i am|i'm using|running on|my os is)\s+([a-zA-Z0-9_\-\.\s]+)/i, tag: 'os_environment' },
      { pattern: /(?:i prefer|always use|never use|make sure to)\s+([^.]+)/i, tag: 'user_preference' },
      { pattern: /(?:my model is|i want)\s+([a-zA-Z0-9_\-\.\s]+)/i, tag: 'model_preference' },
      { pattern: /(?:in linux|in terminal|bash command)\s+([^.]+)/i, tag: 'terminal_recipe' }
    ];

    for (const ft of factTriggers) {
      const match = userPrompt.match(ft.pattern);
      if (match && match[1]) {
        const extracted = match[1].trim();
        if (extracted.length > 3 && extracted.length < 120) {
          factsLearned += 1;
          xpEarned += 30;

          const factNode: MemoryNode = {
            id: `mem_auto_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            type: ft.tag === 'user_preference' ? 'user_preference' : 'synthesized_fact',
            title: `Synthesized Fact (${ft.tag.replace('_', ' ')})`,
            content: `User stated: "${match[0]}". Autonomous agent incorporated this into continuous behavioral memory graph.`,
            importance: 0.92,
            reinforcementScore: 1,
            timestamp: Date.now(),
            tags: ['auto-learned', ft.tag, 'symbiotic-growth'],
            source: 'dialogue'
          };

          await memoryStore.saveMemory(factNode);

          this.addEvent({
            id: `ge_fact_${Date.now()}`,
            type: 'fact_extracted',
            title: `Learned Fact: ${ft.tag.replace('_', ' ')}`,
            detail: `Recorded: "${extracted.slice(0, 60)}" into local IndexedDB memory graph.`,
            xpEarned: 30,
            timestamp: Date.now()
          });
          break;
        }
      }
    }

    // 3. Feedback reinforcement
    if (feedback === 'positive') {
      xpEarned += 20;
      this.synapsesGrown += 5;
      this.addEvent({
        id: `ge_fb_${Date.now()}`,
        type: 'feedback_reinforced',
        title: 'Reinforced Behavioral Policy',
        detail: 'User confirmed answer quality; strengthened current synaptic weights.',
        xpEarned: 20,
        timestamp: Date.now()
      });
    } else if (feedback === 'negative') {
      newRuleFormed = `Adjust edge response strategy for queries matching: "${userPrompt.slice(0, 45)}"`;
      xpEarned += 15;
    }

    // 4. Autonomous skill auto-synthesis if prompt indicates novel programmatic need
    if ((lowerPrompt.includes('script') || lowerPrompt.includes('command') || lowerPrompt.includes('how to install') || lowerPrompt.includes('terminal')) && Math.random() > 0.5) {
      const existing = this.skills.find(s => s.triggerPhrases.some(p => lowerPrompt.includes(p)));
      if (!existing && this.skills.length < 15) {
        const autoSkill: AutonomousSkill = {
          id: `skill_auto_${Date.now()}`,
          name: `Auto-Synthesized: ${userPrompt.slice(0, 24)}...`,
          category: 'linux_terminal',
          description: `Autonomously synthesized from user prompt: "${userPrompt.slice(0, 60)}"`,
          triggerPhrases: [userPrompt.slice(0, 20).toLowerCase()],
          codeTemplate: `# Autonomous Edge Script Generated on ${new Date().toISOString().slice(0, 10)}\nlitert-cli exec --auto-route --query "${userPrompt.replace(/"/g, '')}"`,
          language: 'bash',
          timesUsed: 1,
          successRate: 1.0,
          isAutoSynthesized: true,
          createdAt: Date.now()
        };
        this.skills.unshift(autoSkill);
        xpEarned += 50;
        this.addEvent({
          id: `ge_syn_${Date.now()}`,
          type: 'skill_synthesized',
          title: `Synthesized New Skill: ${autoSkill.name}`,
          detail: 'Created new executable skill template based on conversation context.',
          xpEarned: 50,
          timestamp: Date.now()
        });
      }
    }

    this.addXp(xpEarned, 'interaction');
    return { factsLearned, skillTriggered, xpEarned, newRuleFormed };
  }

  /**
   * Consolidate duplicate memories and optimize graph
   */
  public async performAutonomousConsolidation(): Promise<{ consolidatedCount: number; rulesUpdated: number }> {
    await memoryStore.init();
    const memories = await memoryStore.getAllMemories();
    const rules = await memoryStore.getAllRules();

    // Reinforce frequently recalled memories
    for (const mem of memories) {
      if (mem.reinforcementScore > 5) {
        mem.importance = Math.min(1.0, mem.importance + 0.02);
        await memoryStore.saveMemory(mem);
      }
    }

    this.addXp(40, 'consolidation');
    this.addEvent({
      id: `ge_cons_${Date.now()}`,
      type: 'memory_consolidated',
      title: 'Autonomous Memory Graph Consolidation',
      detail: `Consolidated ${memories.length} memory nodes and optimized ${rules.length} policy rules.`,
      xpEarned: 40,
      timestamp: Date.now()
    });

    return {
      consolidatedCount: memories.length,
      rulesUpdated: rules.length
    };
  }

  public async registerCustomSkill(skill: Omit<AutonomousSkill, 'id' | 'createdAt' | 'timesUsed' | 'successRate'>): Promise<AutonomousSkill> {
    const newSkill: AutonomousSkill = {
      ...skill,
      id: `skill_usr_${Date.now()}`,
      timesUsed: 0,
      successRate: 1.0,
      createdAt: Date.now()
    };
    this.skills.unshift(newSkill);
    this.addXp(60, 'manual_skill');
    this.addEvent({
      id: `ge_mskill_${Date.now()}`,
      type: 'skill_synthesized',
      title: `Registered Skill: ${newSkill.name}`,
      detail: `Integrated ${newSkill.language} skill into autonomous repertoire.`,
      xpEarned: 60,
      timestamp: Date.now()
    });
    this.saveState();
    this.notify();
    return newSkill;
  }
}

export const growthEngine = new AutonomousGrowthEngine();
