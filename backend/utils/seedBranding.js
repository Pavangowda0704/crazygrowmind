require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Settings = require('../models/Settings');

const sourceDir = path.join(__dirname, '..', 'branding-source');
const destDir = path.join(__dirname, '..', 'uploads', 'branding');
const exts = ['.png', '.jpg', '.jpeg', '.webp'];

function findSourceFile(baseName) {
  for (const ext of exts) {
    const candidate = path.join(sourceDir, baseName + ext);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

async function run() {
  await connectDB();
  fs.mkdirSync(destDir, { recursive: true });

  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();

  const logoSrc = findSourceFile('logo');
  if (logoSrc) {
    const filename = `logo${path.extname(logoSrc)}`;
    fs.copyFileSync(logoSrc, path.join(destDir, filename));
    settings.logo = { url: `/uploads/branding/${filename}`, public_id: filename };
    console.log(`✓ Logo set from branding-source/${path.basename(logoSrc)}`);
  } else {
    console.log('… No logo file found in backend/branding-source/ (expected logo.png/.jpg/.jpeg/.webp) — skipped');
  }

  const sigSrc = findSourceFile('signature');
  if (sigSrc) {
    const filename = `signature${path.extname(sigSrc)}`;
    fs.copyFileSync(sigSrc, path.join(destDir, filename));
    settings.signature = { url: `/uploads/branding/${filename}`, public_id: filename };
    console.log(`✓ Signature set from branding-source/${path.basename(sigSrc)}`);
  } else {
    console.log('… No signature file found in backend/branding-source/ (expected signature.png/.jpg/.jpeg/.webp) — skipped');
  }

  await settings.save();
  console.log('Settings saved.');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
