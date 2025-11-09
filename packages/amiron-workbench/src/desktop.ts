import { Window, globalAnimationManager } from '@amiron/intuition';
import { GraphicsContext, Point, Rect } from '@amiron/pal';
import { NecroTheme } from '@amiron/intuition';
import { Icon } from './icon';
import { ApplicationLoader, globalAppLoader } from './app-loader';
import { loadSystemIcons } from './icons';

export type ApplicationModule = () => Window;

export class Desktop {
  icons: Icon[] = [];
  windows: Window[] = [];
  dragState: { icon: Icon; offset: Point } | null = null;
  private applicationRegistry: Map<string, ApplicationModule> = new Map();
  private windowDragState: { window: Window; offset: Point } | null = null;
  private appLoader: ApplicationLoader;
  private systemIcons: Map<string, ImageData> | null = null;
  
  constructor(appLoader: ApplicationLoader = globalAppLoader) {
    this.appLoader = appLoader;
    this.loadIcons();
  }
  
  private async loadIcons(): Promise<void> {
    try {
      this.systemIcons = await loadSystemIcons();
    } catch (error) {
      console.error('Failed to load system icons:', error);
    }
  }
  
  addIcon(icon: Icon): void {
    this.icons.push(icon);
    this.saveLayout();
  }
  
  registerApplication(target: string, module: ApplicationModule): void {
    this.applicationRegistry.set(target, module);
  }
  
  /**
   * Register an application with lazy loading (dynamic import)
   */
  registerLazyApplication(
    target: string, 
    importFn: () => Promise<{ default: ApplicationModule }>
  ): void {
    this.appLoader.register(target, importFn);
  }
  
  openWindow(window: Window): void {
    console.log('🪟 openWindow called with:', window);
    console.log('🔍 Type check:', typeof window, window?.constructor?.name);
    console.log('🔍 Has render?', typeof window?.render);
    
    if (!window || typeof window.render !== 'function') {
      console.error('❌ REJECTED: Invalid window object!', window);
      return;
    }
    
    this.windows.push(window);
    console.log('✅ Window added to array. Total windows:', this.windows.length);
    this.focusWindow(window);
    
    // Start fade-in animation
    window.opacity = 0;
    globalAnimationManager.start(
      `window-fade-${Date.now()}`,
      300, // 300ms fade-in
      (progress) => {
        window.opacity = progress;
      }
    );
  }
  
  private focusWindow(window: Window): void {
    // Unfocus all windows and reset their glow
    for (const w of this.windows) {
      if (w.focused) {
        w.focused = false;
        // Fade out glow
        globalAnimationManager.start(
          `window-glow-out-${Date.now()}`,
          150,
          (progress) => {
            w.glowIntensity = 1 - progress;
          }
        );
      }
    }
    
    // Focus the target window
    window.focused = true;
    
    // Start glow animation
    globalAnimationManager.start(
      `window-glow-${Date.now()}`,
      200, // 200ms glow
      (progress) => {
        window.glowIntensity = progress;
      }
    );
    
    // Move to end of array (top of z-order)
    const index = this.windows.indexOf(window);
    if (index !== -1 && index !== this.windows.length - 1) {
      this.windows.splice(index, 1);
      this.windows.push(window);
    }
  }
  
  render(ctx: GraphicsContext): void {
    ctx.clear(NecroTheme.background);
    
    for (const icon of this.icons) {
      this.renderIcon(ctx, icon);
    }
    
    // Filter out any invalid windows before rendering
    this.windows = this.windows.filter(w => {
      if (!w || typeof w.render !== 'function') {
        console.error('❌ Removing invalid window from array:', w);
        return false;
      }
      return true;
    });
    
    for (const window of this.windows) {
      window.render(ctx);
    }
  }
  
  private renderIcon(ctx: GraphicsContext, icon: Icon): void {
    const iconSize = 48;
    const bounds: Rect = {
      x: icon.position.x,
      y: icon.position.y,
      width: iconSize,
      height: iconSize,
    };
    
    ctx.drawRect(bounds, NecroTheme.shadow);
    
    // Use system icon if available, otherwise use icon.image
    if (icon.image) {
      ctx.drawImage(icon.image, icon.position);
    } else if (this.systemIcons && this.systemIcons.has(icon.target)) {
      const systemIcon = this.systemIcons.get(icon.target);
      if (systemIcon) {
        ctx.drawImage(systemIcon, icon.position);
      }
    }
    
    const labelY = icon.position.y + iconSize + 12;
    ctx.drawText(icon.label, { x: icon.position.x, y: labelY }, NecroTheme.font, NecroTheme.text);
  }
  
