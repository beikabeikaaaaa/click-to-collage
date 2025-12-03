/**
 * Download Manager - Handles canvas export and download functionality
 */

class DownloadManager {
  constructor(canvasManager, collageManager) {
    this.canvasManager = canvasManager;
    this.collageManager = collageManager;
  }

  /**
   * Download canvas as PNG with transparent background support
   */
  downloadAsPNG(filename = 'collage.png') {
    try {
      // Create a temporary canvas for export (full resolution)
      const canvas = this.canvasManager.getCanvas();
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const ctx = exportCanvas.getContext('2d');

      // Fill with transparent background (or white if no background image)
      ctx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);

      // Draw background if exists
      if (this.canvasManager.backgroundImage) {
        ctx.drawImage(
          this.canvasManager.backgroundImage,
          0, 0,
          exportCanvas.width,
          exportCanvas.height
        );
      } else {
        // White background for export (optional - can be removed for true transparency)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      }

      // Draw all materials
      const materials = this.collageManager.getMaterials();
      materials.forEach(material => {
        // Only draw non-ghost materials (user's own materials)
        if (!material.isGhost) {
          ctx.drawImage(
            material.image,
            material.x,
            material.y,
            material.width,
            material.height
          );
        }
      });

      // Convert to blob and download
      exportCanvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob');
          alert('下载失败：无法创建图片文件');
          return;
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('Download completed:', filename);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Error downloading canvas:', error);
      alert('下载失败: ' + error.message);
    }
  }

  /**
   * Get canvas as data URL (for preview or other uses)
   */
  getDataURL(format = 'image/png', quality = 1.0) {
    const canvas = this.canvasManager.getCanvas();
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext('2d');

    // Draw background
    if (this.canvasManager.backgroundImage) {
      ctx.drawImage(
        this.canvasManager.backgroundImage,
        0, 0,
        exportCanvas.width,
        exportCanvas.height
      );
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    }

    // Draw materials
    const materials = this.collageManager.getMaterials();
    materials.forEach(material => {
      if (!material.isGhost) {
        ctx.drawImage(
          material.image,
          material.x,
          material.y,
          material.width,
          material.height
        );
      }
    });

    return exportCanvas.toDataURL(format, quality);
  }

  /**
   * Copy canvas to clipboard (if supported)
   */
  async copyToClipboard() {
    try {
      const dataURL = this.getDataURL();
      
      // Convert data URL to blob
      const response = await fetch(dataURL);
      const blob = await response.blob();
      
      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      console.log('Copied to clipboard');
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }
}

// Initialize download manager when both managers are ready
const initDownloadManager = () => {
  if (window.canvasManager && window.collageManager) {
    window.downloadManager = new DownloadManager(
      window.canvasManager,
      window.collageManager
    );
    
    // Setup download button
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (window.downloadManager) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `collage-${timestamp}.png`;
          window.downloadManager.downloadAsPNG(filename);
        } else {
          alert('下载功能未就绪，请稍后再试');
        }
      });
    }
  } else {
    setTimeout(initDownloadManager, 100);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDownloadManager);
} else {
  initDownloadManager();
}

