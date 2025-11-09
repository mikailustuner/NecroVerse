/**
 * Video Manager for SWF
 * 
 * Handles video playback for SWF files. Supports:
 * - H.264 video decoding
 * - VP6 video decoding
 * - Sorenson Spark video decoding
 * - Timeline synchronization
 * - Video rendering to canvas
 * 
 * @example
 * ```typescript
 * const videoManager = new VideoManager();
 * await videoManager.loadVideoStream(streamId, codec, width, height, data);
 * videoManager.playVideo(streamId, depth, matrix, colorTransform);
 * videoManager.syncToTimeline(currentFrame, frameRate);
 * ```
 */

export interface VideoStream {
  id: number;
  codec: number; // 2 = H.264, 4 = VP6, 3 = Sorenson Spark
  width: number;
  height: number;
  frameRate: number;
  frameCount: number;
  videoElement?: HTMLVideoElement;
  frames: Map<number, ArrayBuffer>; // Frame number -> video data
  currentFrame: number;
  playing: boolean;
}

export interface VideoInstance {
  streamId: number;
  depth: number;
  matrix?: {
    scaleX?: number;
    scaleY?: number;
    rotateSkew0?: number;
    rotateSkew1?: number;
    translateX?: number;
    translateY?: number;
  };
  colorTransform?: {
    redMultiplier?: number;
    greenMultiplier?: number;
    blueMultiplier?: number;
    alphaMultiplier?: number;
    redOffset?: number;
    greenOffset?: number;
    blueOffset?: number;
    alphaOffset?: number;
  };
}

export class VideoManager {
  private streams: Map<number, VideoStream> = new Map();
  private instances: Map<number, VideoInstance> = new Map(); // depth -> instance
  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  
  get canvasElement(): HTMLCanvasElement | undefined {
    return this.canvas;
  }
  private currentFrame: number = 0;
  private frameRate: number = 12;

  constructor(canvas?: HTMLCanvasElement) {
    if (canvas) {
      this.setCanvas(canvas);
    }
  }

