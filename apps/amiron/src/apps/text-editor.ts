import { Amiron } from '@amiron/ritual-api';
import { Window, TextArea, MenuBar, Menu } from '@amiron/intuition';

/**
 * Text Editor Application
 * A simple text editor with file open/save capabilities
 */
export class TextEditor {
  private window: Window;
  private textArea: TextArea;
  private menuBar: MenuBar;
  private currentFilePath: string | null = null;
  
  constructor() {
    // Create window
    this.window = Amiron.createWindow('Text Editor', 100, 100, 600, 400);
    
    // Create menu bar (relative to window: title bar is 24px, so menu bar starts at y: 24)
    const menus: Menu[] = [
      {
        label: 'File',
        items: [
          { label: 'Open', action: () => this.openFile() },
          { label: 'Save', action: () => this.saveFile() },
          { label: 'Close', action: () => this.close() },
        ],
      },
    ];
    
    this.menuBar = new MenuBar(
      { x: 0, y: 24, width: 600, height: 24 },
      menus
    );
    
    // Create text area (relative to window: title bar 24px + menu bar 24px = 48px)
    this.textArea = new TextArea(
      { x: 0, y: 48, width: 600, height: 352 },
      ''
    );
    
    // Add widgets to window
    Amiron.addWidget(this.window, this.menuBar);
    Amiron.addWidget(this.window, this.textArea);
  }
  
  /**
   * Get the window instance
   */
  getWindow(): Window {
    return this.window;
  }
  
  /**
   * Open a file from the file system
   */
  private async openFile(): Promise<void> {
    // For now, use a hardcoded path
    // In a full implementation, this would show a file picker dialog
    const path = '/documents/note.txt';
    
    try {
      const result = await Amiron.readFileSafe(path);
      if (result.ok) {
        const text = new TextDecoder().decode(result.value);
        this.textArea.setText(text);
        this.currentFilePath = path;
        this.window.title = `Text Editor - ${path}`;
      } else {
        console.error('Failed to open file:', result.error.message);
        // In a full implementation, show error dialog
      }
    } catch (error) {
      console.error('Error opening file:', error);
    }
  }
  
  /**
   * Save the current text to a file
   */
  private async saveFile(): Promise<void> {
    const path = this.currentFilePath || '/documents/untitled.txt';
    
    try {
      const text = this.textArea.getText();
      const data = new TextEncoder().encode(text);
      const result = await Amiron.writeFileSafe(path, data);
      
      if (result.ok) {
        this.currentFilePath = path;
        this.window.title = `Text Editor - ${path}`;
        console.log('File saved successfully');
      } else {
        console.error('Failed to save file:', result.error.message);
        // In a full implementation, show error dialog
      }
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }
  
  /**
   * Close the text editor
   */
  private close(): void {
    Amiron.closeWindow(this.window);
    // In a full implementation, this would remove the window from the desktop
  }
}

/**
 * Launch the text editor application
 */
export function launchTextEditor(): Window {
  const editor = new TextEditor();
  return editor.getWindow();
}
