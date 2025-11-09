import { Window } from '@amiron/intuition';
let execInstance;
let fileSystemInstance;
let audioContextInstance = null;
export var Amiron;
(function (Amiron) {
    /**
     * Initialize the Amiron system with core subsystems
     * @param exec - The Exec layer instance for task management
     * @param fs - The FileSystem instance for storage operations
     * @param audio - Optional audio context for sound playback
     */
    function init(exec, fs, audio) {
        execInstance = exec;
        fileSystemInstance = fs;
        audioContextInstance = audio || null;
    }
    Amiron.init = init;
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
    function createTask(priority) {
        return execInstance.create_task(priority);
    }
    Amiron.createTask = createTask;
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
    function sendMessage(task, data) {
        execInstance.send_message(task, Array.from(data));
    }
    Amiron.sendMessage = sendMessage;
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
    function receiveMessage(task) {
        const msg = execInstance.receive_message(task);
        return msg ? new Uint8Array(msg) : null;
    }
    Amiron.receiveMessage = receiveMessage;
    /**
     * Terminate a task and clean up its resources
     * @param task - Task ID to terminate
     */
    function terminateTask(task) {
        execInstance.terminate_task(task);
    }
    Amiron.terminateTask = terminateTask;
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
    function createWindow(title, x, y, width, height) {
        return new Window(title, { x, y, width, height });
    }
    Amiron.createWindow = createWindow;
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
    function addWidget(window, widget) {
        window.addWidget(widget);
    }
    Amiron.addWidget = addWidget;
    /**
     * Focus a window, bringing it to the front
     * @param window - Window to focus
     */
    function focusWindow(window) {
        window.focused = true;
    }
    Amiron.focusWindow = focusWindow;
    /**
     * Close a window (helper to mark as unfocused)
     * @param window - Window to close
     */
    function closeWindow(window) {
        window.focused = false;
    }
    Amiron.closeWindow = closeWindow;
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
    async function readFile(path) {
        return await fileSystemInstance.readFile(path);
    }
    Amiron.readFile = readFile;
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
    async function readFileSafe(path) {
        try {
            const data = await fileSystemInstance.readFile(path);
            return { ok: true, value: data };
        }
        catch (error) {
            return { ok: false, error: error };
        }
    }
    Amiron.readFileSafe = readFileSafe;
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
    async function writeFile(path, data) {
        return await fileSystemInstance.writeFile(path, data);
    }
    Amiron.writeFile = writeFile;
    /**
     * Write data to a file with Result type for error handling
     * @param path - File path to write
     * @param data - Data to write
     * @returns Result indicating success or error
     */
    async function writeFileSafe(path, data) {
        try {
            await fileSystemInstance.writeFile(path, data);
            return { ok: true, value: undefined };
        }
        catch (error) {
            return { ok: false, error: error };
        }
    }
    Amiron.writeFileSafe = writeFileSafe;
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
    async function listDirectory(path) {
        return await fileSystemInstance.listDir(path);
    }
    Amiron.listDirectory = listDirectory;
    /**
     * Create a directory in the virtual file system
     * @param path - Directory path to create
     * @returns Promise that resolves when directory is created
     */
    async function createDirectory(path) {
        return await fileSystemInstance.createDir(path);
    }
    Amiron.createDirectory = createDirectory;
    /**
     * Delete a file from the virtual file system
     * @param path - File path to delete
     * @returns Promise that resolves when file is deleted
     */
    async function deleteFile(path) {
        return await fileSystemInstance.deleteFile(path);
    }
    Amiron.deleteFile = deleteFile;
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
    async function playSound(buffer, volume = 1.0) {
        if (!audioContextInstance) {
            throw new Error('Audio context not initialized. Call Amiron.init() with an audio context.');
        }
        return await audioContextInstance.playSound(buffer, volume);
    }
    Amiron.playSound = playSound;
    /**
     * Play a sound with Result type for error handling
     * @param buffer - Audio data as ArrayBuffer
     * @param volume - Volume level (0.0 to 1.0), defaults to 1.0
     * @returns Result indicating success or error
     */
    async function playSoundSafe(buffer, volume = 1.0) {
        try {
            if (!audioContextInstance) {
                return {
                    ok: false,
                    error: new Error('Audio context not initialized. Call Amiron.init() with an audio context.')
                };
            }
            await audioContextInstance.playSound(buffer, volume);
            return { ok: true, value: undefined };
        }
        catch (error) {
            return { ok: false, error: error };
        }
    }
    Amiron.playSoundSafe = playSoundSafe;
    /**
     * Check if audio context is available
     * @returns true if audio context is initialized
     */
    function hasAudio() {
        return audioContextInstance !== null;
    }
    Amiron.hasAudio = hasAudio;
})(Amiron || (Amiron = {}));
// Re-export types and classes from other packages
export * from '@amiron/intuition';
export * from '@amiron/pal';
