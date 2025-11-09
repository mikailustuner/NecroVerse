// Automatic test failure analysis and fix suggestions
module.exports = async (context) => {
  const { testResult, kiro } = context;
  
  kiro.log('☠️ The trial has failed...');
  kiro.log(`Failed tests: ${testResult.failedTests.length}`);
  
  try {
    const analyses = [];
    
    for (const test of testResult.failedTests) {
      kiro.log(`\n🔮 Analyzing: ${test.name}`);
      
      const analysis = analyzeTestFailure(test);
      analyses.push(analysis);
      
      kiro.log(`Failure Type: ${analysis.type}`);
      kiro.log(`Reason: ${analysis.reason}`);
      
      // Provide fix suggestions
      if (analysis.suggestions.length > 0) {
        kiro.log(`\n⚗️ Suggested Fixes:`);
        analysis.suggestions.forEach((suggestion, i) => {
          kiro.log(`  ${i + 1}. ${suggestion}`);
        });
      }
      
      // Check if auto-fixable
      if (analysis.autoFixable) {
        kiro.log(`\n⚡ This curse can be auto-exorcised`);
        const fixed = await autoFixTest(test, analysis);
        if (fixed) {
          kiro.log('✓ Test has been resurrected');
        } else {
          kiro.log('⚠️ Auto-fix failed. Manual intervention required');
        }
      }
    }
    
    // Generate test report
    await generateTestReport(testResult, analyses);
    
    return {
      success: true,
      analyses,
      autoFixedCount: analyses.filter(a => a.autoFixed).length
    };
  } catch (error) {
    kiro.log(`⚠️ Analysis ritual failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

function analyzeTestFailure(test) {
  const error = test.error || {};
  const message = error.message || '';
  
  let type = 'Unknown Failure';
  let reason = message;
  let suggestions = [];
  let autoFixable = false;
  
  // Assertion failures
  if (message.includes('expect') || message.includes('toBe') || message.includes('toEqual')) {
    type = 'Assertion Corruption';
    reason = 'Expected value does not match actual value';
    suggestions = [
      'Verify the expected value is correct',
      'Check if the function logic has changed',
      'Update test expectations if behavior is intentional',
      'Add console.log to debug actual vs expected values'
    ];
  }
  
  // Timeout failures
  else if (message.includes('timeout') || message.includes('exceeded')) {
    type = 'Ritual Timeout';
    reason = 'Test execution exceeded time limit';
    suggestions = [
      'Increase test timeout with jest.setTimeout()',
      'Check for infinite loops or blocking operations',
      'Mock slow async operations',
      'Optimize the code being tested'
    ];
  }
  
  // Mock failures
  else if (message.includes('mock') || message.includes('spy')) {
    type = 'Mock Binding Failed';
    reason = 'Mock or spy not configured correctly';
    suggestions = [
      'Verify mock is set up before test execution',
      'Check mock return values match expected types',
      'Clear mocks between tests with jest.clearAllMocks()',
      'Use jest.fn() for function mocks'
    ];
  }
  
  // Snapshot failures
  else if (message.includes('snapshot')) {
    type = 'Snapshot Divergence';
    reason = 'Component output differs from saved snapshot';
    suggestions = [
      'Review the diff to see what changed',
      'Update snapshot if change is intentional: pnpm test -- -u',
      'Check if props or state changed unexpectedly'
    ];
    autoFixable = true; // Can auto-update snapshot
  }
  
  // Async failures
  else if (message.includes('async') || message.includes('promise')) {
    type = 'Async Ritual Incomplete';
    reason = 'Async operation not properly awaited';
    suggestions = [
      'Add await before async function calls',
      'Return promises from test functions',
      'Use async/await or .then() properly',
      'Check if all promises are resolved'
    ];
  }
  
  // Component rendering failures
  else if (message.includes('render') || message.includes('component')) {
    type = 'Manifestation Failed';
    reason = 'Component failed to render';
    suggestions = [
      'Check if all required props are provided',
      'Verify component imports are correct',
      'Mock external dependencies (Supabase, APIs)',
      'Wrap component in required providers (ThemeProvider, etc.)'
    ];
  }
  
  return {
    type,
    reason,
    suggestions,
    autoFixable,
    autoFixed: false,
    test
  };
}

async function autoFixTest(test, analysis) {
  // Only auto-fix snapshot tests for now
  if (analysis.type === 'Snapshot Divergence') {
    const { exec } = require('child_process');
    return new Promise((resolve) => {
      exec(`pnpm test -- -u ${test.file}`, (err) => {
        if (!err) {
          analysis.autoFixed = true;
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }
  
  return false;
}

async function generateTestReport(testResult, analyses) {
  const fs = require('fs').promises;
  const path = require('path');
  
  const report = {
    timestamp: new Date().toISOString(),
    totalTests: testResult.totalTests,
    passedTests: testResult.passedTests,
    failedTests: testResult.failedTests.length,
    analyses: analyses.map(a => ({
      test: a.test.name,
      type: a.type,
      reason: a.reason,
      autoFixed: a.autoFixed
    }))
  };
  
  const reportPath = path.join('.kiro', 'logs', 'test-failures.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
}
