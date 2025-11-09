import { GraphicsContext, Rect, Point, Color } from '@amiron/pal';
import { InputEvent } from './events';
import { NecroTheme } from './theme';
import { Widget } from './widget';

export interface MenuItem {
  label: string;
  action: () => void;
}

export interface Menu {
  label: string;
  items: MenuItem[];
}

/**
 * Menu bar widget with dropdown menus
 */
export class MenuBar extends Widget {
  menus: Menu[];
  activeMenuIndex: number = -1;
  hoveredItemIndex: number = -1;
  
  constructor(bounds: Rect, menus: Menu[]) {
    super(bounds);
    this.menus = menus;
  }
  
  render(ctx: GraphicsContext): void {
    const theme = NecroTheme;
    
    // Draw menu bar background
    ctx.drawRect(this.bounds, theme.shadow);
    
    // Draw menu labels
    let x = this.bounds.x + 8;
    for (let i = 0; i < this.menus.length; i++) {
      const menu = this.menus[i];
      const isActive = i === this.activeMenuIndex;
      
      // Highlight active menu
      if (isActive) {
        const menuWidth = menu.label.length * 7 + 16;
        ctx.drawRect(
          { x: x - 8, y: this.bounds.y, width: menuWidth, height: this.bounds.height },
          theme.accentGlow
        );
      }
      
      ctx.drawText(
        menu.label,
        { x, y: this.bounds.y + 16 },
        theme.font,
        theme.text
      );
      
      x += menu.label.length * 7 + 24;
    }
    
    // Draw dropdown menu if active
    if (this.activeMenuIndex >= 0) {
      this.renderDropdown(ctx, this.activeMenuIndex);
    }
  }
  
  private renderDropdown(ctx: GraphicsContext, menuIndex: number): void {
    const theme = NecroTheme;
    const menu = this.menus[menuIndex];
    
    // Calculate dropdown position
    let menuX = this.bounds.x + 8;
    for (let i = 0; i < menuIndex; i++) {
      menuX += this.menus[i].label.length * 7 + 24;
    }
    menuX -= 8;
    
    const menuY = this.bounds.y + this.bounds.height;
    const menuWidth = 150;
    const itemHeight = 24;
    const menuHeight = menu.items.length * itemHeight;
    
    // Draw dropdown background
    ctx.drawRect(
      { x: menuX, y: menuY, width: menuWidth, height: menuHeight },
      theme.windowBackground
    );
    
    // Draw border
    this.drawBorder(
      ctx,
      { x: menuX, y: menuY, width: menuWidth, height: menuHeight },
      theme.accentGlow
    );
    
    // Draw menu items
    for (let i = 0; i < menu.items.length; i++) {
      const item = menu.items[i];
      const itemY = menuY + (i * itemHeight);
      
      // Highlight hovered item
      if (i === this.hoveredItemIndex) {
        ctx.drawRect(
          { x: menuX, y: itemY, width: menuWidth, height: itemHeight },
          theme.shadow
        );
      }
      
      ctx.drawText(
        item.label,
        { x: menuX + 8, y: itemY + 16 },
        theme.font,
        theme.text
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
    // Handle menu bar clicks
    if (event.type === 'click' && this.containsMenuBar(event.position)) {
      const menuIndex = this.getMenuIndexAtPosition(event.position);
      if (menuIndex >= 0) {
        this.activeMenuIndex = this.activeMenuIndex === menuIndex ? -1 : menuIndex;
        return true;
      }
    }
    
    // Handle dropdown clicks
    if (event.type === 'click' && this.activeMenuIndex >= 0) {
      const itemIndex = this.getMenuItemIndexAtPosition(event.position);
      if (itemIndex >= 0) {
        const menu = this.menus[this.activeMenuIndex];
        menu.items[itemIndex].action();
        this.activeMenuIndex = -1;
        this.hoveredItemIndex = -1;
        return true;
      }
      
      // Click outside dropdown closes it
      if (!this.containsDropdown(event.position)) {
        this.activeMenuIndex = -1;
        this.hoveredItemIndex = -1;
        return true;
      }
    }
    
    // Handle hover
    if (event.type === 'mousemove' && this.activeMenuIndex >= 0) {
      this.hoveredItemIndex = this.getMenuItemIndexAtPosition(event.position);
    }
    
    return false;
  }
  
  private containsMenuBar(point: Point): boolean {
    return point.x >= this.bounds.x &&
           point.x < this.bounds.x + this.bounds.width &&
           point.y >= this.bounds.y &&
           point.y < this.bounds.y + this.bounds.height;
  }
  
  private containsDropdown(point: Point): boolean {
    if (this.activeMenuIndex < 0) return false;
    
    const menu = this.menus[this.activeMenuIndex];
    let menuX = this.bounds.x + 8;
    for (let i = 0; i < this.activeMenuIndex; i++) {
      menuX += this.menus[i].label.length * 7 + 24;
    }
    menuX -= 8;
    
    const menuY = this.bounds.y + this.bounds.height;
    const menuWidth = 150;
    const menuHeight = menu.items.length * 24;
    
    return point.x >= menuX &&
           point.x < menuX + menuWidth &&
           point.y >= menuY &&
           point.y < menuY + menuHeight;
  }
  
  private getMenuIndexAtPosition(point: Point): number {
    let x = this.bounds.x + 8;
    for (let i = 0; i < this.menus.length; i++) {
      const menu = this.menus[i];
      const menuWidth = menu.label.length * 7 + 16;
      if (point.x >= x - 8 && point.x < x - 8 + menuWidth) {
        return i;
      }
      x += menu.label.length * 7 + 24;
    }
    return -1;
  }
  
  private getMenuItemIndexAtPosition(point: Point): number {
    if (this.activeMenuIndex < 0) return -1;
    
    const menu = this.menus[this.activeMenuIndex];
    let menuX = this.bounds.x + 8;
    for (let i = 0; i < this.activeMenuIndex; i++) {
      menuX += this.menus[i].label.length * 7 + 24;
    }
    menuX -= 8;
    
    const menuY = this.bounds.y + this.bounds.height;
    const itemHeight = 24;
    
    if (point.x < menuX || point.x >= menuX + 150) return -1;
    if (point.y < menuY) return -1;
    
    const itemIndex = Math.floor((point.y - menuY) / itemHeight);
    return itemIndex < menu.items.length ? itemIndex : -1;
  }
}
