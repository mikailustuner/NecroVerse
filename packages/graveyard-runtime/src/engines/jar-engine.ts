import { JARFile, JARClass } from "../parsers/jar";
import { BinaryReader } from "../utils/binary-reader";
import { JavaClass as ParsedJavaClass, parseJavaClass } from "../parsers/jar-bytecode";
import { ConstantPoolResolver } from "../jvm/constant-pool-resolver";
import { parseMethodDescriptor, MethodDescriptor, getTypeSize } from "../jvm/method-descriptor";
import { getNativeMethodBridge } from "../awt/native-bridge";

/**
 * Java Bytecode Parser
 * Parses .class files and extracts method information
 */
export class JavaBytecodeParser {
  parse(classData: Uint8Array): JavaClass {
    const reader = new BinaryReader(classData.buffer);
    
    // Read class file header
    const magic = reader.readUint32();
    if (magic !== 0xcafebabe) {
      throw new Error("Invalid class file magic number");
    }
    
    const minorVersion = reader.readUint16();
    const majorVersion = reader.readUint16();
    const constantPoolCount = reader.readUint16();
    
    // Parse constant pool
    const constantPool: any[] = [];
    for (let i = 1; i < constantPoolCount; i++) {
      const tag = reader.readUint8();
      switch (tag) {
        case 7: // Class
          reader.readUint16(); // name_index
          break;
        case 9: // Fieldref
        case 10: // Methodref
        case 11: // InterfaceMethodref
          reader.readUint16(); // class_index
          reader.readUint16(); // name_and_type_index
          break;
        case 8: // String
          reader.readUint16(); // string_index
          break;
        case 3: // Integer
        case 4: // Float
          reader.readUint32();
          break;
        case 5: // Long
        case 6: // Double
          reader.readUint32();
          reader.readUint32();
          i++; // Long and Double take two entries
          break;
        case 12: // NameAndType
          reader.readUint16(); // name_index
          reader.readUint16(); // descriptor_index
          break;
        case 1: // Utf8
          const length = reader.readUint16();
          const bytes = reader.readBytes(length);
          constantPool.push(String.fromCharCode(...bytes));
          break;
        case 15: // MethodHandle
          reader.readUint8(); // reference_kind
          reader.readUint16(); // reference_index
          break;
        case 16: // MethodType
          reader.readUint16(); // descriptor_index
          break;
        case 18: // InvokeDynamic
          reader.readUint16(); // bootstrap_method_attr_index
          reader.readUint16(); // name_and_type_index
          break;
        default:
          constantPool.push(null);
          break;
      }
    }
    
    const accessFlags = reader.readUint16();
    const thisClass = reader.readUint16();
    const superClass = reader.readUint16();
    const interfacesCount = reader.readUint16();
    
    // Skip interfaces
    for (let i = 0; i < interfacesCount; i++) {
      reader.readUint16();
    }
    
    // Parse fields
    const fieldsCount = reader.readUint16();
    const fields: JavaField[] = [];
    for (let i = 0; i < fieldsCount; i++) {
      const fieldAccessFlags = reader.readUint16();
      const fieldNameIndex = reader.readUint16();
      const fieldDescriptorIndex = reader.readUint16();
      const attributesCount = reader.readUint16();
      
      // Skip attributes
      for (let j = 0; j < attributesCount; j++) {
        reader.readUint16(); // attribute_name_index
        const attributeLength = reader.readUint32();
        reader.skip(attributeLength);
      }
      
      fields.push({
        name: constantPool[fieldNameIndex - 1] || "",
        descriptor: constantPool[fieldDescriptorIndex - 1] || "",
        accessFlags: fieldAccessFlags,
      });
    }
    
    // Parse methods
    const methodsCount = reader.readUint16();
    const methods: JavaMethod[] = [];
    for (let i = 0; i < methodsCount; i++) {
      const methodAccessFlags = reader.readUint16();
      const methodNameIndex = reader.readUint16();
      const methodDescriptorIndex = reader.readUint16();
      const attributesCount = reader.readUint16();
      
      let code: Uint8Array | null = null;
      
      // Parse attributes (look for Code attribute)
      for (let j = 0; j < attributesCount; j++) {
        const attributeNameIndex = reader.readUint16();
        const attributeLength = reader.readUint32();
        const attributeName = constantPool[attributeNameIndex - 1];
        
        if (attributeName === "Code") {
          // Parse Code attribute
          reader.readUint16(); // max_stack
          reader.readUint16(); // max_locals
          const codeLength = reader.readUint32();
          code = reader.readBytes(codeLength);
          
          // Skip exception table and attributes
          const exceptionTableLength = reader.readUint16();
          for (let k = 0; k < exceptionTableLength; k++) {
            reader.skip(8); // 4 uint16s
          }
          const codeAttributesCount = reader.readUint16();
          for (let k = 0; k < codeAttributesCount; k++) {
            reader.readUint16(); // attribute_name_index
            const codeAttributeLength = reader.readUint32();
            reader.skip(codeAttributeLength);
          }
        } else {
          reader.skip(attributeLength);
        }
      }
      
      methods.push({
        name: constantPool[methodNameIndex - 1] || "",
        descriptor: constantPool[methodDescriptorIndex - 1] || "",
        accessFlags: methodAccessFlags,
        code: code || new Uint8Array(0),
      });
    }
    
    return {
      majorVersion,
      minorVersion,
      constantPool,
      accessFlags,
      thisClass,
      superClass,
      fields,
      methods,
    };
  }
}

export interface JavaClass {
  majorVersion: number;
  minorVersion: number;
  constantPool: any[];
  accessFlags: number;
  thisClass: number;
  superClass: number;
  fields: JavaField[];
  methods: JavaMethod[];
  // Enhanced fields
  parsedClass?: ParsedJavaClass;
  className?: string;
  superClassName?: string;
  constantPoolResolver?: ConstantPoolResolver;
}

export interface JavaField {
  name: string;
  descriptor: string;
  accessFlags: number;
}

export interface JavaMethod {
  name: string;
  descriptor: string;
  accessFlags: number;
  code: Uint8Array;
  // Enhanced fields
  parsedDescriptor?: MethodDescriptor;
  maxStack?: number;
  maxLocals?: number;
}

/**
 * Minimal JVM Interpreter
 * Executes Java bytecode in JavaScript
 */