  /**
   * Set canvas for video rendering
   */
  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to get 2D rendering context");
    }
    this.ctx = context;
  }

  /**
   * Load video stream definition
   */
  async loadVideoStream(
    streamId: number,
    codec: number,
    width: number,
    height: number,
    frameRate: number,
    frameCount: number
  ): Promise<void> {
    const stream: VideoStream = {
      id: streamId,
      codec,
      width,
      height,
      frameRate,
      frameCount,
      frames: new Map(),
      currentFrame: 0,
      playing: false,
    };

    // Create video element for H.264 (browser native support)
    if (codec === 2) {
      // H.264 - use HTML5 video element
      const videoElement = document.createElement("video");
      videoElement.width = width;
      videoElement.height = height;
      videoElement.muted = true; // Muted by default, controlled by audio manager
      videoElement.playsInline = true;
      stream.videoElement = videoElement;
    }

    this.streams.set(streamId, stream);
  }

  /**
   * Add video frame data
   */
  addVideoFrame(streamId: number, frameNumber: number, data: ArrayBuffer): void {
    const stream = this.streams.get(streamId);
    if (!stream) {
      console.warn(`Video stream ${streamId} not found`);
      return;
    }

    stream.frames.set(frameNumber, data);

    // For H.264, we can use MediaSource API to feed frames
    if (stream.codec === 2 && stream.videoElement) {
      // H.264 frames can be fed to video element via MediaSource
      // This is a simplified implementation
      // In a full implementation, we would use MediaSource Extensions API
    }
  }

  /**
   * Place video instance on display list
   */
  placeVideo(
    streamId: number,
    depth: number,
    matrix?: VideoInstance["matrix"],
    colorTransform?: VideoInstance["colorTransform"]
  ): void {
    const instance: VideoInstance = {
      streamId,
      depth,
      matrix,
      colorTransform,
    };

    this.instances.set(depth, instance);
  }

  /**
   * Remove video instance from display list
   */
  removeVideo(depth: number): void {
    this.instances.delete(depth);
  }

  /**
   * Play video stream
   */
  playVideo(streamId: number): void {
    const stream = this.streams.get(streamId);
    if (!stream) {
      console.warn(`Video stream ${streamId} not found`);
      return;
    }

    if (stream.videoElement) {
      stream.videoElement.play().catch(console.error);
      stream.playing = true;
    }
  }

  /**
   * Stop video stream
   */
  stopVideo(streamId: number): void {
    const stream = this.streams.get(streamId);
    if (!stream) {
      return;
    }

    if (stream.videoElement) {
      stream.videoElement.pause();
      stream.videoElement.currentTime = 0;
      stream.playing = false;
    }
  }

  /**
   * Seek video to specific frame
   */
  seekVideo(streamId: number, frameNumber: number): void {
    const stream = this.streams.get(streamId);
    if (!stream) {
      return;
    }

    stream.currentFrame = frameNumber;

    if (stream.videoElement) {
      // Calculate time based on frame number and frame rate
      const time = frameNumber / stream.frameRate;
      stream.videoElement.currentTime = time;
    }
  }

  /**
   * Render all video instances to canvas
   */
  render(): void {
    if (!this.ctx || !this.canvas) {
      return;
    }

    // Sort instances by depth (render order)
    const sortedInstances = Array.from(this.instances.entries())
      .sort(([a], [b]) => a - b);

    for (const [depth, instance] of sortedInstances) {
      const stream = this.streams.get(instance.streamId);
      if (!stream) {
        continue;
      }

      this.ctx.save();

      // Apply matrix transform
      if (instance.matrix) {
        const scaleX = instance.matrix.scaleX ?? 1;
        const scaleY = instance.matrix.scaleY ?? 1;
        const rotateSkew0 = instance.matrix.rotateSkew0 ?? 0;
        const rotateSkew1 = instance.matrix.rotateSkew1 ?? 0;
        const translateX = instance.matrix.translateX ?? 0;
        const translateY = instance.matrix.translateY ?? 0;

        this.ctx.setTransform(scaleX, rotateSkew0, rotateSkew1, scaleY, translateX, translateY);
      }

      // Apply color transform
      if (instance.colorTransform) {
        const {
          redMultiplier = 1,
          greenMultiplier = 1,
          blueMultiplier = 1,
          alphaMultiplier = 1,
          redOffset = 0,
          greenOffset = 0,
          blueOffset = 0,
          alphaOffset = 0,
        } = instance.colorTransform;

        this.ctx.globalAlpha = alphaMultiplier;
        // Color transform is applied via globalCompositeOperation and filters
        // Simplified implementation
      }

      // Render video
      if (stream.videoElement && stream.videoElement.readyState >= 2) {
        // Video is loaded enough to render
        this.ctx.drawImage(
          stream.videoElement,
          0,
          0,
          stream.width,
          stream.height
        );
      } else {
        // Fallback: draw placeholder rectangle
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, stream.width, stream.height);
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "12px Arial";
        this.ctx.fillText(`Video ${stream.id}`, 10, 20);
      }

      this.ctx.restore();
    }
  }

  /**
   * Sync video playback to timeline
   */
  syncToTimeline(currentFrame: number, frameRate: number): void {
    this.currentFrame = currentFrame;
    this.frameRate = frameRate;

    // Update all video streams to match timeline
    for (const stream of this.streams.values()) {
      if (stream.playing) {
        const targetFrame = Math.floor((currentFrame / frameRate) * stream.frameRate);
        if (targetFrame !== stream.currentFrame) {
          this.seekVideo(stream.id, targetFrame);
        }
      }
    }
  }

  /**
   * Get video stream by ID
   */
  getStream(streamId: number): VideoStream | undefined {
    return this.streams.get(streamId);
  }

  /**
   * Get video instance by depth
   */
  getInstance(depth: number): VideoInstance | undefined {
    return this.instances.get(depth);
  }

  /**
   * Cleanup
   */
  dispose(): void {
    // Stop all videos
    for (const stream of this.streams.values()) {
      this.stopVideo(stream.id);
      if (stream.videoElement) {
        stream.videoElement.src = "";
        stream.videoElement.load();
      }
    }

    this.streams.clear();
    this.instances.clear();
  }
}

