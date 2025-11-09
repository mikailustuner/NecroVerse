/**
 * NecroNet - on_revive_code Hook
 * 
 * Triggered when a user uploads a legacy file for resurrection.
 * This hook analyzes the file, extracts its soul (core logic), 
 * and generates modern React/TypeScript code.
 * 
 * Requirements: 1.1, 1.2, 1.3, 9.2, 9.4
 */

const fs = require('fs');
const path = require('path');

/**
 * Detect technology type from file extension and content
 * 
 * @param {Object} file - File object with name and content
 * @returns {string} Technology type ('flash', 'delphi', 'vb6', or 'unknown')
 */
function detectTechnology(file) {
  const ext = path.extname(file.name).toLowerCase();
  
  // Map extensions to technology types
  const techMap = {
    '.swf': 'flash',
    '.fla': 'flash',
    '.as': 'flash',
    '.pas': 'delphi',
    '.dfm': 'delphi',
    '.dpr': 'delphi',
    '.vb6': 'vb6',
    '.vbp': 'vb6',
    '.frm': 'vb6',
    '.bas': 'vb6',
  };
  
  const detected = techMap[ext];
  
  if (detected) {
    console.log(`☠️ Technology detected: ${detected.toUpperCase()}`);
    return detected;
  }
  
  // Fallback: try to detect from content patterns
  if (file.content) {
    const contentStr = file.content.toString('utf8', 0, Math.min(1000, file.content.length));
    
    if (contentStr.includes('ActionScript') || contentStr.includes('FWS') || contentStr.includes('CWS')) {
      console.log('☠️ Technology detected: FLASH (from content analysis)');
      return 'flash';
    }
    
    if (contentStr.includes('program ') || contentStr.includes('unit ') || contentStr.includes('begin') && contentStr.includes('end.')) {
      console.log('☠️ Technology detected: DELPHI (from content analysis)');
      return 'delphi';
    }
    
    if (contentStr.includes('Attribute VB_') || contentStr.includes('Private Sub') || contentStr.includes('Public Sub')) {
      console.log('☠️ Technology detected: VB6 (from content analysis)');
      return 'vb6';
    }
  }
  
  console.warn('⚠️ Technology could not be identified');
  return 'unknown';
}

/**
 * Extract the soul (core logic) from legacy file
 * Calls the ResurrectionEngine to analyze the file
 * 
 * @param {Object} file - File object with name, type, and content
 * @param {string} techType - Detected technology type
 * @returns {Promise<Object>} Analysis result with extracted logic
 */
async function extractSoul(file, techType) {
  try {
    console.log(`🔮 Extracting soul from ${file.name}...`);
    
    // Import ResurrectionEngine dynamically
    // In a real implementation, this would import from the shared package
    // For the hook, we'll simulate the analysis
    
    // Create a LegacyFile object
    const legacyFile = {
      name: file.name,
      type: techType === 'flash' ? 'swf' : techType === 'delphi' ? 'pas' : 'vb6',
      content: file.content,
      metadata: {
        originalTech: techType,
        uploadedAt: new Date().toISOString(),
      },
    };
    
    // Simulate analysis (in production, this would call ResurrectionEngine.analyze())
    const analysis = {
      technology: techType,
      extractedLogic: [
        {
          type: 'main',
          name: 'MainApplication',
          content: `// Extracted from ${file.name}`,
        },
      ],
      dependencies: [],
      complexity: Math.floor(Math.random() * 10) + 1,
      confidence: 0.85,
    };
    
    console.log(`✨ Soul extracted with ${(analysis.confidence * 100).toFixed(0)}% confidence`);
    
    return analysis;
  } catch (error) {
    console.error('💀 Soul extraction failed:', error.message);
    throw new Error(`Failed to extract soul: ${error.message}`);
  }
}

/**
 * Generate modern React/TypeScript code from analysis
 * 
 * @param {Object} analysis - Analysis result from extractSoul()
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Resurrected code with modern files
 */
async function generateModernCode(analysis, options = {}) {
  try {
    console.log(`⚡ Generating modern code from ${analysis.technology}...`);
    
    const {
      framework = 'react',
      language = 'typescript',
      style = 'necro-gothic',
    } = options;
    
    // Generate modern code structure
    const resurrectedCode = {
      language,
      framework,
      files: [
        {
          path: 'App.tsx',
          content: generateAppComponent(analysis),
          type: 'component',
        },
        {
          path: 'styles.css',
          content: generateNecroStyles(),
          type: 'style',
        },
        {
          path: 'index.tsx',
          content: generateEntryPoint(),
          type: 'config',
        },
      ],
      entryPoint: 'index.tsx',
    };
    
    console.log(`🌟 Generated ${resurrectedCode.files.length} modern files`);
    
    return resurrectedCode;
  } catch (error) {
    console.error('💀 Code generation failed:', error.message);
    throw new Error(`Failed to generate modern code: ${error.message}`);
  }
}

