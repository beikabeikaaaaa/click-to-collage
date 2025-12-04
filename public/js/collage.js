/**
 * Collage Manager
 */

class CollageManager {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.materials = []; // Array of material objects on canvas
    this.materialLibrary = []; // Available materials from server
    this.selectedMaterial = null;
    this.dragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.nextMaterialId = 1;

    this.initEventListeners();
    this.loadMaterials();
  }

  /**
   * Initialize event listeners
   */
  initEventListeners() {
    const canvas = this.canvasManager.getCanvas();
    
    // Mouse events
    canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleMouseDown({
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0
      });
    });
    
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY
      });
    });
    
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.handleMouseUp(e);
    });
    
    // Keyboard events for delete
    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedMaterial) {
        e.preventDefault();
        this.deleteMaterial(this.selectedMaterial.id);
        this.selectedMaterial = null;
        this.render();
      }
    });
  }

  /**
   * Load materials
   */
  async loadMaterials() {
    try {
      // Add cache-busting parameter to ensure fresh data
      const response = await fetch(`/api/materials?t=${Date.now()}`);
      const data = await response.json();
      
      if (data.success) {
        this.materialLibrary = data.materials;
        this.renderMaterialList();
      } else {
        console.error('Failed to load materials:', data.error);
      }
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  }

  /**
   * Render material list
   */
  renderMaterialList() {
    const materialsList = document.getElementById('materials-list');
    
    if (this.materialLibrary.length === 0) {
      materialsList.innerHTML = '<div class="empty">No materials yet. Please upload.</div>';
      return;
    }

    materialsList.innerHTML = this.materialLibrary.map(material => {
      // Backend already provides encoded URLs, use them directly
      // Add cache-busting parameter to ensure fresh images
      const imageUrl = `${material.url}?t=${Date.now()}`;
      return `
      <div class="material-item" data-url="${material.url}">
        <img src="${imageUrl}" alt="${material.name}" loading="lazy" 
             crossorigin="anonymous"
             onerror="console.error('Failed to load image:', '${material.url}'); this.onerror=null; this.style.display='none'; 
                      const errorDiv = this.parentElement.querySelector('.image-error');
                      if (errorDiv) errorDiv.style.display='block';">
        <div class="image-error" style="display: none; padding: 8px; text-align: center; color: #999; font-size: 0.65rem; background: #f5f5f5; border-radius: 4px;">
          图片无法加载
        </div>
        <span class="material-name">${material.name}</span>
      </div>
    `;
    }).join('');

    // Add click handlers
    materialsList.querySelectorAll('.material-item').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.dataset.url;
        this.selectMaterialFromLibrary(url);
      });
    });
  }

  /**
   * Select material from library
   */
  selectMaterialFromLibrary(materialUrl) {
    // Create a preview material that will be added on click
    this.pendingMaterial = {
      url: materialUrl,
      ready: false
    };

    // Load the image first
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.pendingMaterial = {
        url: materialUrl,
        image: img,
        width: img.width,
        height: img.height,
        ready: true
      };
      
      // Change cursor to indicate ready to place
      const canvas = this.canvasManager.getCanvas();
      canvas.style.cursor = 'crosshair';
    };
    img.src = materialUrl;
  }

  /**
   * Add material to canvas
   */
  addMaterial(materialUrl, x, y, width = null, height = null) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const materialId = `material-${this.nextMaterialId++}`;
        const imgWidth = width || img.width;
        const imgHeight = height || img.height;
        
        // Scale to fit if too large
        const maxWidth = 500;
        const maxHeight = 500;
        let finalWidth = imgWidth;
        let finalHeight = imgHeight;
        
        if (finalWidth > maxWidth) {
          finalHeight = (finalHeight * maxWidth) / finalWidth;
          finalWidth = maxWidth;
        }
        if (finalHeight > maxHeight) {
          finalWidth = (finalWidth * maxHeight) / finalHeight;
          finalHeight = maxHeight;
        }

        const material = {
          id: materialId,
          url: materialUrl,
          image: img,
          x: x - finalWidth / 2,
          y: y - finalHeight / 2,
          width: finalWidth,
          height: finalHeight,
          zIndex: this.materials.length
        };

        this.materials.push(material);
        this.render();
        
        // Emit socket event
        if (window.socketClient) {
          window.socketClient.emitAddMaterial(material);
        }

        resolve(material);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load material image'));
      };
      
      img.src = materialUrl;
    });
  }

  /**
   * Handle mouse down
   */
  handleMouseDown(e) {
    const canvas = this.canvasManager.getCanvas();
    const coords = this.canvasManager.screenToCanvas(e.clientX, e.clientY);
    
    // Check if clicking on existing material (only non-ghost materials)
    const clickedMaterial = this.getMaterialAt(coords.x, coords.y);
    
    if (clickedMaterial && !clickedMaterial.isGhost) {
      // Select and start dragging
      this.selectedMaterial = clickedMaterial;
      this.dragging = true;
      this.dragOffset = {
        x: coords.x - clickedMaterial.x,
        y: coords.y - clickedMaterial.y
      };
      canvas.style.cursor = 'grabbing';
    } else if (this.pendingMaterial && this.pendingMaterial.ready) {
      // Add new material at click position
      this.addMaterial(
        this.pendingMaterial.url,
        coords.x,
        coords.y,
        this.pendingMaterial.width,
        this.pendingMaterial.height
      ).then(() => {
        this.pendingMaterial = null;
        canvas.style.cursor = 'default';
      });
    }
  }

  /**
   * Handle mouse move
   */
  handleMouseMove(e) {
    const canvas = this.canvasManager.getCanvas();
    const coords = this.canvasManager.screenToCanvas(e.clientX, e.clientY);
    
    if (this.dragging && this.selectedMaterial) {
      // Update material position
      this.selectedMaterial.x = coords.x - this.dragOffset.x;
      this.selectedMaterial.y = coords.y - this.dragOffset.y;
      
      // Keep within canvas bounds
      this.selectedMaterial.x = Math.max(0, Math.min(
        this.selectedMaterial.x,
        this.canvasManager.getDimensions().width - this.selectedMaterial.width
      ));
      this.selectedMaterial.y = Math.max(0, Math.min(
        this.selectedMaterial.y,
        this.canvasManager.getDimensions().height - this.selectedMaterial.height
      ));
      
      this.render();
      
      // Emit socket event
      if (window.socketClient) {
        window.socketClient.emitMoveMaterial(this.selectedMaterial);
      }
    } else {
      // Check if hovering over material (only non-ghost materials)
      const hoveredMaterial = this.getMaterialAt(coords.x, coords.y);
      if (hoveredMaterial && !hoveredMaterial.isGhost) {
        canvas.style.cursor = 'grab';
      } else if (this.pendingMaterial && this.pendingMaterial.ready) {
        canvas.style.cursor = 'crosshair';
      } else {
        canvas.style.cursor = 'default';
      }
    }
  }

  /**
   * Handle mouse up
   */
  handleMouseUp(e) {
    if (this.dragging) {
      this.dragging = false;
      this.selectedMaterial = null;
      const canvas = this.canvasManager.getCanvas();
      canvas.style.cursor = 'default';
    }
  }

  /**
   * Get material at coordinates
   */
  getMaterialAt(x, y) {
    // Check from top to bottom (reverse order for z-index)
    // Prioritize non-ghost materials
    for (let i = this.materials.length - 1; i >= 0; i--) {
      const material = this.materials[i];
      if (
        x >= material.x &&
        x <= material.x + material.width &&
        y >= material.y &&
        y <= material.y + material.height
      ) {
        return material;
      }
    }
    return null;
  }

  /**
   * Delete material
   */
  deleteMaterial(materialId) {
    const index = this.materials.findIndex(m => m.id === materialId);
    if (index !== -1) {
      this.materials.splice(index, 1);
      this.render();
      
      // Emit socket event
      if (window.socketClient) {
        window.socketClient.emitDeleteMaterial(materialId);
      }
    }
  }

  /**
   * Render materials
   */
  render() {
    // First render background
    this.canvasManager.render();
    
    // Then render materials
    const ctx = this.canvasManager.getContext();
    this.materials.forEach(material => {
      // Save context for ghost materials
      ctx.save();
      
      if (material.isGhost) {
        // Render ghost material with transparency
        ctx.globalAlpha = 0.5;
      }
      
      // Draw material image
      ctx.drawImage(
        material.image,
        material.x,
        material.y,
        material.width,
        material.height
      );
      
      if (material.isGhost) {
        // Draw user indicator border
        ctx.strokeStyle = material.userColor || '#3498db';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.8;
        ctx.strokeRect(
          material.x - 2,
          material.y - 2,
          material.width + 4,
          material.height + 4
        );
        
        // Draw user label
        const label = material.nickname || (material.userId ? material.userId.substring(0, 6) : 'User');
        ctx.fillStyle = material.userColor || '#3498db';
        ctx.globalAlpha = 0.9;
        ctx.font = 'bold 14px Arial';
        ctx.fillText(
          label,
          material.x + 5,
          material.y + 18
        );
      }
      
      ctx.restore();
    });

    // Update material count (only count non-ghost materials)
    const materialCountEl = document.getElementById('material-count');
    if (materialCountEl) {
      const ownMaterials = this.materials.filter(m => !m.isGhost);
      materialCountEl.textContent = `Material Count: ${ownMaterials.length}`;
    }
  }

  /**
   * Add external material
   */
  addExternalMaterial(materialData, isGhost = false) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const material = {
          id: materialData.materialId,
          url: materialData.materialUrl,
          image: img,
          x: materialData.x,
          y: materialData.y,
          width: materialData.width || img.width,
          height: materialData.height || img.height,
          zIndex: this.materials.length,
          isGhost: isGhost, // Mark as ghost for other users' materials
          userId: materialData.userId,
          userColor: materialData.color,
          nickname: materialData.nickname
        };

        this.materials.push(material);
        this.render();
        resolve(material);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load external material image'));
      };
      
      img.src = materialData.materialUrl;
    });
  }

  /**
   * Update material position
   */
  updateMaterialPosition(materialId, x, y) {
    const material = this.materials.find(m => m.id === materialId);
    if (material) {
      material.x = x;
      material.y = y;
      this.render();
    }
  }

  /**
   * Clear all materials
   */
  clear() {
    this.materials = [];
    this.selectedMaterial = null;
    this.pendingMaterial = null;
    this.render();
  }

  /**
   * Get all materials
   */
  getMaterials() {
    return this.materials;
  }
}

// Initialize collage manager
if (window.canvasManager) {
  window.collageManager = new CollageManager(window.canvasManager);
}

