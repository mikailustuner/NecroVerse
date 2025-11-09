import { GraphicsContext, Rect, Point } from '@amiron/pal';
import { InputEvent } from './events';
import { NecroTheme } from './theme';
import { Widget } from './widget';

/**
 * Breadcrumb navigation widget
 */
export class Breadcrumb extends Widget {
  path: string;
  onNavigate?: (path: string) => void;
  private segments: string[];
  
  constructor(bounds: Rect, initialPath: string = '/') {
    super(bounds);
    this.path = initialPath;
    this.segments = this.parsePath(initialPath);
  }
  
  setPath(path: string): void {
    this.path = path;
    this.segments = this.parsePath(path);
  }
  
  private parsePath(path: string): string[] {
    if (path === '/') return ['/'];
    const parts = path.split('/').filter(p => p.length > 0);
    return ['/', ...parts];
  }
  
  render(ctx: GraphicsContext): void {
    const theme = NecroTheme;
    
    // Draw background
    ctx.drawRect(this.bounds, theme.windowBackground);
    
    // Draw path segments
    let x = this.bounds.x + 4;
    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i];
      
      // Draw segment
      ctx.drawText(
        segment,
        { x, y: this.bounds.y + 16 },
        theme.font,
        theme.text
      );
      
      x += segment.length * 7 + 4;
      
      // Draw separator
      if (i < this.segments.length - 1) {
        ctx.drawText(
          '>',
          { x, y: this.bounds.y + 16 },
          theme.font,
          theme.textDim
        );
        x += 12;
      }
    }
  }
  
  handleEvent(event: InputEvent): boolean {
    if (event.type === 'click' && this.containsPoint(event.position)) {
      const segmentIndex = this.getSegmentIndexAtPosition(event.position);
      if (segmentIndex >= 0 && this.onNavigate) {
        const newPath = this.buildPathFromSegments(segmentIndex);
        this.onNavigate(newPath);
        return true;
      }
    }
    
    return false;
  }
  
  private getSegmentIndexAtPosition(point: Point): number {
    let x = this.bounds.x + 4;
    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i];
      const segmentWidth = segment.length * 7 + 4;
      
      if (point.x >= x && point.x < x + segmentWidth) {
        return i;
      }
      
      x += segmentWidth + 12; // Include separator
    }
    
    return -1;
  }
  
  private buildPathFromSegments(endIndex: number): string {
    if (endIndex === 0) return '/';
    return '/' + this.segments.slice(1, endIndex + 1).join('/');
  }
}
