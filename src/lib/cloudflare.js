import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Initialize Cloudflare R2 client (S3-compatible)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload file to Cloudflare R2
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - File name with extension
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export async function uploadToR2(fileBuffer, fileName, contentType) {
  try {
    const key = `uploads/${Date.now()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await r2Client.send(command);
    
    // Return public URL
    const publicUrl = `${process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL}/${key}`;
    return publicUrl;
  } catch (error) {
    console.error('R2 upload error:', error);
    throw new Error('Failed to upload file to R2');
  }
}

/**
 * Delete file from Cloudflare R2
 * @param {string} fileUrl - Full URL of the file
 * @returns {Promise<boolean>}
 */
export async function deleteFromR2(fileUrl) {
  try {
    // Extract key from URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash
    
    const command = new DeleteObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error('R2 delete error:', error);
    return false;
  }
}

/**
 * Upload multiple files to R2
 * @param {Array<{buffer: Buffer, fileName: string, contentType: string}>} files
 * @returns {Promise<string[]>} - Array of public URLs
 */
export async function uploadMultipleToR2(files) {
  try {
    const uploadPromises = files.map(file => 
      uploadToR2(file.buffer, file.fileName, file.contentType)
    );
    
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Multiple R2 upload error:', error);
    throw new Error('Failed to upload files to R2');
  }
}
