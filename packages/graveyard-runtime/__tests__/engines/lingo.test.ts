import { describe, it, expect, beforeEach } from "vitest";
import { LingoInterpreter, LingoContext } from "../../src/engines/lingo";

describe("LingoInterpreter", () => {
  let interpreter: LingoInterpreter;
  let context: LingoContext;

  beforeEach(() => {
    context = {
      variables: {},
      functions: {},
      sprites: new Map(),
      stage: {
        width: 800,
        height: 600,
      },
      timeline: {
        currentFrame: 1,
        totalFrames: 10,
        gotoFrame: () => {},
        play: () => {},
        stop: () => {},
        pause: () => {},
      },
    };
    interpreter = new LingoInterpreter(context);
  });

  it("should initialize", () => {
    expect(interpreter).toBeDefined();
  });

  it("should execute Lingo script", () => {
    const script = "put 42";
    expect(() => interpreter.execute(script)).not.toThrow();
  });

  it("should handle go statement", () => {
    const script = "go 5";
    expect(() => interpreter.execute(script)).not.toThrow();
  });

  it("should handle sprite property access", () => {
    context.sprites.set(1, { x: 100, y: 200, visible: true });
    const script = "put the locH of sprite(1)";
    expect(() => interpreter.execute(script)).not.toThrow();
  });
});

