import { CanvasGraphics, IndexedDBFileSystem, WebAudioContext } from '@amiron/pal';
import { Desktop } from '@amiron/workbench';
import { Amiron, Window } from '@amiron/ritual-api';
import init, { Exec } from '@amiron/exec';
import { launchTextEditor, launchFileManager, launchTerminal } from './apps';

async function bootstrap() {
  console.log('☠️ Initiating resurrection protocol...');
  
  // Acquire canvas element
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Canvas element not found - the void rejects manifestation');
  }
  
  // Set canvas to fullscreen
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Handle window resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
  
  console.log('⚡ Loading Exec WASM module...');
  
  // Initialize WASM module
  await init();
  
  // Create core subsystems
  const exec = new Exec();
  const graphics = new CanvasGraphics(canvas);
  const filesystem = new IndexedDBFileSystem();
  const audioContext = new WebAudioContext();
  
  console.log('🌑 Initializing filesystem...');
  await filesystem.init();
  
  console.log('🔮 Binding Ritual API...');
  // Initialize Amiron API with all subsystems
  Amiron.init(exec, filesystem, audioContext);
  
  // Create desktop instance
  const desktop = new Desktop();
  
  // Register core applications
  console.log('🔮 Registering applications...');
  desktop.registerApplication('text-editor', launchTextEditor as () => Window);
  desktop.registerApplication('file-manager', launchFileManager as () => Window);
  desktop.registerApplication('terminal', launchTerminal as () => Window);
  console.log('✅ Applications registered');
  
  // Load saved desktop layout or create default icons
  desktop.loadLayout();
  
  // If no icons exist (first launch), create default icons
  if (desktop.icons.length === 0) {
    console.log('🕯️ First launch detected - summoning default icons...');
    
    const iconSpacing = 80;
    const iconStartX = 20;
    const iconStartY = 20;
    
    desktop.addIcon({
      label: 'Text Editor',
      image: null,
      position: { x: iconStartX, y: iconStartY },
      target: 'text-editor',
    });
    
    desktop.addIcon({
      label: 'File Manager',
      image: null,
      position: { x: iconStartX, y: iconStartY + iconSpacing },
      target: 'file-manager',
    });
    
    desktop.addIcon({
      label: 'Terminal',
      image: null,
      position: { x: iconStartX, y: iconStartY + iconSpacing * 2 },
      target: 'terminal',
    });
    
    console.log('👻 Default icons materialized');
  }
  
  // Track click timing for double-click detection
  let lastClickTime = 0;
  let lastClickPos = { x: 0, y: 0 };
  const DOUBLE_CLICK_THRESHOLD = 300; // ms
  const DOUBLE_CLICK_DISTANCE = 5; // pixels
  
  // Event handlers
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const pos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    desktop.handleMouseDown(pos);
  });
  
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const pos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    desktop.handleMouseMove(pos);
  });
  
  canvas.addEventListener('mouseup', () => {
    desktop.handleMouseUp();
  });
  
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const pos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    
    const now = Date.now();
    const timeDiff = now - lastClickTime;
    const distance = Math.sqrt(
      Math.pow(pos.x - lastClickPos.x, 2) + 
      Math.pow(pos.y - lastClickPos.y, 2)
    );
    
    if (timeDiff < DOUBLE_CLICK_THRESHOLD && distance < DOUBLE_CLICK_DISTANCE) {
      // Double click detected
      desktop.handleDoubleClick(pos);
      lastClickTime = 0; // Reset to prevent triple-click
    } else {
      lastClickTime = now;
      lastClickPos = pos;
    }
  });
  
  // Start render loop
  let lastFrameTime = performance.now();
  let frameCount = 0;
  let fps = 0;
  
  function render(currentTime: number) {
    // Calculate FPS
    frameCount++;
    const elapsed = currentTime - lastFrameTime;
    if (elapsed >= 1000) {
      fps = Math.round((frameCount * 1000) / elapsed);
      frameCount = 0;
      lastFrameTime = currentTime;
    }
    
    // Render desktop
    desktop.render(graphics);
    
    // Display FPS counter (optional, for debugging)
    if (fps > 0) {
      graphics.drawText(
        `FPS: ${fps}`,
        { x: canvas.width - 80, y: 20 },
        { family: 'Orbitron', size: 12 },
        { r: 153, g: 153, b: 153 }
      );
    }
    
    requestAnimationFrame(render);
  }
  
  requestAnimationFrame(render);
  
  console.log('⚡ The binding ritual is complete.');
  console.log('☠️ Amiron Desktop manifested successfully.');
}

bootstrap().catch((error) => {
  console.error('⚠️ The ritual falters...', error);
  document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #0a0612;
      color: #ff006e;
      font-family: 'Orbitron', monospace;
      text-align: center;
      padding: 20px;
    ">
      <div>
        <h1>⚠️ Manifestation Failed</h1>
        <p style="color: #999; margin-top: 20px;">
          ${error.message || 'Unknown curse detected'}
        </p>
        <p style="color: #666; margin-top: 10px; font-size: 12px;">
          Check the console for details
        </p>
      </div>
    </div>
  `;
});
