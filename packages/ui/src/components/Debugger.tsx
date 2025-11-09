"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";

export interface DebuggerProps {
  isRunning: boolean;
  isPaused: boolean;
  callStack: Array<{
    functionName: string;
    fileName?: string;
    lineNumber?: number;
    variables: Array<{ name: string; value: any; type: string }>;
  }>;
  variables: Array<{ name: string; value: any; type: string; scope: string }>;
  breakpoints: Array<{ id: string; line: number; enabled: boolean }>;
  watchExpressions?: Array<{ id: string; expression: string; value?: any; error?: string }>;
  onPause?: () => void;
  onResume?: () => void;
  onStepOver?: () => void;
  onStepInto?: () => void;
  onStepOut?: () => void;
  onAddBreakpoint?: (line: number) => void;
  onRemoveBreakpoint?: (id: string) => void;
  onToggleBreakpoint?: (id: string) => void;
  onAddWatchExpression?: (expression: string) => void;
  onRemoveWatchExpression?: (id: string) => void;
  className?: string;
}

export function Debugger({
  isRunning,
  isPaused,
  callStack,
  variables,
  breakpoints,
  watchExpressions = [],
  onPause,
  onResume,
  onStepOver,
  onStepInto,
  onStepOut,
  onAddBreakpoint,
  onRemoveBreakpoint,
  onToggleBreakpoint,
  onAddWatchExpression,
  onRemoveWatchExpression,
  className = "",
}: DebuggerProps) {
  const [selectedTab, setSelectedTab] = useState<"variables" | "callstack" | "breakpoints" | "watch">("variables");
  const [newWatchExpression, setNewWatchExpression] = useState("");

  const formatValue = (value: any): string => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className={`bg-[#0a0612] border border-[#a855f7]/30 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#a855f7] font-orbitron">Debugger</h3>
        <div className="flex gap-2">
          {isRunning && !isPaused && (
            <Button onClick={onPause} variant="secondary" className="px-3 py-1 text-xs">
              Pause
            </Button>
          )}
          {isPaused && (
            <>
              <Button onClick={onResume} variant="primary" className="px-3 py-1 text-xs">
                Resume
              </Button>
              <Button onClick={onStepOver} variant="secondary" className="px-3 py-1 text-xs">
                Step Over
              </Button>
              <Button onClick={onStepInto} variant="secondary" className="px-3 py-1 text-xs">
                Step Into
              </Button>
              <Button onClick={onStepOut} variant="secondary" className="px-3 py-1 text-xs">
                Step Out
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-[#a855f7]/20">
        <button
          onClick={() => setSelectedTab("variables")}
          className={`px-3 py-2 text-xs font-semibold transition-colors ${
            selectedTab === "variables"
              ? "text-[#a855f7] border-b-2 border-[#a855f7]"
              : "text-[#f5f5f5] hover:text-[#a855f7]"
          }`}
        >
          Variables ({variables.length})
        </button>
        <button
          onClick={() => setSelectedTab("callstack")}
          className={`px-3 py-2 text-xs font-semibold transition-colors ${
            selectedTab === "callstack"
              ? "text-[#a855f7] border-b-2 border-[#a855f7]"
              : "text-[#f5f5f5] hover:text-[#a855f7]"
          }`}
        >
          Call Stack ({callStack.length})
        </button>
        <button
          onClick={() => setSelectedTab("breakpoints")}
          className={`px-3 py-2 text-xs font-semibold transition-colors ${
            selectedTab === "breakpoints"
              ? "text-[#a855f7] border-b-2 border-[#a855f7]"
              : "text-[#f5f5f5] hover:text-[#a855f7]"
          }`}
        >
          Breakpoints ({breakpoints.length})
        </button>
        <button
          onClick={() => setSelectedTab("watch")}
          className={`px-3 py-2 text-xs font-semibold transition-colors ${
            selectedTab === "watch"
              ? "text-[#a855f7] border-b-2 border-[#a855f7]"
              : "text-[#f5f5f5] hover:text-[#a855f7]"
          }`}
        >
          Watch ({watchExpressions.length})
        </button>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence mode="wait">
          {selectedTab === "variables" && (
            <motion.div
              key="variables"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {variables.map((variable, index) => (
                <div
                  key={index}
                  className="bg-[#1a0f2e] rounded-lg p-3 border border-[#a855f7]/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#a855f7]">{variable.name}</span>
                    <span className="text-xs text-[#00fff7]">{variable.type}</span>
                  </div>
                  <div className="text-xs text-[#f5f5f5] font-mono break-all">
                    {formatValue(variable.value)}
                  </div>
                  <div className="text-xs text-[#a855f7] mt-1">Scope: {variable.scope}</div>
                </div>
              ))}
              {variables.length === 0 && (
                <div className="text-xs text-[#f5f5f5] text-center py-4">
                  No variables available
                </div>
              )}
            </motion.div>
          )}

          {selectedTab === "callstack" && (
            <motion.div
              key="callstack"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {callStack.map((frame, index) => (
                <div
                  key={index}
                  className="bg-[#1a0f2e] rounded-lg p-3 border border-[#a855f7]/20"
                >
                  <div className="text-xs font-semibold text-[#a855f7] mb-2">
                    {frame.functionName}
                  </div>
                  {frame.fileName && (
                    <div className="text-xs text-[#f5f5f5] mb-2">
                      {frame.fileName}
                      {frame.lineNumber && `:${frame.lineNumber}`}
                    </div>
                  )}
                  {frame.variables.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {frame.variables.slice(0, 3).map((variable, vIndex) => (
                        <div key={vIndex} className="text-xs text-[#a855f7]">
                          {variable.name}: {formatValue(variable.value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {callStack.length === 0 && (
                <div className="text-xs text-[#f5f5f5] text-center py-4">
                  Call stack is empty
                </div>
              )}
            </motion.div>
          )}

          {selectedTab === "breakpoints" && (
            <motion.div
              key="breakpoints"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {breakpoints.map((breakpoint) => (
                <div
                  key={breakpoint.id}
                  className="flex items-center justify-between bg-[#1a0f2e] rounded-lg p-3 border border-[#a855f7]/20"
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleBreakpoint?.(breakpoint.id)}
                      className={`w-4 h-4 rounded border-2 ${
                        breakpoint.enabled
                          ? "bg-[#a855f7] border-[#a855f7]"
                          : "bg-transparent border-[#a855f7]/50"
                      }`}
                    />
                    <span className="text-xs text-[#f5f5f5]">Line {breakpoint.line}</span>
                  </div>
                  <Button
                    onClick={() => onRemoveBreakpoint?.(breakpoint.id)}
                    variant="secondary"
                    className="px-2 py-1 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {breakpoints.length === 0 && (
                <div className="text-xs text-[#f5f5f5] text-center py-4">
                  No breakpoints set
                </div>
              )}

          {selectedTab === "watch" && (
            <motion.div
              key="watch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {/* Add watch expression */}
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newWatchExpression}
                  onChange={(e) => setNewWatchExpression(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && newWatchExpression.trim()) {
                      onAddWatchExpression?.(newWatchExpression.trim());
                      setNewWatchExpression("");
                    }
                  }}
                  placeholder="Enter expression..."
                  className="flex-1 bg-[#1a0f2e] border border-[#a855f7]/30 rounded px-2 py-1 text-xs text-[#f5f5f5] focus:outline-none focus:border-[#a855f7]"
                />
                <Button
                  onClick={() => {
                    if (newWatchExpression.trim()) {
                      onAddWatchExpression?.(newWatchExpression.trim());
                      setNewWatchExpression("");
                    }
                  }}
                  variant="primary"
                  className="px-3 py-1 text-xs"
                >
                  Add
                </Button>
              </div>

              {/* Watch expressions */}
              {watchExpressions.map((watch) => (
                <div
                  key={watch.id}
                  className="bg-[#1a0f2e] rounded-lg p-3 border border-[#a855f7]/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#a855f7] font-mono">
                      {watch.expression}
                    </span>
                    <Button
                      onClick={() => onRemoveWatchExpression?.(watch.id)}
                      variant="secondary"
                      className="px-2 py-1 text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                  {watch.error ? (
                    <div className="text-xs text-[#ff006e] font-mono">
                      Error: {watch.error}
                    </div>
                  ) : (
                    <div className="text-xs text-[#f5f5f5] font-mono break-all">
                      {formatValue(watch.value)}
                    </div>
                  )}
                </div>
              ))}
              {watchExpressions.length === 0 && (
                <div className="text-xs text-[#f5f5f5] text-center py-4">
                  No watch expressions. Add one above.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

