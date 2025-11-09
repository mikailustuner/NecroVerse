# Kiro Integration Design Document

## Overview

Kiro Integration provides automation and AI-driven features through hooks, MCP extensions, and steering files. It enables automatic code resurrection, commit message transformation, UI generation, WebAssembly compilation, and NFT minting while maintaining the Dark Architect personality.

## Architecture

```
.kiro/
├── hooks/
│   ├── on_revive_code.js
│   ├── on_commit.js
│   ├── on_ui_generate.js
│   ├── on_setup.js
│   └── on_test.js
├── settings/
│   └── mcp.json
├── steering/
│   └── dark-architect.md
└── logs/
    └── hooks.log
```

## Hooks

### on_revive_code Hook

```javascript
// .kiro/hooks/on_revive_code.js
const { AnalysisEngine } = require('../../packages/graveyard-runtime');
const { CodeGenerator } = require('../../apps/necrodev/services/codeGenerator');

module.exports = async (context) => {
  const { file, kiro } = context;
  
  kiro.log('☠️ Initiating resurrection protocol...');
  kiro.log('The soul extraction begins. Stand by.');
  
  try {
    // Detect technology
    const techType = detectTechnology(file.name, file.buffer);
    kiro.log(`Technology detected: ${techType}`);
    
    // Analyze file
    const engine = new AnalysisEngine();
    const analysis = await engine.analyze(file);
    
    kiro.log(`Confidence: ${analysis.confidence}% | Complexity: ${analysis.complexity}`);
    kiro.log('The essence has been captured.');
    
    // Generate modern code
    const generator = new CodeGenerator();
    const resurrected = await generator.generate(analysis);
    
    kiro.log('⚡ The binding ritual is complete.');
    kiro.log(`${resurrected.files.length} components materialized from the void.`);
    
    return {
      success: true,
      analysis,
      code: resurrected,
      message: '☠️ The soul has been rebound ☠️'
    };
  } catch (error) {
    kiro.log(`⚠️ The ritual falters... ${error.message}`);
    return {
      success: false,
      error: error.message,
      message: '⚠️ The resurrection failed. The artifact resists.'
    };
  }
};

function detectTechnology(filename, buffer) {
  const ext = filename.split('.').pop().toLowerCase();
  const view = new DataView(buffer);
  
  // Verify with magic numbers
  if (ext === 'swf' && (view.getUint8(0) === 0x46 || view.getUint8(0) === 0x43)) {
    return 'Flash ActionScript';
  }
  if (ext === 'jar' && view.getUint32(0) === 0x504B0304) {
    return 'Java Archive';
  }
  if (ext === 'xap' && view.getUint32(0) === 0x504B0304) {
    return 'Silverlight XAML';
  }
  if (ext === 'dcr' && (view.getUint32(0) === 0x52494658 || view.getUint32(0) === 0x58464952)) {
    return 'Director Lingo';
  }
  
  return ext.toUpperCase();
}
```

### on_commit Hook

```javascript
// .kiro/hooks/on_commit.js
module.exports = async (context) => {
  const { message, kiro } = context;
  
  // Transform commit message to occult style
  const occultMessage = transformToOccult(message);
  
  // Display ASCII art
  const art = generateSkullArt();
  console.log(art);
  
  // Optional: play sound
  if (process.env.COMMIT_TO_DARKNESS === 'true') {
    playRitualSound();
  }
  
  return {
    message: `☠️ ${occultMessage} ☠️`,
    art
  };
};

function transformToOccult(message) {
  const transformations = {
    'add': 'summon',
    'added': 'summoned',
    'create': 'manifest',
    'created': 'manifested',
    'delete': 'banish',
    'deleted': 'banished',
    'fix': 'exorcise',
    'fixed': 'exorcised',
    'update': 'transmute',
    'updated': 'transmuted',
    'implement': 'bind',
    'implemented': 'bound',
    'refactor': 'reshape',
    'refactored': 'reshaped',
    'test': 'trial',
    'tested': 'trialed',
    'deploy': 'release to the void',
    'deployed': 'released to the void',
  };
  
  let transformed = message.toLowerCase();
  
  for (const [original, occult] of Object.entries(transformations)) {
    const regex = new RegExp(`\\b${original}\\b`, 'gi');
    transformed = transformed.replace(regex, occult);
  }
  
  return transformed.charAt(0).toUpperCase() + transformed.slice(1);
}

function generateSkullArt() {
  return `
