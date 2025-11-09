import { JavaClass, ConstantPoolEntry } from "../parsers/jar-bytecode";

/**
 * Constant Pool Resolver
 * Resolves constant pool entries to their actual values
 */
export class ConstantPoolResolver {
  private classFile: JavaClass;

  constructor(classFile: JavaClass) {
    this.classFile = classFile;
  }

  /**
   * Get UTF-8 string from constant pool
   */
  getUtf8(index: number): string {
    if (index < 0 || index >= this.classFile.constantPool.length) {
      console.error(`[ConstantPoolResolver] Index ${index} out of bounds (pool size: ${this.classFile.constantPool.length})`);
      return `<invalid-index-${index}>`;
    }
    
    const entry = this.classFile.constantPool[index];
    if (!entry) {
      console.error(`[ConstantPoolResolver] Constant pool entry ${index} is null`);
      return `<null-entry-${index}>`;
    }
    
    if (entry.tag === 1) {
      const value = entry.value;
      if (typeof value === 'string') {
        return value;
      }
      console.error(`[ConstantPoolResolver] UTF-8 entry ${index} has non-string value:`, typeof value);
      return `<invalid-utf8-${index}>`;
    }
    
    console.error(`[ConstantPoolResolver] Constant pool entry ${index} is not a UTF-8 string (tag: ${entry.tag})`);
    return `<wrong-tag-${index}>`;
  }

  /**
   * Get class name from constant pool
   */
  getClassName(index: number): string {
    const entry = this.classFile.constantPool[index];
    if (!entry) {
      throw new Error(`Constant pool index ${index} out of bounds`);
    }
    if (entry.tag === 7) {
      // Class entry contains name_index
      const nameIndex = entry.value as number;
      return this.getUtf8(nameIndex);
    }
    throw new Error(`Constant pool entry ${index} is not a Class entry (tag: ${entry.tag})`);
  }

  /**
   * Get field reference from constant pool
   */
  getFieldRef(index: number): { className: string; fieldName: string; descriptor: string } {
    const entry = this.classFile.constantPool[index];
    if (!entry) {
      throw new Error(`Constant pool index ${index} out of bounds`);
    }
    if (entry.tag === 9) {
      const { classIndex, nameAndTypeIndex } = entry.value as { classIndex: number; nameAndTypeIndex: number };
      const className = this.getClassName(classIndex);
      const { nameIndex, descriptorIndex } = this.getNameAndType(nameAndTypeIndex);
      const fieldName = this.getUtf8(nameIndex);
      const descriptor = this.getUtf8(descriptorIndex);
      return { className, fieldName, descriptor };
    }
    throw new Error(`Constant pool entry ${index} is not a Fieldref entry (tag: ${entry.tag})`);
  }

  /**
   * Get method reference from constant pool
   */
  getMethodRef(index: number): { className: string; methodName: string; descriptor: string } {
    const entry = this.classFile.constantPool[index];
    if (!entry) {
      throw new Error(`Constant pool index ${index} out of bounds`);
    }
    if (entry.tag === 10) {
      const { classIndex, nameAndTypeIndex } = entry.value as { classIndex: number; nameAndTypeIndex: number };
      const className = this.getClassName(classIndex);
      const { nameIndex, descriptorIndex } = this.getNameAndType(nameAndTypeIndex);
      const methodName = this.getUtf8(nameIndex);
      const descriptor = this.getUtf8(descriptorIndex);
      return { className, methodName, descriptor };
    }
    throw new Error(`Constant pool entry ${index} is not a Methodref entry (tag: ${entry.tag})`);
  }

  /**
   * Get interface method reference from constant pool
   */
  getInterfaceMethodRef(index: number): { className: string; methodName: string; descriptor: string } {
    const entry = this.classFile.constantPool[index];
    if (!entry) {
      throw new Error(`Constant pool index ${index} out of bounds`);
    }
    if (entry.tag === 11) {
      const { classIndex, nameAndTypeIndex } = entry.value as { classIndex: number; nameAndTypeIndex: number };
      const className = this.getClassName(classIndex);
      const { nameIndex, descriptorIndex } = this.getNameAndType(nameAndTypeIndex);
      const methodName = this.getUtf8(nameIndex);
      const descriptor = this.getUtf8(descriptorIndex);
      return { className, methodName, descriptor };
    }
    throw new Error(`Constant pool entry ${index} is not an InterfaceMethodref entry (tag: ${entry.tag})`);
  }