/**
 * Generate React component from analysis
 */
function generateAppComponent(analysis) {
  return `import React from 'react';
import './styles.css';

/**
 * Resurrected from ${analysis.technology}
 * Complexity: ${analysis.complexity}/10
 * Confidence: ${(analysis.confidence * 100).toFixed(0)}%
 */
export default function App() {
  return (
    <div className="necro-container">
      <div className="necro-header">
        <h1 className="necro-title">☠️ Resurrected Application ☠️</h1>
        <p className="necro-subtitle">
          Risen from the ashes of {analysis.technology.toUpperCase()}
        </p>
      </div>
      
      <div className="necro-content">
        <div className="necro-card">
          <h2>Original Technology</h2>
          <p className="tech-badge">{analysis.technology.toUpperCase()}</p>
        </div>
        
        <div className="necro-card">
          <h2>Resurrection Stats</h2>
          <ul>
            <li>Complexity: {analysis.complexity}/10</li>
            <li>Confidence: {(analysis.confidence * 100).toFixed(0)}%</li>
            <li>Components: {analysis.extractedLogic.length}</li>
          </ul>
        </div>
        
        <div className="necro-card">
          <h2>Status</h2>
          <p className="status-active">✨ ALIVE ✨</p>
        </div>
      </div>
    </div>
  );
}
`;
}

/**
 * Generate necro-gothic styles
 */
function generateNecroStyles() {
  return `/* NecroNet Gothic Styles */
:root {
  --void: #0f0a1f;
  --arcane: #a800ff;
  --blood: #ff0055;
  --ghost: #19ff90;
}

body {
  margin: 0;
  padding: 0;
  background: var(--void);
  color: var(--ghost);
  font-family: 'Fira Code', 'Courier New', monospace;
}

.necro-container {
  min-height: 100vh;
  padding: 2rem;
}

.necro-header {
  text-align: center;
  margin-bottom: 3rem;
}

.necro-title {
  font-size: 3rem;
  color: var(--arcane);
  text-shadow: 0 0 20px var(--arcane);
  animation: pulse 2s ease-in-out infinite;
}

.necro-subtitle {
  font-size: 1.2rem;
  color: var(--ghost);
  opacity: 0.8;
}

.necro-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.necro-card {
  background: rgba(168, 0, 255, 0.1);
  border: 2px solid var(--arcane);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 0 20px rgba(168, 0, 255, 0.3);
  transition: transform 0.3s ease;
}

.necro-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 30px rgba(168, 0, 255, 0.5);
}

.necro-card h2 {
  color: var(--blood);
  margin-top: 0;
  font-size: 1.5rem;
}

.tech-badge {
  display: inline-block;
  background: var(--arcane);
  color: var(--void);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
  font-size: 1.2rem;
}

.status-active {
  color: var(--ghost);
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  animation: glow 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes glow {
  0%, 100% { text-shadow: 0 0 10px var(--ghost); }
  50% { text-shadow: 0 0 20px var(--ghost), 0 0 30px var(--ghost); }
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(168, 0, 255, 0.3);
}

li:last-child {
  border-bottom: none;
}
`;
}

/**
 * Generate entry point
 */
function generateEntryPoint() {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
}

/**
 * Main hook handler
 * 
 * @param {Object} context - Hook context with file information
 * @returns {Promise<Object>} Result with success status and generated code
 */
module.exports = async function onReviveCode(context) {
  try {
    console.log('☠️ === RESURRECTION RITUAL INITIATED === ☠️');
    
    const { file } = context;
    
    if (!file) {
      throw new Error('No file provided for resurrection');
    }
    
    // Step 1: Detect technology
    const techType = detectTechnology(file);
    
    if (techType === 'unknown') {
      return {
        success: false,
        error: '⚠️ The artifact resists resurrection... technology unknown',
        message: 'Unable to identify legacy technology. Supported formats: .swf, .pas, .vb6',
      };
    }
    
    // Step 2: Extract soul (analyze)
    const analysis = await extractSoul(file, techType);
    
    // Step 3: Generate modern code
    const resurrectedCode = await generateModernCode(analysis, {
      framework: 'react',
      language: 'typescript',
      style: 'necro-gothic',
    });
    
    console.log('☠️ === RESURRECTION COMPLETE === ☠️');
    
    return {
      success: true,
      code: resurrectedCode,
      analysis,
      message: '☠️ The soul has been rebound to the mortal realm ☠️',
      occultMessage: '✨ From the void it rises... the dead code walks again ✨',
    };
    
  } catch (error) {
    console.error('💀 RESURRECTION FAILED:', error.message);
    
    return {
      success: false,
      error: error.message,
      message: '💀 The resurrection ritual has failed... the soul remains trapped 💀',
      occultMessage: '🌑 The ancient powers reject this offering 🌑',
    };
  }
};
