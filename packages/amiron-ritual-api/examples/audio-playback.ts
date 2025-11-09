/**
 * Audio Playback Example
 * 
 * Demonstrates playing sounds with volume control
 */

import { Amiron } from '@amiron/ritual-api';

export async function audioPlaybackDemo() {
  // Check if audio is available
  if (!Amiron.hasAudio()) {
    console.error("Audio context not initialized");
    return;
  }
  
  console.log("✓ Audio context available");
  
  // Load a sound file
  const response = await fetch("/sounds/beep.wav");
  const audioBuffer = await response.arrayBuffer();
  
  // Play at full volume
  await Amiron.playSound(audioBuffer, 1.0);
  console.log("✓ Played sound at full volume");
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Play at half volume
  await Amiron.playSound(audioBuffer, 0.5);
  console.log("✓ Played sound at half volume");
  
  // Safe playback with error handling
  const result = await Amiron.playSoundSafe(audioBuffer, 0.8);
  if (result.ok) {
    console.log("✓ Sound played successfully");
  } else {
    console.error("✗ Playback failed:", result.error.message);
  }
}

/**
 * Generate a simple beep tone programmatically
 */
export function generateBeep(frequency: number = 440, duration: number = 0.2): ArrayBuffer {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2); // WAV header + PCM data
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);
  
  // Generate sine wave
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t) * 0.5;
    const value = Math.floor(sample * 32767);
    view.setInt16(44 + i * 2, value, true);
  }
  
  return buffer;
}
