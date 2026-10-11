# Production Deployment Guide

## Overview

This guide covers deploying the **Autonomous Self-Growing Edge AI Agent** to production environments, including Docker containers, Linux systemd services, and cloud VPS instances.

---

## 🐳 Docker Deployment

### 1. Build Container Image

Ensure Docker is installed, then build the image:

```bash
docker build -t litert-edge-agent .
```

### 2. Run Container

```bash
docker run -d \
  --name edge-agent \
  -p 3000:3000 \
  --restart unless-stopped \
  -e NODE_ENV=production \
  litert-edge-agent
```

Access the app at `http://localhost:3000`.

---

## 🐧 Linux Server Deployment (Systemd + Node.js)

### Prerequisites
- Node.js 20+ LTS
- npm or bun

### Setup Steps

1. Clone and install dependencies:
```bash
git clone https://github.com/abdulraheemnohri/Autonomous-Self-Growing-Edge-AI-Agent.git
cd Autonomous-Self-Growing-Edge-AI-Agent
npm install
npm run build
```

2. Create systemd service `/etc/systemd/system/litert-agent.service`:
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

3. Start and enable service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable litert-agent.service
sudo systemctl start litert-agent.service
```
