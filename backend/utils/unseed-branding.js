require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Settings = require('../models/Settings');

const destDir = path.join(__dirname, '..', 'uploads', 'branding');
const exts = ['.png', '.jpg', '.jpeg', '.webp'];

function deleteAllVariants(baseName) {
  let deleted = [];
  for (const ext of exts) {
    const candidate = path.join(destDir, baseName + ext);
    if (fs.existsSync(candidate)) {
      fs.unlinkSync(candidate);
      deleted.push(baseName + ext);
    }
  }
  return deleted;
}

async function run() {
  await connectDB();

  let settings = await Settings.findOne();
  if (!settings) {
    console.log('No Settings document found — nothing to clear.');
    await mongoose.disconnect();
    process.exit(0);
  }

  const deletedLogo = deleteAllVariants('logo');
  if (deletedLogo.length) {
    console.log(`✓ Deleted logo file(s): ${deletedLogo.join(', ')}`);
  } else {
    console.log('… No logo file(s) found on disk — skipped');
  }

  const deletedSig = deleteAllVariants('signature');
  if (deletedSig.length) {
    console.log(`✓ Deleted signature file(s): ${deletedSig.join(', ')}`);
  } else {
    console.log('… No signature file(s) found on disk — skipped');
  }

  settings.logo = undefined;
  settings.signature = undefined;
  await settings.save();
  console.log('✓ Settings.logo and Settings.signature cleared.');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});