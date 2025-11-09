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

// Necrodev build output'unu necroplay build output'una merge et
// Necrodev basePath ile /necrodev prefix'i eklenmiş, bu yüzden direkt olarak çalışır
if (fs.existsSync(necrodevBuild) && fs.existsSync(necroplayBuild)) {
  console.log('Merging necrodev build into necroplay build...');
  
  // Necrodev'in static files'larını kopyala
  const necrodevStatic = path.join(necrodevBuild, 'static');
  const necroplayStatic = path.join(necroplayBuild, 'static');
  
  if (fs.existsSync(necrodevStatic)) {
    console.log('Copying necrodev static files...');
    if (!fs.existsSync(necroplayStatic)) {
      fs.mkdirSync(necroplayStatic, { recursive: true });
    }
    fs.readdirSync(necrodevStatic).forEach(item => {
      const src = path.join(necrodevStatic, item);
      const dest = path.join(necroplayStatic, item);
      copyRecursiveSync(src, dest);
    });
  }
  
  // Necrodev'in server files'larını kopyala (functions için)
  const necrodevServer = path.join(necrodevBuild, 'server');
  const necroplayServer = path.join(necroplayBuild, 'server');
  
  if (fs.existsSync(necrodevServer)) {
    console.log('Copying necrodev server files...');
    if (!fs.existsSync(necroplayServer)) {
      fs.mkdirSync(necroplayServer, { recursive: true });
    }
    
    // Server pages'ları kopyala
    const necrodevPages = path.join(necrodevServer, 'pages');
    const necroplayPages = path.join(necroplayServer, 'pages');
    
    if (fs.existsSync(necrodevPages)) {
      if (!fs.existsSync(necroplayPages)) {
        fs.mkdirSync(necroplayPages, { recursive: true });
      }
      fs.readdirSync(necrodevPages).forEach(item => {
        const src = path.join(necrodevPages, item);
        const dest = path.join(necroplayPages, item);
        copyRecursiveSync(src, dest);
      });
    }
    
    // Server app directory'yi kopyala (App Router için)
    const necrodevApp = path.join(necrodevServer, 'app');
    const necroplayApp = path.join(necroplayServer, 'app');
    
    if (fs.existsSync(necrodevApp)) {
      console.log('Copying necrodev app directory...');
      copyRecursiveSync(necrodevApp, necroplayApp);
    }
  }
  
  // Necrodev'in standalone output'unu kopyala (eğer varsa)
  const necrodevStandalone = path.join(necrodevBuild, 'standalone');
  if (fs.existsSync(necrodevStandalone)) {
    console.log('Copying necrodev standalone files...');
    const necroplayStandalone = path.join(necroplayBuild, 'standalone');
    copyRecursiveSync(necrodevStandalone, necroplayStandalone);
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

