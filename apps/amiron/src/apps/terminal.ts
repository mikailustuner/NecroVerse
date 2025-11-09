import { Amiron, Window, TerminalWidget, FileEntry } from '@amiron/ritual-api';

/**
 * Terminal Emulator Application
 * Execute basic file system commands
 */
export class Terminal {
  private window: Window;
  private terminal: TerminalWidget;
  private currentPath: string = '/';
  
  constructor() {
    // Create window
    this.window = Amiron.createWindow('Terminal', 200, 200, 600, 400);
    
    // Create terminal widget
    this.terminal = new TerminalWidget(
      { x: 200, y: 224, width: 600, height: 376 }
    );
    this.terminal.onCommand = (command) => this.executeCommand(command);
    
    // Add widget to window
    Amiron.addWidget(this.window, this.terminal);
    
    // Show welcome message
    this.terminal.addOutput('Amiron Terminal v1.0');
    this.terminal.addOutput('Type "help" for available commands');
    this.terminal.addOutput('');
  }
  
  /**
   * Get the window instance
   */
  getWindow(): Window {
    return this.window;
  }
  
  /**
   * Execute a command
   */
  private async executeCommand(command: string): Promise<void> {
    // Echo command
    this.terminal.addOutput(`> ${command}`);
    
    // Parse command
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    try {
      switch (cmd) {
        case 'help':
          this.showHelp();
          break;
        
        case 'ls':
          await this.listDirectory(args[0] || this.currentPath);
          break;
        
        case 'cd':
          await this.changeDirectory(args[0] || '/');
          break;
        
        case 'pwd':
          this.terminal.addOutput(this.currentPath);
          break;
        
        case 'cat':
          if (args.length === 0) {
            this.terminal.addOutput('Usage: cat <file>');
          } else {
            await this.catFile(args[0]);
          }
          break;
        
        case 'mkdir':
          if (args.length === 0) {
            this.terminal.addOutput('Usage: mkdir <directory>');
          } else {
            await this.makeDirectory(args[0]);
          }
          break;
        
        case 'rm':
          if (args.length === 0) {
            this.terminal.addOutput('Usage: rm <file>');
          } else {
            await this.removeFile(args[0]);
          }
          break;
        
        case 'clear':
          this.terminal.clear();
          break;
        
        case 'echo':
          this.terminal.addOutput(args.join(' '));
          break;
        
        default:
          this.terminal.addOutput(`Unknown command: ${cmd}`);
          this.terminal.addOutput('Type "help" for available commands');
      }
    } catch (error) {
      this.terminal.addOutput(`Error: ${(error as Error).message}`);
    }
    
    this.terminal.addOutput('');
  }
  
  /**
   * Show help message
   */
  private showHelp(): void {
    this.terminal.addOutput('Available commands:');
    this.terminal.addOutput('  ls [path]       - List directory contents');
    this.terminal.addOutput('  cd <path>       - Change directory');
    this.terminal.addOutput('  pwd             - Print working directory');
    this.terminal.addOutput('  cat <file>      - Display file contents');
    this.terminal.addOutput('  mkdir <dir>     - Create directory');
    this.terminal.addOutput('  rm <file>       - Remove file');
    this.terminal.addOutput('  echo <text>     - Print text');
    this.terminal.addOutput('  clear           - Clear terminal');
    this.terminal.addOutput('  help            - Show this help');
  }
  
  /**
   * List directory contents
   */
  private async listDirectory(path: string): Promise<void> {
    const fullPath = this.resolvePath(path);
    
    try {
      const entries = await Amiron.listDirectory(fullPath);
      
      if (entries.length === 0) {
        this.terminal.addOutput('(empty directory)');
        return;
      }
      
      // Sort entries
      entries.sort((a, b) => {
        if (a.type === 'directory' && b.type !== 'directory') return -1;
        if (a.type !== 'directory' && b.type === 'directory') return 1;
        return a.name.localeCompare(b.name);
      });
      
      // Display entries
      for (const entry of entries) {
        const icon = this.getIconForType(entry.type);
        const size = entry.type === 'file' ? `${entry.size}B` : '';
        this.terminal.addOutput(`${icon} ${entry.name.padEnd(30)} ${size}`);
      }
    } catch (error) {
      this.terminal.addOutput(`ls: cannot access '${path}': ${(error as Error).message}`);
    }
  }
  
  /**
   * Change directory
   */
  private async changeDirectory(path: string): Promise<void> {
    const fullPath = this.resolvePath(path);
    
    try {
      // Verify directory exists by trying to list it
      await Amiron.listDirectory(fullPath);
      this.currentPath = fullPath;
    } catch (error) {
      this.terminal.addOutput(`cd: ${path}: No such directory`);
    }
  }
  
  /**
   * Display file contents
   */
  private async catFile(path: string): Promise<void> {
    const fullPath = this.resolvePath(path);
    
    try {
      const data = await Amiron.readFile(fullPath);
      const text = new TextDecoder().decode(data);
      
      // Split into lines and display
      const lines = text.split('\n');
      for (const line of lines) {
        this.terminal.addOutput(line);
      }
    } catch (error) {
      this.terminal.addOutput(`cat: ${path}: ${(error as Error).message}`);
    }
  }
  
  /**
   * Create directory
   */
  private async makeDirectory(path: string): Promise<void> {
    const fullPath = this.resolvePath(path);
    
    try {
      await Amiron.createDirectory(fullPath);
      this.terminal.addOutput(`Created directory: ${path}`);
    } catch (error) {
      this.terminal.addOutput(`mkdir: cannot create directory '${path}': ${(error as Error).message}`);
    }
  }
  
  /**
   * Remove file
   */
  private async removeFile(path: string): Promise<void> {
    const fullPath = this.resolvePath(path);
    
    try {
      await Amiron.deleteFile(fullPath);
      this.terminal.addOutput(`Removed: ${path}`);
    } catch (error) {
      this.terminal.addOutput(`rm: cannot remove '${path}': ${(error as Error).message}`);
    }
  }
  
  /**
   * Resolve relative path to absolute path
   */
  private resolvePath(path: string): string {
    if (path.startsWith('/')) {
      return path;
    }
    
    if (path === '.') {
      return this.currentPath;
    }
    
    if (path === '..') {
      return this.getParentPath(this.currentPath);
    }
    
    if (this.currentPath === '/') {
      return '/' + path;
    }
    
    return this.currentPath + '/' + path;
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
   * Get icon for file type
   */
  private getIconForType(type: string): string {
    switch (type) {
      case 'directory':
        return '[DIR]';
      case 'application':
        return '[APP]';
      case 'file':
      default:
        return '[FILE]';
    }
  }
}

/**
 * Launch the terminal application
 */
export function launchTerminal(): Window {
  const terminal = new Terminal();
  return terminal.getWindow();
}
