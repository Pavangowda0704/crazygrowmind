const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const uploadsRoot = path.join(__dirname, '..', 'uploads');

/**
 * Resolves an image URL (Cloudinary URL, or a local `/uploads/...` path
 * produced by middleware/upload.js's local-storage fallback) into a Buffer
 * so it can be embedded in a PDFKit document via doc.image(). PDFKit
 * cannot fetch remote URLs or resolve relative paths itself.
 *
 * Local `/uploads/...` URLs are read straight off disk (fast, no network
 * hop back to our own server). Anything else (http/https, e.g. Cloudinary)
 * is downloaded. Resolves to `null` on any failure so callers can safely
 * skip the image (e.g. no logo uploaded yet) without breaking PDF generation.
 *
 * @param {string} url
 * @returns {Promise<Buffer|null>}
 */
async function fetchImageBuffer(url) {
  if (!url) return null;

  if (url.startsWith('/uploads/')) {
    const filePath = path.join(uploadsRoot, url.replace('/uploads/', ''));
    try {
      return await fs.promises.readFile(filePath);
    } catch (e) {
      return null;
    }
  }

  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const request = client.get(url, (response) => {
      if (response.statusCode !== 200) {
        response.resume(); // discard
        return resolve(null);
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', () => resolve(null));
    });

    request.on('error', () => resolve(null));
    request.setTimeout(8000, () => {
      request.destroy();
      resolve(null);
    });
  });
}

module.exports = fetchImageBuffer;
