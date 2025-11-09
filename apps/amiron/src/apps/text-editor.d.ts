import { Window } from '@amiron/ritual-api';
/**
 * Text Editor Application
 * A simple text editor with file open/save capabilities
 */
export declare class TextEditor {
    private window;
    private textArea;
    private menuBar;
    private currentFilePath;
    constructor();
    /**
     * Get the window instance
     */
    getWindow(): Window;
    /**
     * Open a file from the file system
     */
    private openFile;
    /**
     * Save the current text to a file
     */
    private saveFile;
    /**
     * Close the text editor
     */
    private close;
}
/**
 * Launch the text editor application
 */
export declare function launchTextEditor(): TextEditor;
//# sourceMappingURL=text-editor.d.ts.map