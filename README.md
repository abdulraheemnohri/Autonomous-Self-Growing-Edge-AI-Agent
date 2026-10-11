# Autonomous Self-Growing Edge AI Agent & LiteRT Runtime

An advanced, 100% air-gapped, offline-first Autonomous Edge AI assistant and cognitive engine powered by **LiteRT** and **Hugging Face (`litert-community`)** models, complete with Whisper ASR, Piper TTS, vector search memory, and self-growing reflection loops.

---

## 🚀 Installation Methods

This application and runtime can be installed across various Linux distributions, containerized environments, and server setups. Below are the complete installation methods.

### 1. Ubuntu / Debian / Raspberry Pi (APT-based)
For Ubuntu 22.04+, Debian 12+, and Raspberry Pi OS (Bookworm):

```bash
# 1. Update system packages & install prerequisites
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git python3 python3-pip build-essential cmake pkg-config

# 2. Install Node.js 20+ LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Clone and setup repository
git clone https://github.com/abdulraheemnohri/Autonomous-Self-Growing-Edge-AI-Agent.git
cd Autonomous-Self-Growing-Edge-AI-Agent
npm install

# 4. Build and start production server
npm run build
npm start
```

### 2. Arch Linux / Manjaro (Pacman-based)
```bash
# 1. Update system & install dependencies
sudo pacman -Syu --noconfirm nodejs npm git base-devel cmake python

# 2. Clone repository & install packages
git clone https://github.com/abdulraheemnohri/Autonomous-Self-Growing-Edge-AI-Agent.git
cd Autonomous-Self-Growing-Edge-AI-Agent
npm install

# 3. Build & Run
npm run build
npm start
```

### 3. Fedora / RHEL / CentOS (DNF-based)
```bash
# 1. Install Node.js and build tools
sudo dnf install -y nodejs npm git gcc-c++ make cmake python3

# 2. Clone repository
git clone https://github.com/abdulraheemnohri/Autonomous-Self-Growing-Edge-AI-Agent.git
cd Autonomous-Self-Growing-Edge-AI-Agent
npm install

# 3. Build & Run
npm run build
npm start
```

### 4. Docker & Podman Containerization
Run the agent in an isolated container with zero host dependencies:

```bash
# Build Docker image
docker build -t litert-edge-agent .

# Run container exposing port 3000
docker run -d \
  --name edge-agent \
  -p 3000:3000 \
  --restart unless-stopped \
  litert-edge-agent
```

### 5. Background Systemd Daemon Setup (Linux Server)
To run the agent automatically as a system service:

1. Create the systemd service file `/etc/systemd/system/litert-agent.service`:
```ini
[Unit]
Description=LiteRT Autonomous Edge AI Agent
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/Autonomous-Self-Growing-Edge-AI-Agent
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

2. Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable litert-agent.service
sudo systemctl start litert-agent.service
sudo systemctl status litert-agent.service
```

---

## 🧠 Core Features

- **Hugging Face `litert-community` Model Hub**: Download and switch between Gemma 2 2B, Llama 3.2 1B/3B, Qwen 2.5, and DeepSeek R1 optimized for edge devices.
- **Self-Growing Cognitive Engine**: Automatically extracts atomic facts from conversation, builds semantic vector memory, derives procedural rules, and levels up XP through autonomous consolidation.
- **Offline Voice Suite**: Whisper ASR speech-to-text, Piper TTS (Ryan & Amy), Kokoro-82M, and Silero VAD with real-time waveform visualization.
- **100% Air-Gapped**: Runs entirely client-side or locally without external API telemetry or cloud dependency.
