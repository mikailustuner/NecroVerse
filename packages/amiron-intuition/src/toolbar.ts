import { GraphicsContext, Rect, Point } from '@amiron/pal';
import { InputEvent } from './events';
import { NecroTheme } from './theme';
import { Widget } from './widget';
import { Button } from './widget';

/**
 * Toolbar widget containing multiple buttons
 */
export class Toolbar extends Widget {
  buttons: Button[];
  
  constructor(bounds: Rect, buttonConfigs: Array<{ label: string; onClick: () => void }>) {
    super(bounds);
    this.buttons = [];
    
    // Create buttons with automatic layout
    const buttonWidth = 80;
    const buttonHeight = 24;
    const spacing = 8;
    let x = bounds.x + spacing;
    
    for (const config of buttonConfigs) {
      const button = new Button(
        { x, y: bounds.y + 4, width: buttonWidth, height: buttonHeight },
        config.label,
        config.onClick
      );
      this.buttons.push(button);
      x += buttonWidth + spacing;
    }
  }
  
  render(ctx: GraphicsContext): void {
    const theme = NecroTheme;
    
    // Draw toolbar background
    ctx.drawRect(this.bounds, theme.shadow);
    
    // Render buttons
    for (const button of this.buttons) {
      button.render(ctx);
    }
  }
  
  handleEvent(event: InputEvent): boolean {
    // Propagate events to buttons
    for (const button of this.buttons) {
      if (button.handleEvent(event)) {
        return true;
      }
    }
    
    return false;
  }
}
