"use client";

import { useEffect } from "react";

/**
 * Service Worker Registration Component
 * Registers the service worker for PWA offline support
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[Service Worker] Registered:", registration.scope);

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New service worker available
                  console.log("[Service Worker] New version available");
                  // In a full implementation, we would show a notification
                  // to the user to reload the page
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("[Service Worker] Registration failed:", error);
        });

      // Handle service worker updates
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  return null;
}

