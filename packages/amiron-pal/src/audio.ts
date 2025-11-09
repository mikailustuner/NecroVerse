export interface IAudioContext {
  playSound(buffer: ArrayBuffer, volume?: number): Promise<void>;
}

export class WebAudioContext implements IAudioContext {
  private context: globalThis.AudioContext | null = null;
  
  private ensureContext(): globalThis.AudioContext {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.context;
  }
  
  async playSound(buffer: ArrayBuffer, volume: number = 1.0): Promise<void> {
    const ctx = this.ensureContext();
    const audioBuffer = await ctx.decodeAudioData(buffer);
    
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    
    source.buffer = audioBuffer;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    source.start(0);
  }
}
