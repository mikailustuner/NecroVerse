import type { Exec, TaskId } from '@amiron/exec';
import { Window, Widget } from '@amiron/intuition';
import type { FileSystem, FileEntry } from '@amiron/pal';
import type { IAudioContext } from '@amiron/pal';
/**
 * Result type for operations that may fail
 */
export type Result<T, E = Error> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
export declare namespace Amiron {
    /**
     * Initialize the Amiron system with core subsystems
     * @param exec - The Exec layer instance for task management
     * @param fs - The FileSystem instance for storage operations
     * @param audio - Optional audio context for sound playback
     */
    function init(exec: Exec, fs: FileSystem, audio?: IAudioContext): void;
    /**
     * Create a new task with specified priority
     * @param priority - Task priority (0-255, higher values = higher priority)
     * @returns TaskId that can be used to send/receive messages
     * @example
     * ```typescript
     * const taskId = Amiron.createTask(10);
     * ```
     */
    function createTask(priority: number): TaskId;
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
    function sendMessage(task: TaskId, data: Uint8Array): void;
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
    function receiveMessage(task: TaskId): Uint8Array | null;
    /**
     * Terminate a task and clean up its resources
     * @param task - Task ID to terminate
     */
    function terminateTask(task: TaskId): void;
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
    function createWindow(title: string, x: number, y: number, width: number, height: number): Window;
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
    function addWidget(window: Window, widget: Widget): void;
    /**
     * Focus a window, bringing it to the front
     * @param window - Window to focus
     */
    function focusWindow(window: Window): void;
    /**
     * Close a window (helper to mark as unfocused)
     * @param window - Window to close
     */
    function closeWindow(window: Window): void;
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
    function readFile(path: string): Promise<Uint8Array>;
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
    function readFileSafe(path: string): Promise<Result<Uint8Array>>;
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
    function writeFile(path: string, data: Uint8Array): Promise<void>;
    /**
     * Write data to a file with Result type for error handling
     * @param path - File path to write
     * @param data - Data to write
     * @returns Result indicating success or error
     */
    function writeFileSafe(path: string, data: Uint8Array): Promise<Result<void>>;
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
    function listDirectory(path: string): Promise<FileEntry[]>;
    /**
     * Create a directory in the virtual file system
     * @param path - Directory path to create
     * @returns Promise that resolves when directory is created
     */
    function createDirectory(path: string): Promise<void>;
    /**
     * Delete a file from the virtual file system
     * @param path - File path to delete
     * @returns Promise that resolves when file is deleted
     */
    function deleteFile(path: string): Promise<void>;
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
    function playSound(buffer: ArrayBuffer, volume?: number): Promise<void>;
    /**
     * Play a sound with Result type for error handling
     * @param buffer - Audio data as ArrayBuffer
     * @param volume - Volume level (0.0 to 1.0), defaults to 1.0
     * @returns Result indicating success or error
     */
    function playSoundSafe(buffer: ArrayBuffer, volume?: number): Promise<Result<void>>;
    /**
     * Check if audio context is available
     * @returns true if audio context is initialized
     */
    function hasAudio(): boolean;
}
export * from '@amiron/intuition';
export * from '@amiron/pal';
export type { TaskId } from '@amiron/exec';
//# sourceMappingURL=index.d.ts.map