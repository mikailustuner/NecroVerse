/**
 * Minimal JVM Interpreter
 * 
 * Executes Java bytecode in JavaScript. Supports basic JVM operations including:
 * - Stack operations
 * - Local variables
 * - Method invocation
 * - Field access
 * - Exception handling
 * - Array operations
 * 
 * @example
 * ```typescript
 * const parser = new JavaClassParser(arrayBuffer);
 * const classFile = parser.parse();
 * const interpreter = new JVMInterpreter();
 * interpreter.loadClass("MyClass", classFile);
 * const result = interpreter.executeMethod("MyClass", "main", []);
 * ```
 */

import { JavaClass, MethodInfo } from "../parsers/jar-bytecode";

export interface JVMException {
  type: string;
  message: string;
  stackTrace: JVMStackTraceFrame[];
  cause?: JVMException;
}

export interface JVMStackTraceFrame {
  className: string;
  methodName: string;
  fileName?: string;
  lineNumber?: number;
}

export interface JVMContext {
  stack: any[];
  locals: any[];
  heap: Map<number, any>;
  classes: Map<string, JavaClass>;
  currentClass?: JavaClass;
  currentMethod?: MethodInfo;
  pc: number; // Program counter
  staticFields: Map<string, Map<string, any>>; // className -> fieldName -> value
  instanceFields: Map<any, Map<string, any>>; // objectref -> fieldName -> value
  exceptionHandler?: {
    exception: JVMException;
    handlerPc: number;
    catchType?: number;
  };
}

export class JVMInterpreter {
  private context: JVMContext;
  private bytecode: Uint8Array = new Uint8Array(0);

  constructor() {
    this.context = {
      stack: [],
      locals: [],
      heap: new Map(),
      classes: new Map(),
      pc: 0,
      staticFields: new Map(),
      instanceFields: new Map(),
    };
  }

  loadClass(className: string, classFile: JavaClass): void {
    this.context.classes.set(className, classFile);
  }

  executeMethod(className: string, methodName: string, args: any[] = []): any {
    const classFile = this.context.classes.get(className);
    if (!classFile) {
      throw new Error(`Class not found: ${className}`);
    }

    this.context.currentClass = classFile;

    // Find method
    const method = classFile.methods.find((m) => {
      const name = this.getConstantPoolString(classFile, m.nameIndex);
      return name === methodName;
    });

    if (!method || !method.code) {
      throw new Error(`Method not found or has no code: ${methodName}`);
    }

    this.context.currentMethod = method;
    this.bytecode = method.code.code;
    this.context.pc = 0;
    this.context.stack = [];
    this.context.locals = new Array(method.code.maxLocals);
    
    // Set arguments
    for (let i = 0; i < args.length && i < this.context.locals.length; i++) {
      this.context.locals[i] = args[i];
    }

    return this.execute();
  }

  private execute(): any {
    while (this.context.pc < this.bytecode.length) {
      // Check for exception handler
      if (this.context.exceptionHandler) {
        const handler = this.context.exceptionHandler;
        this.context.pc = handler.handlerPc;
        this.context.stack.push(handler.exception);
        this.context.exceptionHandler = undefined;
        continue;
      }

      const opcode = this.bytecode[this.context.pc];
      this.context.pc++;

      try {
        this.executeOpcode(opcode);
      } catch (error) {
        // Handle exception
        const exception = this.createExceptionFromError(error);
        const handler = this.findExceptionHandler(exception);
        
        if (handler) {
          this.context.exceptionHandler = {
            exception,
            handlerPc: handler.handlerPc,
            catchType: handler.catchType,
          };
          continue;
        } else {
          // No handler found, rethrow
          throw error;
        }
      }
    }

    return this.context.stack.pop();
  }

