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
      const tag = this.reader.readUint8();
      let value: any;

      switch (tag) {
        case 1: // UTF8
          {
            const length = this.reader.readUint16();
            value = this.reader.readString(length);
          }
          break;
        case 3: // Integer
          value = this.reader.readInt32();
          break;
        case 4: // Float
          value = this.reader.readFloat32();
          break;
        case 5: // Long
          {
            const high = this.reader.readUint32();
            const low = this.reader.readUint32();
            value = (BigInt(high) << 32n) | BigInt(low);
            i++; // Long takes 2 entries
          }
          break;
        case 6: // Double
          value = this.reader.readFloat64();
          i++; // Double takes 2 entries
          break;
        case 7: // Class
          value = this.reader.readUint16();
          break;
        case 8: // String
          value = this.reader.readUint16();
          break;
        case 9: // Fieldref
          value = {
            classIndex: this.reader.readUint16(),
            nameAndTypeIndex: this.reader.readUint16(),
          };
          break;
        case 10: // Methodref
          value = {
            classIndex: this.reader.readUint16(),
            nameAndTypeIndex: this.reader.readUint16(),
          };
          break;
        case 11: // InterfaceMethodref
          value = {
            classIndex: this.reader.readUint16(),
            nameAndTypeIndex: this.reader.readUint16(),
          };
          break;
        case 12: // NameAndType
          value = {
            nameIndex: this.reader.readUint16(),
            descriptorIndex: this.reader.readUint16(),
          };
          break;
        case 15: // MethodHandle
          value = {
            referenceKind: this.reader.readUint8(),
            referenceIndex: this.reader.readUint16(),
          };
          break;
        case 16: // MethodType
          value = this.reader.readUint16(); // descriptor_index
          break;
        case 18: // InvokeDynamic
          value = {
            bootstrapMethodAttrIndex: this.reader.readUint16(),
            nameAndTypeIndex: this.reader.readUint16(),
          };
          break;
        default:
          value = null;
          break;
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
    const reader = new BinaryReader(attr.data.buffer, false);
    const maxStack = reader.readUint16();
    const maxLocals = reader.readUint16();
    const codeLength = reader.readUint32();
    const code = reader.readBytes(codeLength);

    const exceptionTableLength = reader.readUint16();
    const exceptions: ExceptionInfo[] = [];
    for (let i = 0; i < exceptionTableLength; i++) {
      exceptions.push({
        startPc: reader.readUint16(),
        endPc: reader.readUint16(),
        handlerPc: reader.readUint16(),
        catchType: reader.readUint16(),
      });
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

