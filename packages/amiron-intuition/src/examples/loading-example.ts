/**
 * Example: Using the Loading Indicator
 * 
 * This example demonstrates how to use the LoadingIndicator widget
 * for async operations in Amiron applications.
 */

import { Window, LoadingIndicator } from '@amiron/intuition';
import { Rect } from '@amiron/pal';

/**
 * Create a window with a loading indicator
 */
export function createLoadingWindow(): Window {
  const window = new Window('Loading Example', {
    x: 100,
    y: 100,
    width: 300,
    height: 200,
  });
  
  // Create loading indicator in center of window
  const loadingIndicator = new LoadingIndicator(
    {
      x: 125,
      y: 80,
      width: 150,
      height: 100,
    },
    'Loading application...'
  );
  
  window.addWidget(loadingIndicator);
  
  // Simulate async operation
  setTimeout(() => {
    loadingIndicator.setMessage('Almost ready...');
  }, 2000);
  
  return window;
}

/**
 * Example: Show loading indicator during file load
 */
export async function loadFileWithIndicator(
  window: Window,
  filePath: string
): Promise<void> {
  // Add loading indicator
  const loadingIndicator = new LoadingIndicator(
    {
      x: window.bounds.x + 50,
      y: window.bounds.y + 50,
      width: 200,
      height: 100,
    },
    `Loading ${filePath}...`
  );
  
  window.addWidget(loadingIndicator);
  
  try {
    // Simulate file loading
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Remove loading indicator when done
    const index = window.widgets.indexOf(loadingIndicator);
    if (index > -1) {
      window.widgets.splice(index, 1);
    }
  } catch (error) {
    loadingIndicator.setMessage('Failed to load file');
    console.error('File load error:', error);
  }
}
