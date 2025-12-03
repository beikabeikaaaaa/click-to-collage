const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const replicateService = require('../services/replicate');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Only accept PNG files
    if (file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only PNG files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * POST /api/generate-background
 * Generate a background image using Replicate AI
 */
router.post('/generate-background', async (req, res) => {
  try {
    const imageUrl = await replicateService.generateBackground();
    res.json({
      success: true,
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error in generate-background:', error);
    
    // Handle specific Replicate API errors
    let statusCode = 500;
    let errorMessage = error.message || 'Failed to generate background';
    let errorType = 'unknown';
    
    // Check for Replicate API errors
    if (error.message && error.message.includes('402')) {
      statusCode = 402;
      errorType = 'insufficient_credit';
      errorMessage = 'Replicate API 账户余额不足。请访问 https://replicate.com/account/billing 充值后再试。';
    } else if (error.message && error.message.includes('401')) {
      statusCode = 401;
      errorType = 'unauthorized';
      errorMessage = 'Replicate API Token 无效或未配置。请在 .env 文件中设置有效的 REPLICATE_API_TOKEN。';
    } else if (error.message && error.message.includes('429')) {
      statusCode = 429;
      errorType = 'rate_limit';
      errorMessage = '请求过于频繁，请稍后再试。';
    } else if (error.message && error.message.includes('REPLICATE_API_TOKEN')) {
      statusCode = 400;
      errorType = 'not_configured';
      errorMessage = 'Replicate API Token 未配置。请在 .env 文件中设置 REPLICATE_API_TOKEN。';
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      errorType: errorType
    });
  }
});

/**
 * POST /api/upload-material
 * Upload a PNG material file
 */
router.post('/upload-material', upload.single('material'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: fileUrl,
      size: req.file.size
    });
  } catch (error) {
    console.error('Error in upload-material:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload material'
    });
  }
});

/**
 * GET /api/materials
 * Get list of all uploaded materials
 */
router.get('/materials', (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.json({
        success: true,
        materials: []
      });
    }

    const files = fs.readdirSync(uploadsDir)
      .filter(file => file.toLowerCase().endsWith('.png'))
      .map(file => {
        // Encode filename for URL to handle spaces and special characters
        // Express static middleware will decode it automatically when serving the file
        const encodedFilename = encodeURIComponent(file);
        return {
          filename: file,
          url: `/uploads/${encodedFilename}`,
          name: path.basename(file, path.extname(file))
        };
      });

    res.json({
      success: true,
      materials: files
    });
  } catch (error) {
    console.error('Error in materials:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get materials'
    });
  }
});

/**
 * GET /api/backgrounds
 * Get list of generated backgrounds (if cached locally)
 */
router.get('/backgrounds', (req, res) => {
  try {
    // For now, backgrounds are generated on-demand and not cached
    // This endpoint can be extended to return cached backgrounds
    res.json({
      success: true,
      backgrounds: []
    });
  } catch (error) {
    console.error('Error in backgrounds:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get backgrounds'
    });
  }
});

module.exports = router;

