import { BinaryReader } from "../utils/binary-reader";

/**
 * Java Class File Parser
 * Parses .class files to extract bytecode and metadata
 */

export interface JavaClass {
  magic: number;
  minorVersion: number;
  majorVersion: number;
  constantPool: ConstantPoolEntry[];
  accessFlags: number;
  thisClass: number;
  superClass: number;
  interfaces: number[];
  fields: FieldInfo[];
  methods: MethodInfo[];
  attributes: AttributeInfo[];
}

export interface ConstantPoolEntry {
  tag: number;
  value: any;
}

export interface FieldInfo {
  accessFlags: number;
  nameIndex: number;
  descriptorIndex: number;
  attributes: AttributeInfo[];
}

export interface MethodInfo {
  accessFlags: number;
  nameIndex: number;
  descriptorIndex: number;
  attributes: AttributeInfo[];
  code?: CodeAttribute;
}

export interface CodeAttribute {
  maxStack: number;
  maxLocals: number;
  code: Uint8Array;
  exceptions: ExceptionInfo[];
  attributes: AttributeInfo[];
}

export interface ExceptionInfo {
  startPc: number;
  endPc: number;
  handlerPc: number;
  catchType: number;
}

export interface AttributeInfo {
  nameIndex: number;
  length: number;
  data: Uint8Array;
}

/**
 * Parse Java .class file
 */
export class JavaClassParser {
  private reader: BinaryReader;
  private constantPool: ConstantPoolEntry[] = [];

  constructor(buffer: ArrayBuffer) {
    this.reader = new BinaryReader(buffer, false); // Big-endian
  }

  parse(): JavaClass {
    // Magic number (0xCAFEBABE)
    const magic = this.reader.readUint32();
    if (magic !== 0xcafebabe) {
      throw new Error("Invalid Java class file: magic number mismatch");
    }

    // Version
    const minorVersion = this.reader.readUint16();
    const majorVersion = this.reader.readUint16();

    // Constant pool
    const constantPoolCount = this.reader.readUint16();
    this.constantPool = this.parseConstantPool(constantPoolCount);

    // Access flags
    const accessFlags = this.reader.readUint16();

    // This class
    const thisClass = this.reader.readUint16();

    // Super class
    const superClass = this.reader.readUint16();

    // Interfaces
    const interfacesCount = this.reader.readUint16();
    const interfaces: number[] = [];
    for (let i = 0; i < interfacesCount; i++) {
      interfaces.push(this.reader.readUint16());
    }

    // Fields
    const fieldsCount = this.reader.readUint16();
    const fields = this.parseFields(fieldsCount);

    // Methods
    const methodsCount = this.reader.readUint16();
    const methods = this.parseMethods(methodsCount);

    // Attributes
    const attributesCount = this.reader.readUint16();
    const attributes = this.parseAttributes(attributesCount);

    return {
      magic,
      minorVersion,
      majorVersion,
      constantPool: this.constantPool,
      accessFlags,
      thisClass,
      superClass,
      interfaces,
      fields,
      methods,
      attributes,
    };
  }

