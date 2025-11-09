/**
 * ActionScript v2.0 Interpreter
 * 
 * Extends ActionScript v1.0 with class-based programming support.
 * Supports:
 * - Class definitions
 * - Inheritance
 * - Interfaces
 * - Type annotations
 * - Static members
 * 
 * @example
 * ```typescript
 * const context = {
 *   variables: {},
 *   functions: {},
 *   classes: {},
 *   timeline: { currentFrame: 0, totalFrames: 10, gotoFrame: () => {}, play: () => {}, stop: () => {} }
 * };
 * const interpreter = new ActionScriptV2Interpreter(context);
 * interpreter.execute(bytecode);
 * ```
 */

import { ActionScriptContext, ActionScriptInterpreter } from "./actionscript";

export interface ActionScriptV2Context extends ActionScriptContext {
  classes: Record<string, ActionScriptV2Class>;
  interfaces: Record<string, ActionScriptV2Interface>;
  currentClass?: string;
}

export interface ActionScriptV2Class {
  name: string;
  superClass?: string;
  implements: string[];
  staticMembers: Record<string, any>;
  instanceMembers: Record<string, any>;
  constructor?: Function;
  methods: Record<string, Function>;
  properties: Record<string, { getter?: Function; setter?: Function }>;
}

export interface ActionScriptV2Interface {
  name: string;
  extends: string[];
  methods: Record<string, { params: string[]; returnType?: string }>;
  properties: Record<string, { type?: string }>;
}

export class ActionScriptV2Interpreter extends ActionScriptInterpreter {
  private v2Context: ActionScriptV2Context;

  constructor(context: ActionScriptV2Context) {
    super(context);
    this.v2Context = context;
    
    if (!this.v2Context.classes) {
      this.v2Context.classes = {};
    }
    if (!this.v2Context.interfaces) {
      this.v2Context.interfaces = {};
    }
    
    this.initV2Builtins();
  }

  /**
   * Initialize ActionScript v2.0 built-in functions
   */
  private initV2Builtins(): void {
    // Class-related functions
    this.v2Context.functions["Class"] = (name: string) => {
      return this.v2Context.classes[name];
    };

    // Type checking
    this.v2Context.functions["instanceof"] = (obj: any, className: string) => {
      const cls = this.v2Context.classes[className];
      if (!cls) return false;
      
      // Check if object is instance of class or its superclass
      let currentClass = obj.constructor?.name || obj.__class__;
      while (currentClass) {
        if (currentClass === className) return true;
        const current = this.v2Context.classes[currentClass];
        if (!current || !current.superClass) break;
        currentClass = current.superClass;
      }
      return false;
    };

    // Type casting
    this.v2Context.functions["as"] = (obj: any, type: string) => {
      // Type casting in AS2 is mostly compile-time, but we can do runtime checks
      if (type === "String") return String(obj);
      if (type === "Number") return Number(obj);
      if (type === "Boolean") return Boolean(obj);
      if (type === "Object") return Object(obj);
      if (type === "Array") return Array.isArray(obj) ? obj : null;
      
      // Class type casting
      const cls = this.v2Context.classes[type];
      if (cls && this.v2Context.functions["instanceof"](obj, type)) {
        return obj;
      }
      return null;
    };
  }

  /**
   * Define a class
   */
  defineClass(
    name: string,
    superClass?: string,
    implements: string[] = [],
    constructor?: Function,
    methods: Record<string, Function> = {},
    properties: Record<string, { getter?: Function; setter?: Function }> = {},
    staticMembers: Record<string, any> = {}
  ): void {
    const cls: ActionScriptV2Class = {
      name,
      superClass,
      implements,
      staticMembers,
      instanceMembers: {},
      constructor,
      methods,
      properties,
    };

    this.v2Context.classes[name] = cls;

    // Create constructor function
    const Constructor = function(this: any, ...args: any[]) {
      if (cls.constructor) {
        cls.constructor.apply(this, args);
      }
      
      // Initialize instance members
      Object.assign(this, cls.instanceMembers);
      
      // Set class reference
      this.__class__ = name;
    };

    // Set prototype from superclass
    if (superClass) {
      const superCls = this.v2Context.classes[superClass];
      if (superCls) {
        Constructor.prototype = Object.create(superCls.constructor?.prototype || Object.prototype);
      }
    }

    // Add methods to prototype
    for (const [methodName, method] of Object.entries(methods)) {
      Constructor.prototype[methodName] = method;
    }

    // Add static members
    for (const [memberName, member] of Object.entries(staticMembers)) {
      (Constructor as any)[memberName] = member;
    }

    // Store constructor
    cls.constructor = Constructor as any;
    
    // Make class available globally
    this.v2Context.variables[name] = Constructor;
    this.v2Context.functions[name] = Constructor;
  }

  /**
   * Define an interface
   */
  defineInterface(
    name: string,
    extends: string[] = [],
    methods: Record<string, { params: string[]; returnType?: string }> = {},
    properties: Record<string, { type?: string }> = {}
  ): void {
    const iface: ActionScriptV2Interface = {
      name,
      extends,
      methods,
      properties,
    };

    this.v2Context.interfaces[name] = iface;
  }

  /**
   * Create instance of a class
   */
  createInstance(className: string, ...args: any[]): any {
    const cls = this.v2Context.classes[className];
    if (!cls || !cls.constructor) {
      throw new Error(`Class ${className} not found`);
    }

    const instance = new (cls.constructor as any)(...args);
    return instance;
  }

  /**
   * Check if class implements interface
   */
  implementsInterface(className: string, interfaceName: string): boolean {
    const cls = this.v2Context.classes[className];
    const iface = this.v2Context.interfaces[interfaceName];
    
    if (!cls || !iface) return false;
    
    // Check direct implementation
    if (cls.implements.includes(interfaceName)) return true;
    
    // Check extended interfaces
    for (const extended of iface.extends) {
      if (this.implementsInterface(className, extended)) return true;
    }
    
    // Check superclass
    if (cls.superClass) {
      return this.implementsInterface(cls.superClass, interfaceName);
    }
    
    return false;
  }

  /**
   * Execute ActionScript v2.0 bytecode
   * Extends v1.0 bytecode with additional opcodes
   */
  execute(bytecode: Uint8Array): void {
    // For now, delegate to v1.0 interpreter
    // In a full implementation, we would parse AS2-specific bytecode
    super.execute(bytecode);
  }
}

