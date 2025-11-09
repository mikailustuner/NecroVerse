import { Window } from '@amiron/ritual-api';
/**
 * File Manager Application
 * Browse and manage files in the virtual file system
 */
export declare class FileManager {
    private window;
    private breadcrumb;
    private toolbar;
    private fileList;
    private currentPath;
    constructor();
    /**
     * Get the window instance
     */
    getWindow(): Window;
    /**
     * Load and display files from a directory
     */
    private loadDirectory;
    /**
     * Get icon for file entry
     */
    private getIconForEntry;
    /**
     * Handle file selection
     */
    private onFileSelect;
    /**
     * Handle file double-click (open directory or file)
     */
    private onFileDoubleClick;
    /**
     * Navigate to a specific path
     */
    private navigateToPath;
    /**
     * Copy selected file
     */
    private copyFile;
    /**
     * Move selected file
     */
    private moveFile;
    /**
     * Delete selected file
     */
    private deleteFile;
    /**
     * Create a new folder
     */
    private createFolder;
    /**
     * Get parent directory path
     */
    private getParentPath;
    /**
     * Join path segments
     */
    private joinPath;
}
/**
 * Launch the file manager application
 */
export declare function launchFileManager(): FileManager;
//# sourceMappingURL=file-manager.d.ts.map