export class JVMInterpreter {
  private classes: Map<string, JavaClass> = new Map();
  private stack: any[] = [];
  private locals: any[] = [];
  private heap: Map<number, any> = new Map();
  private bytecodeParser: JavaBytecodeParser;
  private currentClass: JavaClass | null = null;
  private currentMethod: JavaMethod | null = null;
  private objectHeap: Map<number, any> = new Map();
  private nextObjectId: number = 1;
  private callStack: Array<{ className: string; methodName: string }> = [];
  private maxCallStackDepth: number = 100;

  constructor() {
    this.bytecodeParser = new JavaBytecodeParser();
  }

  /**
   * Get loaded classes
   */
  getClasses(): Map<string, JavaClass> {
    return this.classes;
  }

  /**
   * Get class by name
   */
  getClass(className: string): JavaClass | undefined {
    return this.classes.get(className);
  }

  loadClass(jarClass: JARClass): void {
    try {
      // Parse using enhanced parser
      const parsedClass = parseJavaClass(jarClass.data.buffer);
      
      // Create constant pool resolver
      const resolver = new ConstantPoolResolver(parsedClass);
      
      // Resolve class name
      const className = resolver.getClassName(parsedClass.thisClass);
      const superClassName = parsedClass.superClass > 0 
        ? resolver.getClassName(parsedClass.superClass)
        : undefined;
      
      // Convert parsed class to JavaClass format
      const javaClass: JavaClass = {
        majorVersion: parsedClass.majorVersion,
        minorVersion: parsedClass.minorVersion,
        constantPool: parsedClass.constantPool.map(e => e.value),
        accessFlags: parsedClass.accessFlags,
        thisClass: parsedClass.thisClass,
        superClass: parsedClass.superClass,
        fields: parsedClass.fields.map(f => ({
          name: resolver.getUtf8(f.nameIndex),
          descriptor: resolver.getUtf8(f.descriptorIndex),
          accessFlags: f.accessFlags,
        })),
        methods: parsedClass.methods.map(m => {
          const methodName = resolver.getUtf8(m.nameIndex);
          const methodDescriptor = resolver.getUtf8(m.descriptorIndex);
          
          // Try to parse method descriptor, but handle errors gracefully
          let parsedDescriptor: MethodDescriptor | null = null;
          try {
            // Validate descriptor format first
            if (!methodDescriptor || typeof methodDescriptor !== 'string') {
              console.warn(`[JVMInterpreter] Method ${methodName} has invalid descriptor type:`, typeof methodDescriptor);
              parsedDescriptor = {
                parameters: [],
                returnType: { type: 'void' },
              };
            } else if (methodDescriptor.startsWith('(')) {
              // Valid descriptor format
              parsedDescriptor = parseMethodDescriptor(methodDescriptor);
            } else {
              // Invalid descriptor format - likely corrupted constant pool
              console.warn(`[JVMInterpreter] Method ${methodName} has invalid descriptor format: ${methodDescriptor}`);
              console.warn(`[JVMInterpreter] This may indicate a corrupted class file or constant pool parsing error`);
              // Create a fallback descriptor based on method name
              parsedDescriptor = {
                parameters: [],
                returnType: { type: 'void' },
              };
            }
          } catch (error) {
            console.warn(`[JVMInterpreter] Failed to parse method descriptor for ${methodName}: ${methodDescriptor}`, error);
            // Create a more intelligent fallback descriptor
            // Try to infer from descriptor string if possible
            if (typeof methodDescriptor === 'string') {
              const paramCount = (methodDescriptor.match(/[ZBCSIJFD]|\[+[ZBCSIJFD]|L[^;]+;/g) || []).length;
              parsedDescriptor = {
                parameters: Array(paramCount).fill({ type: 'object' }),
                returnType: { type: 'void' },
              };
            } else {
              parsedDescriptor = {
                parameters: [],
                returnType: { type: 'void' },
              };
            }
          }
          
          return {
            name: methodName,
            descriptor: methodDescriptor,
            accessFlags: m.accessFlags,
            code: m.code?.code || new Uint8Array(0),
            parsedDescriptor: parsedDescriptor || {
              parameters: [],
              returnType: { type: 'void' },
            },
            maxStack: m.code?.maxStack,
            maxLocals: m.code?.maxLocals,
          };
        }),
        parsedClass,
        className,
        superClassName,
        constantPoolResolver: resolver,
      };
      
      this.classes.set(jarClass.name, javaClass);
      console.log(`[JVMInterpreter] Loaded class: ${className}, methods: ${javaClass.methods.length}, fields: ${javaClass.fields.length}`);
    } catch (error) {
      console.error(`Failed to parse class ${jarClass.name}:`, error);
    }
  }

  executeMethod(className: string, methodName: string, args: any[]): any {
    const javaClass = this.classes.get(className);
    if (!javaClass) {
      throw new Error(`Class ${className} not found`);
    }

    // Find method in class hierarchy (support method overloading by descriptor)
    let method: JavaMethod | undefined;
    let targetClass: JavaClass | undefined;
    
    // Traverse class hierarchy to find method
    let currentClassName: string | undefined = className;
    while (currentClassName) {
      const currentClass = this.classes.get(currentClassName);
      if (!currentClass) {
        break;
      }
      
      // Try to find method in current class
      if (args.length === 0 && methodName === 'main') {
        // Try to find main method with String[] parameter
        method = currentClass.methods.find((m) => 
          m.name === methodName && 
          (m.parsedDescriptor?.parameters.length === 1 || m.descriptor.includes('[Ljava/lang/String'))
        );
      } else {
        // Find method by name (first match wins, Java uses first match in hierarchy)
        method = currentClass.methods.find((m) => m.name === methodName);
      }
      
      if (method) {
        targetClass = currentClass;
        break;
      }
      
      // Try superclass
      currentClassName = currentClass.superClassName;
    }
    
    if (!method || !targetClass) {
      // Log available methods for debugging
      const availableMethods = javaClass.methods.map(m => `${m.name}${m.descriptor || ''}`).join(', ');
      const errorMsg = `Method ${methodName} not found in ${className} (available: ${availableMethods || 'none'})`;
      console.error(`[JVMInterpreter] ${errorMsg}`);
      
      // Also check if method exists in superclass
      if (javaClass.superClassName) {
        console.log(`[JVMInterpreter] Superclass: ${javaClass.superClassName}`);
      }
      
      throw new Error(errorMsg);
    }

    // Set up execution context
    this.currentClass = targetClass;
    this.currentMethod = method;
    
    // Set up locals with arguments
    const maxLocals = method.maxLocals || method.parsedDescriptor?.parameters.length || args.length;
    this.locals = new Array(maxLocals);
    
    // Set arguments (skip 'this' for instance methods)
    let localIndex = 0;
    for (let i = 0; i < args.length && localIndex < maxLocals; i++) {
      this.locals[localIndex++] = args[i];
    }
    
    this.stack = [];

    // Execute bytecode
    try {
      return this.executeBytecode(method.code, targetClass);
    } finally {
      this.currentClass = null;
      this.currentMethod = null;
    }
  }

  /**
   * Resolve method from class hierarchy
   */
  private resolveMethod(className: string, methodName: string, descriptor: string): { class: JavaClass; method: JavaMethod } | null {
    let currentClassName: string | undefined = className;
    
    // Traverse class hierarchy
    while (currentClassName) {
      const javaClass = this.classes.get(currentClassName);
      if (!javaClass) {
        break;
      }
      
      // Look for method in current class
      const method = javaClass.methods.find(m => m.name === methodName && m.descriptor === descriptor);
      if (method) {
        return { class: javaClass, method };
      }
      
      // Try superclass
      currentClassName = javaClass.superClassName;
    }
    
    return null;
  }

  /**
   * Resolve field from class hierarchy
   */
  private resolveField(className: string, fieldName: string): { class: JavaClass; field: JavaField } | null {
    let currentClassName: string | undefined = className;
    
    // Traverse class hierarchy
    while (currentClassName) {
      const javaClass = this.classes.get(currentClassName);
      if (!javaClass) {
        break;
      }
      
      // Look for field in current class
      const field = javaClass.fields.find(f => f.name === fieldName);
      if (field) {
        return { class: javaClass, field };
      }
      
      // Try superclass
      currentClassName = javaClass.superClassName;
    }
    
    return null;
  }

  /**
   * Invoke a method
   */
  private invokeMethod(className: string, methodName: string, descriptor: string, objectRef: any, args: any[]): any {
    // Check call stack depth to prevent infinite recursion
    if (this.callStack.length >= this.maxCallStackDepth) {
      console.error(`[JVMInterpreter] Maximum call stack depth exceeded: ${this.maxCallStackDepth}`);
      console.error(`[JVMInterpreter] Call stack:`, this.callStack.map(c => `${c.className}.${c.methodName}`).join(' -> '));
      // Return undefined instead of throwing to prevent complete failure
      return undefined;
    }
    
    // Check for recursive calls - be more aggressive
    const recursionCount = this.callStack.filter(c => c.className === className && c.methodName === methodName).length;
    if (recursionCount > 5) {
      console.warn(`[JVMInterpreter] Excessive recursion detected (${recursionCount} times): ${className}.${methodName}`);
      console.warn(`[JVMInterpreter] Call stack:`, this.callStack.map(c => `${c.className}.${c.methodName}`).join(' -> '));
      // Return undefined to break recursion
      return undefined;
    }
    
    // Push to call stack
    this.callStack.push({ className, methodName });
    
    try {
      // Check if method is native
      const nativeBridge = getNativeMethodBridge();
      if (nativeBridge.hasMethod(className, methodName)) {
        return nativeBridge.invoke(className, methodName, descriptor, objectRef, ...args);
      }
      
      const resolved = this.resolveMethod(className, methodName, descriptor);
      if (!resolved) {
        // Try native method as fallback
        const nativeResult = nativeBridge.invoke(className, methodName, descriptor, objectRef, ...args);
        if (nativeResult !== undefined) {
          return nativeResult;
        }
        console.warn(`[JVMInterpreter] Method not found: ${className}.${methodName}${descriptor}`);
        return undefined;
      }
      
      const { class: javaClass, method } = resolved;
      
      // Check if method has no code (native or abstract)
      if (!method.code || method.code.length === 0) {
        // Try native method
        const nativeResult = nativeBridge.invoke(className, methodName, descriptor, objectRef, ...args);
        if (nativeResult !== undefined) {
          return nativeResult;
        }
        console.warn(`[JVMInterpreter] Method has no code: ${className}.${methodName}${descriptor}`);
        return undefined;
      }
      
      // Save current context
      const savedClass = this.currentClass;
      const savedMethod = this.currentMethod;
      const savedLocals = this.locals;
      const savedStack = this.stack;
      
      try {
        // Set up new context
        this.currentClass = javaClass;
        this.currentMethod = method;
        
        // Set up locals
        const maxLocals = method.maxLocals || method.parsedDescriptor?.parameters.length || args.length;
        this.locals = new Array(maxLocals);
        
        // Set 'this' for instance methods
        let localIndex = 0;
        if (objectRef !== undefined && objectRef !== null) {
          this.locals[localIndex++] = objectRef;
        }
        
        // Set arguments
        for (let i = 0; i < args.length && localIndex < maxLocals; i++) {
          this.locals[localIndex++] = args[i];
        }
        
        this.stack = [];
        
        // Execute method
        return this.executeBytecode(method.code, javaClass);
      } finally {
        // Restore context
        this.currentClass = savedClass;
        this.currentMethod = savedMethod;
        this.locals = savedLocals;
        this.stack = savedStack;
      }
    } finally {
      // Pop from call stack
      this.callStack.pop();
    }
  }

  private executeBytecode(code: Uint8Array, javaClass: JavaClass): any {
    let pc = 0; // Program counter

    while (pc < code.length) {
      const opcode = code[pc];
      pc++;

      switch (opcode) {
        case 0x00: // nop
          break;
        case 0x01: // aconst_null
          this.stack.push(null);
          break;
        case 0x02: // iconst_m1
        case 0x03: // iconst_0
        case 0x04: // iconst_1
        case 0x05: // iconst_2
        case 0x06: // iconst_3
        case 0x07: // iconst_4
        case 0x08: // iconst_5
          this.stack.push(opcode - 3);
          break;
        case 0x09: // lconst_0
        case 0x0a: // lconst_1
          this.stack.push(BigInt(opcode - 0x09));
          break;
        case 0x0b: // fconst_0
        case 0x0c: // fconst_1
        case 0x0d: // fconst_2
          this.stack.push(opcode - 0x0b);
          break;
        case 0x0e: // dconst_0
        case 0x0f: // dconst_1
          this.stack.push(opcode - 0x0e);
          break;
        case 0x10: // bipush
          this.stack.push(code[pc++]);
          break;
        case 0x11: // sipush
          {
            const value = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            this.stack.push(value);
          }
          break;
        case 0x12: // ldc
          {
            const index = code[pc++];
            const resolver = javaClass.constantPoolResolver;
            if (resolver) {
              try {
                const entry = javaClass.parsedClass?.constantPool[index];
                if (entry) {
                  if (entry.tag === 3) { // Integer
                    this.stack.push(resolver.getInteger(index));
                  } else if (entry.tag === 4) { // Float
                    this.stack.push(resolver.getFloat(index));
                  } else if (entry.tag === 8) { // String
                    this.stack.push(resolver.getString(index));
                  } else {
                    this.stack.push(resolver.getUtf8(index));
                  }
                } else {
                  this.stack.push(index);
                }
              } catch (e) {
                this.stack.push(index);
              }
            } else {
              this.stack.push(index);
            }
          }
          break;
        case 0x13: // ldc_w
          {
            const index = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            const resolver = javaClass.constantPoolResolver;
            if (resolver) {
              try {
                const entry = javaClass.parsedClass?.constantPool[index];
                if (entry) {
                  if (entry.tag === 3) { // Integer
                    this.stack.push(resolver.getInteger(index));
                  } else if (entry.tag === 4) { // Float
                    this.stack.push(resolver.getFloat(index));
                  } else if (entry.tag === 8) { // String
                    this.stack.push(resolver.getString(index));
                  } else {
                    this.stack.push(resolver.getUtf8(index));
                  }
                } else {
                  this.stack.push(index);
                }
              } catch (e) {
                this.stack.push(index);
              }
            } else {
              this.stack.push(index);
            }
          }
          break;
        case 0x14: // ldc2_w
          {
            const index = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            const resolver = javaClass.constantPoolResolver;
            if (resolver) {
              try {
                const entry = javaClass.parsedClass?.constantPool[index];
                if (entry) {
                  if (entry.tag === 5) { // Long
                    this.stack.push(resolver.getLong(index));
                  } else if (entry.tag === 6) { // Double
                    this.stack.push(resolver.getDouble(index));
                  } else {
                    this.stack.push(index);
                  }
                } else {
                  this.stack.push(index);
                }
              } catch (e) {
                this.stack.push(index);
              }
            } else {
              this.stack.push(index);
            }
          }
          break;
        case 0x15: // iload
          {
            const index = code[pc++];
            this.stack.push(this.locals[index] || 0);
          }
          break;
        case 0x16: // lload
          {
            const index = code[pc++];
            this.stack.push(this.locals[index] || BigInt(0));
          }
          break;
        case 0x17: // fload
          {
            const index = code[pc++];
            this.stack.push(this.locals[index] || 0);
          }
          break;
        case 0x18: // dload
          {
            const index = code[pc++];
            this.stack.push(this.locals[index] || 0);
          }
          break;
        case 0x19: // aload
          {
            const index = code[pc++];
            this.stack.push(this.locals[index] || null);
          }
          break;
        case 0x1a: // iload_0
        case 0x1b: // iload_1
        case 0x1c: // iload_2
        case 0x1d: // iload_3
          this.stack.push(this.locals[opcode - 0x1a] || 0);
          break;
        case 0x1e: // lload_0
        case 0x1f: // lload_1
        case 0x20: // lload_2
        case 0x21: // lload_3
          this.stack.push(this.locals[opcode - 0x1e] || BigInt(0));
          break;
        case 0x22: // fload_0
        case 0x23: // fload_1
        case 0x24: // fload_2
        case 0x25: // fload_3
          this.stack.push(this.locals[opcode - 0x22] || 0);
          break;
        case 0x26: // dload_0
        case 0x27: // dload_1
        case 0x28: // dload_2
        case 0x29: // dload_3
          this.stack.push(this.locals[opcode - 0x26] || 0);
          break;
        case 0x2a: // aload_0
        case 0x2b: // aload_1
        case 0x2c: // aload_2
        case 0x2d: // aload_3
          this.stack.push(this.locals[opcode - 0x2a] || null);
          break;
        case 0x36: // istore
          {
            const index = code[pc++];
            this.locals[index] = this.stack.pop();
          }
          break;
        case 0x37: // lstore
          {
            const index = code[pc++];
            this.locals[index] = this.stack.pop();
          }
          break;
        case 0x38: // fstore
          {
            const index = code[pc++];
            this.locals[index] = this.stack.pop();
          }
          break;
        case 0x39: // dstore
          {
            const index = code[pc++];
            this.locals[index] = this.stack.pop();
          }
          break;
        case 0x3a: // astore
          {
            const index = code[pc++];
            this.locals[index] = this.stack.pop();
          }
          break;
        case 0x3b: // istore_0
        case 0x3c: // istore_1
        case 0x3d: // istore_2
        case 0x3e: // istore_3
          this.locals[opcode - 0x3b] = this.stack.pop();
          break;
        case 0x3f: // lstore_0
        case 0x40: // lstore_1
        case 0x41: // lstore_2
        case 0x42: // lstore_3
          this.locals[opcode - 0x3f] = this.stack.pop();
          break;
        case 0x43: // fstore_0
        case 0x44: // fstore_1
        case 0x45: // fstore_2
        case 0x46: // fstore_3
          this.locals[opcode - 0x43] = this.stack.pop();
          break;
        case 0x47: // dstore_0
        case 0x48: // dstore_1
        case 0x49: // dstore_2
        case 0x4a: // dstore_3
          this.locals[opcode - 0x47] = this.stack.pop();
          break;
        case 0x4b: // astore_0
        case 0x4c: // astore_1
        case 0x4d: // astore_2
        case 0x4e: // astore_3
          this.locals[opcode - 0x4b] = this.stack.pop();
          break;
        case 0x57: // pop
          this.stack.pop();
          break;
        case 0x58: // pop2
          this.stack.pop();
          this.stack.pop();
          break;
        case 0x59: // dup
          {
            const value = this.stack[this.stack.length - 1];
            this.stack.push(value);
          }
          break;
        case 0x5a: // dup_x1
          {
            const value1 = this.stack.pop();
            const value2 = this.stack.pop();
            this.stack.push(value1);
            this.stack.push(value2);
            this.stack.push(value1);
          }
          break;
        case 0x5b: // dup_x2
          {
            const value1 = this.stack.pop();
            const value2 = this.stack.pop();
            const value3 = this.stack.pop();
            this.stack.push(value1);
            this.stack.push(value3);
            this.stack.push(value2);
            this.stack.push(value1);
          }
          break;
        case 0x5c: // dup2
          {
            const value1 = this.stack.pop();
            const value2 = this.stack.pop();
            this.stack.push(value2);
            this.stack.push(value1);
            this.stack.push(value2);
            this.stack.push(value1);
          }
          break;
        case 0x60: // iadd
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a + b);
          }
          break;
        case 0x61: // ladd
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(Number(a) + Number(b));
          }
          break;
        case 0x62: // fadd
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a + b);
          }
          break;
        case 0x63: // dadd
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a + b);
          }
          break;
        case 0x64: // isub
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a - b);
          }
          break;
        case 0x65: // lsub
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(Number(a) - Number(b));
          }
          break;
        case 0x66: // fsub
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a - b);
          }
          break;
        case 0x67: // dsub
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a - b);
          }
          break;
        case 0x68: // imul
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a * b);
          }
          break;
        case 0x69: // lmul
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(Number(a) * Number(b));
          }
          break;
        case 0x6a: // fmul
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a * b);
          }
          break;
        case 0x6b: // dmul
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a * b);
          }
          break;
        case 0x6c: // idiv
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(Math.floor(a / b));
          }
          break;
        case 0x6d: // ldiv
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(Math.floor(Number(a) / Number(b)));
          }
          break;
        case 0x6e: // fdiv
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a / b);
          }
          break;
        case 0x6f: // ddiv
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a / b);
          }
          break;
        case 0x70: // irem
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a % b);
          }
          break;
        case 0x71: // lrem
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(Number(a) % Number(b));
          }
          break;
        case 0x72: // frem
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a % b);
          }
          break;
        case 0x73: // drem
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a % b);
          }
          break;
        case 0x74: // ineg
          this.stack.push(-this.stack.pop());
          break;
        case 0x75: // lneg
          this.stack.push(-Number(this.stack.pop()));
          break;
        case 0x76: // fneg
          this.stack.push(-this.stack.pop());
          break;
        case 0x77: // dneg
          this.stack.push(-this.stack.pop());
          break;
        case 0x78: // ishl
          {
            const shift = this.stack.pop();
            const value = this.stack.pop();
            this.stack.push(value << shift);
          }
          break;
        case 0x79: // lshl
          {
            const shift = this.stack.pop();
            const value = this.stack.pop();
            this.stack.push(Number(value) << shift);
          }
          break;
        case 0x7a: // ishr
          {
            const shift = this.stack.pop();
            const value = this.stack.pop();
            this.stack.push(value >> shift);
          }
          break;
        case 0x7b: // lshr
          {
            const shift = this.stack.pop();
            const value = this.stack.pop();
            this.stack.push(Number(value) >> shift);
          }
          break;
        case 0x7c: // iushr
          {
            const shift = this.stack.pop();
            const value = this.stack.pop();
            this.stack.push(value >>> shift);
          }
          break;
        case 0x7d: // lushr
          {
            const shift = this.stack.pop();
            const value = this.stack.pop();
            this.stack.push(Number(value) >>> shift);
          }
          break;
        case 0x7e: // iand
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a & b);
          }
          break;
        case 0x7f: // land
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(Number(a) & Number(b));
          }
          break;
        case 0x80: // ior
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a | b);
          }
          break;
        case 0x81: // lor
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(Number(a) | Number(b));
          }
          break;
        case 0x82: // ixor
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a ^ b);
          }
          break;
        case 0x83: // lxor
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(Number(a) ^ Number(b));
          }
          break;
        case 0x84: // iinc
          {
            const index = code[pc++];
            const constValue = code[pc++];
            this.locals[index] = (this.locals[index] || 0) + constValue;
          }
          break;
        case 0x85: // i2l
          this.stack.push(BigInt(this.stack.pop()));
          break;
        case 0x86: // i2f
          this.stack.push(Number(this.stack.pop()));
          break;
        case 0x87: // i2d
          this.stack.push(Number(this.stack.pop()));
          break;
        case 0x88: // l2i
          this.stack.push(Number(this.stack.pop()));
          break;
        case 0x89: // l2f
          this.stack.push(Number(this.stack.pop()));
          break;
        case 0x8a: // l2d
          this.stack.push(Number(this.stack.pop()));
          break;
        case 0x8b: // f2i
          this.stack.push(Math.floor(this.stack.pop()));
          break;
        case 0x8c: // f2l
          this.stack.push(BigInt(Math.floor(this.stack.pop())));
          break;
        case 0x8d: // f2d
          this.stack.push(Number(this.stack.pop()));
          break;
        case 0x8e: // d2i
          this.stack.push(Math.floor(this.stack.pop()));
          break;
        case 0x8f: // d2l
          this.stack.push(BigInt(Math.floor(this.stack.pop())));
          break;
        case 0x90: // d2f
          this.stack.push(Number(this.stack.pop()));
          break;
        case 0x91: // i2b
          {
            const value = this.stack.pop();
            this.stack.push((value << 24) >> 24);
          }
          break;
        case 0x92: // i2c
          this.stack.push(this.stack.pop() & 0xffff);
          break;
        case 0x93: // i2s
          {
            const value = this.stack.pop();
            this.stack.push((value << 16) >> 16);
          }
          break;
        case 0x94: // lcmp
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            const result = Number(a) > Number(b) ? 1 : Number(a) < Number(b) ? -1 : 0;
            this.stack.push(result);
          }
          break;
        case 0x95: // fcmpl
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            if (isNaN(a) || isNaN(b)) {
              this.stack.push(-1);
            } else {
              this.stack.push(a > b ? 1 : a < b ? -1 : 0);
            }
          }
          break;
        case 0x96: // fcmpg
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            if (isNaN(a) || isNaN(b)) {
              this.stack.push(1);
            } else {
              this.stack.push(a > b ? 1 : a < b ? -1 : 0);
            }
          }
          break;
        case 0x97: // dcmpl
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            if (isNaN(a) || isNaN(b)) {
              this.stack.push(-1);
            } else {
              this.stack.push(a > b ? 1 : a < b ? -1 : 0);
            }
          }
          break;
        case 0x98: // dcmpg
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            if (isNaN(a) || isNaN(b)) {
              this.stack.push(1);
            } else {
              this.stack.push(a > b ? 1 : a < b ? -1 : 0);
            }
          }
          break;
        case 0x99: // ifeq
          {
            const value = this.stack.pop();
            const offset = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            if (value === 0) {
              pc += offset - 3;
            }
          }
          break;
        case 0x9a: // ifne
          {
            const value = this.stack.pop();
            const offset = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            if (value !== 0) {
              pc += offset - 3;
            }
          }
          break;
        case 0x9b: // iflt
          {
            const value = this.stack.pop();
            const offset = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            if (value < 0) {
              pc += offset - 3;
            }
          }
          break;
        case 0x9c: // ifge
          {
            const value = this.stack.pop();
            const offset = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            if (value >= 0) {
              pc += offset - 3;
            }
          }
          break;
        case 0x9d: // ifgt
          {
            const value = this.stack.pop();
            const offset = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            if (value > 0) {
              pc += offset - 3;
            }
          }
          break;
        case 0x9e: // ifle
          {
            const value = this.stack.pop();
            const offset = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            if (value <= 0) {
              pc += offset - 3;
            }
          }
          break;
        case 0x9f: // if_icmpeq
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            const offset = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            if (a === b) {
              pc += offset - 3;
            }
          }
          break;
        case 0xa0: // if_icmpne
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            const offset = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            if (a !== b) {
              pc += offset - 3;
            }
          }
          break;
        case 0xa1: // if_icmplt
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            const offset = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            if (a < b) {
              pc += offset - 3;
            }
          }
          break;
        case 0xa2: // if_icmpge
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            const offset = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            if (a >= b) {
              pc += offset - 3;
            }
          }
          break;
        case 0xa3: // if_icmpgt
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            const offset = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            if (a > b) {
              pc += offset - 3;
            }
          }
          break;
        case 0xa4: // if_icmple
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            const offset = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            if (a <= b) {
              pc += offset - 3;
            }
          }
          break;
        case 0xa5: // if_acmpeq
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            const offset = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            if (a === b) {
              pc += offset - 3;
            }
          }
          break;
        case 0xa6: // if_acmpne
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            const offset = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            if (a !== b) {
              pc += offset - 3;
            }
          }
          break;
        case 0xa7: // goto
          {
            const offset = (code[pc] << 8) | code[pc + 1];
            pc += offset - 1;
          }
          break;
        case 0xa8: // jsr
          {
            const offset = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            this.stack.push(pc);
            pc += offset - 3;
          }
          break;
        case 0xa9: // ret
          {
            const index = code[pc++];
            pc = this.locals[index] || 0;
          }
          break;
        case 0xaa: // tableswitch
          {
            // Align to 4-byte boundary
            while (pc % 4 !== 0) pc++;
            
            const defaultOffset = (code[pc] << 24) | (code[pc + 1] << 16) | (code[pc + 2] << 8) | code[pc + 3];
            pc += 4;
            const low = (code[pc] << 24) | (code[pc + 1] << 16) | (code[pc + 2] << 8) | code[pc + 3];
            pc += 4;
            const high = (code[pc] << 24) | (code[pc + 1] << 16) | (code[pc + 2] << 8) | code[pc + 3];
            pc += 4;
            
            const key = this.stack.pop();
            if (key >= low && key <= high) {
              const offset = (code[pc + (key - low) * 4] << 24) |
                            (code[pc + (key - low) * 4 + 1] << 16) |
                            (code[pc + (key - low) * 4 + 2] << 8) |
                            code[pc + (key - low) * 4 + 3];
              pc += offset - 1;
            } else {
              pc += defaultOffset - 1;
            }
          }
          break;
        case 0xab: // lookupswitch
          {
            // Align to 4-byte boundary
            while (pc % 4 !== 0) pc++;
            
            const defaultOffset = (code[pc] << 24) | (code[pc + 1] << 16) | (code[pc + 2] << 8) | code[pc + 3];
            pc += 4;
            const npairs = (code[pc] << 24) | (code[pc + 1] << 16) | (code[pc + 2] << 8) | code[pc + 3];
            pc += 4;
            
            const key = this.stack.pop();
            let found = false;
            
            for (let i = 0; i < npairs; i++) {
              const match = (code[pc] << 24) | (code[pc + 1] << 16) | (code[pc + 2] << 8) | code[pc + 3];
              pc += 4;
              const offset = (code[pc] << 24) | (code[pc + 1] << 16) | (code[pc + 2] << 8) | code[pc + 3];
              pc += 4;
              
              if (match === key) {
                pc += offset - 1;
                found = true;
                break;
              }
            }
            
            if (!found) {
              pc += defaultOffset - 1;
            }
          }
          break;
        case 0xac: // ireturn
          return this.stack.pop();
        case 0xad: // lreturn
          return this.stack.pop();
        case 0xae: // freturn
          return this.stack.pop();
        case 0xaf: // dreturn
          return this.stack.pop();
        case 0xb0: // areturn
          return this.stack.pop();
        case 0xb1: // return
          return;
        case 0xb2: // getstatic
          {
            const index = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            const resolver = javaClass.constantPoolResolver;
            if (resolver) {
              try {
                const fieldRef = resolver.getFieldRef(index);
                // For now, return default value based on field type
                // In full implementation, would access static field storage
                this.stack.push(0);
              } catch (e) {
                this.stack.push(0);
              }
            } else {
              this.stack.push(0);
            }
          }
          break;
        case 0xb3: // putstatic
          {
            const index = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            const value = this.stack.pop();
            const resolver = javaClass.constantPoolResolver;
            if (resolver) {
              try {
                const fieldRef = resolver.getFieldRef(index);
                // In full implementation, would store in static field storage
              } catch (e) {
                // Ignore
              }
            }
          }
          break;
        case 0xb4: // getfield
          {
            const index = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            const objectref = this.stack.pop();
            const resolver = javaClass.constantPoolResolver;
            if (resolver && objectref) {
              try {
                const fieldRef = resolver.getFieldRef(index);
                // Get object's class name
                let targetClassName = fieldRef.className;
                if (objectref && typeof objectref === 'object' && objectref.__class) {
                  targetClassName = objectref.__class;
                }
                
                // Resolve field from class hierarchy
                const fieldResolved = this.resolveField(targetClassName, fieldRef.fieldName);
                if (fieldResolved && objectref && typeof objectref === 'object') {
                  // Access field from object
                  const fieldName = fieldRef.fieldName;
                  if (fieldName in objectref) {
                    this.stack.push(objectref[fieldName]);
                  } else {
                    // Return default value based on field type
                    this.stack.push(0);
                  }
                } else {
                  // Return default value
                  this.stack.push(0);
                }
              } catch (e) {
                console.warn(`[JVMInterpreter] getfield failed:`, e);
                this.stack.push(0);
              }
            } else {
              this.stack.push(0);
            }
          }
          break;
        case 0xb5: // putfield
          {
            const index = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            const value = this.stack.pop();
            const objectref = this.stack.pop();
            const resolver = javaClass.constantPoolResolver;
            if (resolver && objectref) {
              try {
                const fieldRef = resolver.getFieldRef(index);
                // Get object's class name
                let targetClassName = fieldRef.className;
                if (objectref && typeof objectref === 'object' && objectref.__class) {
                  targetClassName = objectref.__class;
                }
                
                // Resolve field from class hierarchy
                const fieldResolved = this.resolveField(targetClassName, fieldRef.fieldName);
                if (fieldResolved && objectref && typeof objectref === 'object') {
                  // Store field in object
                  const fieldName = fieldRef.fieldName;
                  objectref[fieldName] = value;
                }
              } catch (e) {
                console.warn(`[JVMInterpreter] putfield failed:`, e);
              }
            }
          }
          break;
        case 0xb6: // invokevirtual
          {
            const index = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            const resolver = javaClass.constantPoolResolver;
            if (resolver) {
              try {
                const methodRef = resolver.getMethodRef(index);
                
                // Parse method descriptor to get argument count BEFORE popping objectref
                let methodDesc: MethodDescriptor;
                try {
                  methodDesc = parseMethodDescriptor(methodRef.descriptor);
                } catch (e) {
                  console.warn(`[JVMInterpreter] Failed to parse descriptor for invokevirtual: ${methodRef.descriptor}`, e);
                  // Fallback: assume no parameters
                  methodDesc = {
                    parameters: [],
                    returnType: { type: 'void' },
                  };
                }
                
                // Pop arguments first (in reverse order)
                const args: any[] = [];
                for (let i = methodDesc.parameters.length - 1; i >= 0; i--) {
                  if (this.stack.length > 0) {
                    args.unshift(this.stack.pop());
                  }
                }
                
                // Then pop objectref
                const objectref = this.stack.length > 0 ? this.stack.pop() : null;
                
                // Get object's class name
                let targetClassName = methodRef.className;
                if (objectref && typeof objectref === 'object' && objectref.__class) {
                  targetClassName = objectref.__class;
                }
                
                // Invoke method
                const result = this.invokeMethod(targetClassName, methodRef.methodName, methodRef.descriptor, objectref, args);
                if (result !== undefined && methodDesc.returnType && methodDesc.returnType.type !== 'void') {
                  this.stack.push(result);
                }
              } catch (e) {
                console.warn(`[JVMInterpreter] invokevirtual failed:`, e);
                // Stack cleanup is already handled above
              }
            } else {
              // Fallback: pop objectref
              if (this.stack.length > 0) {
                this.stack.pop();
              }
            }
          }
          break;
        case 0xb7: // invokespecial
          {
            const index = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            const resolver = javaClass.constantPoolResolver;
            if (resolver) {
              try {
                const methodRef = resolver.getMethodRef(index);
                
                // Parse method descriptor to get argument count BEFORE popping objectref
                let methodDesc: MethodDescriptor;
                try {
                  methodDesc = parseMethodDescriptor(methodRef.descriptor);
                } catch (e) {
                  console.warn(`[JVMInterpreter] Failed to parse descriptor for invokespecial: ${methodRef.descriptor}`, e);
                  methodDesc = {
                    parameters: [],
                    returnType: { type: 'void' },
                  };
                }
                
                // Pop arguments first (in reverse order)
                const args: any[] = [];
                for (let i = methodDesc.parameters.length - 1; i >= 0; i--) {
                  if (this.stack.length > 0) {
                    args.unshift(this.stack.pop());
                  }
                }
                
                // Then pop objectref
                const objectref = this.stack.length > 0 ? this.stack.pop() : null;
                
                // For invokespecial, use the class from the constant pool (not object's class)
                const result = this.invokeMethod(methodRef.className, methodRef.methodName, methodRef.descriptor, objectref, args);
                if (result !== undefined && methodDesc.returnType && methodDesc.returnType.type !== 'void') {
                  this.stack.push(result);
                }
              } catch (e) {
                console.warn(`[JVMInterpreter] invokespecial failed:`, e);
                // Stack cleanup is already handled above
              }
            } else {
              // Fallback: pop objectref
              if (this.stack.length > 0) {
                this.stack.pop();
              }
            }
          }
          break;
        case 0xb8: // invokestatic
          {
            const index = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            const resolver = javaClass.constantPoolResolver;
            if (resolver) {
              try {
                const methodRef = resolver.getMethodRef(index);
                
                // Parse method descriptor to get argument count
                const methodDesc = parseMethodDescriptor(methodRef.descriptor);
                const args: any[] = [];
                
                // Pop arguments (in reverse order)
                for (let i = methodDesc.parameters.length - 1; i >= 0; i--) {
                  args.unshift(this.stack.pop());
                }
                
                // Invoke static method
                const result = this.invokeMethod(methodRef.className, methodRef.methodName, methodRef.descriptor, undefined, args);
                if (result !== undefined && methodDesc.returnType && methodDesc.returnType.type !== 'void') {
                  this.stack.push(result);
                }
              } catch (e) {
                console.warn(`[JVMInterpreter] invokestatic failed:`, e);
              }
            }
          }
          break;
        case 0xb9: // invokeinterface
          {
            const index = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            const count = code[pc++];
            code[pc++]; // Reserved byte
            const resolver = javaClass.constantPoolResolver;
            if (resolver) {
              try {
                const methodRef = resolver.getInterfaceMethodRef(index);
                
                // Parse method descriptor to get argument count BEFORE popping objectref
                let methodDesc: MethodDescriptor;
                try {
                  methodDesc = parseMethodDescriptor(methodRef.descriptor);
                } catch (e) {
                  console.warn(`[JVMInterpreter] Failed to parse descriptor for invokeinterface: ${methodRef.descriptor}`, e);
                  methodDesc = {
                    parameters: [],
                    returnType: { type: 'void' },
                  };
                }
                
                // Pop arguments first (in reverse order)
                const args: any[] = [];
                for (let i = methodDesc.parameters.length - 1; i >= 0; i--) {
                  if (this.stack.length > 0) {
                    args.unshift(this.stack.pop());
                  }
                }
                
                // Then pop objectref
                const objectref = this.stack.length > 0 ? this.stack.pop() : null;
                
                // Get object's class name
                let targetClassName = methodRef.className;
                if (objectref && typeof objectref === 'object' && objectref.__class) {
                  targetClassName = objectref.__class;
                }
                
                // Invoke method
                const result = this.invokeMethod(targetClassName, methodRef.methodName, methodRef.descriptor, objectref, args);
                if (result !== undefined && methodDesc.returnType && methodDesc.returnType.type !== 'void') {
                  this.stack.push(result);
                }
              } catch (e) {
                console.warn(`[JVMInterpreter] invokeinterface failed:`, e);
                // Stack cleanup is already handled above
              }
            } else {
              // Fallback: pop objectref
              if (this.stack.length > 0) {
                this.stack.pop();
              }
            }
          }
          break;
        case 0xba: // invokedynamic
          {
            const index = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            code[pc++]; // Reserved byte
            code[pc++]; // Reserved byte
            // Simplified - would need bootstrap method resolution
          }
          break;
        case 0xbb: // new
          {
            const index = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            const resolver = javaClass.constantPoolResolver;
            if (resolver) {
              try {
                const className = resolver.getClassName(index);
                // Create new object with class reference
                const objectId = this.nextObjectId++;
                const newObject: any = {
                  __id: objectId,
                  __class: className,
                };
                this.objectHeap.set(objectId, newObject);
                this.stack.push(newObject);
                
                // Note: Constructor will be called with invokespecial after this
                // The object is pushed on stack first, then constructor is called
              } catch (e) {
                console.warn(`[JVMInterpreter] Failed to create object for class index ${index}:`, e);
                // Fallback: create empty object
                const objectId = this.nextObjectId++;
                const newObject: any = {
                  __id: objectId,
                  __class: 'java.lang.Object',
                };
                this.objectHeap.set(objectId, newObject);
                this.stack.push(newObject);
              }
            } else {
              // Fallback: create empty object
              const objectId = this.nextObjectId++;
              const newObject: any = {
                __id: objectId,
                __class: 'java.lang.Object',
              };
              this.objectHeap.set(objectId, newObject);
              this.stack.push(newObject);
            }
          }
          break;
        case 0xbc: // newarray
          {
            const atype = code[pc++];
            const count = this.stack.pop();
            const array: any[] = [];
            for (let i = 0; i < count; i++) {
              array.push(0);
            }
            this.stack.push(array);
          }
          break;
        case 0xbd: // anewarray
          {
            const index = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            const count = this.stack.pop();
            const array: any[] = [];
            for (let i = 0; i < count; i++) {
              array.push(null);
            }
            this.stack.push(array);
          }
          break;
        case 0xbe: // arraylength
          {
            const arrayref = this.stack.pop();
            if (Array.isArray(arrayref)) {
              this.stack.push(arrayref.length);
            } else {
              this.stack.push(0);
            }
          }
          break;
        case 0xbf: // athrow
          {
            const exception = this.stack.pop();
            throw exception;
          }
          break;
        case 0xc0: // checkcast
          {
            const index = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            // Type check - simplified
            const objectref = this.stack.pop();
            this.stack.push(objectref);
          }
          break;
        case 0xc1: // instanceof
          {
            const index = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            const objectref = this.stack.pop();
            // Type check - simplified
            this.stack.push(objectref !== null ? 1 : 0);
          }
          break;
        case 0xc2: // monitorenter
          {
            const objectref = this.stack.pop();
            // Monitor enter - simplified (no-op)
          }
          break;
        case 0xc3: // monitorexit
          {
            const objectref = this.stack.pop();
            // Monitor exit - simplified (no-op)
          }
          break;
        case 0xc4: // wide
          {
            const opcode = code[pc++];
            // Wide instruction - handle next instruction with wide index
            // Simplified - would need to handle all wide variants
            switch (opcode) {
              case 0x15: // iload
              case 0x16: // lload
              case 0x17: // fload
              case 0x18: // dload
              case 0x19: // aload
                {
                  const index = (code[pc] << 8) | code[pc + 1];
                  pc += 2;
                  this.stack.push(this.locals[index] || 0);
                }
                break;
              case 0x36: // istore
              case 0x37: // lstore
              case 0x38: // fstore
              case 0x39: // dstore
              case 0x3a: // astore
                {
                  const index = (code[pc] << 8) | code[pc + 1];
                  pc += 2;
                  this.locals[index] = this.stack.pop();
                }
                break;
              case 0x84: // iinc
                {
                  const index = (code[pc] << 8) | code[pc + 1];
                  pc += 2;
                  const constValue = (code[pc] << 8) | code[pc + 1];
                  pc += 2;
                  this.locals[index] = (this.locals[index] || 0) + constValue;
                }
                break;
              case 0xa9: // ret
                {
                  const index = (code[pc] << 8) | code[pc + 1];
                  pc += 2;
                  pc = this.locals[index] || 0;
                }
                break;
            }
          }
          break;
        case 0xc5: // multianewarray
          {
            const index = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            const dimensions = code[pc++];
            const sizes: number[] = [];
            for (let i = 0; i < dimensions; i++) {
              sizes.unshift(this.stack.pop());
            }
            // Create multi-dimensional array - simplified
            const array = this.createMultiArray(sizes);
            this.stack.push(array);
          }
          break;
        case 0xc6: // ifnull
          {
            const value = this.stack.pop();
            const offset = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            if (value === null) {
              pc += offset - 3;
            }
          }
          break;
        case 0xc7: // ifnonnull
          {
            const value = this.stack.pop();
            const offset = (code[pc] << 8) | code[pc + 1];
            pc += 2;
            if (value !== null) {
              pc += offset - 3;
            }
          }
          break;
        case 0xc8: // goto_w
          {
            const offset = (code[pc] << 24) | (code[pc + 1] << 16) | (code[pc + 2] << 8) | code[pc + 3];
            pc += 4;
            pc += offset - 5;
          }
          break;
        case 0xc9: // jsr_w
          {
            const offset = (code[pc] << 24) | (code[pc + 1] << 16) | (code[pc + 2] << 8) | code[pc + 3];
            pc += 4;
            this.stack.push(pc);
            pc += offset - 5;
          }
          break;
        default:
          // Unknown opcode
          console.warn(`Unknown Java bytecode opcode: 0x${opcode.toString(16)}`);
          break;
      }
    }

    return this.stack.pop();
  }

  private createMultiArray(sizes: number[]): any {
    if (sizes.length === 0) return [];
    if (sizes.length === 1) {
      const array: any[] = [];
      for (let i = 0; i < sizes[0]; i++) {
        array.push(0);
      }
      return array;
    }
    const array: any[] = [];
    const [first, ...rest] = sizes;
    for (let i = 0; i < first; i++) {
      array.push(this.createMultiArray(rest));
    }
    return array;
  }
}

