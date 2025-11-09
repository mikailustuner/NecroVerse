"use client";

import { useEffect, useCallback } from "react";

export interface KeyboardShortcutsConfig {
  onPlayPause?: () => void;
  onNextFrame?: () => void;
  onPreviousFrame?: () => void;
  onFullscreen?: () => void;
  onExitFullscreen?: () => void;
  enabled?: boolean;
}

/**
 * Hook for keyboard shortcuts
 */
export function useKeyboardShortcuts(config: KeyboardShortcutsConfig): void {
  const {
    onPlayPause,
    onNextFrame,
    onPreviousFrame,
    onFullscreen,
    onExitFullscreen,
    enabled = true,
  } = config;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if typing in input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.key) {
        case " ": // Space - Play/Pause
          event.preventDefault();
          onPlayPause?.();
          break;

        case "ArrowRight": // Right Arrow - Next Frame
          event.preventDefault();
          onNextFrame?.();
          break;

        case "ArrowLeft": // Left Arrow - Previous Frame
          event.preventDefault();
          onPreviousFrame?.();
          break;

        case "f":
        case "F": // F - Fullscreen
          event.preventDefault();
          if (document.fullscreenElement) {
            onExitFullscreen?.();
          } else {
            onFullscreen?.();
          }
          break;

        case "Escape": // Esc - Exit Fullscreen
          if (document.fullscreenElement) {
            event.preventDefault();
            onExitFullscreen?.();
          }
          break;
      }
    },
    [enabled, onPlayPause, onNextFrame, onPreviousFrame, onFullscreen, onExitFullscreen]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [enabled, handleKeyDown]);
}

