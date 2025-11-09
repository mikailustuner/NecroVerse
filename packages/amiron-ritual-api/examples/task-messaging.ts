/**
 * Task Messaging Example
 * 
 * Demonstrates creating tasks and passing messages between them
 */

import { Amiron } from '@amiron/ritual-api';

export async function taskMessagingDemo() {
  // Create two tasks with different priorities
  const workerTask = Amiron.createTask(5);
  const managerTask = Amiron.createTask(10);
  
  console.log("✓ Created worker and manager tasks");
  
  // Send a message from manager to worker
  const command = new TextEncoder().encode("PROCESS_DATA");
  Amiron.sendMessage(workerTask, command);
  console.log("✓ Manager sent command to worker");
  
  // Worker receives the message
  const receivedCommand = Amiron.receiveMessage(workerTask);
  if (receivedCommand) {
    const commandText = new TextDecoder().decode(receivedCommand);
    console.log("✓ Worker received:", commandText);
    
    // Worker sends response back
    const response = new TextEncoder().encode("DATA_PROCESSED");
    Amiron.sendMessage(managerTask, response);
    console.log("✓ Worker sent response to manager");
  }
  
  // Manager receives the response
  const receivedResponse = Amiron.receiveMessage(managerTask);
  if (receivedResponse) {
    const responseText = new TextDecoder().decode(receivedResponse);
    console.log("✓ Manager received:", responseText);
  }
  
  // Clean up tasks
  Amiron.terminateTask(workerTask);
  Amiron.terminateTask(managerTask);
  console.log("✓ Tasks terminated");
}