  private executeOpcode(opcode: number): void {
    switch (opcode) {
        case 0x00: // nop
          break;
        case 0x01: // aconst_null
          this.context.stack.push(null);
          break;
        case 0x02: // iconst_m1
          this.context.stack.push(-1);
          break;
        case 0x03: // iconst_0
          this.context.stack.push(0);
          break;
        case 0x04: // iconst_1
          this.context.stack.push(1);
          break;
        case 0x05: // iconst_2
          this.context.stack.push(2);
          break;
        case 0x06: // iconst_3
          this.context.stack.push(3);
          break;
        case 0x07: // iconst_4
          this.context.stack.push(4);
          break;
        case 0x08: // iconst_5
          this.context.stack.push(5);
          break;
        case 0x09: // lconst_0
          this.context.stack.push(0n);
          break;
        case 0x0a: // lconst_1
          this.context.stack.push(1n);
          break;
        case 0x0b: // fconst_0
          this.context.stack.push(0.0);
          break;
        case 0x0c: // fconst_1
          this.context.stack.push(1.0);
          break;
        case 0x0d: // fconst_2
          this.context.stack.push(2.0);
          break;
        case 0x0e: // dconst_0
          this.context.stack.push(0.0);
          break;
        case 0x0f: // dconst_1
          this.context.stack.push(1.0);
          break;
        case 0x10: // bipush
          {
            const value = this.readInt8();
            this.context.stack.push(value);
          }
          break;
        case 0x11: // sipush
          {
            const value = this.readInt16();
            this.context.stack.push(value);
          }
          break;
        case 0x12: // ldc
          {
            const index = this.readUint8();
            const constant = this.getConstant(this.context.currentClass!, index);
            this.context.stack.push(constant);
          }
          break;
        case 0x13: // ldc_w
          {
            const index = this.readUint16();
            const constant = this.getConstant(this.context.currentClass!, index);
            this.context.stack.push(constant);
          }
          break;
        case 0x14: // ldc2_w
          {
            const index = this.readUint16();
            const constant = this.getConstant(this.context.currentClass!, index);
            this.context.stack.push(constant);
          }
          break;
        case 0x15: // iload
          {
            const index = this.readUint8();
            this.context.stack.push(this.context.locals[index] || 0);
          }
          break;
        case 0x16: // lload
          {
            const index = this.readUint8();
            this.context.stack.push(this.context.locals[index] || 0n);
          }
          break;
        case 0x17: // fload
          {
            const index = this.readUint8();
            this.context.stack.push(this.context.locals[index] || 0.0);
          }
          break;
        case 0x18: // dload
          {
            const index = this.readUint8();
            this.context.stack.push(this.context.locals[index] || 0.0);
          }
          break;
        case 0x19: // aload
          {
            const index = this.readUint8();
            this.context.stack.push(this.context.locals[index]);
          }
          break;
        case 0x1a: // iload_0
          this.context.stack.push(this.context.locals[0] || 0);
          break;
        case 0x1b: // iload_1
          this.context.stack.push(this.context.locals[1] || 0);
          break;
        case 0x1c: // iload_2
          this.context.stack.push(this.context.locals[2] || 0);
          break;
        case 0x1d: // iload_3
          this.context.stack.push(this.context.locals[3] || 0);
          break;
        case 0x2a: // aload_0
          this.context.stack.push(this.context.locals[0]);
          break;
        case 0x2b: // aload_1
          this.context.stack.push(this.context.locals[1]);
          break;
        case 0x2c: // aload_2
          this.context.stack.push(this.context.locals[2]);
          break;
        case 0x2d: // aload_3
          this.context.stack.push(this.context.locals[3]);
          break;
        case 0x3b: // istore
          {
            const index = this.readUint8();
            this.context.locals[index] = this.context.stack.pop();
          }
          break;
        case 0x3c: // istore_0
          this.context.locals[0] = this.context.stack.pop();
          break;
        case 0x3d: // istore_1
          this.context.locals[1] = this.context.stack.pop();
          break;
        case 0x3e: // istore_2
          this.context.locals[2] = this.context.stack.pop();
          break;
        case 0x3f: // istore_3
          this.context.locals[3] = this.context.stack.pop();
          break;
        case 0x4a: // astore_0
          this.context.locals[0] = this.context.stack.pop();
          break;
        case 0x4b: // astore_1
          this.context.locals[1] = this.context.stack.pop();
          break;
        case 0x4c: // astore_2
          this.context.locals[2] = this.context.stack.pop();
          break;
        case 0x4d: // astore_3
          this.context.locals[3] = this.context.stack.pop();
          break;
        case 0x57: // pop
          this.context.stack.pop();
          break;
        case 0x58: // pop2
          this.context.stack.pop();
          this.context.stack.pop();
          break;
        case 0x59: // dup
          {
            const value = this.context.stack[this.context.stack.length - 1];
            this.context.stack.push(value);
          }
          break;
        case 0x5a: // dup_x1
          {
            const value1 = this.context.stack.pop();
            const value2 = this.context.stack.pop();
            this.context.stack.push(value1);
            this.context.stack.push(value2);
            this.context.stack.push(value1);
          }
          break;
        case 0x60: // iadd
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(a + b);
          }
          break;
        case 0x61: // ladd
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(BigInt(a) + BigInt(b));
          }
          break;
        case 0x62: // fadd
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(a + b);
          }
          break;
        case 0x63: // dadd
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(a + b);
          }
          break;
        case 0x64: // isub
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(a - b);
          }
          break;
        case 0x65: // lsub
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(BigInt(a) - BigInt(b));
          }
          break;
        case 0x66: // fsub
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(a - b);
          }
          break;
        case 0x67: // dsub
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(a - b);
          }
          break;
        case 0x68: // imul
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(a * b);
          }
          break;
        case 0x69: // lmul
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(BigInt(a) * BigInt(b));
          }
          break;
        case 0x6a: // fmul
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(a * b);
          }
          break;
        case 0x6b: // dmul
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(a * b);
          }
          break;
        case 0x6c: // idiv
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(Math.floor(a / b));
          }
          break;
        case 0x6d: // ldiv
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(BigInt(a) / BigInt(b));
          }
          break;
        case 0x6e: // fdiv
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(a / b);
          }
          break;
        case 0x6f: // ddiv
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(a / b);
          }
          break;
        case 0x70: // irem
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(a % b);
          }
          break;
        case 0x71: // lrem
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(BigInt(a) % BigInt(b));
          }
          break;
        case 0x72: // frem
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(a % b);
          }
          break;
        case 0x73: // drem
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            this.context.stack.push(a % b);
          }
          break;
        case 0x74: // ineg
          {
            const value = this.context.stack.pop();
            this.context.stack.push(-value);
          }
          break;
        case 0x75: // lneg
          {
            const value = this.context.stack.pop();
            this.context.stack.push(-BigInt(value));
          }
          break;
        case 0x76: // fneg
          {
            const value = this.context.stack.pop();
            this.context.stack.push(-value);
          }
          break;
        case 0x77: // dneg
          {
            const value = this.context.stack.pop();
            this.context.stack.push(-value);
          }
          break;
        case 0x84: // iinc
          {
            const index = this.readUint8();
            const constValue = this.readInt8();
            this.context.locals[index] = (this.context.locals[index] || 0) + constValue;
          }
          break;
        case 0x94: // lcmp
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            const result = BigInt(a) > BigInt(b) ? 1 : BigInt(a) < BigInt(b) ? -1 : 0;
            this.context.stack.push(result);
          }
          break;
        case 0x95: // fcmpl
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            const result = a > b ? 1 : a < b ? -1 : 0;
            this.context.stack.push(isNaN(result) ? -1 : result);
          }
          break;
        case 0x96: // fcmpg
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            const result = a > b ? 1 : a < b ? -1 : 0;
            this.context.stack.push(isNaN(result) ? 1 : result);
          }
          break;
        case 0x97: // dcmpl
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            const result = a > b ? 1 : a < b ? -1 : 0;
            this.context.stack.push(isNaN(result) ? -1 : result);
          }
          break;
        case 0x98: // dcmpg
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            const result = a > b ? 1 : a < b ? -1 : 0;
            this.context.stack.push(isNaN(result) ? 1 : result);
          }
          break;
        case 0x99: // ifeq
          {
            const value = this.context.stack.pop();
            const offset = this.readInt16();
            if (value === 0) {
              this.context.pc += offset - 3;
            }
          }
          break;
        case 0x9a: // ifne
          {
            const value = this.context.stack.pop();
            const offset = this.readInt16();
            if (value !== 0) {
              this.context.pc += offset - 3;
            }
          }
          break;
        case 0x9b: // iflt
          {
            const value = this.context.stack.pop();
            const offset = this.readInt16();
            if (value < 0) {
              this.context.pc += offset - 3;
            }
          }
          break;
        case 0x9c: // ifge
          {
            const value = this.context.stack.pop();
            const offset = this.readInt16();
            if (value >= 0) {
              this.context.pc += offset - 3;
            }
          }
          break;
        case 0x9d: // ifgt
          {
            const value = this.context.stack.pop();
            const offset = this.readInt16();
            if (value > 0) {
              this.context.pc += offset - 3;
            }
          }
          break;
        case 0x9e: // ifle
          {
            const value = this.context.stack.pop();
            const offset = this.readInt16();
            if (value <= 0) {
              this.context.pc += offset - 3;
            }
          }
          break;
        case 0x9f: // if_icmpeq
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            const offset = this.readInt16();
            if (a === b) {
              this.context.pc += offset - 3;
            }
          }
          break;
        case 0xa0: // if_icmpne
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            const offset = this.readInt16();
            if (a !== b) {
              this.context.pc += offset - 3;
            }
          }
          break;
        case 0xa1: // if_icmplt
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            const offset = this.readInt16();
            if (a < b) {
              this.context.pc += offset - 3;
            }
          }
          break;
        case 0xa2: // if_icmpge
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            const offset = this.readInt16();
            if (a >= b) {
              this.context.pc += offset - 3;
            }
          }
          break;
        case 0xa3: // if_icmpgt
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            const offset = this.readInt16();
            if (a > b) {
              this.context.pc += offset - 3;
            }
          }
          break;
        case 0xa4: // if_icmple
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            const offset = this.readInt16();
            if (a <= b) {
              this.context.pc += offset - 3;
            }
          }
          break;
        case 0xa5: // if_acmpeq
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            const offset = this.readInt16();
            if (a === b) {
              this.context.pc += offset - 3;
            }
          }
          break;
        case 0xa6: // if_acmpne
          {
            const b = this.context.stack.pop();
            const a = this.context.stack.pop();
            const offset = this.readInt16();
            if (a !== b) {
              this.context.pc += offset - 3;
            }
          }
          break;
        case 0xa7: // goto
          {
            const offset = this.readInt16();
            this.context.pc += offset - 3;
          }
          break;
        case 0xa8: // jsr
          {
            const offset = this.readInt16();
            this.context.stack.push(this.context.pc);
            this.context.pc += offset - 3;
          }
          break;
        case 0xa9: // ret
          {
            const index = this.readUint8();
            this.context.pc = this.context.locals[index] || 0;
          }
          break;
        case 0xaa: // tableswitch
          {
            // Skip padding
            while (this.context.pc % 4 !== 0) {
              this.context.pc++;
            }
            const defaultOffset = this.readInt32();
            const low = this.readInt32();
            const high = this.readInt32();
            const offsets: number[] = [];
            for (let i = low; i <= high; i++) {
              offsets.push(this.readInt32());
            }
            const index = this.context.stack.pop();
            if (index >= low && index <= high) {
              this.context.pc += offsets[index - low] - (this.context.pc - 1);
            } else {
              this.context.pc += defaultOffset - (this.context.pc - 1);
            }
          }
          break;
        case 0xab: // lookupswitch
          {
            // Skip padding
            while (this.context.pc % 4 !== 0) {
              this.context.pc++;
            }
            const defaultOffset = this.readInt32();
            const npairs = this.readInt32();
            const matchOffsets: Array<{ match: number; offset: number }> = [];
            for (let i = 0; i < npairs; i++) {
              matchOffsets.push({
                match: this.readInt32(),
                offset: this.readInt32(),
              });
            }
            const key = this.context.stack.pop();
            let found = false;
            for (const { match, offset } of matchOffsets) {
              if (match === key) {
                this.context.pc += offset - (this.context.pc - 1);
                found = true;
                break;
              }
            }
            if (!found) {
              this.context.pc += defaultOffset - (this.context.pc - 1);
            }
          }
          break;
        case 0xac: // ireturn
          return this.context.stack.pop();
        case 0xad: // lreturn
          return this.context.stack.pop();
        case 0xae: // freturn
          return this.context.stack.pop();
        case 0xaf: // dreturn
          return this.context.stack.pop();
        case 0xb0: // areturn
          return this.context.stack.pop();
        case 0xb1: // return
          return undefined;
        case 0xb2: // getstatic
          {
            const index = this.readUint16();
            const fieldRef = this.resolveField(this.context.currentClass!, index);
            if (fieldRef) {
              const className = fieldRef.className || this.getConstantPoolString(this.context.currentClass!, this.context.currentClass!.thisClass);
              const fieldName = fieldRef.fieldName;
              
              if (!this.context.staticFields.has(className)) {
                this.context.staticFields.set(className, new Map());
              }
              const classFields = this.context.staticFields.get(className)!;
              this.context.stack.push(classFields.get(fieldName) ?? this.getDefaultValue(fieldRef.descriptor));
            } else {
              this.context.stack.push(0);
            }
          }
          break;
        case 0xb3: // putstatic
          {
            const index = this.readUint16();
            const value = this.context.stack.pop();
            const fieldRef = this.resolveField(this.context.currentClass!, index);
            if (fieldRef) {
              const className = fieldRef.className || this.getConstantPoolString(this.context.currentClass!, this.context.currentClass!.thisClass);
              const fieldName = fieldRef.fieldName;
              
              if (!this.context.staticFields.has(className)) {
                this.context.staticFields.set(className, new Map());
              }
              const classFields = this.context.staticFields.get(className)!;
              classFields.set(fieldName, value);
            }
          }
          break;
        case 0xb4: // getfield
          {
            const index = this.readUint16();
            const objectref = this.context.stack.pop();
            if (objectref === null) {
              throw this.createException("java/lang/NullPointerException", "null object reference");
            }
            const fieldRef = this.resolveField(this.context.currentClass!, index);
            if (fieldRef && objectref) {
              const fieldName = fieldRef.fieldName;
              
              if (!this.context.instanceFields.has(objectref)) {
                this.context.instanceFields.set(objectref, new Map());
              }
              const objectFields = this.context.instanceFields.get(objectref)!;
              this.context.stack.push(objectFields.get(fieldName) ?? this.getDefaultValue(fieldRef.descriptor));
            } else {
              this.context.stack.push(0);
            }
          }
          break;
        case 0xb5: // putfield
          {
            const index = this.readUint16();
            const value = this.context.stack.pop();
            const objectref = this.context.stack.pop();
            if (objectref === null) {
              throw this.createException("java/lang/NullPointerException", "null object reference");
            }
            const fieldRef = this.resolveField(this.context.currentClass!, index);
            if (fieldRef && objectref) {
              const fieldName = fieldRef.fieldName;
              
              if (!this.context.instanceFields.has(objectref)) {
                this.context.instanceFields.set(objectref, new Map());
              }
              const objectFields = this.context.instanceFields.get(objectref)!;
              objectFields.set(fieldName, value);
            }
          }
          break;
        case 0xb6: // invokevirtual
          {
            const index = this.readUint16();
            const methodRef = this.resolveMethod(this.context.currentClass!, index);
            if (methodRef) {
              const objectref = this.context.stack.pop();
              const { paramCount } = this.parseMethodDescriptor(methodRef.descriptor);
              
              // Pop arguments
              const args: any[] = [];
              for (let i = 0; i < paramCount; i++) {
                args.unshift(this.context.stack.pop());
              }
              
              // Try to find and execute method
              const result = this.invokeMethod(methodRef.className || "", methodRef.methodName, args, objectref);
              if (result !== undefined && methodRef.descriptor.endsWith("V") === false) {
                this.context.stack.push(result);
              }
            } else {
              // Fallback: pop objectref
              this.context.stack.pop();
            }
          }
          break;
        case 0xb7: // invokespecial
          {
            const index = this.readUint16();
            const methodRef = this.resolveMethod(this.context.currentClass!, index);
            if (methodRef) {
              const objectref = this.context.stack.pop();
              const { paramCount } = this.parseMethodDescriptor(methodRef.descriptor);
              
              // Pop arguments
              const args: any[] = [];
              for (let i = 0; i < paramCount; i++) {
                args.unshift(this.context.stack.pop());
              }
              
              // Try to find and execute method (special - constructor or super method)
              const result = this.invokeMethod(methodRef.className || "", methodRef.methodName, args, objectref);
              if (result !== undefined && methodRef.descriptor.endsWith("V") === false) {
                this.context.stack.push(result);
              }
            } else {
              // Fallback: pop objectref
              this.context.stack.pop();
            }
          }
          break;
        case 0xb8: // invokestatic
          {
            const index = this.readUint16();
            const methodRef = this.resolveMethod(this.context.currentClass!, index);
            if (methodRef) {
              const { paramCount } = this.parseMethodDescriptor(methodRef.descriptor);
              
              // Pop arguments
              const args: any[] = [];
              for (let i = 0; i < paramCount; i++) {
                args.unshift(this.context.stack.pop());
              }
              
              // Try to find and execute static method
              const result = this.invokeMethod(methodRef.className || "", methodRef.methodName, args);
              if (result !== undefined && methodRef.descriptor.endsWith("V") === false) {
                this.context.stack.push(result);
              }
            }
          }
          break;
        case 0xb9: // invokeinterface
          {
            const index = this.readUint16();
            const count = this.readUint8();
            this.readUint8(); // Reserved
            // Invoke interface method - simplified
            this.context.stack.pop(); // Pop objectref
          }
          break;
        case 0xba: // invokedynamic
          {
            const index = this.readUint16();
            this.readUint16(); // Reserved
            // Invoke dynamic method - simplified
          }
          break;
        case 0xbb: // new
          {
            const index = this.readUint16();
            // Create new object - simplified
            this.context.stack.push({});
          }
          break;
        case 0xbc: // newarray
          {
            const atype = this.readUint8();
            const count = this.context.stack.pop();
            const array: any[] = [];
            for (let i = 0; i < count; i++) {
              array.push(0);
            }
            this.context.stack.push(array);
          }
          break;
        case 0xbd: // anewarray
          {
            const index = this.readUint16();
            const count = this.context.stack.pop();
            const array: any[] = [];
            for (let i = 0; i < count; i++) {
              array.push(null);
            }
            this.context.stack.push(array);
          }
          break;
        case 0x2e: // iaload
          {
            const index = this.context.stack.pop();
            const arrayref = this.context.stack.pop();
            if (arrayref === null) {
              throw this.createException("java/lang/NullPointerException", "null array reference");
            }
            if (!Array.isArray(arrayref)) {
              throw this.createException("java/lang/ArrayStoreException", "not an array");
            }
            if (index < 0 || index >= arrayref.length) {
              throw this.createException("java/lang/ArrayIndexOutOfBoundsException", `index ${index} out of bounds for length ${arrayref.length}`);
            }
            this.context.stack.push(arrayref[index] || 0);
          }
          break;
        case 0x2f: // laload
          {
            const index = this.context.stack.pop();
            const arrayref = this.context.stack.pop();
            if (Array.isArray(arrayref) && index >= 0 && index < arrayref.length) {
              this.context.stack.push(BigInt(arrayref[index] || 0));
            } else {
              this.context.stack.push(0n);
            }
          }
          break;
        case 0x30: // faload
          {
            const index = this.context.stack.pop();
            const arrayref = this.context.stack.pop();
            if (Array.isArray(arrayref) && index >= 0 && index < arrayref.length) {
              this.context.stack.push(arrayref[index] || 0.0);
            } else {
              this.context.stack.push(0.0);
            }
          }
          break;
        case 0x31: // daload
          {
            const index = this.context.stack.pop();
            const arrayref = this.context.stack.pop();
            if (Array.isArray(arrayref) && index >= 0 && index < arrayref.length) {
              this.context.stack.push(arrayref[index] || 0.0);
            } else {
              this.context.stack.push(0.0);
            }
          }
          break;
        case 0x32: // aaload
          {
            const index = this.context.stack.pop();
            const arrayref = this.context.stack.pop();
            if (Array.isArray(arrayref) && index >= 0 && index < arrayref.length) {
              this.context.stack.push(arrayref[index] || null);
            } else {
              this.context.stack.push(null);
            }
          }
          break;
        case 0x33: // baload
          {
            const index = this.context.stack.pop();
            const arrayref = this.context.stack.pop();
            if (Array.isArray(arrayref) && index >= 0 && index < arrayref.length) {
              const value = arrayref[index] || 0;
              this.context.stack.push((value << 24) >> 24); // Sign extend byte
            } else {
              this.context.stack.push(0);
            }
          }
          break;
        case 0x34: // caload
          {
            const index = this.context.stack.pop();
            const arrayref = this.context.stack.pop();
            if (Array.isArray(arrayref) && index >= 0 && index < arrayref.length) {
              this.context.stack.push((arrayref[index] || 0) & 0xffff); // Zero extend char
            } else {
              this.context.stack.push(0);
            }
          }
          break;
        case 0x35: // saload
          {
            const index = this.context.stack.pop();
            const arrayref = this.context.stack.pop();
            if (Array.isArray(arrayref) && index >= 0 && index < arrayref.length) {
              const value = arrayref[index] || 0;
              this.context.stack.push((value << 16) >> 16); // Sign extend short
            } else {
              this.context.stack.push(0);
            }
          }
          break;
        case 0x4f: // iastore
          {
            const value = this.context.stack.pop();
            const index = this.context.stack.pop();
            const arrayref = this.context.stack.pop();
            if (arrayref === null) {
              throw this.createException("java/lang/NullPointerException", "null array reference");
            }
            if (!Array.isArray(arrayref)) {
              throw this.createException("java/lang/ArrayStoreException", "not an array");
            }
            if (index < 0 || index >= arrayref.length) {
              throw this.createException("java/lang/ArrayIndexOutOfBoundsException", `index ${index} out of bounds for length ${arrayref.length}`);
            }
            arrayref[index] = value;
          }
          break;
        case 0x50: // lastore
          {
            const value = this.context.stack.pop();
            const index = this.context.stack.pop();
            const arrayref = this.context.stack.pop();
            if (Array.isArray(arrayref) && index >= 0 && index < arrayref.length) {
              arrayref[index] = value;
            }
          }
          break;
        case 0x51: // fastore
          {
            const value = this.context.stack.pop();
            const index = this.context.stack.pop();
            const arrayref = this.context.stack.pop();
            if (Array.isArray(arrayref) && index >= 0 && index < arrayref.length) {
              arrayref[index] = value;
            }
          }
          break;
        case 0x52: // dastore
          {
            const value = this.context.stack.pop();
            const index = this.context.stack.pop();
            const arrayref = this.context.stack.pop();
            if (Array.isArray(arrayref) && index >= 0 && index < arrayref.length) {
              arrayref[index] = value;
            }
          }
          break;
        case 0x53: // aastore
          {
            const value = this.context.stack.pop();
            const index = this.context.stack.pop();
            const arrayref = this.context.stack.pop();
            if (Array.isArray(arrayref) && index >= 0 && index < arrayref.length) {
              arrayref[index] = value;
            }
          }
          break;
        case 0x54: // bastore
          {
            const value = this.context.stack.pop();
            const index = this.context.stack.pop();
            const arrayref = this.context.stack.pop();
            if (Array.isArray(arrayref) && index >= 0 && index < arrayref.length) {
              arrayref[index] = value & 0xff; // Store as byte
            }
          }
          break;
        case 0x55: // castore
          {
            const value = this.context.stack.pop();
            const index = this.context.stack.pop();
            const arrayref = this.context.stack.pop();
            if (Array.isArray(arrayref) && index >= 0 && index < arrayref.length) {
              arrayref[index] = value & 0xffff; // Store as char
            }
          }
          break;
        case 0x56: // sastore
          {
            const value = this.context.stack.pop();
            const index = this.context.stack.pop();
            const arrayref = this.context.stack.pop();
            if (Array.isArray(arrayref) && index >= 0 && index < arrayref.length) {
              arrayref[index] = value & 0xffff; // Store as short
            }
          }
          break;
        case 0xbe: // arraylength
          {
            const arrayref = this.context.stack.pop();
            this.context.stack.push(Array.isArray(arrayref) ? arrayref.length : 0);
          }
          break;
        case 0xbf: // athrow
          {
            const exception = this.context.stack.pop();
            if (!exception) {
              // Throw NullPointerException
              const npe = this.createException("java/lang/NullPointerException", "null pointer exception");
              throw npe;
            }
            if (this.isJVMException(exception)) {
              throw exception;
            } else {
              // Convert to JVM exception
              const jvmException = this.createException("java/lang/RuntimeException", String(exception));
              throw jvmException;
            }
          }
          break;
        case 0xc0: // checkcast
          {
            const index = this.readUint16();
            const objectref = this.context.stack.pop();
            this.context.stack.push(objectref);
          }
          break;
        case 0xc1: // instanceof
          {
            const index = this.readUint16();
            const objectref = this.context.stack.pop();
            this.context.stack.push(objectref !== null ? 1 : 0);
          }
          break;
        case 0xc2: // monitorenter
          {
            const objectref = this.context.stack.pop();
            // Monitor enter - simplified
          }
          break;
        case 0xc3: // monitorexit
          {
            const objectref = this.context.stack.pop();
            // Monitor exit - simplified
          }
          break;
        case 0xc4: // wide
          {
            const opcode = this.readUint8();
            // Wide instruction - handle separately
            console.warn("Wide instruction not fully implemented");
          }
          break;
        case 0xc5: // multianewarray
          {
            const index = this.readUint16();
            const dimensions = this.readUint8();
            // Multi-dimensional array - simplified
            this.context.stack.push([]);
          }
          break;
        case 0xc6: // ifnull
          {
            const value = this.context.stack.pop();
            const offset = this.readInt16();
            if (value === null) {
              this.context.pc += offset - 3;
            }
          }
          break;
        case 0xc7: // ifnonnull
          {
            const value = this.context.stack.pop();
            const offset = this.readInt16();
            if (value !== null) {
              this.context.pc += offset - 3;
            }
          }
          break;
        case 0xc8: // goto_w
          {
            const offset = this.readInt32();
            this.context.pc += offset - 5;
          }
          break;
        case 0xc9: // jsr_w
          {
            const offset = this.readInt32();
            this.context.stack.push(this.context.pc);
            this.context.pc += offset - 5;
          }
          break;
        default:
          console.warn(`Unknown JVM opcode: 0x${opcode.toString(16)}`);
          break;
      }
    }

    return this.context.stack.pop();
  }

  private readUint8(): number {
    const value = this.bytecode[this.context.pc];
    this.context.pc++;
    return value;
  }

  private readInt8(): number {
    const value = this.bytecode[this.context.pc];
    this.context.pc++;
    return value > 127 ? value - 256 : value;
  }

  private readUint16(): number {
    const value = (this.bytecode[this.context.pc] << 8) | this.bytecode[this.context.pc + 1];
    this.context.pc += 2;
    return value;
  }

  private readInt16(): number {
    const value = this.readUint16();
    return value > 32767 ? value - 65536 : value;
  }

  private readInt32(): number {
    const value =
      (this.bytecode[this.context.pc] << 24) |
      (this.bytecode[this.context.pc + 1] << 16) |
      (this.bytecode[this.context.pc + 2] << 8) |
      this.bytecode[this.context.pc + 3];
    this.context.pc += 4;
    return value > 2147483647 ? value - 4294967296 : value;
  }

  private getConstant(classFile: JavaClass, index: number): any {
    const entry = classFile.constantPool[index];
    if (!entry) return null;

    switch (entry.tag) {
      case 1: // UTF8
        return entry.value;
      case 3: // Integer
        return entry.value;
      case 4: // Float
        return entry.value;
      case 5: // Long
        return entry.value;
      case 6: // Double
        return entry.value;
      case 7: // Class
        {
          const classIndex = entry.value as number;
          const className = this.getConstant(classFile, classIndex) as string;
          return className;
        }
      case 8: // String
        {
          const stringIndex = entry.value as number;
          return this.getConstant(classFile, stringIndex);
        }
      default:
        return entry.value;
    }
  }

  private getConstantPoolString(classFile: JavaClass, index: number): string {
    const entry = classFile.constantPool[index];
    if (entry && entry.tag === 1) {
      return entry.value as string;
    }
    return "";
  }

  /**
   * Parse method descriptor to get parameter count
   */
  private parseMethodDescriptor(descriptor: string): { paramCount: number; returnType: string } {
    let index = 1; // Skip '('
    let paramCount = 0;
    
    while (index < descriptor.length && descriptor[index] !== ')') {
      if (descriptor[index] === 'L') {
        // Object type
        const endIndex = descriptor.indexOf(';', index);
        if (endIndex >= 0) {
          index = endIndex + 1;
        } else {
          break;
        }
      } else if (descriptor[index] === '[') {
        // Array type
        index++;
        continue;
      } else {
        // Primitive type
        index++;
      }
      paramCount++;
    }
    
    const returnType = descriptor.substring(index + 1);
    
    return { paramCount, returnType };
  }

  /**
   * Resolve method reference from constant pool
   */
  private resolveMethod(classFile: JavaClass, index: number): { className: string; methodName: string; descriptor: string } | null {
    const entry = classFile.constantPool[index];
    if (!entry || (entry.tag !== 10 && entry.tag !== 9)) { // Methodref or InterfaceMethodref
      return null;
    }
    
    // Simplified - would need proper constant pool resolution
    return {
      className: "",
      methodName: "",
      descriptor: "",
    };
  }

  /**
   * Resolve field reference from constant pool
   */
  private resolveField(classFile: JavaClass, index: number): { className: string; fieldName: string; descriptor: string } | null {
    const entry = classFile.constantPool[index];
    if (!entry || entry.tag !== 9) { // Fieldref
      return null;
    }
    
    // Simplified - would need proper constant pool resolution
    // For now, try to extract from constant pool
    try {
      const classIndex = (entry.value as any).classIndex;
      const nameAndTypeIndex = (entry.value as any).nameAndTypeIndex;
      
      const className = this.getConstantPoolString(classFile, classIndex);
      const nameAndType = classFile.constantPool[nameAndTypeIndex];
      const fieldName = this.getConstantPoolString(classFile, (nameAndType?.value as any)?.nameIndex);
      const descriptor = this.getConstantPoolString(classFile, (nameAndType?.value as any)?.descriptorIndex);
      
      return { className, fieldName, descriptor };
    } catch {
      // Fallback
      return {
        className: "",
        fieldName: "",
        descriptor: "",
      };
    }
  }

  /**
   * Get default value for a type descriptor
   */
  private getDefaultValue(descriptor: string): any {
    if (descriptor.startsWith("[")) return null; // Array
    if (descriptor.startsWith("L")) return null; // Object
    switch (descriptor) {
      case "I": return 0; // int
      case "J": return 0n; // long
      case "F": return 0.0; // float
      case "D": return 0.0; // double
      case "B": return 0; // byte
      case "C": return 0; // char
      case "S": return 0; // short
      case "Z": return 0; // boolean
      default: return 0;
    }
  }

  /**
   * Invoke a method
   */
  private invokeMethod(className: string, methodName: string, args: any[], objectref?: any): any {
    // Try to find method in loaded classes
    const classFile = this.context.classes.get(className);
    if (!classFile) {
      // Method not found - return undefined
      return undefined;
    }
    
    // Find method
    const method = classFile.methods.find((m) => {
      const name = this.getConstantPoolString(classFile, m.nameIndex);
      return name === methodName;
    });
    
    if (!method || !method.code) {
      // Method not found or has no code
      return undefined;
    }
    
    // Save current context
    const savedPc = this.context.pc;
    const savedBytecode = this.bytecode;
    const savedMethod = this.context.currentMethod;
    const savedClass = this.context.currentClass;
    
    // Set up new context
    this.context.currentClass = classFile;
    this.context.currentMethod = method;
    this.bytecode = method.code.code;
    this.context.pc = 0;
    this.context.stack = [];
    this.context.locals = new Array(method.code.maxLocals);
    
    // Set arguments
    let localIndex = 0;
    if (objectref !== undefined) {
      this.context.locals[localIndex++] = objectref;
    }
    for (let i = 0; i < args.length && localIndex < this.context.locals.length; i++) {
      this.context.locals[localIndex++] = args[i];
    }
    
    // Execute method
    try {
      const result = this.execute();
      
      // Restore context
      this.context.pc = savedPc;
      this.bytecode = savedBytecode;
      this.context.currentMethod = savedMethod;
      this.context.currentClass = savedClass;
      
      return result;
    } catch (error) {
      // Restore context
      this.context.pc = savedPc;
      this.bytecode = savedBytecode;
      this.context.currentMethod = savedMethod;
      this.context.currentClass = savedClass;
      
      throw error;
    }
  }

  /**
   * Find exception handler for current PC
   */
  private findExceptionHandler(exception: JVMException): { handlerPc: number; catchType?: number } | null {
    if (!this.context.currentMethod?.code) {
      return null;
    }

    const code = this.context.currentMethod.code;
    const currentPc = this.context.pc - 1; // PC was incremented before exception

    // Check exception table
    for (const exceptionInfo of code.exceptions) {
      if (currentPc >= exceptionInfo.startPc && currentPc < exceptionInfo.endPc) {
        // Check if catch type matches
        if (exceptionInfo.catchType === 0) {
          // Catch all (finally)
          return { handlerPc: exceptionInfo.handlerPc };
        }

        // Check if exception type matches
        const catchTypeName = this.getExceptionTypeName(exceptionInfo.catchType);
        if (catchTypeName && this.isExceptionInstanceOf(exception, catchTypeName)) {
          return { handlerPc: exceptionInfo.handlerPc, catchType: exceptionInfo.catchType };
        }
      }
    }

    return null;
  }

  /**
   * Get exception type name from constant pool
   */
  private getExceptionTypeName(catchType: number): string | null {
    if (!this.context.currentClass) {
      return null;
    }

    if (catchType === 0) {
      return null; // Catch all
    }

    const entry = this.context.currentClass.constantPool[catchType];
    if (!entry || entry.tag !== 7) { // Class
      return null;
    }

    const classIndex = entry.value as number;
    return this.getConstantPoolString(this.context.currentClass, classIndex);
  }

  /**
   * Check if exception is instance of given type
   */
  private isExceptionInstanceOf(exception: JVMException, typeName: string): boolean {
    // Check exact match
    if (exception.type === typeName) {
      return true;
    }

    // Check superclass match (java/lang/Throwable, java/lang/Exception, etc.)
    const superTypes = [
      "java/lang/Throwable",
      "java/lang/Exception",
      "java/lang/RuntimeException",
      "java/lang/Error",
    ];

    if (superTypes.includes(typeName)) {
      // Check if exception type is a subclass
      if (typeName === "java/lang/Throwable") {
        return true; // All exceptions extend Throwable
      }
      if (typeName === "java/lang/Exception" && !exception.type.includes("/Error")) {
        return true;
      }
      if (typeName === "java/lang/RuntimeException" && exception.type.includes("/RuntimeException")) {
        return true;
      }
    }

    return false;
  }

  /**
   * Create JVM exception from error
   */
  private createExceptionFromError(error: any): JVMException {
    if (this.isJVMException(error)) {
      return error;
    }

    const message = error instanceof Error ? error.message : String(error);
    const stackTrace: JVMStackTraceFrame[] = [];

    if (error instanceof Error && error.stack) {
      // Parse stack trace
      const lines = error.stack.split("\n");
      for (const line of lines) {
        const match = line.match(/at\s+(.+?)\.(.+?)\s*\((.+?):(\d+)\)/);
        if (match) {
          stackTrace.push({
            className: match[1],
            methodName: match[2],
            fileName: match[3],
            lineNumber: parseInt(match[4]),
          });
        }
      }
    }

    // Add current frame
    if (this.context.currentClass && this.context.currentMethod) {
      const className = this.getConstantPoolString(this.context.currentClass, this.context.currentClass.thisClass);
      const methodName = this.getConstantPoolString(this.context.currentClass, this.context.currentMethod.nameIndex);
      stackTrace.unshift({
        className,
        methodName,
        lineNumber: this.context.pc,
      });
    }

    return this.createException("java/lang/RuntimeException", message, stackTrace);
  }

  /**
   * Create JVM exception
   */
  private createException(type: string, message: string, stackTrace: JVMStackTraceFrame[] = []): JVMException {
    // Add current frame if not provided
    if (stackTrace.length === 0 && this.context.currentClass && this.context.currentMethod) {
      const className = this.getConstantPoolString(this.context.currentClass, this.context.currentClass.thisClass);
      const methodName = this.getConstantPoolString(this.context.currentClass, this.context.currentMethod.nameIndex);
      stackTrace.push({
        className,
        methodName,
        lineNumber: this.context.pc,
      });
    }

    return {
      type,
      message,
      stackTrace,
    };
  }

  /**
   * Check if object is JVM exception
   */
  private isJVMException(obj: any): obj is JVMException {
    return obj && typeof obj === "object" && "type" in obj && "message" in obj && "stackTrace" in obj;
  }
}

