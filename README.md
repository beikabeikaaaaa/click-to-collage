# CollageStates

<div align="center">

**An AI-Powered Collaborative Collage Creation Platform**

*Create stunning collages with AI-generated backgrounds and real-time multi-user collaboration*

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack)

</div>

---

## 🎨 Overview

CollageStates is an intelligent web-based collage tool that combines **AI-generated backgrounds** with **real-time collaborative editing**. Create beautiful compositions with AI-powered landscape generation and seamless multi-user synchronization.

### What Makes It Special

- 🤖 **AI Background Generation** - Instant landscape creation using Replicate's Stable Diffusion models
- 👥 **Real-Time Collaboration** - Multi-user editing with live synchronization via WebSocket
- 🎯 **Intuitive Interface** - Clean, modern UI built with vanilla JavaScript (zero framework overhead)
- 📦 **Material Library** - Batch upload support with intelligent duplicate handling
- 💾 **High-Quality Export** - PNG export with transparency preservation

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **AI Backgrounds** | Generate stunning US landscape backgrounds with one click |
| **Material Management** | Upload, organize, and manage PNG assets with batch operations |
| **Canvas Operations** | Drag, scale, and position elements with pixel-perfect precision |
| **Real-Time Sync** | See collaborators' actions instantly with ghost preview indicators |
| **Initialization Tool** | Bulk import materials from `click/` directory with conflict resolution |
| **Duplicate Handling** | Smart file conflict resolution with overwrite/skip options |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16.x or higher
- **npm** 8.x or higher
- **Stable internet connection** (for AI API calls)

### Installation

```bash
# 1. Clone or extract the project
cd CollageStates

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env  # Create .env file
# Edit .env and add your REPLICATE_API_TOKEN

# 4. Start the server
npm start
```

### Configuration

Create a `.env` file in the project root:

```env
REPLICATE_API_TOKEN=r8_your_token_here
PORT=3000
```