╔═══════════════════════════════════════╗
║                                       ║
║              ☠️  ☠️  ☠️               ║
║                                       ║
║     C O M M I T   T O   D A R K      ║
║                                       ║
║              ☠️  ☠️  ☠️               ║
║                                       ║
╚═══════════════════════════════════════╝
  `;
}

function playRitualSound() {
  // Play a ritual sound effect (implementation depends on platform)
  // Could use node-speaker or similar library
}
```

### on_ui_generate Hook

```javascript
// .kiro/hooks/on_ui_generate.js
module.exports = async (context) => {
  const { componentName, props, kiro } = context;
  
  kiro.log(`Summoning component: ${componentName}`);
  
  const component = await generateComponent({
    name: componentName,
    props,
    theme: 'necro-gothic',
    colors: {
      void: '#0a0612',
      arcane: '#a855f7',
      aqua: '#00fff7',
      blood: '#ff006e',
      ghost: '#19ff90',
    },
    animations: true,
    glitchEffects: true
  });
  
  kiro.log('⚡ Component materialized from the void');
  
  return {
    code: component,
    message: 'summon(): component materialized from the void'
  };
};

async function generateComponent({ name, props, theme, colors, animations, glitchEffects }) {
  const propsInterface = props.map(p => `  ${p.name}: ${p.type};`).join('\n');
  const propsDestructure = props.map(p => p.name).join(',\n  ');
  
  return `
import React from 'react';
import { motion } from 'framer-motion';
${glitchEffects ? "import { GlitchText } from '@necroverse/ui';" : ''}

interface ${name}Props {
${propsInterface}
}

export const ${name}: React.FC<${name}Props> = ({
  ${propsDestructure}
}) => {
  return (
    <motion.div
      ${animations ? `
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      ` : ''}
      className="bg-void border border-arcane/30 rounded-lg p-6 hover:border-arcane transition-all"
    >
      ${glitchEffects ? `<GlitchText>{/* Your content */}</GlitchText>` : ''}
      {/* Component implementation */}
    </motion.div>
  );
};
  `.trim();
}
```

### on_setup Hook

```javascript
// .kiro/hooks/on_setup.js
const fs = require('fs').promises;
const path = require('path');

module.exports = async (context) => {
  const { kiro } = context;
  
  kiro.log('☠️ Initiating resurrection network setup...');
  
  try {
    // Create directory structure
    await createDirectories();
    kiro.log('✓ Directory structure manifested');
    
    // Generate .env.example
    await generateEnvExample();
    kiro.log('✓ Environment template created');
    
    // Initialize Supabase config
    await initializeSupabase();
    kiro.log('✓ Supabase configuration bound');
    
    // Display resurrection chant
    const chant = generateResurrectionChant();
    console.log(chant);
    
    kiro.log('⚡ Setup ritual complete. The network awakens.');
    
    return {
      success: true,
      message: 'The resurrection network is ready'
    };
  } catch (error) {
    kiro.log(`⚠️ Setup ritual failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