  private parseConstantPool(count: number): ConstantPoolEntry[] {
    const pool: ConstantPoolEntry[] = [];
    pool.push({ tag: 0, value: null }); // Index 0 is unused

    for (let i = 1; i < count; i++) {
      // Check if we have enough bytes to read tag
      if (this.reader.available() < 1) {
        console.error(`[JavaClassParser] Not enough bytes to read constant pool entry ${i}`);
        break;
      }
      
      const tag = this.reader.readUint8();
      let value: any;

      try {
        switch (tag) {
          case 1: // UTF8
            {
              if (this.reader.available() < 2) {
                console.error(`[JavaClassParser] Not enough bytes for UTF8 length at entry ${i}`);
                value = "";
                break;
              }
              const length = this.reader.readUint16();
              
              // Validate length
              if (length > this.reader.available()) {
                console.error(`[JavaClassParser] UTF8 length ${length} exceeds available bytes ${this.reader.available()} at entry ${i}`);
                value = "";
                break;
              }
              
              value = this.reader.readString(length);
            }
            break;
          case 3: // Integer
            if (this.reader.available() < 4) {
              console.error(`[JavaClassParser] Not enough bytes for Integer at entry ${i}`);
              value = 0;
              break;
            }
            value = this.reader.readInt32();
            break;
          case 4: // Float
            if (this.reader.available() < 4) {
              console.error(`[JavaClassParser] Not enough bytes for Float at entry ${i}`);
              value = 0;
              break;
            }
            value = this.reader.readFloat32();
            break;
          case 5: // Long
            {
              if (this.reader.available() < 8) {
                console.error(`[JavaClassParser] Not enough bytes for Long at entry ${i}`);
                value = BigInt(0);
                break;
              }
              const high = this.reader.readUint32();
              const low = this.reader.readUint32();
              value = (BigInt(high) << 32n) | BigInt(low);
              i++; // Long takes 2 entries
              pool.push({ tag: 0, value: null }); // Add placeholder for second slot
            }
            break;
          case 6: // Double
            if (this.reader.available() < 8) {
              console.error(`[JavaClassParser] Not enough bytes for Double at entry ${i}`);
              value = 0;
              break;
            }
            value = this.reader.readFloat64();
            i++; // Double takes 2 entries
            pool.push({ tag: 0, value: null }); // Add placeholder for second slot
            break;
          case 7: // Class
            if (this.reader.available() < 2) {
              console.error(`[JavaClassParser] Not enough bytes for Class at entry ${i}`);
              value = 0;
              break;
            }
            value = this.reader.readUint16();
            break;
          case 8: // String
            if (this.reader.available() < 2) {
              console.error(`[JavaClassParser] Not enough bytes for String at entry ${i}`);
              value = 0;
              break;
            }
            value = this.reader.readUint16();
            break;
          case 9: // Fieldref
            if (this.reader.available() < 4) {
              console.error(`[JavaClassParser] Not enough bytes for Fieldref at entry ${i}`);
              value = { classIndex: 0, nameAndTypeIndex: 0 };
              break;
            }
            value = {
              classIndex: this.reader.readUint16(),
              nameAndTypeIndex: this.reader.readUint16(),
            };
            break;
          case 10: // Methodref
            if (this.reader.available() < 4) {
              console.error(`[JavaClassParser] Not enough bytes for Methodref at entry ${i}`);
              value = { classIndex: 0, nameAndTypeIndex: 0 };
              break;
            }
            value = {
              classIndex: this.reader.readUint16(),
              nameAndTypeIndex: this.reader.readUint16(),
            };
            break;
          case 11: // InterfaceMethodref
            if (this.reader.available() < 4) {
              console.error(`[JavaClassParser] Not enough bytes for InterfaceMethodref at entry ${i}`);
              value = { classIndex: 0, nameAndTypeIndex: 0 };
              break;
            }
            value = {
              classIndex: this.reader.readUint16(),
              nameAndTypeIndex: this.reader.readUint16(),
            };
            break;
          case 12: // NameAndType
            if (this.reader.available() < 4) {
              console.error(`[JavaClassParser] Not enough bytes for NameAndType at entry ${i}`);
              value = { nameIndex: 0, descriptorIndex: 0 };
              break;
            }
            value = {
              nameIndex: this.reader.readUint16(),
              descriptorIndex: this.reader.readUint16(),
            };
            break;
          case 15: // MethodHandle
            if (this.reader.available() < 3) {
              console.error(`[JavaClassParser] Not enough bytes for MethodHandle at entry ${i}`);
              value = { referenceKind: 0, referenceIndex: 0 };
              break;
            }
            value = {
              referenceKind: this.reader.readUint8(),
              referenceIndex: this.reader.readUint16(),
            };
            break;
          case 16: // MethodType
            if (this.reader.available() < 2) {
              console.error(`[JavaClassParser] Not enough bytes for MethodType at entry ${i}`);
              value = 0;
              break;
            }
            value = this.reader.readUint16(); // descriptor_index
            break;
          case 18: // InvokeDynamic
            if (this.reader.available() < 4) {
              console.error(`[JavaClassParser] Not enough bytes for InvokeDynamic at entry ${i}`);
              value = { bootstrapMethodAttrIndex: 0, nameAndTypeIndex: 0 };
              break;
            }
            value = {
              bootstrapMethodAttrIndex: this.reader.readUint16(),
              nameAndTypeIndex: this.reader.readUint16(),
            };
            break;
          default:
            console.warn(`[JavaClassParser] Unknown constant pool tag ${tag} at entry ${i}`);
            value = null;
            break;
        }
      } catch (error) {
        console.error(`[JavaClassParser] Error parsing constant pool entry ${i} (tag ${tag}):`, error);
        value = null;
      }

      pool.push({ tag, value });
    }

    return pool;
  }

  private parseFields(count: number): FieldInfo[] {
    const fields: FieldInfo[] = [];

    for (let i = 0; i < count; i++) {
      const accessFlags = this.reader.readUint16();
      const nameIndex = this.reader.readUint16();
      const descriptorIndex = this.reader.readUint16();
      const attributesCount = this.reader.readUint16();
      const attributes = this.parseAttributes(attributesCount);

      fields.push({
        accessFlags,
        nameIndex,
        descriptorIndex,
        attributes,
      });
    }

    return fields;
  }

  private parseMethods(count: number): MethodInfo[] {
    const methods: MethodInfo[] = [];

    for (let i = 0; i < count; i++) {
      const accessFlags = this.reader.readUint16();
      const nameIndex = this.reader.readUint16();
      const descriptorIndex = this.reader.readUint16();
      const attributesCount = this.reader.readUint16();
      const attributes = this.parseAttributes(attributesCount);

      // Look for Code attribute
      let code: CodeAttribute | undefined;
      for (const attr of attributes) {
        const name = this.getConstantPoolString(attr.nameIndex);
        if (name === "Code") {
          code = this.parseCodeAttribute(attr);
        }
      }

      methods.push({
        accessFlags,
        nameIndex,
        descriptorIndex,
        attributes,
        code,
      });
    }

    return methods;
  }

