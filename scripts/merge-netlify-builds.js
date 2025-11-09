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

// Necrodev build output'unu necroplay build output'una kopyala
// Necrodev basePath ile /necrodev prefix'i eklenmiş, bu yüzden direkt olarak çalışır
if (fs.existsSync(necrodevBuild) && fs.existsSync(necroplayBuild)) {
  console.log('Necrodev build found, copying to necroplay build...');
  
  // Necrodev'in static files'larını necroplay'e kopyala (merge)
  const necrodevStatic = path.join(necrodevBuild, 'static');
  const necroplayStatic = path.join(necroplayBuild, 'static');
  
  if (fs.existsSync(necrodevStatic)) {
    console.log('Merging necrodev static files...');
    // Static files'ları merge et (aynı isimdeki dosyalar üzerine yazılır)
    fs.readdirSync(necrodevStatic).forEach(item => {
      const src = path.join(necrodevStatic, item);
      const dest = path.join(necroplayStatic, item);
      copyRecursiveSync(src, dest);
    });
  }
  
  // Necrodev'in standalone output'unu kopyala (eğer varsa)
  const necrodevStandalone = path.join(necrodevBuild, 'standalone');
  if (fs.existsSync(necrodevStandalone)) {
    console.log('Copying necrodev standalone files...');
    const necroplayStandalone = path.join(necroplayBuild, 'standalone');
    copyRecursiveSync(necrodevStandalone, necroplayStandalone);
  }
  
  // Necrodev'in server files'larını kopyala (functions için)
  const necrodevServer = path.join(necrodevBuild, 'server');
  const necroplayServer = path.join(necroplayBuild, 'server');
  
  if (fs.existsSync(necrodevServer)) {
    console.log('Copying necrodev server files...');
    // Server files'ları merge et
    fs.readdirSync(necrodevServer).forEach(item => {
      const src = path.join(necrodevServer, item);
      const dest = path.join(necroplayServer, item);
      copyRecursiveSync(src, dest);
    });
  }
  
  // Necrodev'in pages'larını kopyala (eğer varsa)
  const necrodevPages = path.join(necrodevBuild, 'server', 'pages');
  const necroplayPages = path.join(necroplayBuild, 'server', 'pages');
  
  if (fs.existsSync(necrodevPages)) {
    console.log('Copying necrodev pages...');
    if (!fs.existsSync(necroplayPages)) {
      fs.mkdirSync(necroplayPages, { recursive: true });
    }
    fs.readdirSync(necrodevPages).forEach(item => {
      const src = path.join(necrodevPages, item);
      const dest = path.join(necroplayPages, item);
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

