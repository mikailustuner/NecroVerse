import { Window } from '@amiron/ritual-api';
/**
 * Terminal Emulator Application
 * Execute basic file system commands
 */
export declare class Terminal {
    private window;
    private terminal;
    private currentPath;
    constructor();
    /**
     * Get the window instance
     */
    getWindow(): Window;
    /**
     * Execute a command
     */
    private executeCommand;
    /**
     * Show help message
     */
    private showHelp;
    /**
     * List directory contents
     */
    private listDirectory;
    /**
     * Change directory
     */
    private changeDirectory;
    /**
     * Display file contents
     */
    private catFile;
    /**
     * Create directory
     */
    private makeDirectory;
    /**
     * Remove file
     */
    private removeFile;
    /**
     * Resolve relative path to absolute path
     */
    private resolvePath;
    /**
     * Get parent directory path
     */
    private getParentPath;
    /**
     * Get icon for file type
     */
    private getIconForType;
}
/**
 * Launch the terminal application
 */
export declare function launchTerminal(): Window;
//# sourceMappingURL=terminal.d.ts.map