  private parseCodeAttribute(attr: AttributeInfo): CodeAttribute {
    // Create a new ArrayBuffer from the Uint8Array to avoid offset issues
    const buffer = attr.data.buffer.slice(attr.data.byteOffset, attr.data.byteOffset + attr.data.byteLength);
    const reader = new BinaryReader(buffer, false);
    const availableBytes = attr.data.length;
    
    // Check if we have enough bytes for header
    if (availableBytes < 8) {
      console.warn(`[JavaClassParser] Code attribute too small: ${availableBytes} bytes`);
      return {
        maxStack: 0,
        maxLocals: 0,
        code: new Uint8Array(0),
        exceptions: [],
        attributes: [],
      };
    }
    
    const maxStack = reader.readUint16();
    const maxLocals = reader.readUint16();
    let codeLength = reader.readUint32();
    
    // Validate code length - Java bytecode length is limited to 65535 bytes
    // If it's larger, it's likely a parsing error
    const MAX_VALID_CODE_LENGTH = 65535;
    const remainingBytes = availableBytes - 8; // Already read 8 bytes (2+2+4)
    
    if (codeLength > MAX_VALID_CODE_LENGTH) {
      console.warn(`[JavaClassParser] Code length ${codeLength} is invalid (max ${MAX_VALID_CODE_LENGTH})`);
      console.warn(`[JavaClassParser] Available bytes: ${availableBytes}, remaining after header: ${remainingBytes}`);
      console.warn(`[JavaClassParser] This likely indicates a corrupted class file or parsing error`);
      // Use a safe fallback - read what's available but cap at MAX_VALID_CODE_LENGTH
      codeLength = Math.min(remainingBytes, MAX_VALID_CODE_LENGTH);
    } else if (codeLength > remainingBytes) {
      console.warn(`[JavaClassParser] Code length ${codeLength} exceeds available ${remainingBytes} bytes, clamping`);
      codeLength = remainingBytes;
    }
    
    const actualCodeLength = Math.max(0, Math.min(codeLength, remainingBytes));
    
    // Additional safety check
    if (actualCodeLength !== codeLength) {
      console.warn(`[JavaClassParser] Adjusted code length from ${codeLength} to ${actualCodeLength}`);
    }
    
    const code = reader.readBytes(actualCodeLength);
    
    // Check if we have enough bytes for exception table
    const bytesAfterCode = remainingBytes - actualCodeLength;
    if (bytesAfterCode < 2) {
      return {
        maxStack,
        maxLocals,
        code,
        exceptions: [],
        attributes: [],
      };
    }
    
    const exceptionTableLength = reader.readUint16();
    const exceptions: ExceptionInfo[] = [];
    
    // Each exception entry is 8 bytes (4 * uint16)
    const exceptionEntrySize = 8;
    const maxExceptions = Math.floor((bytesAfterCode - 2) / exceptionEntrySize);
    const actualExceptionCount = Math.min(exceptionTableLength, maxExceptions);
    
    for (let i = 0; i < actualExceptionCount; i++) {
      if (reader.available() < exceptionEntrySize) {
        console.warn(`[JavaClassParser] Not enough bytes for exception entry ${i}, stopping`);
        break;
      }
      exceptions.push({
        startPc: reader.readUint16(),
        endPc: reader.readUint16(),
        handlerPc: reader.readUint16(),
        catchType: reader.readUint16(),
      });
    }

    // Check if we have enough bytes for attributes count
    if (reader.available() < 2) {
      return {
        maxStack,
        maxLocals,
        code,
        exceptions,
        attributes: [],
      };
    }
    
    const attributesCount = reader.readUint16();
    const attributes = this.parseAttributes(attributesCount, reader);

    return {
      maxStack,
      maxLocals,
      code,
      exceptions,
      attributes,
    };
  }

  private parseAttributes(count: number, reader?: BinaryReader): AttributeInfo[] {
    const r = reader || this.reader;
    const attributes: AttributeInfo[] = [];

    for (let i = 0; i < count; i++) {
      const nameIndex = r.readUint16();
      const length = r.readUint32();
      const data = r.readBytes(length);

      attributes.push({
        nameIndex,
        length,
        data,
      });
    }

    return attributes;
  }

  private getConstantPoolString(index: number): string {
    const entry = this.constantPool[index];
    if (entry && entry.tag === 1) {
      return entry.value as string;
    }
    return "";
  }
}

/**
 * Parse Java .class file from ArrayBuffer
 */
export function parseJavaClass(buffer: ArrayBuffer): JavaClass {
  const parser = new JavaClassParser(buffer);
  return parser.parse();
}

