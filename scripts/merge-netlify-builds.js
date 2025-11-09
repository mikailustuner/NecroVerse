// Script to merge Next.js build outputs for Netlify path-based routing
const fs = require('fs');
const path = require('path');

const necrodevBuild = path.join(__dirname, '../apps/necrodev/.next');
const necroplayBuild = path.join(__dirname, '../apps/necroplay/.next');

console.log('Merging Next.js build outputs for Netlify path-based routing...');

// Recursive copy function
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    if (!fs.existsSync(path.dirname(dest))) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

// Necroplay build output'unu necrodev build output'una kopyala
// Necroplay basePath ile /necroplay prefix'i eklenmiş, bu yüzden direkt olarak çalışır
if (fs.existsSync(necrodevBuild) && fs.existsSync(necroplayBuild)) {
  console.log('Necroplay build found, copying to necrodev build...');
  
  // Necroplay'in static files'larını necrodev'e kopyala (merge)
  const necroplayStatic = path.join(necroplayBuild, 'static');
  const necrodevStatic = path.join(necrodevBuild, 'static');
  
  if (fs.existsSync(necroplayStatic)) {
    console.log('Merging necroplay static files...');
    // Static files'ları merge et (aynı isimdeki dosyalar üzerine yazılır)
    fs.readdirSync(necroplayStatic).forEach(item => {
      const src = path.join(necroplayStatic, item);
      const dest = path.join(necrodevStatic, item);
      copyRecursiveSync(src, dest);
    });
  }
  
  // Necroplay'in standalone output'unu kopyala (eğer varsa)
  const necroplayStandalone = path.join(necroplayBuild, 'standalone');
  if (fs.existsSync(necroplayStandalone)) {
    console.log('Copying necroplay standalone files...');
    const necrodevStandalone = path.join(necrodevBuild, 'standalone');
    copyRecursiveSync(necroplayStandalone, necrodevStandalone);
  }
  
  // Necroplay'in server files'larını kopyala (functions için)
  const necroplayServer = path.join(necroplayBuild, 'server');
  const necrodevServer = path.join(necrodevBuild, 'server');
  
  if (fs.existsSync(necroplayServer)) {
    console.log('Copying necroplay server files...');
    // Server files'ları merge et
    fs.readdirSync(necroplayServer).forEach(item => {
      const src = path.join(necroplayServer, item);
      const dest = path.join(necrodevServer, item);
      copyRecursiveSync(src, dest);
    });
  }
  
  // Necroplay'in pages'larını kopyala (eğer varsa)
  const necroplayPages = path.join(necroplayBuild, 'server', 'pages');
  const necrodevPages = path.join(necrodevBuild, 'server', 'pages');
  
  if (fs.existsSync(necroplayPages)) {
    console.log('Copying necroplay pages...');
    if (!fs.existsSync(necrodevPages)) {
      fs.mkdirSync(necrodevPages, { recursive: true });
    }
    fs.readdirSync(necroplayPages).forEach(item => {
      const src = path.join(necroplayPages, item);
      const dest = path.join(necrodevPages, item);
      copyRecursiveSync(src, dest);
    });
  }
  
  console.log('Build outputs merged successfully!');
} else {
  console.log('Build outputs not found, skipping merge...');
  if (!fs.existsSync(necrodevBuild)) {
    console.log('Necrodev build not found!');
  }
  if (!fs.existsSync(necroplayBuild)) {
    console.log('Necroplay build not found!');
  }
}

console.log('Build merge completed!');

