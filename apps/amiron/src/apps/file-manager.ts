import { Amiron, Window, List, Toolbar, Breadcrumb, ListItem, FileEntry } from '@amiron/ritual-api';

/**
 * File Manager Application
 * Browse and manage files in the virtual file system
 */
export class FileManager {
  private window: Window;
  private breadcrumb: Breadcrumb;
  private toolbar: Toolbar;
  private fileList: List;
  private currentPath: string = '/';
  
  constructor() {
    // Create window
    this.window = Amiron.createWindow('File Manager', 150, 150, 500, 400);
    
    // Create breadcrumb navigation
    this.breadcrumb = new Breadcrumb(
      { x: 150, y: 174, width: 500, height: 24 },
      '/'
    );
    this.breadcrumb.onNavigate = (path) => this.navigateToPath(path);
    
    // Create toolbar
    this.toolbar = new Toolbar(
      { x: 150, y: 198, width: 500, height: 32 },
      [
        { label: 'Copy', onClick: () => this.copyFile() },
        { label: 'Move', onClick: () => this.moveFile() },
        { label: 'Delete', onClick: () => this.deleteFile() },
        { label: 'New Folder', onClick: () => this.createFolder() },
      ]
    );
    
    // Create file list
    this.fileList = new List(
      { x: 150, y: 230, width: 500, height: 320 },
      []
    );
    this.fileList.onSelect = (item, index) => this.onFileSelect(item, index);
    this.fileList.onDoubleClick = (item, index) => this.onFileDoubleClick(item, index);
    
    // Add widgets to window
    Amiron.addWidget(this.window, this.breadcrumb);
    Amiron.addWidget(this.window, this.toolbar);
    Amiron.addWidget(this.window, this.fileList);
    
    // Load initial directory
    this.loadDirectory('/');
  }
  
  /**
   * Get the window instance
   */
  getWindow(): Window {
    return this.window;
  }
  
  /**
   * Load and display files from a directory
   */
  private async loadDirectory(path: string): Promise<void> {
    try {
      const entries = await Amiron.listDirectory(path);
      
      // Convert entries to list items
      const items: ListItem[] = entries.map(entry => ({
        label: entry.name,
        icon: this.getIconForEntry(entry),
        data: entry,
      }));
      
      // Sort: directories first, then files
      items.sort((a, b) => {
        const aIsDir = (a.data as FileEntry).type === 'directory';
        const bIsDir = (b.data as FileEntry).type === 'directory';
        
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.label.localeCompare(b.label);
      });
      
      // Add parent directory entry if not at root
      if (path !== '/') {
        items.unshift({
          label: '..',
          icon: '📁',
          data: { name: '..', type: 'directory' } as FileEntry,
        });
      }
      
      this.fileList.setItems(items);
      this.currentPath = path;
      this.breadcrumb.setPath(path);
    } catch (error) {
      console.error('Failed to load directory:', error);
      // In a full implementation, show error dialog
    }
  }
  
  /**
   * Get icon for file entry
   */
  private getIconForEntry(entry: FileEntry): string {
    switch (entry.type) {
      case 'directory':
        return '📁';
      case 'application':
        return '⚡';
      case 'file':
      default:
        return '📄';
    }
  }
  
  /**
   * Handle file selection
   */
  private onFileSelect(item: ListItem, index: number): void {
    // File selected - could show properties in status bar
    console.log('Selected:', item.label);
  }
  
  /**
   * Handle file double-click (open directory or file)
   */
  private onFileDoubleClick(item: ListItem, index: number): void {
    const entry = item.data as FileEntry;
    
    if (entry.type === 'directory') {
      // Navigate to directory
      if (item.label === '..') {
        // Go to parent directory
        const parentPath = this.getParentPath(this.currentPath);
        this.navigateToPath(parentPath);
      } else {
        // Go to subdirectory
        const newPath = this.joinPath(this.currentPath, entry.name);
        this.navigateToPath(newPath);
      }
    } else {
      // Open file (in a full implementation, launch appropriate application)
      console.log('Open file:', entry.name);
    }
  }
  
  /**
   * Navigate to a specific path
   */
  private navigateToPath(path: string): void {
    this.loadDirectory(path);
  }
  
  /**
   * Copy selected file
   */
  private async copyFile(): Promise<void> {
    const selectedItem = this.fileList.getSelectedItem();
    if (!selectedItem) {
      console.log('No file selected');
      return;
    }
    
    // In a full implementation, show dialog for destination
    console.log('Copy:', selectedItem.label);
    // For now, just log the action
  }
  
  /**
   * Move selected file
   */
  private async moveFile(): Promise<void> {
    const selectedItem = this.fileList.getSelectedItem();
    if (!selectedItem) {
      console.log('No file selected');
      return;
    }
    
    // In a full implementation, show dialog for destination
    console.log('Move:', selectedItem.label);
  }
  
  /**
   * Delete selected file
   */
  private async deleteFile(): Promise<void> {
    const selectedItem = this.fileList.getSelectedItem();
    if (!selectedItem) {
      console.log('No file selected');
      return;
    }
    
    const entry = selectedItem.data as FileEntry;
    if (entry.name === '..') {
      return; // Can't delete parent directory entry
    }
    
    try {
      const filePath = this.joinPath(this.currentPath, entry.name);
      await Amiron.deleteFile(filePath);
      
      // Reload directory
      this.loadDirectory(this.currentPath);
      console.log('Deleted:', entry.name);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  }
  
  /**
   * Create a new folder
   */
  private async createFolder(): Promise<void> {
    // In a full implementation, show dialog for folder name
    const folderName = 'NewFolder';
    
    try {
      const folderPath = this.joinPath(this.currentPath, folderName);
      await Amiron.createDirectory(folderPath);
      
      // Reload directory
      this.loadDirectory(this.currentPath);
      console.log('Created folder:', folderName);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  }
  
  /**
   * Get parent directory path
   */
  private getParentPath(path: string): string {
    if (path === '/') return '/';
    const parts = path.split('/').filter(p => p.length > 0);
    parts.pop();
    return parts.length === 0 ? '/' : '/' + parts.join('/');
  }
  
  /**
   * Join path segments
   */
  private joinPath(base: string, name: string): string {
    if (base === '/') return '/' + name;
    return base + '/' + name;
  }
}

/**
 * Launch the file manager application
 */
export function launchFileManager(): Window {
  const fileManager = new FileManager();
  return fileManager.getWindow();
}