async function createDirectories() {
  const dirs = [
    'apps/necrodev',
    'apps/necroplay',
    'packages/graveyard-runtime',
    'packages/ui',
    'supabase/migrations',
    '.kiro/hooks',
    '.kiro/settings',
    '.kiro/steering',
    '.kiro/logs'
  ];
  
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function generateEnvExample() {
  const content = `
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Solana Configuration (for NFT minting)
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WALLET_PRIVATE_KEY=your_wallet_private_key

# Application URLs
NEXT_PUBLIC_NECRODEV_URL=http://localhost:3001
NEXT_PUBLIC_NECROPLAY_URL=http://localhost:3002

# Optional Features
COMMIT_TO_DARKNESS=false
ENABLE_CRT_OVERLAY=true
  `.trim();
  
  await fs.writeFile('.env.example', content);
}

async function initializeSupabase() {
  // Create initial migration
  const migration = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create resurrected_apps table
CREATE TABLE resurrected_apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  original_tech TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  code_files JSONB NOT NULL,
  entry_point TEXT NOT NULL,
  metadata JSONB,
  nft_address TEXT,
  is_public BOOLEAN DEFAULT false
);

-- Create soul_counter table
CREATE TABLE soul_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  count INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Initialize soul counter
INSERT INTO soul_counter (id, count) VALUES (1, 0);

-- Create indexes
CREATE INDEX idx_apps_public ON resurrected_apps(is_public) WHERE is_public = true;
  `.trim();
  
  await fs.mkdir('supabase/migrations', { recursive: true });
  await fs.writeFile('supabase/migrations/001_initial_schema.sql', migration);
}

function generateResurrectionChant() {
  return `
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     ███╗   ██╗███████╗ ██████╗██████╗  ██████╗          ║
║     ████╗  ██║██╔════╝██╔════╝██╔══██╗██╔═══██╗         ║
║     ██╔██╗ ██║█████╗  ██║     ██████╔╝██║   ██║         ║
║     ██║╚██╗██║██╔══╝  ██║     ██╔══██╗██║   ██║         ║
║     ██║ ╚████║███████╗╚██████╗██║  ██║╚██████╔╝         ║
║     ╚═╝  ╚═══╝╚══════╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝          ║
║                                                           ║
║              R E S U R R E C T I O N   N E T             ║
║                                                           ║
║     "From the void, we summon. To the void, we return.   ║
║              But in between, we create."                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Next steps:
1. Configure your .env file with Supabase credentials
2. Run: pnpm install
3. Run: pnpm dev
4. Begin resurrection at http://localhost:3001
  `;
}
```

## MCP Extensions

### MCP Configuration

```json
{
  "mcpServers": {
    "legacy-converter": {
      "command": "node",
      "args": ["packages/mcp/legacy-converter.js"],
      "env": {
        "EMSCRIPTEN_PATH": "/path/to/emscripten"
      },
      "disabled": false,
      "autoApprove": ["convert"]
    },
    "ghost-nft": {
      "command": "node",
      "args": ["packages/mcp/ghost-nft.js"],
      "env": {
        "SOLANA_RPC_URL": "https://api.devnet.solana.com",
        "SOLANA_WALLET_PRIVATE_KEY": "${SOLANA_WALLET_PRIVATE_KEY}"
      },
      "disabled": false,
      "autoApprove": ["mint"]
    }
  }
}
```

### LegacyConverter Extension

```javascript
// packages/mcp/legacy-converter.js
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class LegacyConverterMCP {
  async convert({ file, targetFormat }) {
    if (targetFormat === 'wasm') {
      return await this.compileToWASM(file);
    } else if (targetFormat === 'js') {
      return await this.transpileToJS(file);
    }
    
    throw new Error(`Unsupported target format: ${targetFormat}`);
  }
  
  async compileToWASM(file) {
    // Generate C code from interpreted bytecode
    const cCode = await this.generateCCode(file);
    
    // Write to temp file
    const tempFile = path.join('/tmp', `necro_${Date.now()}.c`);
    await fs.writeFile(tempFile, cCode);
    
    // Compile with Emscripten
    const wasmFile = tempFile.replace('.c', '.wasm');
    await this.runEmscripten(tempFile, wasmFile);
    
    // Read compiled WASM
    const wasmBuffer = await fs.readFile(wasmFile);
    
    // Generate glue code
    const glueCode = this.generateGlueCode(file);
    
    // Cleanup
    await fs.unlink(tempFile);
    await fs.unlink(wasmFile);
    
    return {
      output: wasmBuffer,
      glueCode,
      metadata: {
        originalSize: file.buffer.byteLength,
        compiledSize: wasmBuffer.byteLength,
        compressionRatio: (wasmBuffer.byteLength / file.buffer.byteLength).toFixed(2)
      }
    };
  }
  
  async runEmscripten(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
      const emcc = spawn('emcc', [
        inputFile,
        '-o', outputFile,
        '-O3',
        '-s', 'WASM=1',
        '-s', 'EXPORTED_FUNCTIONS=["_main"]'
      ]);
      
      emcc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Emscripten compilation failed with code ${code}`));
        }
      });
    });
  }
  
  generateGlueCode(file) {
    return `
import wasmModule from './necro.wasm';

export async function initializeRuntime() {
  const wasm = await WebAssembly.instantiate(wasmModule);
  return {
    run: () => wasm.instance.exports.main(),
    // Additional exports
  };
}
    `.trim();
  }
}

