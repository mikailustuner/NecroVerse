import { describe, it, expect, beforeEach } from "vitest";
import { ActionScriptInterpreter, ActionScriptContext } from "../../src/engines/actionscript";

describe("ActionScriptInterpreter", () => {
  let interpreter: ActionScriptInterpreter;
  let context: ActionScriptContext;

  beforeEach(() => {
    context = {
      variables: {},
      functions: {},
      registers: {},
      withScopes: [],
      timeline: {
        currentFrame: 1,
        totalFrames: 10,
        gotoFrame: () => {},
        play: () => {},
        stop: () => {},
      },
    };
    interpreter = new ActionScriptInterpreter(context);
  });

  it("should initialize", () => {
    expect(interpreter).toBeDefined();
  });

  it("should execute bytecode", () => {
    const bytecode = new Uint8Array([0x00]); // ActionEnd
    expect(() => interpreter.execute(bytecode)).not.toThrow();
  });

  it("should handle ActionPushDuplicate", () => {
    const bytecode = new Uint8Array([
      0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Push 0
      0x4c, // ActionPushDuplicate
      0x00, // ActionEnd
    ]);
    expect(() => interpreter.execute(bytecode)).not.toThrow();
  });

  it("should handle ActionStoreRegister", () => {
    const bytecode = new Uint8Array([
      0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Push 0
      0x66, 0x01, // ActionStoreRegister 1
      0x00, // ActionEnd
    ]);
    expect(() => interpreter.execute(bytecode)).not.toThrow();
  });
});

