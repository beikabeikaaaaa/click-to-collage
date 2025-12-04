/**
 * Canvas Manager
 */

class CanvasManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.backgroundImage = null;
    this.backgroundUrl = null;
    
    // Set canvas size
    this.canvas.width = 1920;
    this.canvas.height = 1080;
    
    // Scale canvas for display (maintain aspect ratio)
    this.scaleCanvas();
    window.addEventListener('resize', () => this.scaleCanvas());
    
    this.render();
  }

  /**
   * Scale canvas
   */
  scaleCanvas() {
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const scale = Math.min(
      containerWidth / this.canvas.width,
      containerHeight / this.canvas.height
    );
    
    this.canvas.style.width = `${this.canvas.width * scale}px`;
    this.canvas.style.height = `${this.canvas.height * scale}px`;
    this.scale = scale;
  }

  /**
   * Set background
   */
  async setBackground(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        this.backgroundImage = img;
        this.backgroundUrl = imageUrl;
        this.render();
        resolve();
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load background image'));
      };
      
      img.src = imageUrl;
    });
  }

  /**
   * Clear background
   */
  clearBackground() {
    this.backgroundImage = null;
    this.backgroundUrl = null;
    this.render();
  }

  /**
   * Render canvas
   */
  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background
    if (this.backgroundImage) {
      this.ctx.drawImage(
        this.backgroundImage,
        0, 0,
        this.canvas.width,
        this.canvas.height
      );
    } else {
      // Draw default background (white)
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Get canvas context for external drawing
   */
  getContext() {
    return this.ctx;
  }

  /**
   * Get canvas element
   */
  getCanvas() {
    return this.canvas;
  }

  /**
   * Get canvas dimensions
   */
  getDimensions() {
    return {
      width: this.canvas.width,
      height: this.canvas.height
    };
  }

  /**
   * Convert screen coordinates to canvas coordinates
   */
  screenToCanvas(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    return {
      x: (x - rect.left) * scaleX,
      y: (y - rect.top) * scaleY
    };
  }

  /**
   * Clear entire canvas
   */
  clear() {
    this.clearBackground();
    this.render();
  }

  /**
   * Export canvas as image data URL
   */
  toDataURL(format = 'image/png', quality = 1.0) {
    return this.canvas.toDataURL(format, quality);
  }
}

// Initialize canvas manager
window.canvasManager = new CanvasManager('collage-canvas');