module.exports = new LegacyConverterMCP();
```

### GhostNFT Extension

```javascript
// packages/mcp/ghost-nft.js
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { Metaplex } = require('@metaplex-foundation/js');

class GhostNFTMCP {
  constructor() {
    this.connection = new Connection(process.env.SOLANA_RPC_URL);
    this.wallet = this.loadWallet();
    this.metaplex = Metaplex.make(this.connection).use(this.wallet);
  }
  
  loadWallet() {
    const privateKey = process.env.SOLANA_WALLET_PRIVATE_KEY;
    const keypair = Keypair.fromSecretKey(Buffer.from(privateKey, 'base64'));
    return keypair;
  }
  
  async mint({ appData, metadata }) {
    // Create NFT metadata
    const nftMetadata = {
      name: metadata.name,
      symbol: 'NECRO',
      description: metadata.description,
      image: await this.uploadThumbnail(appData.thumbnail),
      attributes: [
        { trait_type: 'Original Technology', value: metadata.originalTech },
        { trait_type: 'Resurrection Date', value: new Date().toISOString() },
        { trait_type: 'Complexity', value: appData.complexity },
        { trait_type: 'Lines of Code', value: appData.linesOfCode },
      ],
      properties: {
        files: [
          {
            uri: await this.uploadCode(appData.codeFiles),
            type: 'application/json'
          }
        ],
        category: 'code'
      }
    };
    
    // Upload metadata to Arweave
    const metadataUri = await this.uploadMetadata(nftMetadata);
    
    // Mint NFT
    const { nft } = await this.metaplex.nfts().create({
      uri: metadataUri,
      name: metadata.name,
      sellerFeeBasisPoints: 500, // 5%
    });
    
    return {
      nftAddress: nft.address.toString(),
      transactionId: nft.mint.toString(),
      metadata: nftMetadata
    };
  }
  
  async uploadMetadata(metadata) {
    const { uri } = await this.metaplex.storage().upload(metadata);
    return uri;
  }
  
  async uploadThumbnail(thumbnail) {
    if (!thumbnail) return '';
    const { uri } = await this.metaplex.storage().upload(thumbnail);
    return uri;
  }
  
  async uploadCode(codeFiles) {
    const codeData = JSON.stringify(codeFiles);
    const { uri } = await this.metaplex.storage().upload(codeData);
    return uri;
  }
}

module.exports = new GhostNFTMCP();
```

## Steering Files

The dark-architect.md steering file defines the AI personality and is already provided in the workspace.

## Testing Strategy

- Unit tests for each hook
- Integration tests for MCP extensions
- Test hook execution with sample files
- Test commit message transformation
- Test NFT minting on Solana devnet
- Test WASM compilation with Emscripten
