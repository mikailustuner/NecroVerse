import type { Exec, TaskId } from '@amiron/exec';
import { Window, Widget } from '@amiron/intuition';
import type { FileSystem, FileEntry } from '@amiron/pal';
import type { IAudioContext } from '@amiron/pal';

let execInstance: Exec;
let fileSystemInstance: FileSystem;
let audioContextInstance: IAudioContext | null = null;

/**
 * Result type for operations that may fail
 */
export type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

export namespace Amiron {
  /**
   * Initialize the Amiron system with core subsystems
   * @param exec - The Exec layer instance for task management
   * @param fs - The FileSystem instance for storage operations
   * @param audio - Optional audio context for sound playback
   */
  export function init(exec: Exec, fs: FileSystem, audio?: IAudioContext): void {
    execInstance = exec;
    fileSystemInstance = fs;
    audioContextInstance = audio || null;
  }
  
  // ============================================================================
  // Task Management API
  // ============================================================================
  
  /**
   * Create a new task with specified priority
   * @param priority - Task priority (0-255, higher values = higher priority)
   * @returns TaskId that can be used to send/receive messages
   * @example
   * ```typescript
   * const taskId = Amiron.createTask(10);
   * ```
   */
  export function createTask(priority: number): TaskId {
    return execInstance.create_task(priority);
  }
  
  /**
   * Send a message to a task
   * @param task - Target task ID
   * @param data - Message data as byte array
   * @example
   * ```typescript
   * const message = new TextEncoder().encode("Hello");
   * Amiron.sendMessage(taskId, message);
   * ```
   */
  export function sendMessage(task: TaskId, data: Uint8Array): void {
    execInstance.send_message(task, Array.from(data));
  }
  
  /**
   * Receive a message from a task's queue
   * @param task - Task ID to receive from
   * @returns Message data or null if queue is empty
   * @example
   * ```typescript
   * const message = Amiron.receiveMessage(taskId);
   * if (message) {
   *   const text = new TextDecoder().decode(message);
   * }
   * ```
   */
  export function receiveMessage(task: TaskId): Uint8Array | null {
    const msg = execInstance.receive_message(task);
    return msg ? new Uint8Array(msg) : null;
  }
  
  /**
   * Terminate a task and clean up its resources
   * @param task - Task ID to terminate
   */
  export function terminateTask(task: TaskId): void {
    execInstance.terminate_task(task);
  }
  
  // ============================================================================
  // Window Management API
  // ============================================================================
  
  /**
   * Create a new window
   * @param title - Window title displayed in title bar
   * @param x - X position on screen
   * @param y - Y position on screen
   * @param width - Window width in pixels
   * @param height - Window height in pixels
   * @returns Window instance
   * @example
   * ```typescript
   * const window = Amiron.createWindow("My App", 100, 100, 400, 300);
   * ```
   */
  export function createWindow(title: string, x: number, y: number, width: number, height: number): Window {
    return new Window(title, { x, y, width, height });
  }
  
  /**
   * Add a widget to a window
   * @param window - Target window
   * @param widget - Widget to add
   * @example
   * ```typescript
   * const button = new Button({ x: 10, y: 10, width: 100, height: 30 }, "Click", () => {});
   * Amiron.addWidget(window, button);
   * ```
   */
  export function addWidget(window: Window, widget: Widget): void {
    window.addWidget(widget);
  }
  
  /**
   * Focus a window, bringing it to the front
   * @param window - Window to focus
   */
  export function focusWindow(window: Window): void {
    window.focused = true;
  }
  
  /**
   * Close a window (helper to mark as unfocused)
   * @param window - Window to close
   */
  export function closeWindow(window: Window): void {
    window.focused = false;
  }
  
  // ============================================================================
  // File System API
  // ============================================================================
  
  /**
   * Read a file from the virtual file system
   * @param path - File path to read
   * @returns Promise resolving to file data
   * @throws Error if file not found or read fails
   * @example
   * ```typescript
   * const data = await Amiron.readFile("/documents/note.txt");
   * const text = new TextDecoder().decode(data);
   * ```
   */
  export async function readFile(path: string): Promise<Uint8Array> {
    return await fileSystemInstance.readFile(path);
  }
  
