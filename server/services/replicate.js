const Replicate = require('replicate');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ReplicateService {
  constructor() {
    this.apiToken = process.env.REPLICATE_API_TOKEN;
    this.replicate = null;
    // Using Stable Diffusion for landscape generation
    this.model = "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf";
    
    // Initialize Replicate client if token is available
    if (this.apiToken) {
      this.replicate = new Replicate({
        auth: this.apiToken,
      });
    }
  }
  
  /**
   * Check if API token is configured
   */
  isConfigured() {
    return !!this.apiToken;
  }

  /**
   * Generate a random US landscape background image
   * @returns {Promise<string>} URL of the generated image
   */
  async generateBackground() {
    if (!this.isConfigured()) {
      throw new Error('REPLICATE_API_TOKEN is not configured in .env file. Please set REPLICATE_API_TOKEN to use background generation.');
    }
    
    if (!this.replicate) {
      this.replicate = new Replicate({
        auth: this.apiToken,
      });
    }
    
    try {
      // Random US landscape prompts
      const prompts = [
        "A breathtaking view of the Grand Canyon at sunset, dramatic red and orange rock formations, vast desert landscape, cinematic lighting, 4k, highly detailed",
        "Beautiful mountain range in Colorado, snow-capped peaks, pine forests, clear blue sky, natural lighting, professional photography, 4k",
        "Serene lake in Yosemite National Park, mirror-like reflection, granite cliffs, autumn colors, golden hour, high resolution, detailed",
        "Coastal cliffs of Big Sur, California, Pacific Ocean waves crashing, dramatic clouds, sunset colors, wide angle view, 4k quality",
        "Vast prairie in Montana, rolling hills, wildflowers, dramatic sky with clouds, golden hour, cinematic composition, highly detailed",
        "Redwood forest in Northern California, towering ancient trees, dappled sunlight, misty atmosphere, nature photography, 4k resolution",
        "Desert landscape in Arizona, saguaro cacti, red rock formations, clear blue sky, warm colors, professional landscape photography",
        "Mountain lake in Wyoming, crystal clear water, surrounding peaks, alpine meadow, perfect reflection, natural beauty, high quality",
        "Coastal beach in Oregon, rocky shoreline, Pacific waves, moody sky, dramatic lighting, landscape photography, detailed",
        "Autumn forest in New England, vibrant fall colors, winding path, soft natural light, peaceful atmosphere, 4k quality"
      ];

      // Randomly select a prompt
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

      console.log(`Generating background with prompt: ${randomPrompt}`);

      const output = await this.replicate.run(this.model, {
        input: {
          prompt: randomPrompt,
          image_dimensions: "768x768", // Supported dimensions: "512x512" or "768x768"
          num_outputs: 1,
          num_inference_steps: 50,
          guidance_scale: 7.5,
          scheduler: "K_EULER"
        }
      });

      // Output is an array of URLs
      const imageUrl = Array.isArray(output) ? output[0] : output;
      
      if (!imageUrl) {
        throw new Error('No image URL returned from Replicate');
      }

      console.log(`Background generated: ${imageUrl}`);
      return imageUrl;
    } catch (error) {
      console.error('Error generating background:', error);
      
      // Extract more detailed error information from Replicate API
      let errorMessage = error.message || 'Failed to generate background';
      
      // Check if error has response data with status code
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 402) {
          errorMessage = `Request to ${error.config?.url || 'Replicate API'} failed with status 402 Payment Required: ${JSON.stringify(errorData || {})}`;
        } else if (status === 401) {
          errorMessage = `Request to ${error.config?.url || 'Replicate API'} failed with status 401 Unauthorized: Invalid API token`;
        } else if (status === 429) {
          errorMessage = `Request to ${error.config?.url || 'Replicate API'} failed with status 429 Rate Limit Exceeded`;
        }
      } else if (error.status) {
        // Handle Replicate SDK error format
        if (error.status === 402) {
          errorMessage = `Request to Replicate API failed with status 402 Payment Required: ${error.message || JSON.stringify(error)}`;
        }
      }
      
      // Create new error with detailed message
      const detailedError = new Error(errorMessage);
      detailedError.originalError = error;
      throw detailedError;
    }
  }

  /**
   * Download image from URL and save locally (optional)
   * @param {string} imageUrl - URL of the image
   * @param {string} filename - Filename to save as
   * @returns {Promise<string>} Local file path
   */
  async downloadImage(imageUrl, filename) {
    try {
      const response = await axios({
        url: imageUrl,
        method: 'GET',
        responseType: 'stream'
      });

      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, filename);
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }
}

module.exports = new ReplicateService();

