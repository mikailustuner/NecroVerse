import { Color, Font } from '@amiron/pal';

export interface Theme {
  background: Color;
  shadow: Color;
  accentGlow: Color;
  highlight: Color;
  warning: Color;
  text: Color;
  textDim: Color;
  windowBackground: Color;
  font: Font;
}

export const NecroTheme: Theme = {
  background: { r: 10, g: 6, b: 18 },
  shadow: { r: 28, g: 16, b: 36 },
  accentGlow: { r: 168, g: 85, b: 247 },
  highlight: { r: 0, g: 255, b: 247 },
  warning: { r: 255, g: 0, b: 110 },
  text: { r: 245, g: 245, b: 245 },
  textDim: { r: 153, g: 153, b: 153 },
  windowBackground: { r: 20, g: 12, b: 28 },
  font: { family: 'Orbitron, monospace', size: 12 },
};
