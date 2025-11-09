/**
 * File Operations Example
 * 
 * Demonstrates reading, writing, and listing files
 */

import { Amiron } from '@amiron/ritual-api';

export async function fileOperationsDemo() {
  // Write a text file
  const textData = new TextEncoder().encode("Hello from Amiron!\nThis is a test file.");
  await Amiron.writeFile("/documents/test.txt", textData);
  console.log("✓ File written: /documents/test.txt");
  
  // Read the file back
  const readData = await Amiron.readFile("/documents/test.txt");
  const text = new TextDecoder().decode(readData);
  console.log("✓ File read:", text);
  
  // Write a binary file
  const binaryData = new Uint8Array([0x89, 0x50, 0x4E, 0x47]); // PNG header
  await Amiron.writeFile("/images/test.png", binaryData);
  console.log("✓ Binary file written: /images/test.png");
  
  // List directory contents
  const entries = await Amiron.listDirectory("/documents");
  console.log("✓ Directory listing:");
  entries.forEach(entry => {
    console.log(`  - ${entry.name} (${entry.type}) - ${entry.size} bytes`);
  });
  
  // Safe file operations with error handling
  const result = await Amiron.readFileSafe("/nonexistent/file.txt");
  if (result.ok) {
    console.log("File data:", result.value);
  } else {
    console.log("✓ Error handled gracefully:", result.error.message);
  }
}
