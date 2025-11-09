import { describe, it, expect, beforeEach } from "vitest";
import { JVMInterpreter } from "../../src/engines/jvm";
import { createMockJavaClass } from "../helpers";

describe("JVMInterpreter", () => {
  let interpreter: JVMInterpreter;

  beforeEach(() => {
    interpreter = new JVMInterpreter();
  });

  it("should initialize", () => {
    expect(interpreter).toBeDefined();
  });

  it("should load class", () => {
    const classFile = createMockJavaClass();
    expect(() => interpreter.loadClass("TestClass", classFile)).not.toThrow();
  });

  it("should handle exceptions", () => {
    const classFile = createMockJavaClass();
    interpreter.loadClass("TestClass", classFile);
    
    // Test exception handling
    expect(() => {
      // This would throw if exception handling is not working
      interpreter.executeMethod("TestClass", "testMethod", []);
    }).not.toThrow();
  });
});

