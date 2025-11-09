/**
 * Binary reader utility for parsing binary file formats
 */
export class BinaryReader {
  private view: DataView;
  private offset: number;
  private littleEndian: boolean;

  constructor(buffer: ArrayBuffer, littleEndian: boolean = false) {
    this.view = new DataView(buffer);
    this.offset = 0;
    this.littleEndian = littleEndian;
  }

  get position(): number {
    return this.offset;
  }

  set position(value: number) {
    this.offset = value;
  }

  get length(): number {
    return this.view.byteLength;
  }

  get remaining(): number {
    // offset can be in bits (when reading bits) or bytes (when reading bytes)
    // Convert to bytes for comparison with length (which is in bytes)
    const offsetBytes = Math.ceil(this.offset / 8);
    return this.length - offsetBytes;
  }

  available(): number {
    // Alias for remaining
    return this.remaining;
  }

  readUint8(): number {
    // Convert bit offset to byte offset
    const byteOffset = Math.floor(this.offset / 8);
    const value = this.view.getUint8(byteOffset);
    this.offset = (byteOffset + 1) * 8; // Convert back to bit offset
    return value;
  }

  readInt8(): number {
    const byteOffset = Math.floor(this.offset / 8);
    const value = this.view.getInt8(byteOffset);
    this.offset = (byteOffset + 1) * 8;
    return value;
  }

  readUint16(): number {
    const byteOffset = Math.floor(this.offset / 8);
    const value = this.view.getUint16(byteOffset, this.littleEndian);
    this.offset = (byteOffset + 2) * 8;
    return value;
  }

  readInt16(): number {
    const byteOffset = Math.floor(this.offset / 8);
    const value = this.view.getInt16(byteOffset, this.littleEndian);
    this.offset = (byteOffset + 2) * 8;
    return value;
  }

  readUint32(): number {
    const byteOffset = Math.floor(this.offset / 8);
    const value = this.view.getUint32(byteOffset, this.littleEndian);
    this.offset = (byteOffset + 4) * 8;
    return value;
  }

  readInt32(): number {
    const byteOffset = Math.floor(this.offset / 8);
    const value = this.view.getInt32(byteOffset, this.littleEndian);
    this.offset = (byteOffset + 4) * 8;
    return value;
  }

  readFloat32(): number {
    const byteOffset = Math.floor(this.offset / 8);
    const value = this.view.getFloat32(byteOffset, this.littleEndian);
    this.offset = (byteOffset + 4) * 8;
    return value;
  }

  readFloat64(): number {
    const byteOffset = Math.floor(this.offset / 8);
    const value = this.view.getFloat64(byteOffset, this.littleEndian);
    this.offset = (byteOffset + 8) * 8;
    return value;
  }

  readBytes(length: number): Uint8Array {
    const byteOffset = Math.floor(this.offset / 8);
    
    // Validate length
    if (length < 0 || length > this.view.buffer.byteLength - byteOffset) {
      const available = this.view.buffer.byteLength - byteOffset;
      console.warn(`[BinaryReader] Invalid readBytes length: ${length}, available: ${available}, clamping to available`);
      length = Math.max(0, Math.min(length, available));
    }
    
    if (length === 0) {
      return new Uint8Array(0);
    }
    
    const bytes = new Uint8Array(this.view.buffer, byteOffset, length);
    this.offset = (byteOffset + length) * 8;
    return bytes;
  }

  readString(length: number): string {
    const bytes = this.readBytes(length);
    return String.fromCharCode(...bytes);
  }

  readNullTerminatedString(): string {
    const start = this.offset;
    let foundNull = false;
    
    // Find null terminator
    while (this.offset < this.length) {
      const byte = this.readUint8();
      if (byte === 0) {
        foundNull = true;
        break;
      }
    }
    
    // Calculate length
    const length = foundNull ? (this.offset - start - 1) : (this.offset - start);
    
    // Reset to start position
    this.offset = start;
    
    // Read the string
    const str = length > 0 ? this.readString(length) : "";
    
    // Skip null terminator if found, otherwise we're already at the end
    if (foundNull) {
      this.offset += 1; // Skip null terminator
    }
    
    return str;
  }

  readBits(count: number): number {
    // Simple bit reading (for SWF format)
    let value = 0;
    for (let i = 0; i < count; i++) {
      const byteIndex = Math.floor(this.offset / 8);
      const bitIndex = this.offset % 8;
      
      // Check bounds before reading
      if (byteIndex >= this.view.byteLength) {
        // Out of bounds - return 0 for remaining bits
        // This prevents crashes but may cause incorrect parsing
        // The caller should check remaining bytes before calling readBits
        return value;
      }
      
      const byte = this.view.getUint8(byteIndex);
      const bit = (byte >> (7 - bitIndex)) & 1;
      value = (value << 1) | bit;
      this.offset++;
    }
    return value;
  }

  readSignedBits(count: number): number {
    // Read signed bits (two's complement)
    const unsigned = this.readBits(count);
    // Sign extend: if MSB is 1, fill upper bits with 1s
    const signBit = 1 << (count - 1);
    if (unsigned & signBit) {
      // Negative number - sign extend
      const mask = (1 << count) - 1;
      return unsigned | (~mask);
    }
    return unsigned;
  }

  alignToByte(): void {
    if (this.offset % 8 !== 0) {
      this.offset = Math.ceil(this.offset / 8) * 8;
    }
  }

  peekUint8(): number {
    const byteOffset = Math.floor(this.offset / 8);
    return this.view.getUint8(byteOffset);
  }

  peekUint16(): number {
    const byteOffset = Math.floor(this.offset / 8);
    return this.view.getUint16(byteOffset, this.littleEndian);
  }

  peekUint32(): number {
    const byteOffset = Math.floor(this.offset / 8);
    return this.view.getUint32(byteOffset, this.littleEndian);
  }

  skip(bytes: number): void {
    // Skip bytes (convert to bits)
    this.offset += bytes * 8;
  }

  seek(position: number): void {
    // Position can be in bits or bytes - assume bytes if < length, otherwise bits
    if (position < this.length) {
      // Treat as byte offset
      this.offset = position * 8;
    } else {
      // Treat as bit offset
      this.offset = position;
    }
  }
}

