import { Point } from '@amiron/pal';

export interface Icon {
  label: string;
  image: ImageData | null;
  position: Point;
  target: string;
}
