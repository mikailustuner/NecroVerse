/**
 * ActionScript Debugger
 * Provides debugging capabilities for ActionScript execution
 */

export interface Breakpoint {
  id: string;
  line: number;
  enabled: boolean;
  condition?: string;
}

export interface Variable {
  name: string;
  value: any;
  type: string;
  scope: string;
}

export interface CallStackFrame {
  functionName: string;
  fileName?: string;
  lineNumber?: number;
  variables: Variable[];
}

export interface WatchExpression {
  id: string;
  expression: string;
  value?: any;
  error?: string;
}

export interface DebuggerState {
  isRunning: boolean;
  isPaused: boolean;
  currentFrame: number;
  breakpoints: Breakpoint[];
  callStack: CallStackFrame[];
  variables: Variable[];
  watchExpressions: WatchExpression[];
}

/**
 * ActionScript Debugger
 */
export class ActionScriptDebugger {
  private state: DebuggerState = {
    isRunning: false,
    isPaused: false,
    currentFrame: 0,
    breakpoints: [],
    callStack: [],
    variables: [],
    watchExpressions: [],
  };
  private onBreakpoint?: (frame: CallStackFrame) => void;
  private onStep?: () => void;
  private stepMode: "none" | "over" | "into" | "out" = "none";
  private stepDepth: number = 0;

  /**
   * Set breakpoint
   */
  setBreakpoint(line: number, condition?: string): string {
    const id = `bp_${Date.now()}_${line}`;
    const breakpoint: Breakpoint = {
      id,
      line,
      enabled: true,
      condition,
    };
    this.state.breakpoints.push(breakpoint);
    return id;
  }

  /**
   * Remove breakpoint
   */
  removeBreakpoint(id: string): void {
    const index = this.state.breakpoints.findIndex((bp) => bp.id === id);
    if (index >= 0) {
      this.state.breakpoints.splice(index, 1);
    }
  }

  /**
   * Toggle breakpoint
   */
  toggleBreakpoint(id: string): void {
    const breakpoint = this.state.breakpoints.find((bp) => bp.id === id);
    if (breakpoint) {
      breakpoint.enabled = !breakpoint.enabled;
    }
  }

  /**
   * Check if should break at line
   */
  shouldBreak(line: number, context?: Record<string, any>): boolean {
    if (!this.state.isRunning || this.state.isPaused) {
      return false;
    }

    const breakpoint = this.state.breakpoints.find(
      (bp) => bp.line === line && bp.enabled
    );

    if (!breakpoint) {
      return false;
    }

    // Check condition if present
    if (breakpoint.condition && context) {
      try {
        // Evaluate condition
        const result = this.evaluateCondition(breakpoint.condition, context);
        if (!result) {
          return false;
        }
      } catch (error) {
        console.error("Error evaluating breakpoint condition:", error);
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(condition: string, context: Record<string, any>): boolean {
    // Simple condition evaluation
    // In a full implementation, this would parse and evaluate the condition
    try {
      // Replace variables with context values
      let evaluated = condition;
      for (const [key, value] of Object.entries(context)) {
        evaluated = evaluated.replace(new RegExp(`\\b${key}\\b`, "g"), JSON.stringify(value));
      }
      return eval(evaluated);
    } catch (error) {
      return false;
    }
  }

  /**
   * Pause execution
   */
  pause(): void {
    this.state.isPaused = true;
  }

  /**
   * Resume execution
   */
  resume(): void {
    this.state.isPaused = false;
  }

  /**
   * Step over
   */
  stepOver(): void {
    this.stepMode = "over";
    this.state.isPaused = false;
    if (this.onStep) {
      this.onStep();
    }
  }

  /**
   * Step into
   */
  stepInto(): void {
    this.stepMode = "into";
    this.stepDepth = this.state.callStack.length;
    this.state.isPaused = false;
    if (this.onStep) {
      this.onStep();
    }
  }

  /**
   * Step out
   */
  stepOut(): void {
    this.stepMode = "out";
    this.stepDepth = Math.max(0, this.state.callStack.length - 1);
    this.state.isPaused = false;
    if (this.onStep) {
      this.onStep();
    }
  }

  /**
   * Check if should pause for step
   */
  shouldPauseForStep(currentDepth: number): boolean {
    if (this.stepMode === "none") {
      return false;
    }

    if (this.stepMode === "over") {
      // Pause at same depth
      if (currentDepth <= this.state.callStack.length) {
        this.stepMode = "none";
        return true;
      }
      return false;
    }

    if (this.stepMode === "into") {
      // Pause when entering deeper
      if (currentDepth > this.stepDepth) {
        this.stepMode = "none";
        return true;
      }
      return false;
    }

    if (this.stepMode === "out") {
      // Pause when returning to shallower depth
      if (currentDepth <= this.stepDepth) {
        this.stepMode = "none";
        return true;
      }
      return false;
    }

    return false;
  }

  /**
   * Add watch expression
   */
  addWatchExpression(expression: string): string {
    const id = `watch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const watch: WatchExpression = {
      id,
      expression,
    };
    this.state.watchExpressions.push(watch);
    return id;
  }

  /**
   * Remove watch expression
   */
  removeWatchExpression(id: string): void {
    const index = this.state.watchExpressions.findIndex((w) => w.id === id);
    if (index >= 0) {
      this.state.watchExpressions.splice(index, 1);
    }
  }

  /**
   * Evaluate watch expressions
   */
  evaluateWatchExpressions(context: Record<string, any>): void {
    for (const watch of this.state.watchExpressions) {
      try {
        watch.value = this.evaluateExpression(watch.expression, context);
        watch.error = undefined;
      } catch (error) {
        watch.value = undefined;
        watch.error = error instanceof Error ? error.message : String(error);
      }
    }
  }

  /**
   * Evaluate expression in context
   */
  private evaluateExpression(expression: string, context: Record<string, any>): any {
    // Simple expression evaluation
    // In a full implementation, this would parse and evaluate the expression safely
    try {
      // Replace variables with context values
      let evaluated = expression;
      for (const [key, value] of Object.entries(context)) {
        const regex = new RegExp(`\\b${key}\\b`, "g");
        evaluated = evaluated.replace(regex, JSON.stringify(value));
      }
      return eval(evaluated);
    } catch (error) {
      throw new Error(`Failed to evaluate expression: ${expression}`);
    }
  }

  /**
   * Update call stack
   */
  updateCallStack(callStack: CallStackFrame[]): void {
    this.state.callStack = callStack;
  }

  /**
   * Update variables
   */
  updateVariables(variables: Variable[]): void {
    this.state.variables = variables;
  }

  /**
   * Get debugger state
   */
  getState(): DebuggerState {
    return { ...this.state };
  }

  /**
   * Set on breakpoint callback
   */
  setOnBreakpoint(callback: (frame: CallStackFrame) => void): void {
    this.onBreakpoint = callback;
  }

  /**
   * Set on step callback
   */
  setOnStep(callback: () => void): void {
    this.onStep = callback;
  }

  /**
   * Start debugging
   */
  start(): void {
    this.state.isRunning = true;
    this.state.isPaused = false;
  }

  /**
   * Stop debugging
   */
  stop(): void {
    this.state.isRunning = false;
    this.state.isPaused = false;
    this.stepMode = "none";
  }

  /**
   * Reset debugger
   */
  reset(): void {
    this.state = {
      isRunning: false,
      isPaused: false,
      currentFrame: 0,
      breakpoints: [],
      callStack: [],
      variables: [],
      watchExpressions: [],
    };
    this.stepMode = "none";
    this.stepDepth = 0;
  }
}

