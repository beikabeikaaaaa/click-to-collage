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

// Helper function to extract original filename from timestamped filename
// Example: "Image 10-1764747070705-429055316.png" -> "Image 10.png"
function extractOriginalFilename(filename) {
  const ext = path.extname(filename);
  const nameWithoutExt = path.basename(filename, ext);
  // Remove timestamp pattern: -数字-数字
  const originalName = nameWithoutExt.replace(/-\d+-\d+$/, '');
  return originalName + ext;
}

// Helper function to check if a file with the same original name exists in uploads
function findExistingFile(originalFilename, uploadsDir) {
  if (!fs.existsSync(uploadsDir)) {
    return null;
  }

  const files = fs.readdirSync(uploadsDir).filter(file => file.toLowerCase().endsWith('.png'));
  
  // Check if exact filename exists
  if (files.includes(originalFilename)) {
    return originalFilename;
  }

  // Check if any file has the same original name (ignoring timestamp suffix)
  for (const file of files) {
    const fileOriginalName = extractOriginalFilename(file);
    if (fileOriginalName === originalFilename) {
      return file;
    }
  }

  return null;
}

// Helper function to check if file exists (returns file info)
function checkFileExists(originalFilename) {
  const uploadsDir = path.join(__dirname, '../uploads');
  const existingFile = findExistingFile(originalFilename, uploadsDir);
  
  return {
    exists: existingFile !== null,
    existingFilename: existingFile,
    originalFilename: originalFilename
  };
}

/**
 * POST /api/generate-background
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
 * Upload single file with optional overwrite support
 */
router.post('/upload-material', upload.single('material'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const overwrite = req.body.overwrite === 'true' || req.body.overwrite === true;
    const originalFilename = req.file.originalname;
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Check if file already exists
    const fileCheck = checkFileExists(originalFilename);
    
    // If file exists and overwrite is not enabled
    if (fileCheck.exists && !overwrite) {
      // Delete the uploaded file with timestamp
      const tempPath = path.join(uploadsDir, req.file.filename);
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      
      return res.status(409).json({
        success: false,
        duplicate: true,
        error: 'File already exists',
        existingFile: fileCheck.existingFilename,
        message: '文件已存在。请设置 overwrite=true 来覆盖它。'
      });
    }

    // If overwrite is enabled and file exists, delete old file
    if (overwrite && fileCheck.exists && fileCheck.existingFilename) {
      const oldFilePath = path.join(uploadsDir, fileCheck.existingFilename);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Rename uploaded file to original name (remove timestamp)
    const finalPath = path.join(uploadsDir, originalFilename);
    const tempPath = path.join(uploadsDir, req.file.filename);
    
    if (fs.existsSync(tempPath)) {
      if (fs.existsSync(finalPath)) {
        fs.unlinkSync(finalPath);
      }
      fs.renameSync(tempPath, finalPath);
    }

    const fileUrl = `/uploads/${encodeURIComponent(originalFilename)}`;
    res.json({
      success: true,
      filename: originalFilename,
      originalName: originalFilename,
      url: fileUrl,
      size: req.file.size,
      overwritten: fileCheck.exists
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

/**
 * POST /api/init-materials
 * Scan click directory and prepare file list for initialization
 */
router.post('/init-materials', (req, res) => {
  try {
    const clickDir = path.join(__dirname, '../../click');
    const uploadsDir = path.join(__dirname, '../uploads');

    if (!fs.existsSync(clickDir)) {
      return res.status(404).json({
        success: false,
        error: 'Click directory not found'
      });
    }

    // Read all files from click directory
    const allFiles = fs.readdirSync(clickDir);
    
    // Filter PNG files only (skip HEIC and other formats)
    const pngFiles = allFiles.filter(file => 
      file.toLowerCase().endsWith('.png')
    );

    const files = [];
    let newCount = 0;
    let duplicateCount = 0;

    for (const file of pngFiles) {
      const sourcePath = path.join(clickDir, file);
      const fileCheck = checkFileExists(file);
      
      files.push({
        source: file,
        sourcePath: sourcePath,
        exists: fileCheck.exists,
        targetFilename: fileCheck.existingFilename || null
      });

      if (fileCheck.exists) {
        duplicateCount++;
      } else {
        newCount++;
      }
    }

    res.json({
      success: true,
      files: files,
      summary: {
        total: pngFiles.length,
        new: newCount,
        duplicates: duplicateCount
      }
    });
  } catch (error) {
    console.error('Error in init-materials:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scan click directory'
    });
  }
});

/**
 * POST /api/init-materials/execute
 * Execute the file copying with user's overwrite choices
 */
router.post('/init-materials/execute', (req, res) => {
  try {
    const { files } = req.body; // Array of { source, overwrite: boolean }
    
    if (!Array.isArray(files)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid files array'
      });
    }

    const clickDir = path.join(__dirname, '../../click');
    const uploadsDir = path.join(__dirname, '../uploads');

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const results = [];
    let copiedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const fileInfo of files) {
      const { source, overwrite } = fileInfo;
      const sourcePath = path.join(clickDir, source);
      const targetPath = path.join(uploadsDir, source);

      // Check if file should be processed
      if (!overwrite) {
        const fileCheck = checkFileExists(source);
        if (fileCheck.exists) {
          skippedCount++;
          results.push({
            source: source,
            status: 'skipped',
            reason: 'File exists and overwrite not selected'
          });
          continue;
        }
      }

      try {
        // If overwrite and file exists, delete old file first
        if (overwrite && fs.existsSync(targetPath)) {
          fs.unlinkSync(targetPath);
        }

        // Copy file
        fs.copyFileSync(sourcePath, targetPath);
        copiedCount++;
        results.push({
          source: source,
          status: 'copied',
          target: source
        });
      } catch (error) {
        errorCount++;
        results.push({
          source: source,
          status: 'error',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      results: results,
      summary: {
        total: files.length,
        copied: copiedCount,
        skipped: skippedCount,
        errors: errorCount
      }
    });
  } catch (error) {
    console.error('Error in init-materials/execute:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to execute file copying'
    });
  }
});

/**
 * POST /api/upload-materials (batch upload)
 * Upload multiple files at once
 */
const uploadMultiple = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only PNG files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 20 // Maximum 20 files at once
  }
});

