// Auto-fix and validate on file save
module.exports = async (context) => {
  const { file, kiro } = context;
  
  // Only process code files
  if (!file.path.match(/\.(ts|tsx|js|jsx)$/)) {
    return { success: true };
  }
  
  kiro.log('☠️ Scanning for curses in the code...');
  
  try {
    // Run linter
    const lintResult = await runLinter(file.path);
    
    if (lintResult.errors.length > 0) {
      kiro.log(`⚠️ ${lintResult.errors.length} curses detected`);
      
      // Auto-fix if possible
      const fixed = await autoFixLintErrors(file.path);
      if (fixed) {
        kiro.log('⚡ Curses exorcised automatically');
      } else {
        kiro.log('🌑 Manual exorcism required');
        // Show errors in occult style
        lintResult.errors.forEach(err => {
          kiro.log(`  Line ${err.line}: ${transformErrorToOccult(err.message)}`);
        });
      }
    } else {
      kiro.log('✓ The code is pure. No curses found.');
    }
    
    // Run type checker for TypeScript files
    if (file.path.match(/\.tsx?$/)) {
      const typeErrors = await checkTypes(file.path);
      if (typeErrors.length > 0) {
        kiro.log(`⚠️ ${typeErrors.length} type corruptions detected`);
        typeErrors.forEach(err => {
          kiro.log(`  ${err.file}:${err.line} - ${transformErrorToOccult(err.message)}`);
        });
      }
    }
    
    return {
      success: true,
      lintErrors: lintResult.errors,
      autoFixed: lintResult.fixed
    };
  } catch (error) {
    kiro.log(`⚠️ Scan ritual failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

async function runLinter(filePath) {
  const { ESLint } = require('eslint');
  const eslint = new ESLint({ fix: true });
  
  const results = await eslint.lintFiles([filePath]);
  const errors = results[0]?.messages || [];
  
  return {
    errors,
    fixed: results[0]?.output !== undefined
  };
}

async function autoFixLintErrors(filePath) {
  const { ESLint } = require('eslint');
  const eslint = new ESLint({ fix: true });
  
  const results = await eslint.lintFiles([filePath]);
  
  if (results[0]?.output) {
    await ESLint.outputFixes(results);
    return true;
  }
  
  return false;
}

async function checkTypes(filePath) {
  const ts = require('typescript');
  const fs = require('fs');
  
  const configPath = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json');
  if (!configPath) return [];
  
  const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
  const { options, fileNames } = ts.parseJsonConfigFileContent(config, ts.sys, './');
  
  const program = ts.createProgram([filePath], options);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  
  return diagnostics.map(diagnostic => {
    const { line } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    return {
      file: diagnostic.file.fileName,
      line: line + 1,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
    };
  });
}

function transformErrorToOccult(message) {
  const transformations = {
    'is not defined': 'dwells in the void',
    'is not assignable': 'resists binding',
    'cannot find': 'has been banished',
    'expected': 'the ritual requires',
    'missing': 'absent from the incantation',
    'unused': 'lingers without purpose',
    'deprecated': 'fading into the void',
    'invalid': 'corrupted essence',
  };
  
  let transformed = message;
  for (const [original, occult] of Object.entries(transformations)) {
    transformed = transformed.replace(new RegExp(original, 'gi'), occult);
  }
  
  return transformed;
}
