import { GraphicsContext, Rect, Point, Color } from '@amiron/pal';
import { InputEvent } from './events';
import { NecroTheme } from './theme';
import { Widget } from './widget';

/**
 * Multi-line text editing widget
 */
export class TextArea extends Widget {
  lines: string[];
  cursorLine: number;
  cursorColumn: number;
  focused: boolean = false;
  scrollOffset: number = 0;
  
  constructor(bounds: Rect, initialText: string = '') {
    super(bounds);
    this.lines = initialText ? initialText.split('\n') : [''];
    this.cursorLine = 0;
    this.cursorColumn = 0;
  }
  
  getText(): string {
    return this.lines.join('\n');
  }
  
  setText(text: string): void {
    this.lines = text ? text.split('\n') : [''];
    this.cursorLine = 0;
    this.cursorColumn = 0;
    this.scrollOffset = 0;
  }
  
  render(ctx: GraphicsContext): void {
    const theme = NecroTheme;
    
    // Draw background
    const bgColor = this.focused ? theme.windowBackground : theme.shadow;
    ctx.drawRect(this.bounds, bgColor);
    
    // Draw border
    const borderColor = this.focused ? theme.accentGlow : theme.shadow;
    this.drawBorder(ctx, this.bounds, borderColor);
    
    // Calculate visible lines
    const lineHeight = theme.font.size + 4;
    const visibleLines = Math.floor((this.bounds.height - 8) / lineHeight);
    const startLine = this.scrollOffset;
    const endLine = Math.min(startLine + visibleLines, this.lines.length);
    
    // Draw text lines
    const textX = this.bounds.x + 4;
    for (let i = startLine; i < endLine; i++) {
      const textY = this.bounds.y + 4 + ((i - startLine) * lineHeight) + theme.font.size;
      ctx.drawText(this.lines[i], { x: textX, y: textY }, theme.font, theme.text);
    }
    
    // Draw cursor if focused
    if (this.focused && this.cursorLine >= startLine && this.cursorLine < endLine) {
      const cursorX = textX + (this.cursorColumn * 7); // Approximate character width
      const cursorY = this.bounds.y + 4 + ((this.cursorLine - startLine) * lineHeight);
      ctx.drawRect(
        { x: cursorX, y: cursorY, width: 2, height: lineHeight - 2 },
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
    const currentLine = this.lines[this.cursorLine];
    
    if (key === 'Backspace') {
      if (this.cursorColumn > 0) {
        // Delete character before cursor
        this.lines[this.cursorLine] = 
          currentLine.slice(0, this.cursorColumn - 1) + 
          currentLine.slice(this.cursorColumn);
        this.cursorColumn--;
      } else if (this.cursorLine > 0) {
        // Merge with previous line
        const prevLine = this.lines[this.cursorLine - 1];
        this.cursorColumn = prevLine.length;
        this.lines[this.cursorLine - 1] = prevLine + currentLine;
        this.lines.splice(this.cursorLine, 1);
        this.cursorLine--;
      }
      return true;
    }
    
    if (key === 'Delete') {
      if (this.cursorColumn < currentLine.length) {
        // Delete character at cursor
        this.lines[this.cursorLine] = 
          currentLine.slice(0, this.cursorColumn) + 
          currentLine.slice(this.cursorColumn + 1);
      } else if (this.cursorLine < this.lines.length - 1) {
        // Merge with next line
        this.lines[this.cursorLine] = currentLine + this.lines[this.cursorLine + 1];
        this.lines.splice(this.cursorLine + 1, 1);
      }
      return true;
    }
    
    if (key === 'Enter') {
      // Split line at cursor
      const beforeCursor = currentLine.slice(0, this.cursorColumn);
      const afterCursor = currentLine.slice(this.cursorColumn);
      this.lines[this.cursorLine] = beforeCursor;
      this.lines.splice(this.cursorLine + 1, 0, afterCursor);
      this.cursorLine++;
      this.cursorColumn = 0;
      this.ensureCursorVisible();
      return true;
    }
    
    if (key === 'ArrowLeft') {
      if (this.cursorColumn > 0) {
        this.cursorColumn--;
      } else if (this.cursorLine > 0) {
        this.cursorLine--;
        this.cursorColumn = this.lines[this.cursorLine].length;
      }
      this.ensureCursorVisible();
      return true;
    }
    
    if (key === 'ArrowRight') {
      if (this.cursorColumn < currentLine.length) {
        this.cursorColumn++;
      } else if (this.cursorLine < this.lines.length - 1) {
        this.cursorLine++;
        this.cursorColumn = 0;
      }
      this.ensureCursorVisible();
      return true;
    }
    
    if (key === 'ArrowUp') {
      if (this.cursorLine > 0) {
        this.cursorLine--;
        this.cursorColumn = Math.min(this.cursorColumn, this.lines[this.cursorLine].length);
      }
      this.ensureCursorVisible();
      return true;
    }
    
    if (key === 'ArrowDown') {
      if (this.cursorLine < this.lines.length - 1) {
        this.cursorLine++;
        this.cursorColumn = Math.min(this.cursorColumn, this.lines[this.cursorLine].length);
      }
      this.ensureCursorVisible();
      return true;
    }
    
    if (key === 'Home') {
      this.cursorColumn = 0;
      return true;
    }
    
    if (key === 'End') {
      this.cursorColumn = currentLine.length;
      return true;
    }
    
    if (key.length === 1) {
      // Insert character at cursor
      this.lines[this.cursorLine] = 
        currentLine.slice(0, this.cursorColumn) + 
        key + 
        currentLine.slice(this.cursorColumn);
      this.cursorColumn++;
      return true;
    }
    
    return false;
  }
  
  private ensureCursorVisible(): void {
    const lineHeight = NecroTheme.font.size + 4;
    const visibleLines = Math.floor((this.bounds.height - 8) / lineHeight);
    
    if (this.cursorLine < this.scrollOffset) {
      this.scrollOffset = this.cursorLine;
    } else if (this.cursorLine >= this.scrollOffset + visibleLines) {
      this.scrollOffset = this.cursorLine - visibleLines + 1;
    }
  }
}
