# CollageStates Deployment Guide

A comprehensive guide to deploying the CollageStates AI-powered collage creation platform.

---

## Overview

CollageStates is an intelligent online collage tool that combines AI-generated backgrounds with real-time collaborative editing. This guide covers the complete deployment process from environment setup to production launch.

### Core Features
- **AI Background Generation** - Automated landscape generation using Replicate API
- **Material Library** - PNG asset upload and management system
- **Real-time Collaboration** - Multi-user synchronous editing via WebSocket
- **Canvas Operations** - Drag, scale, and manipulate elements with precision

### Technology Stack
- **Frontend**: HTML5 Canvas + Vanilla JavaScript (Zero framework dependencies)
- **Backend**: Node.js + Express.js
- **Real-time**: Socket.io (WebSocket communication)
- **AI Service**: Replicate API (Stable Diffusion models)
- **File Management**: Multer for uploads

---

## Prerequisites

### System Requirements

| Component | Requirement | Purpose |
|-----------|-------------|---------|
| **Operating System** | macOS 10.15+ / Linux / Windows | Runtime environment |
| **Node.js** | 16.x or higher | JavaScript runtime |
| **npm** | 8.x or higher | Package manager |
| **Memory** | 4GB+ RAM recommended | Application performance |
| **Network** | Stable internet connection | AI API calls & real-time sync |

### Verify Installation

```bash
# Check Node.js version
node --version
# Expected: v16.0.0 or higher

# Check npm version
npm --version
# Expected: 8.0.0 or higher
```

---

## Deployment Steps

### Step 1: Environment Setup

#### Install Node.js

**Option A: Official Installer (Recommended for beginners)**
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the **LTS (Long Term Support)** version
3. Run the installer package
4. Restart your terminal after installation

**Option B: Homebrew (macOS/Linux)**
```bash
# Install Homebrew if not available
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

**Option C: Node Version Manager (Advanced)**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use LTS Node.js
nvm install --lts
nvm use --lts
```

---

### Step 2: Project Setup

#### Extract or Clone Project

```bash
# Navigate to your preferred directory
cd ~/Downloads  # or your preferred location

# If using Git
git clone https://github.com/your-repo/CollageStates.git
cd CollageStates

# If using a ZIP file, extract and navigate
cd /path/to/extracted/CollageStates
```

#### Install Dependencies

```bash
npm install
```

**What happens during installation:**
- Reads `package.json` dependency manifest
- Downloads packages from npm registry
- Resolves dependency tree (may take 1-2 minutes)
- Installs to `node_modules/` directory

**Expected output:**
```
added 150 packages in 30s
```

**Troubleshooting slow installation:**
```bash
# Use Chinese mirror for faster downloads
npm config set registry https://registry.npmmirror.com
npm install
```

---

### Step 3: Environment Configuration

#### Create `.env` File

The `.env` file stores sensitive configuration that should never be committed to version control.

**Using Terminal:**
```bash
cd /path/to/CollageStates
touch .env
open -e .env  # Opens in default text editor
```

**Using Text Editor:**
1. Create a new file named `.env` (note the leading dot)
2. Save it in the project root directory
3. Ensure it's saved as plain text

#### Configure Environment Variables

```env
REPLICATE_API_TOKEN=r8_your_actual_token_here
PORT=3000
```