**Get your API token:**
1. Visit [Replicate.com](https://replicate.com)
2. Sign up / Log in
3. Go to [API Tokens](https://replicate.com/account/api-tokens)
4. Create a new token and copy it

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Complete deployment walkthrough |
| [DEPLOYMENT_STRATEGY.md](./DEPLOYMENT_STRATEGY.md) | Deployment architecture and strategy |
| [REPLICATE_API_TOKEN_SETUP.md](./REPLICATE_API_TOKEN_SETUP.md) | API token configuration guide |
| [TEST_CHECKLIST.md](./TEST_CHECKLIST.md) | Testing procedures |
| [FUNCTIONALITY_VERIFICATION.md](./FUNCTIONALITY_VERIFICATION.md) | Feature verification |

---

## 🎯 Usage Guide

### Basic Workflow

1. **Connect to Session**
   - Enter your nickname
   - Choose a color identifier
   - Click "Connect"

2. **Generate Background**
   - Click "Generate Background" button
   - Wait for AI to create landscape (10-30 seconds)
   - Background appears on canvas automatically

3. **Upload Materials**
   - Click "Upload Material" for single file
   - Select multiple PNG files for batch upload
   - Handle duplicates with overwrite/skip options

4. **Create Collage**
   - Click material from library
   - Click canvas to place
   - Drag to reposition
   - Press `Delete` to remove

5. **Collaborate**
   - Multiple users can join simultaneously
   - See others' actions in real-time (ghost preview)
   - Each user has unique color indicator

6. **Export**
   - Click "Download Collage"
   - High-quality PNG with transparency

### Advanced Features

#### Material Library Initialization

Use the **"Initialize Materials"** button to bulk import from `click/` directory:

- Scans for PNG files automatically
- Detects duplicate files
- Interactive conflict resolution dialog
- Progress tracking and summary

#### Batch Upload

- Select multiple files at once
- Automatic duplicate detection
- Per-file conflict resolution
- Upload progress tracking

---

## 🏗️ Architecture

### Technology Stack

```
Frontend:
├── HTML5 Canvas        # High-performance rendering
├── Vanilla JavaScript  # Zero framework dependencies
└── Socket.io Client    # Real-time communication

Backend:
├── Node.js            # JavaScript runtime
├── Express.js         # Web framework
├── Socket.io          # WebSocket server
└── Multer             # File upload handling

AI Services:
└── Replicate API      # Stable Diffusion models
```

### Project Structure

```
CollageStates/
├── server/
│   ├── server.js           # Application entry point
│   ├── routes/
│   │   └── api.js         # REST API endpoints
│   ├── services/
│   │   └── replicate.js   # AI service integration
│   ├── socket/
│   │   └── socketHandler.js  # Real-time event handling
│   └── uploads/           # Material storage
├── public/
│   ├── index.html         # Main application
│   ├── css/
│   │   └── style.css     # Styling
│   └── js/
│       ├── canvas.js      # Canvas management
│       ├── collage.js     # Collage operations
│       ├── download.js    # Export functionality
│       └── socket-client.js  # WebSocket client
├── click/                 # Initial materials (optional)
└── .env                   # Environment configuration
```

---

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate-background` | POST | Generate AI background image |
| `/api/upload-material` | POST | Upload single material file |
| `/api/upload-materials` | POST | Batch upload multiple files |
| `/api/materials` | GET | List all uploaded materials |
| `/api/init-materials` | POST | Scan click directory for initialization |
| `/api/init-materials/execute` | POST | Execute material initialization |

---

## 🎨 Features in Detail

### AI Background Generation

- **Model**: Stable Diffusion via Replicate API
- **Prompts**: 10 curated US landscape variations
- **Dimensions**: 1024x1024px
- **Generation Time**: 10-30 seconds
- **Error Handling**: User-friendly messages for API issues

### Material Management

- **Supported Format**: PNG (with transparency)
- **File Size Limit**: 10MB per file
- **Batch Operations**: Upload up to 20 files simultaneously
- **Duplicate Detection**: Smart filename matching
- **Conflict Resolution**: Overwrite/Skip/Cancel options

### Real-Time Collaboration

- **Protocol**: WebSocket via Socket.io
- **Features**:
  - Live user presence indicators
  - Ghost preview of others' edits
  - Color-coded user identification
  - Automatic synchronization
- **Events**: Add, move, resize, delete operations

---

## 🔒 Security

### Best Practices

- ✅ Sensitive credentials in `.env` (git-ignored)
- ✅ No hardcoded API keys
- ✅ Environment-specific configurations
- ✅ CORS properly configured
- ✅ File type validation (PNG only)
- ✅ File size limits enforced

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Change `PORT` in `.env` or kill process |
| API token error | Verify `.env` format and token validity |
| Images not loading | Check file format (must be PNG) |
| Upload fails | Verify file size (<10MB) and format |
| Dependency errors | Clear cache: `npm cache clean --force` |

### Debug Checklist

- [ ] Node.js version ≥ 16.x
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file exists and configured
- [ ] Server starts without errors
- [ ] Browser console shows no errors
- [ ] Network requests succeed (check Network tab)

---

## 📝 Development

### Running in Development Mode

```bash
npm run dev
```

This uses `nodemon` for automatic server restarts on file changes.

### Adding Custom Materials

**Method 1: Web Upload**
- Use the upload interface

**Method 2: Bulk Initialization**
- Place PNG files in `click/` directory
- Use "Initialize Materials" button

**Method 3: Direct Copy**
- Copy files to `server/uploads/`
- Restart server

### Customizing AI Prompts

Edit `server/services/replicate.js`:

```javascript
const prompts = [
  "Your custom prompt here...",
  // Add more variations
];
```

---

## 🌐 Multi-Platform Support

### Local Development
- Access via `http://localhost:3000`

### LAN Access
- Find your IP: `ifconfig` (Mac/Linux) or `ipconfig` (Windows)
- Access via `http://YOUR_IP:3000`
- Other devices can connect to collaborate

---

## 📊 Performance

- **Canvas Size**: 1920×1080px (Full HD)
- **Material Limit**: Practical limit ~50-100 items
- **Concurrent Users**: Tested with 5+ simultaneous users
- **AI Generation**: ~10-30 seconds per background
- **File Upload**: ~1-3 seconds per file (depends on size)

---

## 🤝 Contributing

This project follows standard Node.js conventions:

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- [Replicate](https://replicate.com) - AI image generation infrastructure
- [Socket.io](https://socket.io) - Real-time communication framework
- [Express.js](https://expressjs.com) - Web application framework

---

## 📚 Additional Resources

- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Deployment Strategy**: [DEPLOYMENT_STRATEGY.md](./DEPLOYMENT_STRATEGY.md)
- **API Setup**: [REPLICATE_API_TOKEN_SETUP.md](./REPLICATE_API_TOKEN_SETUP.md)
- **Testing**: [TEST_CHECKLIST.md](./TEST_CHECKLIST.md)

---

<div align="center">

**Made with ❤️ using AI and Web Technologies**

*Start creating amazing collages today!*

</div>