  /**
   * Get NameAndType from constant pool
   */
  getNameAndType(index: number): { nameIndex: number; descriptorIndex: number } {
    const entry = this.classFile.constantPool[index];
    if (!entry) {
      throw new Error(`Constant pool index ${index} out of bounds`);
    }
    if (entry.tag === 12) {
      return entry.value as { nameIndex: number; descriptorIndex: number };
    }
    throw new Error(`Constant pool entry ${index} is not a NameAndType entry (tag: ${entry.tag})`);
  }

  /**
   * Get string from constant pool
   */
  getString(index: number): string {
    const entry = this.classFile.constantPool[index];
    if (!entry) {
      throw new Error(`Constant pool index ${index} out of bounds`);
    }
    if (entry.tag === 8) {
      // String entry contains string_index
      const stringIndex = entry.value as number;
      return this.getUtf8(stringIndex);
    }
    throw new Error(`Constant pool entry ${index} is not a String entry (tag: ${entry.tag})`);
  }

  /**
   * Get integer from constant pool
   */
  getInteger(index: number): number {
    const entry = this.classFile.constantPool[index];
    if (!entry) {
      throw new Error(`Constant pool index ${index} out of bounds`);
    }
    if (entry.tag === 3) {
      return entry.value as number;
    }
    throw new Error(`Constant pool entry ${index} is not an Integer entry (tag: ${entry.tag})`);
  }

  /**
   * Get float from constant pool
   */
  getFloat(index: number): number {
    const entry = this.classFile.constantPool[index];
    if (!entry) {
      throw new Error(`Constant pool index ${index} out of bounds`);
    }
    if (entry.tag === 4) {
      return entry.value as number;
    }
    throw new Error(`Constant pool entry ${index} is not a Float entry (tag: ${entry.tag})`);
  }

  /**
   * Get long from constant pool
   */
  getLong(index: number): bigint {
    const entry = this.classFile.constantPool[index];
    if (!entry) {
      throw new Error(`Constant pool index ${index} out of bounds`);
    }
    if (entry.tag === 5) {
      return entry.value as bigint;
    }
    throw new Error(`Constant pool entry ${index} is not a Long entry (tag: ${entry.tag})`);
  }

  /**
   * Get double from constant pool
   */
  getDouble(index: number): number {
    const entry = this.classFile.constantPool[index];
    if (!entry) {
      throw new Error(`Constant pool index ${index} out of bounds`);
    }
    if (entry.tag === 6) {
      return entry.value as number;
    }
    throw new Error(`Constant pool entry ${index} is not a Double entry (tag: ${entry.tag})`);
  }

  /**
   * Get method handle from constant pool
   */
  getMethodHandle(index: number): { referenceKind: number; referenceIndex: number } {
    const entry = this.classFile.constantPool[index];
    if (!entry) {
      throw new Error(`Constant pool index ${index} out of bounds`);
    }
    if (entry.tag === 15) {
      return entry.value as { referenceKind: number; referenceIndex: number };
    }
    throw new Error(`Constant pool entry ${index} is not a MethodHandle entry (tag: ${entry.tag})`);
  }

  /**
   * Get method type from constant pool
   */
  getMethodType(index: number): string {
    const entry = this.classFile.constantPool[index];
    if (!entry) {
      throw new Error(`Constant pool index ${index} out of bounds`);
    }
    if (entry.tag === 16) {
      // MethodType entry contains descriptor_index
      const descriptorIndex = entry.value as number;
      return this.getUtf8(descriptorIndex);
    }
    throw new Error(`Constant pool entry ${index} is not a MethodType entry (tag: ${entry.tag})`);
  }

  /**
   * Get invoke dynamic from constant pool
   */
  getInvokeDynamic(index: number): { bootstrapMethodAttrIndex: number; nameAndTypeIndex: number } {
    const entry = this.classFile.constantPool[index];
    if (!entry) {
      throw new Error(`Constant pool index ${index} out of bounds`);
    }
    if (entry.tag === 18) {
      return entry.value as { bootstrapMethodAttrIndex: number; nameAndTypeIndex: number };
    }
    throw new Error(`Constant pool entry ${index} is not an InvokeDynamic entry (tag: ${entry.tag})`);
  }
}

