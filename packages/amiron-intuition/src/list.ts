import { GraphicsContext, Rect, Point, Color } from '@amiron/pal';
import { InputEvent } from './events';
import { NecroTheme } from './theme';
import { Widget } from './widget';

export interface ListItem {
  label: string;
  icon?: string;
  data?: any;
}

/**
 * List widget for displaying selectable items
 */
export class List extends Widget {
  items: ListItem[];
  selectedIndex: number = -1;
  hoveredIndex: number = -1;
  scrollOffset: number = 0;
  onSelect?: (item: ListItem, index: number) => void;
  onDoubleClick?: (item: ListItem, index: number) => void;
  private lastClickTime: number = 0;
  private lastClickIndex: number = -1;
  
  constructor(bounds: Rect, items: ListItem[] = []) {
    super(bounds);
    this.items = items;
  }
  
  setItems(items: ListItem[]): void {
    this.items = items;
    this.selectedIndex = -1;
    this.hoveredIndex = -1;
    this.scrollOffset = 0;
  }
  
  getSelectedItem(): ListItem | null {
    return this.selectedIndex >= 0 ? this.items[this.selectedIndex] : null;
  }
  
  render(ctx: GraphicsContext): void {
    const theme = NecroTheme;
    
    // Draw background
    ctx.drawRect(this.bounds, theme.windowBackground);
    
    // Draw border
    this.drawBorder(ctx, this.bounds, theme.shadow);
    
    // Calculate visible items
    const itemHeight = 24;
    const visibleItems = Math.floor((this.bounds.height - 4) / itemHeight);
    const startIndex = this.scrollOffset;
    const endIndex = Math.min(startIndex + visibleItems, this.items.length);
    
    // Draw items
    for (let i = startIndex; i < endIndex; i++) {
      const item = this.items[i];
      const itemY = this.bounds.y + 2 + ((i - startIndex) * itemHeight);
      const itemRect: Rect = {
        x: this.bounds.x + 2,
        y: itemY,
        width: this.bounds.width - 4,
        height: itemHeight,
      };
      
      // Highlight selected item
      if (i === this.selectedIndex) {
        ctx.drawRect(itemRect, theme.accentGlow);
      } else if (i === this.hoveredIndex) {
        ctx.drawRect(itemRect, theme.shadow);
      }
      
      // Draw icon if present
      let textX = itemRect.x + 4;
      if (item.icon) {
        ctx.drawText(item.icon, { x: textX, y: itemY + 16 }, theme.font, theme.highlight);
        textX += 20;
      }
      
      // Draw label
      ctx.drawText(item.label, { x: textX, y: itemY + 16 }, theme.font, theme.text);
    }
  }
  
  private drawBorder(ctx: GraphicsContext, rect: Rect, color: Color): void {
    ctx.drawRect({ x: rect.x, y: rect.y, width: rect.width, height: 1 }, color);
    ctx.drawRect({ x: rect.x, y: rect.y + rect.height - 1, width: rect.width, height: 1 }, color);
    ctx.drawRect({ x: rect.x, y: rect.y, width: 1, height: rect.height }, color);
    ctx.drawRect({ x: rect.x + rect.width - 1, y: rect.y, width: 1, height: rect.height }, color);
  }
  
  handleEvent(event: InputEvent): boolean {
    if (event.type === 'mousemove' && this.containsPoint(event.position)) {
      this.hoveredIndex = this.getItemIndexAtPosition(event.position);
      return false;
    }
    
    if (event.type === 'click' && this.containsPoint(event.position)) {
      const itemIndex = this.getItemIndexAtPosition(event.position);
      if (itemIndex >= 0) {
        const now = Date.now();
        const isDoubleClick = 
          itemIndex === this.lastClickIndex && 
          now - this.lastClickTime < 500;
        
        this.selectedIndex = itemIndex;
        
        if (isDoubleClick && this.onDoubleClick) {
          this.onDoubleClick(this.items[itemIndex], itemIndex);
        } else if (this.onSelect) {
          this.onSelect(this.items[itemIndex], itemIndex);
        }
        
        this.lastClickTime = now;
        this.lastClickIndex = itemIndex;
        return true;
      }
    }
    
    return false;
  }
  
  private getItemIndexAtPosition(point: Point): number {
    const itemHeight = 24;
    const relativeY = point.y - this.bounds.y - 2;
    const itemIndex = Math.floor(relativeY / itemHeight) + this.scrollOffset;
    
    if (itemIndex >= 0 && itemIndex < this.items.length) {
      return itemIndex;
    }
    
    return -1;
  }
}