router.post('/upload-materials', uploadMultiple.array('materials', 20), (req, res) => {
  try {
    const files = req.files || [];
    const { overwrite = false } = req.body;

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const results = [];
    const uploadsDir = path.join(__dirname, '../uploads');

    for (const file of files) {
      const originalFilename = file.originalname;
      const fileCheck = checkFileExists(originalFilename);

      // If file exists and overwrite is not enabled
      if (fileCheck.exists && !overwrite) {
        results.push({
          originalName: originalFilename,
          success: false,
          duplicate: true,
          existingFile: fileCheck.existingFilename,
          error: 'File already exists. Set overwrite=true to replace it.'
        });
        
        // Delete the uploaded file since we're not using it
        const tempPath = path.join(uploadsDir, file.filename);
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } else {
        // If overwrite is enabled and file exists, delete old file
        if (overwrite && fileCheck.exists && fileCheck.existingFilename) {
          const oldFilePath = path.join(uploadsDir, fileCheck.existingFilename);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }

        // Rename uploaded file to original name (remove timestamp)
        const finalPath = path.join(uploadsDir, originalFilename);
        const tempPath = path.join(uploadsDir, file.filename);
        
        if (fs.existsSync(tempPath)) {
          if (fs.existsSync(finalPath)) {
            fs.unlinkSync(finalPath);
          }
          fs.renameSync(tempPath, finalPath);
        }

        results.push({
          originalName: originalFilename,
          success: true,
          filename: originalFilename,
          url: `/uploads/${encodeURIComponent(originalFilename)}`,
          size: file.size,
          overwritten: fileCheck.exists
        });
      }
    }

    res.json({
      success: true,
      results: results,
      summary: {
        total: files.length,
        successful: results.filter(r => r.success).length,
        duplicates: results.filter(r => r.duplicate).length,
        errors: results.filter(r => !r.success && !r.duplicate).length
      }
    });
  } catch (error) {
    console.error('Error in upload-materials:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload materials'
    });
  }
});

module.exports = router;