  /**
   * Read a file with Result type for error handling
   * @param path - File path to read
   * @returns Result containing file data or error
   * @example
   * ```typescript
   * const result = await Amiron.readFileSafe("/documents/note.txt");
   * if (result.ok) {
   *   console.log("File data:", result.value);
   * } else {
   *   console.error("Error:", result.error.message);
   * }
   * ```
   */
  export async function readFileSafe(path: string): Promise<Result<Uint8Array>> {
    try {
      const data = await fileSystemInstance.readFile(path);
      return { ok: true, value: data };
    } catch (error) {
      return { ok: false, error: error as Error };
    }
  }
  
  /**
   * Write data to a file in the virtual file system
   * @param path - File path to write
   * @param data - Data to write
   * @returns Promise that resolves when write completes
   * @example
   * ```typescript
   * const data = new TextEncoder().encode("Hello, world!");
   * await Amiron.writeFile("/documents/note.txt", data);
   * ```
   */
  export async function writeFile(path: string, data: Uint8Array): Promise<void> {
    return await fileSystemInstance.writeFile(path, data);
  }
  
  /**
   * Write data to a file with Result type for error handling
   * @param path - File path to write
   * @param data - Data to write
   * @returns Result indicating success or error
   */
  export async function writeFileSafe(path: string, data: Uint8Array): Promise<Result<void>> {
    try {
      await fileSystemInstance.writeFile(path, data);
      return { ok: true, value: undefined };
    } catch (error) {
      return { ok: false, error: error as Error };
    }
  }
  
  /**
   * List files and directories at a path
   * @param path - Directory path to list
   * @returns Promise resolving to array of file entries
   * @example
   * ```typescript
   * const entries = await Amiron.listDirectory("/documents");
   * entries.forEach(entry => {
   *   console.log(`${entry.name} (${entry.type})`);
   * });
   * ```
   */
  export async function listDirectory(path: string): Promise<FileEntry[]> {
    return await fileSystemInstance.listDir(path);
  }
  
  /**
   * Create a directory in the virtual file system
   * @param path - Directory path to create
   * @returns Promise that resolves when directory is created
   */
  export async function createDirectory(path: string): Promise<void> {
    return await fileSystemInstance.createDir(path);
  }
  
  /**
   * Delete a file from the virtual file system
   * @param path - File path to delete
   * @returns Promise that resolves when file is deleted
   */
  export async function deleteFile(path: string): Promise<void> {
    return await fileSystemInstance.deleteFile(path);
  }
  
  // ============================================================================
  // Audio API
  // ============================================================================
  
  /**
   * Play a sound from an audio buffer
   * @param buffer - Audio data as ArrayBuffer
   * @param volume - Volume level (0.0 to 1.0), defaults to 1.0
   * @returns Promise that resolves when playback starts
   * @throws Error if audio context not initialized or playback fails
   * @example
   * ```typescript
   * const audioData = await fetch("/sounds/beep.wav").then(r => r.arrayBuffer());
   * await Amiron.playSound(audioData, 0.5);
   * ```
   */
  export async function playSound(buffer: ArrayBuffer, volume: number = 1.0): Promise<void> {
    if (!audioContextInstance) {
      throw new Error('Audio context not initialized. Call Amiron.init() with an audio context.');
    }
    return await audioContextInstance.playSound(buffer, volume);
  }
  
  /**
   * Play a sound with Result type for error handling
   * @param buffer - Audio data as ArrayBuffer
   * @param volume - Volume level (0.0 to 1.0), defaults to 1.0
   * @returns Result indicating success or error
   */
  export async function playSoundSafe(buffer: ArrayBuffer, volume: number = 1.0): Promise<Result<void>> {
    try {
      if (!audioContextInstance) {
        return { 
          ok: false, 
          error: new Error('Audio context not initialized. Call Amiron.init() with an audio context.') 
        };
      }
      await audioContextInstance.playSound(buffer, volume);
      return { ok: true, value: undefined };
    } catch (error) {
      return { ok: false, error: error as Error };
    }
  }
  
  /**
   * Check if audio context is available
   * @returns true if audio context is initialized
   */
  export function hasAudio(): boolean {
    return audioContextInstance !== null;
  }
}

// Re-export types and classes from other packages
export * from '@amiron/intuition';
export * from '@amiron/pal';
export type { TaskId } from '@amiron/exec';