  handleDoubleClick(pos: Point): void {
    for (const icon of this.icons) {
      if (this.iconContainsPoint(icon, pos)) {
        this.launchIcon(icon);
        return;
      }
    }
  }
  
  private iconContainsPoint(icon: Icon, point: Point): boolean {
    const iconSize = 48;
    return point.x >= icon.position.x &&
           point.x < icon.position.x + iconSize &&
           point.y >= icon.position.y &&
           point.y < icon.position.y + iconSize;
  }
  
  private async launchIcon(icon: Icon): Promise<void> {
    console.log('🔮 Launching application:', icon.target);
    
    // Try synchronous registry first (for pre-loaded apps)
    const appModule = this.applicationRegistry.get(icon.target);
    if (appModule) {
      console.log('📦 Found in registry, invoking module...');
      const window = appModule();
      console.log('🪟 Window created:', window);
      console.log('🔍 Window type:', typeof window);
      console.log('🔍 Has render?', typeof window?.render);
      console.log('🔍 Window constructor:', window?.constructor?.name);
      
      if (window && typeof window.render === 'function') {
        this.openWindow(window);
      } else {
        console.error('⚠️ Application module did not return a valid Window!', window);
      }
      return;
    }
    
    // Try lazy-loaded application
    try {
      const window = await this.appLoader.launch(icon.target);
      if (window) {
        this.openWindow(window);
      } else {
        console.warn(`Application not found: ${icon.target}`);
      }
    } catch (error) {
      console.error(`Failed to launch application ${icon.target}:`, error);
    }
  }
  
  private saveLayout(): void {
    const layout = this.icons.map(icon => ({
      label: icon.label,
      position: icon.position,
      target: icon.target,
    }));
    localStorage.setItem('amiron-desktop-layout', JSON.stringify(layout));
  }
  
  loadLayout(): void {
    const saved = localStorage.getItem('amiron-desktop-layout');
    if (saved) {
      const layout = JSON.parse(saved);
      this.icons = layout.map((item: any) => ({
        label: item.label,
        image: null,
        position: item.position,
        target: item.target,
      }));
    }
  }
  
  handleMouseDown(pos: Point): void {
    // Check windows in reverse order (top to bottom)
    for (let i = this.windows.length - 1; i >= 0; i--) {
      const window = this.windows[i];
      
      // Safety check: ensure window has bounds
      if (!window || !window.bounds) {
        console.error('Invalid window object at index', i, window);
        continue;
      }
      
      if (this.isInTitleBar(window, pos)) {
        // Start dragging window
        this.windowDragState = {
          window,
          offset: {
            x: pos.x - window.bounds.x,
            y: pos.y - window.bounds.y,
          },
        };
        this.focusWindow(window);
        return;
      }
      
      if (this.windowContainsPoint(window, pos)) {
        // Focus window on click
        this.focusWindow(window);
        return;
      }
    }
  }
  
  handleMouseMove(pos: Point): void {
    if (this.windowDragState) {
      const { window, offset } = this.windowDragState;
      window.bounds.x = pos.x - offset.x;
      window.bounds.y = pos.y - offset.y;
    }
  }
  
  handleMouseUp(): void {
    this.windowDragState = null;
  }
  
  private isInTitleBar(window: Window, point: Point): boolean {
    const titleBarHeight = 24;
    return point.x >= window.bounds.x &&
           point.x < window.bounds.x + window.bounds.width &&
           point.y >= window.bounds.y &&
           point.y < window.bounds.y + titleBarHeight;
  }
  
  private windowContainsPoint(window: Window, point: Point): boolean {
    return point.x >= window.bounds.x &&
           point.x < window.bounds.x + window.bounds.width &&
           point.y >= window.bounds.y &&
           point.y < window.bounds.y + window.bounds.height;
  }
}
