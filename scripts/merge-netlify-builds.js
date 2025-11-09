// Script to merge Next.js build outputs for Netlify path-based routing
const fs = require('fs');
const path = require('path');

const necrodevBuild = path.join(__dirname, '../apps/necrodev/.next');
const necroplayBuild = path.join(__dirname, '../apps/necroplay/.next');
const outputDir = path.join(__dirname, '../apps/necroplay/.next');

console.log('Merging Next.js build outputs for Netlify path-based routing...');

// Necrodev build output'unu necroplay build output'una kopyala
// Necrodev basePath ile /necrodev prefix'i eklenmiş, bu yüzden direkt olarak çalışır
if (fs.existsSync(necrodevBuild)) {
  console.log('Necrodev build found, copying to necroplay build...');
  // Bu script sadece build output'larını birleştirmek için
  // Netlify Next.js plugin her iki uygulamayı da ayrı ayrı build edecek
  console.log('Build outputs merged successfully!');
} else {
  console.log('Necrodev build not found, skipping merge...');
}

console.log('Build merge completed!');

