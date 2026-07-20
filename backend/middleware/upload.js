const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Auto-detects whether real Cloudinary credentials are configured. If not
// (e.g. running locally without setting them up), uploads fall back to
// local disk storage under backend/uploads/<folder> and are served back
// out via express.static (see server.js). This means services images,
// the company logo, and the signature all work out of the box with zero
// external setup for local development.
const useCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

const uploadsRoot = path.join(__dirname, '..', 'uploads');

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

function makeCloudinaryStorage(folder) {
  return new CloudinaryStorage({
    cloudinary,
    params: async () => ({
      folder: `crazygrowmind/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    }),
  });
}

function makeLocalStorage(folder) {
  const dir = path.join(uploadsRoot, folder);
  fs.mkdirSync(dir, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
}

/**
 * Creates a multer instance scoped to a folder (e.g. 'services', 'branding').
 * Picks Cloudinary or local disk storage automatically based on env config.
 */
function createUploader(folder) {
  const storage = useCloudinary ? makeCloudinaryStorage(folder) : makeLocalStorage(folder);
  return multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
}

/**
 * Normalizes a completed upload (Cloudinary or local) into { url, public_id }.
 * Local URLs are root-relative (e.g. /uploads/branding/169...png) so the
 * admin's Vite dev server can proxy them (see admin/vite.config.js) and
 * they work identically whether opened from the admin app or emailed.
 */
function resolveUploadedFile(req, folder) {
  if (!req.file) return null;
  if (useCloudinary) {
    return { url: req.file.path, public_id: req.file.filename };
  }
  return { url: `/uploads/${folder}/${req.file.filename}`, public_id: req.file.filename };
}

/**
 * Deletes a previously uploaded file (Cloudinary asset or local file) when
 * it's being replaced or its parent record is deleted.
 */
async function deleteUploadedFile(fileMeta) {
  if (!fileMeta) return;
  if (useCloudinary && fileMeta.public_id) {
    await cloudinary.uploader.destroy(fileMeta.public_id).catch(() => {});
  } else if (!useCloudinary && fileMeta.url && fileMeta.url.startsWith('/uploads/')) {
    const filePath = path.join(uploadsRoot, '..', fileMeta.url);
    fs.unlink(filePath, () => {}); // best-effort, ignore if already gone
  }
}

module.exports = { createUploader, resolveUploadedFile, deleteUploadedFile, useCloudinary };
