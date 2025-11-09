import { Point } from '@amiron/pal';

export interface InputEvent {
  type: 'click' | 'mousemove' | 'mousedown' | 'mouseup' | 'keydown' | 'keyup';
  position: Point;
  button?: number;
  key?: string;
}