**Obtaining Replicate API Token:**
1. Visit [replicate.com](https://replicate.com)
2. Sign up or log in (GitHub OAuth supported)
3. Navigate to [Account API Tokens](https://replicate.com/account/api-tokens)
4. Click **"Create Token"**
5. Copy the token immediately (shown only once)
6. Paste into `.env` file

**Security Best Practices:**
- ✅ Never commit `.env` to Git (already in `.gitignore`)
- ✅ Use different tokens for different environments
- ✅ Rotate tokens regularly
- ✅ Never share tokens publicly

---

### Step 4: Directory Structure

Project directories are automatically created on first use:

```
CollageStates/
├── server/
│   └── uploads/          # Auto-created on first upload
├── public/
│   └── assets/          # Auto-created if needed
└── click/               # Initial material assets (optional)
```

**Automatic Directory Creation:**
The application includes intelligent directory management - upload directories are created automatically when needed, eliminating manual setup.

---

### Step 5: Launch Application

#### Start the Server

```bash
npm start
```

**Successful startup indicators:**
```
Server is running on http://localhost:3000
Replicate API Token: Configured
```

#### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

#### Development Mode (Optional)

For automatic server restart on code changes:

```bash
npm run dev
```

Requires `nodemon` (already in devDependencies):
```bash
npx nodemon server/server.js
```

---

## Deployment Architecture

### Startup Sequence

```
1. Load Environment Variables
   └─> dotenv reads .env file
       └─> Sets process.env variables

2. Initialize Express Application
   └─> Create HTTP server instance
       └─> Configure middleware (JSON, URL encoding)

3. Register Static File Service
   └─> Serve public/ directory
       └─> Enable direct browser access to assets

4. Register API Routes
   └─> Mount /api/* endpoints
       └─> Handle material uploads, AI generation

5. Initialize Socket.io
   └─> Upgrade HTTP to WebSocket
       └─> Enable real-time bidirectional communication

6. Start HTTP Server
   └─> Listen on configured port (default: 3000)
       └─> Ready to accept connections
```

---

## Key Design Principles

### 🔒 Security First
- Sensitive credentials stored in `.env` (not in code)
- Git-ignored configuration files
- Environment-specific token management

### ⚡ Automation
- Zero manual directory creation
- Automatic dependency resolution
- Intelligent file conflict handling

### 📦 Standardization
- Industry-standard package management (npm)
- Common configuration patterns (`.env`)
- RESTful API design principles

### 🎯 User Experience
- Minimal deployment steps (5 steps total)
- Clear error messages
- Progressive enhancement

---

## Technical Deep Dive

### Why `.env` Files?

**Security Benefits:**
- Prevents credential leakage in version control
- Enables different configurations per environment
- Follows industry-standard practices

**Implementation:**
```javascript
// Code accesses via environment variables
const apiToken = process.env.REPLICATE_API_TOKEN;
```

### Dependency Management

**Dependency Tree Structure:**
```
CollageStates
├── express@4.18.2
│   ├── accepts@1.3.8
│   ├── array-flatten@1.1.1
│   └── ...
├── socket.io@4.6.1
│   ├── engine.io@6.5.0
│   └── ...
└── ...
```

**Why installation takes time:**
- Recursive dependency resolution
- Network download latency
- Package verification and installation

### Port Configuration

**Default Port: 3000**
- Node.js community convention
- Easily customizable via `.env`
- Avoid conflicts with other services

**Custom Port Example:**
```env
PORT=8080  # Use port 8080 instead
```

---

## Troubleshooting

### Port Already in Use

**Quick Fix:**
```env
# .env file
PORT=3001
```

**Advanced: Find and Kill Process**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)
```

### API Token Issues

**Common Problems:**
- Token not found → Check `.env` file exists
- Invalid token → Verify token format (starts with `r8_`)
- Expired token → Generate new token at Replicate dashboard

**Verification:**
```bash
# Check .env file (don't share output!)
cat .env
```

### Installation Failures

**Network Issues:**
```bash
# Clear npm cache
npm cache clean --force

# Use mirror registry
npm config set registry https://registry.npmmirror.com
npm install
```

**Permission Errors:**
```bash
# Use sudo (not recommended, fix permissions instead)
sudo npm install

# Better: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
```

---

## Quick Reference

### Deployment Commands

```bash
# 1. Verify environment
node --version && npm --version

# 2. Install dependencies
npm install

# 3. Verify configuration
cat .env | grep -v "TOKEN"  # Don't expose token

# 4. Start server
npm start

# 5. Access application
open http://localhost:3000  # macOS
```

### Critical Files

| File | Purpose |
|------|---------|
| `package.json` | Dependency manifest and scripts |
| `.env` | Environment configuration (sensitive) |
| `server/server.js` | Application entry point |
| `server/routes/api.js` | API endpoint definitions |
| `public/index.html` | Frontend application |

---

## Production Considerations

### Security Hardening

- [ ] Use environment-specific `.env` files
- [ ] Enable HTTPS in production
- [ ] Implement rate limiting
- [ ] Set up proper CORS policies
- [ ] Regular dependency updates

### Performance Optimization

- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Implement caching strategies
- [ ] Monitor API rate limits

### Monitoring

- [ ] Set up error logging
- [ ] Monitor API usage
- [ ] Track user sessions
- [ ] Performance metrics

---

## Deployment Checklist

- [ ] Node.js 16+ installed and verified
- [ ] Project dependencies installed (`npm install`)
- [ ] `.env` file created with valid API token
- [ ] Required directories exist (auto-created)
- [ ] Server starts without errors
- [ ] Application accessible in browser
- [ ] API endpoints responding correctly
- [ ] Real-time collaboration functional

---

## Additional Resources

- **API Documentation**: [Replicate Docs](https://replicate.com/docs)
- **Socket.io Guide**: [Socket.io Documentation](https://socket.io/docs/)
- **Express.js**: [Express Guide](https://expressjs.com/en/guide/routing.html)

---

## Support

For issues or questions:
1. Review this deployment guide
2. Check [README.md](./README.md) for usage instructions
3. Review [TEST_CHECKLIST.md](./TEST_CHECKLIST.md) for testing procedures
4. Inspect browser console for frontend errors
5. Check server logs for backend errors

---

**Document Version**: 2.0  
**Last Updated**: December 2024  
**Estimated Deployment Time**: 5-10 minutes
