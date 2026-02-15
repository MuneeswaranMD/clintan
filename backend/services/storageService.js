const cloudinary = require('cloudinary').v2;
const { nanoid } = require('nanoid');

class StorageService {
  constructor() {
    this.configured = false;
    if (process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });
      this.configured = true;
      console.log('✅ Cloudinary storage configured');
    } else {
      console.log('⚠️  Cloudinary not configured. Using local temp storage (Simulated)');
    }
  }

  async uploadPDF(buffer, fileName) {
    if (!this.configured) {
      console.warn('⚠️  Storage not configured. Returning simulation URL.');
      return `https://storage.averqon.com/temp/${fileName || nanoid(10)}.pdf`;
    }

    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            public_id: `billing/${fileName || nanoid(10)}`,
            format: 'pdf',
            access_mode: 'public'
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );

        uploadStream.end(buffer);
      });
    } catch (error) {
      console.error('❌ Cloudinary upload failed:', error.message);
      throw error;
    }
  }
}

module.exports = new StorageService();
