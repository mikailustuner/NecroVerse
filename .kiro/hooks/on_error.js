// Automatic error analysis and debugging suggestions
module.exports = async (context) => {
  const { error, file, kiro } = context;
  
  kiro.log('☠️ A corruption has manifested...');
  kiro.log(`Error: ${error.message}`);
  
  try {
    // Analyze error type
    const analysis = analyzeError(error);
    
    kiro.log(`\n🔮 Divination Results:`);
    kiro.log(`Type: ${analysis.type}`);
    kiro.log(`Severity: ${analysis.severity}`);
    
    // Provide debugging suggestions
    const suggestions = getSuggestions(analysis, error, file);
    
    if (suggestions.length > 0) {
      kiro.log(`\n⚗️ Suggested Rituals for Exorcism:`);
      suggestions.forEach((suggestion, i) => {
        kiro.log(`  ${i + 1}. ${suggestion}`);
      });
    }
    
    // Check if this is a known issue
    const knownIssue = checkKnownIssues(error);
    if (knownIssue) {
      kiro.log(`\n👻 This curse is known to us...`);
      kiro.log(`Solution: ${knownIssue.solution}`);
      
      if (knownIssue.autoFix) {
        kiro.log(`\n⚡ Attempting automatic exorcism...`);
        const fixed = await knownIssue.autoFix(file);
        if (fixed) {
          kiro.log('✓ The corruption has been cleansed');
          return { success: true, autoFixed: true };
        }
      }
    }
    
    // Log to error tracking
    await logError(error, analysis, file);
    
    return {
      success: true,
      analysis,
      suggestions,
      knownIssue: knownIssue !== null
    };
  } catch (err) {
    kiro.log(`⚠️ Divination failed: ${err.message}`);
    return {
      success: false,
      error: err.message
    };
  }
};

function analyzeError(error) {
  const message = error.message.toLowerCase();
  const stack = error.stack || '';
  
  let type = 'Unknown Corruption';
  let severity = 'medium';
  
  // Type errors
  if (message.includes('type') || message.includes('assignable')) {
    type = 'Type Corruption';
    severity = 'low';
  }
  // Syntax errors
  else if (message.includes('unexpected') || message.includes('syntax')) {
    type = 'Malformed Incantation';
    severity = 'high';
  }
  // Runtime errors
  else if (message.includes('undefined') || message.includes('null')) {
    type = 'Void Invocation';
    severity = 'high';
  }
  // Network errors
  else if (message.includes('network') || message.includes('fetch')) {
    type = 'Connection to Void Failed';
    severity = 'medium';
  }
  // Import errors
  else if (message.includes('cannot find module') || message.includes('import')) {
    type = 'Missing Soul Fragment';
    severity = 'high';
  }
  
  return { type, severity, stack };
}

function getSuggestions(analysis, error, file) {
  const suggestions = [];
  const message = error.message.toLowerCase();
  
  if (analysis.type === 'Type Corruption') {
    suggestions.push('Verify the essence types match the ritual requirements');
    suggestions.push('Check TypeScript interfaces and type definitions');
    suggestions.push('Run: pnpm type-check to reveal all corruptions');
  }
  
  if (analysis.type === 'Malformed Incantation') {
    suggestions.push('Review the syntax near the corruption point');
    suggestions.push('Check for missing brackets, semicolons, or quotes');
    suggestions.push('Run: pnpm lint --fix to auto-correct minor issues');
  }
  
  if (analysis.type === 'Void Invocation') {
    suggestions.push('Add null/undefined checks before invoking the void');
    suggestions.push('Use optional chaining (?.) to safely traverse the abyss');
    suggestions.push('Initialize variables before summoning them');
  }
  
  if (analysis.type === 'Connection to Void Failed') {
    suggestions.push('Verify the network connection is stable');
    suggestions.push('Check API endpoints and environment variables');
    suggestions.push('Implement retry logic with exponential backoff');
  }
  
  if (analysis.type === 'Missing Soul Fragment') {
    suggestions.push('Run: pnpm install to summon missing dependencies');
    suggestions.push('Verify the import path is correct');
    suggestions.push('Check if the module exists in node_modules/');
  }
  
  // File-specific suggestions
  if (file && file.path) {
    if (file.path.includes('supabase')) {
      suggestions.push('Verify Supabase credentials in .env file');
      suggestions.push('Check if Supabase tables and policies are configured');
    }
    
    if (file.path.includes('graveyard-runtime')) {
      suggestions.push('Ensure legacy file format is supported');
      suggestions.push('Check parser implementation for the file type');
    }
  }
  
  return suggestions;
}

function checkKnownIssues(error) {
  const knownIssues = [
    {
      pattern: /cannot find module.*@necroverse/i,
      solution: 'Missing workspace dependency. Run: pnpm install from root',
      autoFix: async () => {
        const { exec } = require('child_process');
        return new Promise((resolve) => {
          exec('pnpm install', (err) => resolve(!err));
        });
      }
    },
    {
      pattern: /supabase.*not defined/i,
      solution: 'Supabase client not initialized. Check NEXT_PUBLIC_SUPABASE_URL in .env',
      autoFix: null
    },
    {
      pattern: /framer-motion/i,
      solution: 'Framer Motion animation error. Ensure AnimatePresence wraps conditional renders',
      autoFix: null
    },
    {
      pattern: /hydration/i,
      solution: 'Next.js hydration mismatch. Check for client-only code in server components',
      autoFix: null
    }
  ];
  
  for (const issue of knownIssues) {
    if (issue.pattern.test(error.message)) {
      return issue;
    }
  }
  
  return null;
}

async function logError(error, analysis, file) {
  const fs = require('fs').promises;
  const path = require('path');
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: analysis.type,
    severity: analysis.severity,
    message: error.message,
    file: file?.path || 'unknown',
    stack: error.stack
  };
  
  const logPath = path.join('.kiro', 'logs', 'errors.log');
  await fs.appendFile(logPath, JSON.stringify(logEntry) + '\n');
}
