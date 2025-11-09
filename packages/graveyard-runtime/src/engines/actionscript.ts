/**
 * Basic ActionScript v1.0 Interpreter
 * 
 * Supports variables, functions, timeline control, and display object manipulation.
 * Implements ActionScript bytecode execution with support for:
 * - Variable operations
 * - Function definitions (ActionDefineFunction2)
 * - With statements (ActionWith)
 * - Register-based variables (ActionStoreRegister, ActionGetRegister)
 * - Stack operations (ActionPushDuplicate)
 * - Display object property access
 * - Sprite operations (clone, remove, drag)
 * 
 * @example
 * ```typescript
 * const context = {
 *   variables: {},
 *   functions: {},
 *   timeline: { currentFrame: 0, totalFrames: 10, gotoFrame: () => {}, play: () => {}, stop: () => {} }
 * };
 * const interpreter = new ActionScriptInterpreter(context);
 * interpreter.execute(bytecode);
 * ```
 */

export interface ActionScriptContext {
  variables: Record<string, any>;
  functions: Record<string, Function>;
  registers: Record<number, any>; // Register-based variables
  timeline: {
    currentFrame: number;
    totalFrames: number;
    gotoFrame: (frame: number) => void;
    play: () => void;
    stop: () => void;
  };
  // Display object access
  getDisplayObject?: (target: string | number) => any;
  setDisplayObjectProperty?: (target: string | number, property: number, value: any) => void;
  getDisplayObjectProperty?: (target: string | number, property: number) => any;
  // Sprite operations
  cloneSprite?: (depth: number, newDepth: number) => void;
  removeSprite?: (depth: number) => void;
  // Drag operations
  startDrag?: (target: string | number, lockCenter: boolean, left?: number, top?: number, right?: number, bottom?: number) => void;
  stopDrag?: () => void;
  // Current target
  currentTarget?: string | number;
  // With scope stack
  withScopes?: any[];
}

export class ActionScriptInterpreter {
  private context: ActionScriptContext;
  private stack: any[] = [];
  private functionBodies: Map<string, { bytecode: Uint8Array; params: Array<{ name: string; reg: number }>; registerCount: number }> = new Map();

  constructor(context: ActionScriptContext) {
    this.context = context;
    if (!this.context.registers) {
      this.context.registers = {};
    }
    if (!this.context.withScopes) {
      this.context.withScopes = [];
    }
    this.initBuiltins();
  }

  private initBuiltins(): void {
    // Basic built-in functions
    this.context.functions["trace"] = (...args: any[]) => {
      console.log("[ActionScript]", ...args);
    };

    this.context.functions["gotoAndPlay"] = (frame: number) => {
      this.context.timeline.gotoFrame(frame);
      this.context.timeline.play();
    };

    this.context.functions["gotoAndStop"] = (frame: number) => {
      this.context.timeline.gotoFrame(frame);
      this.context.timeline.stop();
    };

    this.context.functions["play"] = () => {
      this.context.timeline.play();
    };

    this.context.functions["stop"] = () => {
      this.context.timeline.stop();
    };

    this.context.functions["_root"] = () => {
      return this.context;
    };

    this.context.functions["_currentframe"] = () => {
      return this.context.timeline.currentFrame;
    };

    this.context.functions["_totalframes"] = () => {
      return this.context.timeline.totalFrames;
    };
  }

  /**
   * Execute ActionScript bytecode
   * This is a simplified interpreter - full implementation would parse actual bytecode
   */
  execute(bytecode: Uint8Array): void {
    // Simplified execution - in a full implementation, this would parse
    // ActionScript bytecode instructions
    // For now, we'll support basic operations through a simplified interface
    
    try {
      // This is a placeholder - real ActionScript bytecode parsing is complex
      // We'll implement a basic instruction set
      this.executeBytecode(bytecode);
    } catch (error) {
      console.error("ActionScript execution error:", error);
    }
  }

