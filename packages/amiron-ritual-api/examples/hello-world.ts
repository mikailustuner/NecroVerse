/**
 * Hello World Example
 * 
 * Demonstrates basic window creation and button interaction
 */

import { Amiron } from '@amiron/ritual-api';
import { Button } from '@amiron/intuition';

export async function helloWorld() {
  // Create a window
  const window = Amiron.createWindow("Hello World", 100, 100, 300, 200);
  
  // Create a button
  const button = new Button(
    { x: 75, y: 70, width: 150, height: 40 },
    "Click Me!",
    () => {
      console.log("Hello, Amiron!");
      alert("Hello from the void!");
    }
  );
  
  // Add button to window
  Amiron.addWidget(window, button);
  
  // Focus the window
  Amiron.focusWindow(window);
  
  return window;
}
