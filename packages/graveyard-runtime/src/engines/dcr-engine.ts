import { DCRFile, DCRFrame, DCRSprite } from "../parsers/dcr";
import { CanvasRenderer } from "../renderers/canvas-renderer";
import { LingoInterpreter, LingoContext } from "./lingo";

/**
 * Director Rendering Engine
 * Renders Director/Shockwave content
 */
export class DCREngine {
  private dcr: DCRFile;
  private renderer: CanvasRenderer;
  private lingo: LingoInterpreter;
  private context: LingoContext;
  private currentFrame: number = 0;
  private animationId?: number;

  private spriteChannels: Map<number, { spriteId: number; x: number; y: number; visible: boolean; member?: string }> = new Map();

  constructor(dcr: DCRFile, renderer: CanvasRenderer) {
    this.dcr = dcr;
    this.renderer = renderer;
    
    // Initialize Lingo context
    this.context = {
      variables: {},
      functions: {},
      sprites: new Map(),
      stage: {
        width: dcr.header.dimensions?.width || 800,
        height: dcr.header.dimensions?.height || 600,
      },
      timeline: {
        currentFrame: 0,
        totalFrames: dcr.frames.length,
        gotoFrame: (frame: number) => this.gotoFrame(frame),
        play: () => this.play(),
        stop: () => this.stop(),
        pause: () => this.stop(), // Pause is same as stop for now
      },
    };
    
    // Initialize sprites
    for (const sprite of dcr.sprites) {
      this.context.sprites.set(sprite.id, {
        id: sprite.id,
        name: sprite.name,
        x: 0,
        y: 0,
        visible: true,
        member: sprite.name,
      });
    }
    
    this.lingo = new LingoInterpreter(this.context);
    
    // Execute initialization scripts
    this.executeScripts();
  }

  private executeScripts(): void {
    // Execute all Lingo scripts
    for (const [name, script] of Object.entries(this.dcr.scripts)) {
      try {
        this.lingo.execute(script);
      } catch (error) {
        console.error(`Error executing script ${name}:`, error);
      }
    }
  }

  render(): void {
    this.renderer.clear();
    
    // Update context
    this.context.variables["_currentFrame"] = this.currentFrame;
    this.context.variables["_totalFrames"] = this.dcr.frames.length;
    
    // Render current frame
    if (this.currentFrame < this.dcr.frames.length) {
      const frame = this.dcr.frames[this.currentFrame];
      this.renderFrame(frame);
    }
  }

  private renderFrame(frame: DCRFrame): void {
    // Update context
    this.context.variables["_currentFrame"] = this.currentFrame + 1; // Lingo is 1-indexed
    this.context.variables["_totalFrames"] = this.dcr.frames.length;
    this.context.timeline!.currentFrame = this.currentFrame;
    
    // Execute frame scripts (on enterFrame)
    if (frame.scripts) {
      for (const script of frame.scripts) {
        try {
          this.lingo.execute(script);
        } catch (error) {
          console.error("Error executing frame script:", error);
        }
      }
    }
    
    // Update sprite channels from frame data
    this.updateSpriteChannels(frame);
    
    // Render sprites in frame
    for (const spriteRef of frame.sprites) {
      const sprite = this.dcr.sprites.find((s) => s.id === spriteRef.spriteId);
      if (sprite) {
        this.renderSprite(sprite, spriteRef);
      }
    }
    
    // Render sprites from channels (updated by Lingo)
    for (const [channel, channelData] of this.spriteChannels) {
      const sprite = this.dcr.sprites.find((s) => s.id === channelData.spriteId);
      if (sprite && channelData.visible) {
        this.renderSpriteAt(sprite, channelData.x, channelData.y);
      }
    }
  }

  /**
   * Update sprite channels from frame data
   */
  private updateSpriteChannels(frame: DCRFrame): void {
    for (const spriteRef of frame.sprites) {
      const channel = spriteRef.channel;
      const spriteData = this.context.sprites.get(spriteRef.spriteId);
      
      if (spriteData) {
        // Update channel with sprite data
        this.spriteChannels.set(channel, {
          spriteId: spriteRef.spriteId,
          x: spriteRef.x,
          y: spriteRef.y,
          visible: spriteData.visible !== false,
          member: spriteData.member || spriteData.name,
        });
        
        // Update sprite data from frame
        spriteData.x = spriteRef.x;
        spriteData.y = spriteRef.y;
      }
    }
  }

  private renderSprite(sprite: DCRSprite, ref: { x: number; y: number; channel: number }): void {
    const spriteData = this.context.sprites.get(sprite.id);
    if (spriteData && spriteData.visible !== false) {
      this.renderSpriteAt(sprite, ref.x, ref.y);
    }
  }

  /**
   * Render sprite at specific position
   */
  private renderSpriteAt(sprite: DCRSprite, x: number, y: number): void {
    const ctx = this.renderer["ctx"] as CanvasRenderingContext2D;
    if (!ctx) return;
    
    // Draw sprite placeholder
    ctx.fillStyle = "#a855f7";
    ctx.fillRect(x, y, 50, 50);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px Arial";
    ctx.fillText(sprite.name, x + 5, y + 30);
  }

  play(): void {
    const frameTime = 1000 / 12; // 12 fps default
    
    const animate = () => {
      this.render();
      this.currentFrame++;
      
      if (this.currentFrame < this.dcr.frames.length) {
        this.animationId = window.setTimeout(animate, frameTime);
      }
    };
    
    animate();
  }

  stop(): void {
    if (this.animationId) {
      clearTimeout(this.animationId);
      this.animationId = undefined;
    }
  }

  gotoFrame(frame: number): void {
    this.currentFrame = Math.max(0, Math.min(frame, this.dcr.frames.length - 1));
    this.render();
  }

  handleMouseEvent(event: MouseEvent, canvas: HTMLCanvasElement): void {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.context.variables["_mouseX"] = x;
    this.context.variables["_mouseY"] = y;
    this.context.variables["_mouseDown"] = event.type === "mousedown" ? 1 : 0;
    this.context.variables["_mouseUp"] = event.type === "mouseup" ? 1 : 0;
    
    // Execute mouse event handlers
    if (this.dcr.scripts["onMouseDown"] && event.type === "mousedown") {
      this.lingo.execute(this.dcr.scripts["onMouseDown"]);
    }
    if (this.dcr.scripts["onMouseUp"] && event.type === "mouseup") {
      this.lingo.execute(this.dcr.scripts["onMouseUp"]);
    }
  }
}