  private executeBytecode(bytecode: Uint8Array): void {
    let offset = 0;
    
    while (offset < bytecode.length) {
      const instruction = bytecode[offset];
      offset++;

      switch (instruction) {
        case 0x00: // ActionEnd
          return;
        
        case 0x04: // ActionNextFrame
          this.context.timeline.gotoFrame(this.context.timeline.currentFrame + 1);
          break;
        
        case 0x05: // ActionPreviousFrame
          this.context.timeline.gotoFrame(Math.max(1, this.context.timeline.currentFrame - 1));
          break;
        
        case 0x06: // ActionPlay
          this.context.timeline.play();
          break;
        
        case 0x07: // ActionStop
          this.context.timeline.stop();
          break;
        
        case 0x08: // ActionToggleQuality
          // Quality toggle - not implemented
          break;
        
        case 0x09: // ActionStopSounds
          // Stop sounds - not implemented
          break;
        
        case 0x0a: // ActionAdd
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a + b);
          }
          break;
        
        case 0x0b: // ActionSubtract
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a - b);
          }
          break;
        
        case 0x0c: // ActionMultiply
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a * b);
          }
          break;
        
        case 0x0d: // ActionDivide
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a / b);
          }
          break;
        
        case 0x0e: // ActionEquals
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a === b ? 1 : 0);
          }
          break;
        
        case 0x0f: // ActionLess
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a < b ? 1 : 0);
          }
          break;
        
        case 0x10: // ActionAnd
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a && b ? 1 : 0);
          }
          break;
        
        case 0x11: // ActionOr
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a || b ? 1 : 0);
          }
          break;
        
        case 0x12: // ActionNot
          {
            const a = this.stack.pop();
            this.stack.push(a ? 0 : 1);
          }
          break;
        
        case 0x13: // ActionStringEquals
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(String(a) === String(b) ? 1 : 0);
          }
          break;
        
        case 0x14: // ActionStringLength
          {
            const str = String(this.stack.pop());
            this.stack.push(str.length);
          }
          break;
        
        case 0x15: // ActionStringExtract
          {
            const end = this.stack.pop();
            const start = this.stack.pop();
            const str = String(this.stack.pop());
            this.stack.push(str.substring(start, end));
          }
          break;
        
        case 0x17: // ActionPop
          this.stack.pop();
          break;
        
        case 0x1a: // ActionGetVariable
          {
            const name = this.readString(bytecode, offset);
            offset += name.length + 1;
            
            // Check with scopes first
            let value: any = undefined;
            for (let i = this.context.withScopes!.length - 1; i >= 0; i--) {
              const scope = this.context.withScopes![i];
              if (scope && scope[name] !== undefined) {
                value = scope[name];
                break;
              }
            }
            
            // Fallback to context variables
            if (value === undefined) {
              value = this.context.variables[name] ?? 0;
            }
            
            this.stack.push(value);
          }
          break;
        
        case 0x1b: // ActionSetVariable
          {
            const value = this.stack.pop();
            const name = this.readString(bytecode, offset);
            offset += name.length + 1;
            
            // Check with scopes first
            let set = false;
            for (let i = this.context.withScopes!.length - 1; i >= 0; i--) {
              const scope = this.context.withScopes![i];
              if (scope && typeof scope === "object") {
                scope[name] = value;
                set = true;
                break;
              }
            }
            
            // Fallback to context variables
            if (!set) {
              this.context.variables[name] = value;
            }
          }
          break;
        
        case 0x1c: // ActionSetTarget2
          {
            // Set target for subsequent operations
            const target = this.stack.pop();
            if (this.context.setDisplayObjectProperty) {
              this.context.currentTarget = target;
            }
          }
          break;
        
        case 0x20: // ActionStringAdd
          {
            const b = String(this.stack.pop());
            const a = String(this.stack.pop());
            this.stack.push(a + b);
          }
          break;
        
        case 0x21: // ActionGetProperty
          {
            const property = this.stack.pop();
            const target = this.stack.pop() ?? this.context.currentTarget;
            
            if (this.context.getDisplayObjectProperty && target !== undefined) {
              const value = this.context.getDisplayObjectProperty(target, property);
              this.stack.push(value);
            } else {
              // Fallback: return property value based on property index
              const propValue = this.getPropertyValue(property);
              this.stack.push(propValue);
            }
          }
          break;
        
        case 0x22: // ActionSetProperty
          {
            const value = this.stack.pop();
            const property = this.stack.pop();
            const target = this.stack.pop() ?? this.context.currentTarget;
            
            if (this.context.setDisplayObjectProperty && target !== undefined) {
              this.context.setDisplayObjectProperty(target, property, value);
            } else {
              // Fallback: set property in context
              this.setPropertyValue(property, value);
            }
          }
          break;
        
        case 0x23: // ActionCloneSprite
          {
            const newDepth = this.stack.pop();
            const depth = this.stack.pop();
            
            if (this.context.cloneSprite) {
              this.context.cloneSprite(depth, newDepth);
            }
          }
          break;
        
        case 0x24: // ActionRemoveSprite
          {
            const depth = this.stack.pop();
            
            if (this.context.removeSprite) {
              this.context.removeSprite(depth);
            }
          }
          break;
        
        case 0x25: // ActionTrace
          {
            const value = this.stack.pop();
            this.context.functions["trace"](value);
          }
          break;
        
        case 0x26: // ActionStartDrag
          {
            const target = this.stack.pop() ?? this.context.currentTarget;
            const lockCenter = this.stack.pop() ? true : false;
            const bottom = this.stack.length > 0 ? this.stack.pop() : undefined;
            const right = this.stack.length > 0 ? this.stack.pop() : undefined;
            const top = this.stack.length > 0 ? this.stack.pop() : undefined;
            const left = this.stack.length > 0 ? this.stack.pop() : undefined;
            
            if (this.context.startDrag && target !== undefined) {
              this.context.startDrag(target, lockCenter, left, top, right, bottom);
            }
          }
          break;
        
        case 0x27: // ActionStopDrag
          {
            if (this.context.stopDrag) {
              this.context.stopDrag();
            }
          }
          break;
        
        case 0x2a: // ActionStringLess
          {
            const b = String(this.stack.pop());
            const a = String(this.stack.pop());
            this.stack.push(a < b ? 1 : 0);
          }
          break;
        
        case 0x2b: // ActionThrow
          {
            const error = this.stack.pop();
            throw new Error(String(error));
          }
          break;
        
        case 0x2c: // ActionCastOp
          // Type casting - not implemented
          break;
        
        case 0x2d: // ActionImplementsOp
          // Implements - not implemented
          break;
        
        case 0x30: // ActionRandomNumber
          {
            const max = this.stack.pop();
            this.stack.push(Math.floor(Math.random() * max));
          }
          break;
        
        case 0x31: // ActionMBStringLength
          {
            const str = String(this.stack.pop());
            this.stack.push(str.length);
          }
          break;
        
        case 0x32: // ActionCharToAscii
          {
            const str = String(this.stack.pop());
            this.stack.push(str.charCodeAt(0) || 0);
          }
          break;
        
        case 0x33: // ActionAsciiToChar
          {
            const code = this.stack.pop();
            this.stack.push(String.fromCharCode(code));
          }
          break;
        
        case 0x34: // ActionGetTime
          {
            this.stack.push(Date.now());
          }
          break;
        
        case 0x35: // ActionMBStringExtract
          {
            const end = this.stack.pop();
            const start = this.stack.pop();
            const str = String(this.stack.pop());
            this.stack.push(str.substring(start, end));
          }
          break;
        
        case 0x36: // ActionMBCharToAscii
          {
            const str = String(this.stack.pop());
            this.stack.push(str.charCodeAt(0) || 0);
          }
          break;
        
        case 0x37: // ActionMBAsciiToChar
          {
            const code = this.stack.pop();
            this.stack.push(String.fromCharCode(code));
          }
          break;
        
        case 0x3a: // ActionDelete
          {
            const name = this.readString(bytecode, offset);
            offset += name.length + 1;
            delete this.context.variables[name];
          }
          break;
        
        case 0x3b: // ActionDelete2
          {
            const obj = this.stack.pop();
            const name = String(this.stack.pop());
            if (obj && typeof obj === "object") {
              delete obj[name];
            }
          }
          break;
        
        case 0x3c: // ActionDefineLocal
          {
            const value = this.stack.pop();
            const name = this.readString(bytecode, offset);
            offset += name.length + 1;
            this.context.variables[name] = value;
          }
          break;
        
        case 0x3d: // ActionCallFunction
          {
            const name = this.readString(bytecode, offset);
            offset += name.length + 1;
            const numArgs = this.stack.pop();
            const args: any[] = [];
            for (let i = 0; i < numArgs; i++) {
              args.unshift(this.stack.pop());
            }
            
            const func = this.context.functions[name];
            if (func) {
              const result = func(...args);
              if (result !== undefined) {
                this.stack.push(result);
              }
            }
          }
          break;
        
        case 0x3e: // ActionReturn
          {
            const value = this.stack.pop();
            return value;
          }
          break;
        
        case 0x3f: // ActionModulo
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a % b);
          }
          break;
        
        case 0x40: // ActionNewObject
          {
            const name = this.readString(bytecode, offset);
            offset += name.length + 1;
            const numArgs = this.stack.pop();
            const args: any[] = [];
            for (let i = 0; i < numArgs; i++) {
              args.unshift(this.stack.pop());
            }
            
            // Create new object - simplified
            this.stack.push({});
          }
          break;
        
        case 0x41: // ActionDefineLocal2
          {
            const name = this.readString(bytecode, offset);
            offset += name.length + 1;
            this.context.variables[name] = 0;
          }
          break;
        
        case 0x42: // ActionInitArray
          {
            const numElements = this.stack.pop();
            const elements: any[] = [];
            for (let i = 0; i < numElements; i++) {
              elements.unshift(this.stack.pop());
            }
            this.stack.push(elements);
          }
          break;
        
        case 0x43: // ActionInitObject
          {
            const numProperties = this.stack.pop();
            const obj: Record<string, any> = {};
            for (let i = 0; i < numProperties; i++) {
              const value = this.stack.pop();
              const name = String(this.stack.pop());
              obj[name] = value;
            }
            this.stack.push(obj);
          }
          break;
        
        case 0x44: // ActionTypeOf
          {
            const value = this.stack.pop();
            this.stack.push(typeof value);
          }
          break;
        
        case 0x45: // ActionTargetPath
          {
            // Get target path - simplified
            this.stack.push("");
          }
          break;
        
        case 0x46: // ActionEnumerate
          {
            const obj = this.stack.pop();
            if (obj && typeof obj === "object") {
              const keys = Object.keys(obj);
              this.stack.push(keys.length);
              for (const key of keys) {
                this.stack.push(key);
              }
            } else {
              this.stack.push(0);
            }
          }
          break;
        
        case 0x47: // ActionAdd2
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a + b);
          }
          break;
        
        case 0x48: // ActionLess2
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a < b ? 1 : 0);
          }
          break;
        
        case 0x49: // ActionEquals2
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a === b ? 1 : 0);
          }
          break;
        
        case 0x4a: // ActionToNumber
          {
            const value = this.stack.pop();
            this.stack.push(Number(value));
          }
          break;
        
        case 0x4b: // ActionToString
          {
            const value = this.stack.pop();
            this.stack.push(String(value));
          }
          break;
        
        case 0x4c: // ActionPushDuplicate
          {
            const value = this.stack[this.stack.length - 1];
            this.stack.push(value);
          }
          break;
        
        case 0x4d: // ActionStackSwap
          {
            const a = this.stack.pop();
            const b = this.stack.pop();
            this.stack.push(a);
            this.stack.push(b);
          }
          break;
        
        case 0x4e: // ActionGetMember
          {
            const name = String(this.stack.pop());
            const obj = this.stack.pop();
            if (obj && typeof obj === "object") {
              this.stack.push(obj[name] ?? 0);
            } else {
              this.stack.push(0);
            }
          }
          break;
        
        case 0x4f: // ActionSetMember
          {
            const value = this.stack.pop();
            const name = String(this.stack.pop());
            const obj = this.stack.pop();
            if (obj && typeof obj === "object") {
              obj[name] = value;
            }
          }
          break;
        
        case 0x50: // ActionIncrement
          {
            const value = this.stack.pop();
            this.stack.push(value + 1);
          }
          break;
        
        case 0x51: // ActionDecrement
          {
            const value = this.stack.pop();
            this.stack.push(value - 1);
          }
          break;
        
        case 0x52: // ActionCallMethod
          {
            const name = this.readString(bytecode, offset);
            offset += name.length + 1;
            const numArgs = this.stack.pop();
            const args: any[] = [];
            for (let i = 0; i < numArgs; i++) {
              args.unshift(this.stack.pop());
            }
            const obj = this.stack.pop();
            
            if (obj && typeof obj === "object" && typeof obj[name] === "function") {
              const result = obj[name](...args);
              if (result !== undefined) {
                this.stack.push(result);
              }
            }
          }
          break;
        
        case 0x53: // ActionNewMethod
          {
            const name = this.readString(bytecode, offset);
            offset += name.length + 1;
            const numArgs = this.stack.pop();
            const args: any[] = [];
            for (let i = 0; i < numArgs; i++) {
              args.unshift(this.stack.pop());
            }
            const obj = this.stack.pop();
            
            // Create new method - simplified
            if (obj && typeof obj === "object") {
              obj[name] = (...methodArgs: any[]) => {
                // Method implementation
                return 0;
              };
            }
          }
          break;
        
        case 0x54: // ActionInstanceOf
          {
            const obj = this.stack.pop();
            const constructor = this.stack.pop();
            // Instance check - simplified
            this.stack.push(0);
          }
          break;
        
        case 0x55: // ActionEnumerate2
          {
            const obj = this.stack.pop();
            if (obj && typeof obj === "object") {
              const keys = Object.keys(obj);
              for (const key of keys) {
                this.stack.push(key);
              }
              this.stack.push(keys.length);
            } else {
              this.stack.push(0);
            }
          }
          break;
        
        case 0x60: // ActionStrictEquals
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a === b ? 1 : 0);
          }
          break;
        
        case 0x61: // ActionGreater
          {
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push(a > b ? 1 : 0);
          }
          break;
        
        case 0x62: // ActionStringGreater
          {
            const b = String(this.stack.pop());
            const a = String(this.stack.pop());
            this.stack.push(a > b ? 1 : 0);
          }
          break;
        
        case 0x63: // ActionExtends
          // Extends - not implemented
          break;
        
        case 0x64: // ActionGotoFrame
          {
            const frame = this.stack.pop();
            this.context.timeline.gotoFrame(frame);
          }
          break;
        
        case 0x65: // ActionGetURL
          {
            const url = String(this.stack.pop());
            const target = String(this.stack.pop());
            // URL navigation - simplified
            console.log(`[ActionScript] GetURL: ${url} (target: ${target})`);
          }
          break;
        
        case 0x66: // ActionStoreRegister
          {
            const register = bytecode[offset];
            offset++;
            const value = this.stack.pop();
            this.context.registers[register] = value;
          }
          break;
        
        case 0x5d: // ActionGetRegister
          {
            const register = bytecode[offset];
            offset++;
            this.stack.push(this.context.registers[register] ?? 0);
          }
          break;
        
        case 0x67: // ActionConstantPool
          {
            const count = this.readUint16(bytecode, offset);
            offset += 2;
            const pool: string[] = [];
            for (let i = 0; i < count; i++) {
              const str = this.readString(bytecode, offset);
              offset += str.length + 1;
              pool.push(str);
            }
            // Store constant pool - simplified
            this.context.variables["_constantPool"] = pool;
          }
          break;
        
        case 0x68: // ActionPush
          {
            const type = bytecode[offset];
            offset++;
            
            switch (type) {
              case 0: // String
                {
                  const str = this.readString(bytecode, offset);
                  offset += str.length + 1;
                  this.stack.push(str);
                }
                break;
              
              case 1: // Float
                {
                  const value = this.readFloat32(bytecode, offset);
                  offset += 4;
                  this.stack.push(value);
                }
                break;
              
              case 2: // Null
                this.stack.push(null);
                break;
              
              case 3: // Undefined
                this.stack.push(undefined);
                break;
              
              case 4: // Register
                {
                  const reg = bytecode[offset];
                  offset++;
                  this.stack.push(this.context.variables[`_r${reg}`] ?? 0);
                }
                break;
              
              case 5: // Boolean
                {
                  const value = bytecode[offset];
                  offset++;
                  this.stack.push(value !== 0);
                }
                break;
              
              case 6: // Double
                {
                  const value = this.readFloat64(bytecode, offset);
                  offset += 8;
                  this.stack.push(value);
                }
                break;
              
              case 7: // Integer
                {
                  const value = this.readInt32(bytecode, offset);
                  offset += 4;
                  this.stack.push(value);
                }
                break;
              
              case 8: // Constant8
                {
                  const index = bytecode[offset];
                  offset++;
                  const pool = this.context.variables["_constantPool"] as string[];
                  if (pool && pool[index]) {
                    this.stack.push(pool[index]);
                  } else {
                    this.stack.push("");
                  }
                }
                break;
              
              case 9: // Constant16
                {
                  const index = this.readUint16(bytecode, offset);
                  offset += 2;
                  const pool = this.context.variables["_constantPool"] as string[];
                  if (pool && pool[index]) {
                    this.stack.push(pool[index]);
                  } else {
                    this.stack.push("");
                  }
                }
                break;
            }
          }
          break;
        
        case 0x69: // ActionJump
          {
            const jumpOffset = this.readInt16(bytecode, offset);
            offset += 2; // Skip the jump offset bytes
            offset += jumpOffset; // Jump relative
          }
          break;
        
        case 0x6a: // ActionGetURL2
          {
            const flags = bytecode[offset];
            offset++;
            const url = String(this.stack.pop());
            // URL navigation - simplified
            console.log(`[ActionScript] GetURL2: ${url}`);
          }
          break;
        
        case 0x6b: // ActionDefineFunction
          {
            const name = this.readString(bytecode, offset);
            offset += name.length + 1;
            const numParams = this.readUint16(bytecode, offset);
            offset += 2;
            const params: string[] = [];
            for (let i = 0; i < numParams; i++) {
              const param = this.readString(bytecode, offset);
              offset += param.length + 1;
              params.push(param);
            }
            const codeSize = this.readUint16(bytecode, offset);
            offset += 2;
            
            // Define function - simplified
            this.context.functions[name] = (...args: any[]) => {
              // Function execution
              return 0;
            };
            
            offset += codeSize; // Skip function body for now
          }
          break;
        
        case 0x7a: // ActionGotoFrame2
          {
            const flags = bytecode[offset];
            offset++;
            if (flags & 0x01) {
              const frame = this.stack.pop();
              this.context.timeline.gotoFrame(frame);
            }
            if (flags & 0x02) {
              const scene = String(this.stack.pop());
              // Scene navigation - not implemented
            }
          }
          break;
        
        case 0x7d: // ActionWaitForFrame
          {
            const frame = this.readUint16(bytecode, offset);
            offset += 2;
            const skipCount = this.readUint16(bytecode, offset);
            offset += 2;
            // Wait for frame - simplified
          }
          break;
        
        case 0x7e: // ActionSetTarget
          {
            const target = this.readString(bytecode, offset);
            offset += target.length + 1;
            // Set target - simplified
          }
          break;
        
        case 0x7f: // ActionGoToLabel
          {
            const label = this.readString(bytecode, offset);
            offset += label.length + 1;
            // Goto label - simplified
          }
          break;
        
        case 0x81: // ActionWaitForFrame2
          {
            const skipCount = bytecode[offset];
            offset++;
            // Wait for frame - simplified
          }
          break;
        
        case 0x83: // ActionIf
          {
            const condition = this.stack.pop();
            const jumpOffset = this.readInt16(bytecode, offset);
            offset += 2; // Skip the jump offset bytes
            if (!condition) {
              offset += jumpOffset; // Jump if false
            }
          }
          break;
        
        case 0x87: // ActionWith
          {
            const codeSize = this.readUint16(bytecode, offset);
            offset += 2;
            const obj = this.stack.pop();
            
            // Push with scope
            this.context.withScopes!.push(obj || {});
            
            // Execute with block bytecode
            const withStartOffset = offset;
            const withEndOffset = offset + codeSize;
            const withBytecode = bytecode.slice(withStartOffset, withEndOffset);
            
            try {
              // Execute bytecode within with scope
              this.executeBytecode(withBytecode);
            } finally {
              // Pop with scope
              this.context.withScopes!.pop();
            }
            
            offset = withEndOffset;
          }
          break;
        
        case 0x88: // ActionPushData
          {
            const count = this.readUint16(bytecode, offset);
            offset += 2;
            for (let i = 0; i < count; i++) {
              const type = bytecode[offset];
              offset++;
              // Push data based on type - simplified
              this.stack.push(0);
            }
          }
          break;
        
        case 0x89: // ActionBranchAlways
          {
            const jumpOffset = this.readInt16(bytecode, offset);
            offset += 2; // Skip the jump offset bytes
            offset += jumpOffset; // Jump
          }
          break;
        
        case 0x8a: // ActionGetURL3
          {
            const flags = bytecode[offset];
            offset++;
            const url = String(this.stack.pop());
            // URL navigation - simplified
            console.log(`[ActionScript] GetURL3: ${url}`);
          }
          break;
        
        case 0x8b: // ActionDefineFunction2
          {
            const name = this.readString(bytecode, offset);
            offset += name.length + 1;
            const numParams = this.readUint16(bytecode, offset);
            offset += 2;
            const registerCount = bytecode[offset];
            offset++;
            const flags = this.readUint16(bytecode, offset);
            offset += 2;
            
            const params: Array<{ name: string; reg: number }> = [];
            for (let i = 0; i < numParams; i++) {
              const paramName = this.readString(bytecode, offset);
              offset += paramName.length + 1;
              const reg = bytecode[offset];
              offset++;
              params.push({ name: paramName, reg });
            }
            
            const codeSize = this.readUint16(bytecode, offset);
            offset += 2;
            
            // Extract function body bytecode
            const functionBody = bytecode.slice(offset, offset + codeSize);
            
            // Store function definition
            this.functionBodies.set(name, {
              bytecode: functionBody,
              params,
              registerCount,
            });
            
            // Define function with proper execution
            this.context.functions[name] = (...args: any[]) => {
              // Save current context
              const savedRegisters = { ...this.context.registers };
              const savedStack = [...this.stack];
              
              try {
                // Set up function context
                const funcDef = this.functionBodies.get(name);
                if (!funcDef) {
                  return 0;
                }
                
                // Initialize registers
                for (let i = 0; i < funcDef.registerCount; i++) {
                  this.context.registers[i] = 0;
                }
                
                // Set parameter values in registers
                for (let i = 0; i < funcDef.params.length && i < args.length; i++) {
                  const param = funcDef.params[i];
                  this.context.registers[param.reg] = args[i];
                  // Also set as variable for compatibility
                  this.context.variables[param.name] = args[i];
                }
                
                // Execute function body
                this.executeBytecode(funcDef.bytecode);
                
                // Return value from stack
                const result = this.stack.length > 0 ? this.stack.pop() : undefined;
                
                // Restore context
                this.context.registers = savedRegisters;
                this.stack = savedStack;
                
                return result;
              } catch (error) {
                // Restore context on error
                this.context.registers = savedRegisters;
                this.stack = savedStack;
                throw error;
              }
            };
            
            offset += codeSize;
          }
          break;
        
        case 0x8c: // ActionTry
          {
            const catchInRegister = bytecode[offset];
            offset++;
            const finallyInRegister = bytecode[offset];
            offset++;
            const trySize = this.readUint16(bytecode, offset);
            offset += 2;
            const catchSize = this.readUint16(bytecode, offset);
            offset += 2;
            const finallySize = this.readUint16(bytecode, offset);
            offset += 2;
            
            // Try-catch-finally - simplified
            try {
              // Execute try block
              offset += trySize;
            } catch (error) {
              if (catchInRegister !== 0) {
                this.context.variables[`_r${catchInRegister}`] = error;
              }
              offset += catchSize;
            } finally {
              if (finallyInRegister !== 0) {
                // Finally block
              }
              offset += finallySize;
            }
          }
          break;
        
        case 0x8d: // ActionThrow
          {
            const error = this.stack.pop();
            throw new Error(String(error));
          }
          break;
        
        case 0x8e: // ActionPushConstant
          {
            const index = bytecode[offset];
            offset++;
            const pool = this.context.variables["_constantPool"] as string[];
            if (pool && pool[index]) {
              this.stack.push(pool[index]);
            } else {
              this.stack.push("");
            }
          }
          break;
        
        case 0x96: // ActionPushConstant16
          {
            const index = this.readUint16(bytecode, offset);
            offset += 2;
            const pool = this.context.variables["_constantPool"] as string[];
            if (pool && pool[index]) {
              this.stack.push(pool[index]);
            } else {
              this.stack.push("");
            }
          }
          break;
        
        default:
          // Unknown instruction - skip silently
          // Note: Some instructions (like 0x70) are AS3-specific and not supported in AS1/2
          // We'll skip them without warning to reduce console noise
          break;
      }
    }
  }

  private readString(bytecode: Uint8Array, offset: number): string {
    let str = "";
    while (offset < bytecode.length && bytecode[offset] !== 0) {
      str += String.fromCharCode(bytecode[offset]);
      offset++;
    }
    return str;
  }

  private readUint16(bytecode: Uint8Array, offset: number): number {
    return (bytecode[offset] << 8) | bytecode[offset + 1];
  }

  private readInt16(bytecode: Uint8Array, offset: number): number {
    const value = this.readUint16(bytecode, offset);
    return value > 32767 ? value - 65536 : value;
  }

  private readFloat32(bytecode: Uint8Array, offset: number): number {
    const view = new DataView(bytecode.buffer, bytecode.byteOffset + offset, 4);
    return view.getFloat32(0, false); // Big-endian
  }

  private readFloat64(bytecode: Uint8Array, offset: number): number {
    const view = new DataView(bytecode.buffer, bytecode.byteOffset + offset, 8);
    return view.getFloat64(0, false); // Big-endian
  }

  private readInt32(bytecode: Uint8Array, offset: number): number {
    return (
      (bytecode[offset] << 24) |
      (bytecode[offset + 1] << 16) |
      (bytecode[offset + 2] << 8) |
      bytecode[offset + 3]
    );
  }

  /**
   * Get property value by property index
   * Property indices match Flash property constants
   */
  private getPropertyValue(property: number): any {
    // Flash property constants
    switch (property) {
      case 0x00: // X
        return this.context.variables["_x"] ?? 0;
      case 0x01: // Y
        return this.context.variables["_y"] ?? 0;
      case 0x02: // XScale
        return this.context.variables["_xscale"] ?? 100;
      case 0x03: // YScale
        return this.context.variables["_yscale"] ?? 100;
      case 0x04: // CurrentFrame
        return this.context.timeline.currentFrame;
      case 0x05: // TotalFrames
        return this.context.timeline.totalFrames;
      case 0x06: // Alpha
        return this.context.variables["_alpha"] ?? 100;
      case 0x07: // Visible
        return this.context.variables["_visible"] ?? 1;
      case 0x08: // Width
        return this.context.variables["_width"] ?? 0;
      case 0x09: // Height
        return this.context.variables["_height"] ?? 0;
      case 0x0a: // Rotation
        return this.context.variables["_rotation"] ?? 0;
      case 0x0b: // Target
        return this.context.currentTarget ?? "";
      case 0x0c: // FramesLoaded
        return this.context.timeline.totalFrames;
      case 0x0d: // Name
        return this.context.variables["_name"] ?? "";
      case 0x0e: // DropTarget
        return "";
      case 0x0f: // Url
        return "";
      case 0x10: // HighQuality
        return 1;
      case 0x11: // FocusRect
        return 1;
      case 0x12: // SoundBufTime
        return 0;
      default:
        return 0;
    }
  }

  /**
   * Set property value by property index
   */
  private setPropertyValue(property: number, value: any): void {
    // Flash property constants
    switch (property) {
      case 0x00: // X
        this.context.variables["_x"] = value;
        break;
      case 0x01: // Y
        this.context.variables["_y"] = value;
        break;
      case 0x02: // XScale
        this.context.variables["_xscale"] = value;
        break;
      case 0x03: // YScale
        this.context.variables["_yscale"] = value;
        break;
      case 0x06: // Alpha
        this.context.variables["_alpha"] = Math.max(0, Math.min(100, value));
        break;
      case 0x07: // Visible
        this.context.variables["_visible"] = value ? 1 : 0;
        break;
      case 0x08: // Width
        this.context.variables["_width"] = value;
        break;
      case 0x09: // Height
        this.context.variables["_height"] = value;
        break;
      case 0x0a: // Rotation
        this.context.variables["_rotation"] = value;
        break;
      case 0x0d: // Name
        this.context.variables["_name"] = String(value);
        break;
    }
  }
}

