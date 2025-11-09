import { GraphicsContext, Rect, Point, Color, Font } from '@amiron/pal';
import { InputEvent } from './events';
import { NecroTheme } from './theme';
import { Widget } from './widget';

/**
 * Terminal widget with command input and output display
 */
export class TerminalWidget extends Widget {
  outputLines: string[];
  inputLine: string;
  cursorPosition: number;
  focused: boolean = false;
  scrollOffset: number = 0;
  commandHistory: string[];
  historyIndex: number = -1;
  onCommand?: (command: string) => void;
  
  constructor(bounds: Rect) {
    super(bounds);
    this.outputLines = [];
    this.inputLine = '';
    this.cursorPosition = 0;
    this.commandHistory = [];
  }
  
  /**
   * Add output line to terminal
   */
  addOutput(line: string): void {
    this.outputLines.push(line);
    
    // Auto-scroll to bottom
    const lineHeight = this.getMonospaceFont().size + 2;
    const visibleLines = Math.floor((this.bounds.height - 30) / lineHeight);
    if (this.outputLines.length > visibleLines) {
      this.scrollOffset = this.outputLines.length - visibleLines;
    }
  }
  
  /**
   * Clear terminal output
   */
  clear(): void {
    this.outputLines = [];
    this.scrollOffset = 0;
  }
  
  /**
   * Get monospace font for terminal
   */
  private getMonospaceFont(): Font {
    return {
      family: 'monospace',
      size: 12,
    };
  }
  
  render(ctx: GraphicsContext): void {
    const theme = NecroTheme;
    const monoFont = this.getMonospaceFont();
    
    // Draw background
    ctx.drawRect(this.bounds, { r: 0, g: 0, b: 0 }); // Pure black background
    
    // Draw border
    const borderColor = this.focused ? theme.accentGlow : theme.shadow;
    this.drawBorder(ctx, this.bounds, borderColor);
    
    // Calculate visible lines
    const lineHeight = monoFont.size + 2;
    const outputHeight = this.bounds.height - 30;
    const visibleLines = Math.floor(outputHeight / lineHeight);
    const startLine = this.scrollOffset;
    const endLine = Math.min(startLine + visibleLines, this.outputLines.length);
    
    // Draw output lines
    const textX = this.bounds.x + 4;
    for (let i = startLine; i < endLine; i++) {
      const textY = this.bounds.y + 4 + ((i - startLine) * lineHeight) + monoFont.size;
      ctx.drawText(this.outputLines[i], { x: textX, y: textY }, monoFont, theme.highlight);
    }
    
    // Draw input line separator
    const inputY = this.bounds.y + this.bounds.height - 26;
    ctx.drawRect(
      { x: this.bounds.x, y: inputY, width: this.bounds.width, height: 1 },
      theme.shadow
    );
    
    // Draw prompt
    const promptY = inputY + 16;
    ctx.drawText('>', { x: textX, y: promptY }, monoFont, theme.accentGlow);
    
    // Draw input line
    const inputX = textX + 14;
    ctx.drawText(this.inputLine, { x: inputX, y: promptY }, monoFont, theme.text);
    
    // Draw cursor if focused
    if (this.focused) {
      const cursorX = inputX + (this.cursorPosition * 7); // Approximate character width
      ctx.drawRect(
        { x: cursorX, y: inputY + 4, width: 2, height: lineHeight },
        theme.highlight
      );
    }
  }
  
  private drawBorder(ctx: GraphicsContext, rect: Rect, color: Color): void {
    ctx.drawRect({ x: rect.x, y: rect.y, width: rect.width, height: 1 }, color);
    ctx.drawRect({ x: rect.x, y: rect.y + rect.height - 1, width: rect.width, height: 1 }, color);
    ctx.drawRect({ x: rect.x, y: rect.y, width: 1, height: rect.height }, color);
    ctx.drawRect({ x: rect.x + rect.width - 1, y: rect.y, width: 1, height: rect.height }, color);
  }
  
  handleEvent(event: InputEvent): boolean {
    if (event.type === 'click' && this.containsPoint(event.position)) {
      this.focused = true;
      return true;
    }
    
    if (event.type === 'click' && !this.containsPoint(event.position)) {
      this.focused = false;
      return false;
    }
    
    if (this.focused && event.type === 'keydown' && event.key) {
      return this.handleKeyPress(event.key);
    }
    
    return false;
  }
  
  private handleKeyPress(key: string): boolean {
    if (key === 'Enter') {
      // Execute command
      if (this.inputLine.trim().length > 0) {
        this.commandHistory.push(this.inputLine);
        this.historyIndex = this.commandHistory.length;
        
        if (this.onCommand) {
          this.onCommand(this.inputLine);
        }
        
        this.inputLine = '';
        this.cursorPosition = 0;
      }
      return true;
    }
    
    if (key === 'Backspace') {
      if (this.cursorPosition > 0) {
        this.inputLine = 
          this.inputLine.slice(0, this.cursorPosition - 1) + 
          this.inputLine.slice(this.cursorPosition);
        this.cursorPosition--;
      }
      return true;
    }
    
    if (key === 'Delete') {
      if (this.cursorPosition < this.inputLine.length) {
        this.inputLine = 
          this.inputLine.slice(0, this.cursorPosition) + 
          this.inputLine.slice(this.cursorPosition + 1);
      }
      return true;
    }
    
    if (key === 'ArrowLeft') {
      if (this.cursorPosition > 0) {
        this.cursorPosition--;
      }
      return true;
    }
    
    if (key === 'ArrowRight') {
      if (this.cursorPosition < this.inputLine.length) {
        this.cursorPosition++;
      }
      return true;
    }
    
    if (key === 'ArrowUp') {
      // Navigate command history backwards
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.inputLine = this.commandHistory[this.historyIndex];
        this.cursorPosition = this.inputLine.length;
      }
      return true;
    }
    
    if (key === 'ArrowDown') {
      // Navigate command history forwards
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        this.inputLine = this.commandHistory[this.historyIndex];
        this.cursorPosition = this.inputLine.length;
      } else if (this.historyIndex === this.commandHistory.length - 1) {
        this.historyIndex = this.commandHistory.length;
        this.inputLine = '';
        this.cursorPosition = 0;
      }
      return true;
    }
    
    if (key === 'Home') {
      this.cursorPosition = 0;
      return true;
    }
    
    if (key === 'End') {
      this.cursorPosition = this.inputLine.length;
      return true;
    }
    
    if (key.length === 1) {
      // Insert character at cursor
      this.inputLine = 
        this.inputLine.slice(0, this.cursorPosition) + 
        key + 
        this.inputLine.slice(this.cursorPosition);
      this.cursorPosition++;
      return true;
    }
    
    return false;
  }
}
