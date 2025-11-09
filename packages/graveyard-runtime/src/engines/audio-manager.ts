/**
 * Audio Manager for SWF
 * 
 * Handles MP3, ADPCM audio playback and mixing. Provides:
 * - MP3 audio decoding
 * - ADPCM audio decoding
 * - Volume control
 * - Mute/unmute
 * - Pan control
 * - Timeline synchronization
 * 
 * @example
 * ```typescript
 * const audioManager = new AudioManager();
 * await audioManager.loadMP3(soundId, arrayBuffer);
 * audioManager.playSound(soundId, false, 1.0, 0.0);
 * audioManager.setMasterVolume(0.5);
 * ```
 */

export interface AudioTrack {
  id: number;
  soundId: number;
  audioBuffer?: AudioBuffer;
  audioSource?: AudioBufferSourceNode;
  gainNode?: GainNode;
  startTime: number;
  loop: boolean;
  volume: number;
  pan: number;
  playing: boolean;
}

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private tracks: Map<number, AudioTrack> = new Map();
  private masterVolume: number = 1.0;
  private muted: boolean = false;
  private masterGainNode: GainNode | null = null;
  private currentTime: number = 0;
  private timelinePosition: number = 0;

  constructor() {
    this.initializeAudioContext();
  }

  /**
   * Initialize Web Audio API context
   */
  private initializeAudioContext(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        
        // Create master gain node
        this.masterGainNode = this.audioContext.createGain();
        this.masterGainNode.connect(this.audioContext.destination);
        this.masterGainNode.gain.value = this.masterVolume;
      }
    } catch (error) {
      console.error("Failed to initialize audio context:", error);
    }
  }

  /**
   * Load MP3 audio from data
   */
  async loadMP3(soundId: number, data: ArrayBuffer): Promise<void> {
    if (!this.audioContext) {
      console.warn("Audio context not available");
      return;
    }

    try {
      // Decode MP3 audio data
      const audioBuffer = await this.audioContext.decodeAudioData(data.slice(0));
      
      // Store audio buffer
      const track: AudioTrack = {
        id: soundId,
        soundId,
        audioBuffer,
        startTime: 0,
        loop: false,
        volume: 1.0,
        pan: 0.0,
        playing: false,
      };
      
      this.tracks.set(soundId, track);
    } catch (error) {
      console.error(`Failed to load MP3 audio ${soundId}:`, error);
    }
  }

  /**
   * Load ADPCM audio from data
   */
  async loadADPCM(soundId: number, data: ArrayBuffer, sampleRate: number = 22050): Promise<void> {
    if (!this.audioContext) {
      console.warn("Audio context not available");
      return;
    }

    try {
      // Decode ADPCM audio data
      const audioBuffer = this.decodeADPCM(data, sampleRate);
      
      // Store audio buffer
      const track: AudioTrack = {
        id: soundId,
        soundId,
        audioBuffer,
        startTime: 0,
        loop: false,
        volume: 1.0,
        pan: 0.0,
        playing: false,
      };
      
      this.tracks.set(soundId, track);
    } catch (error) {
      console.error(`Failed to load ADPCM audio ${soundId}:`, error);
    }
  }

  /**
   * Decode ADPCM audio data
   */
  private decodeADPCM(data: ArrayBuffer, sampleRate: number): AudioBuffer {
    if (!this.audioContext) {
      throw new Error("Audio context not available");
    }

    // Simplified ADPCM decoder
    // In a full implementation, this would properly decode ADPCM format
    const view = new DataView(data);
    const samples: number[] = [];
    
    // Basic ADPCM decoding (simplified)
    let predictor = 0;
    let stepIndex = 0;
    const stepTable = this.getADPCMStepTable();
    
    for (let i = 0; i < data.byteLength; i++) {
      const byte = view.getUint8(i);
      
      // Decode 4-bit ADPCM samples
      for (let j = 0; j < 2; j++) {
        const nibble = j === 0 ? (byte & 0x0f) : ((byte >> 4) & 0x0f);
        const step = stepTable[stepIndex];
        
        let diff = step >> 3;
        if (nibble & 1) diff += step >> 2;
        if (nibble & 2) diff += step >> 1;
        if (nibble & 4) diff += step;
        if (nibble & 8) diff = -diff;
        
        predictor += diff;
        predictor = Math.max(-32768, Math.min(32767, predictor));
        
        stepIndex += this.getADPCMIndexTable()[nibble & 7];
        stepIndex = Math.max(0, Math.min(88, stepIndex));
        
        samples.push(predictor / 32768.0);
      }
    }
    
    // Create audio buffer
    const audioBuffer = this.audioContext.createBuffer(1, samples.length, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < samples.length; i++) {
      channelData[i] = samples[i];
    }
    
    return audioBuffer;
  }

  /**
   * Get ADPCM step table
   */
  private getADPCMStepTable(): number[] {
    return [
      7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 21, 23, 25, 28, 31,
      34, 37, 41, 45, 50, 55, 60, 66, 73, 80, 88, 97, 107, 118, 130, 143,
      157, 173, 190, 209, 230, 253, 279, 307, 337, 371, 408, 449, 494, 544, 598, 658,
      724, 796, 876, 963, 1060, 1166, 1282, 1411, 1552, 1707, 1878, 2066, 2272, 2499, 2749, 3024,
      3327, 3660, 4026, 4428, 4871, 5358, 5894, 6484, 7132, 7845, 8630, 9493, 10442, 11487, 12635, 13899,
      15289, 16818, 18500, 20350, 22385, 24623, 27086, 29794, 32767,
    ];
  }

  /**
   * Get ADPCM index table
   */
  private getADPCMIndexTable(): number[] {
    return [-1, -1, -1, -1, 2, 4, 6, 8];
  }

  /**
   * Play sound
   */
  playSound(soundId: number, loop: boolean = false, volume: number = 1.0, pan: number = 0.0): void {
    if (!this.audioContext || this.muted) {
      return;
    }

    const track = this.tracks.get(soundId);
    if (!track || !track.audioBuffer) {
      console.warn(`Sound ${soundId} not loaded`);
      return;
    }

    // Stop existing playback if any
    this.stopSound(soundId);

    // Create audio source
    const source = this.audioContext.createBufferSource();
    source.buffer = track.audioBuffer;
    source.loop = loop;

    // Create gain node for volume
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume * this.masterVolume;

    // Create panner node for panning
    const pannerNode = this.audioContext.createStereoPanner();
    pannerNode.pan.value = pan;

    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(pannerNode);
    pannerNode.connect(this.masterGainNode!);

    // Start playback
    source.start(0);

    // Update track
    track.audioSource = source;
    track.gainNode = gainNode;
    track.startTime = this.audioContext.currentTime;
    track.loop = loop;
    track.volume = volume;
    track.pan = pan;
    track.playing = true;
  }

  /**
   * Stop sound
   */
  stopSound(soundId: number): void {
    const track = this.tracks.get(soundId);
    if (track && track.audioSource) {
      try {
        track.audioSource.stop();
      } catch (error) {
        // Source may already be stopped
      }
      track.audioSource = undefined;
      track.playing = false;
    }
  }

  /**
   * Stop all sounds
   */
  stopAllSounds(): void {
    for (const [soundId, track] of this.tracks) {
      this.stopSound(soundId);
    }
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = this.muted ? 0 : this.masterVolume;
    }
    
    // Update all track volumes
    for (const track of this.tracks.values()) {
      if (track.gainNode) {
        track.gainNode.gain.value = track.volume * this.masterVolume;
      }
    }
  }

  /**
   * Get master volume
   */
  getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Mute/unmute
   */
  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = muted ? 0 : this.masterVolume;
    }
  }

  /**
   * Is muted
   */
  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Set track volume
   */
  setTrackVolume(soundId: number, volume: number): void {
    const track = this.tracks.get(soundId);
    if (track) {
      track.volume = Math.max(0, Math.min(1, volume));
      if (track.gainNode) {
        track.gainNode.gain.value = track.volume * this.masterVolume;
      }
    }
  }

  /**
   * Set track pan
   */
  setTrackPan(soundId: number, pan: number): void {
    const track = this.tracks.get(soundId);
    if (track && track.audioSource) {
      // Recreate panner if needed
      // For simplicity, we'll just update the pan value
      track.pan = Math.max(-1, Math.min(1, pan));
    }
  }

  /**
   * Sync audio to timeline position
   */
  syncToTimeline(frame: number, frameRate: number): void {
    this.timelinePosition = frame / frameRate;
    
    // Update audio playback based on timeline
    // This is a simplified implementation
    // In a full implementation, we would seek audio buffers to match timeline
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.stopAllSounds();
    
    if (this.audioContext) {
      this.audioContext.close().catch(console.error);
      this.audioContext = null;
    }
    
    this.tracks.clear();
    this.masterGainNode = null;
  }
}

