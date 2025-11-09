/**
 * SVG Icon System for Amiron
 * Minimalist icons matching NecroNet aesthetic
 */

export interface IconDefinition {
  name: string;
  svg: string;
  viewBox: string;
}

/**
 * Convert SVG string to ImageData for canvas rendering
 */
export function svgToImageData(svg: string, size: number = 48): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size);
      resolve(imageData);
    };
    
    img.onerror = () => reject(new Error('Failed to load SVG'));
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.src = url;
  });
}

/**
 * System application icons
 */
export const SystemIcons: Record<string, IconDefinition> = {
  'text-editor': {
    name: 'Text Editor',
    viewBox: '0 0 48 48',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <rect x="8" y="8" width="32" height="32" fill="none" stroke="#a855f7" stroke-width="2"/>
      <line x1="12" y1="16" x2="36" y2="16" stroke="#00fff7" stroke-width="2"/>
      <line x1="12" y1="22" x2="32" y2="22" stroke="#00fff7" stroke-width="2"/>
      <line x1="12" y1="28" x2="36" y2="28" stroke="#00fff7" stroke-width="2"/>
      <line x1="12" y1="34" x2="28" y2="34" stroke="#00fff7" stroke-width="2"/>
    </svg>`,
  },
  
  'file-manager': {
    name: 'File Manager',
    viewBox: '0 0 48 48',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <path d="M 8 12 L 8 38 L 40 38 L 40 18 L 24 18 L 20 12 Z" fill="none" stroke="#a855f7" stroke-width="2"/>
      <line x1="8" y1="18" x2="40" y2="18" stroke="#a855f7" stroke-width="2"/>
      <circle cx="16" cy="26" r="2" fill="#00fff7"/>
      <circle cx="24" cy="26" r="2" fill="#00fff7"/>
      <circle cx="32" cy="26" r="2" fill="#00fff7"/>
    </svg>`,
  },
  
  'terminal': {
    name: 'Terminal',
    viewBox: '0 0 48 48',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <rect x="6" y="10" width="36" height="28" fill="none" stroke="#a855f7" stroke-width="2"/>
      <polyline points="12,18 18,24 12,30" fill="none" stroke="#00fff7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="22" y1="30" x2="32" y2="30" stroke="#00fff7" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  
  'loading': {
    name: 'Loading',
    viewBox: '0 0 48 48',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="16" fill="none" stroke="#a855f7" stroke-width="3" opacity="0.3"/>
      <path d="M 24 8 A 16 16 0 0 1 40 24" fill="none" stroke="#00fff7" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
  },
};

/**
 * Load all system icons and convert to ImageData
 */
export async function loadSystemIcons(): Promise<Map<string, ImageData>> {
  const iconMap = new Map<string, ImageData>();
  
  for (const [key, icon] of Object.entries(SystemIcons)) {
    try {
      const imageData = await svgToImageData(icon.svg, 48);
      iconMap.set(key, imageData);
    } catch (error) {
      console.error(`Failed to load icon ${key}:`, error);
    }
  }
  
  return iconMap;
}
