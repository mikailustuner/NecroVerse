"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  loadRuffleRuntime,
  createRufflePlayer,
  createWASMRunner,
  createCanvasRuntime,
  createSWFRuntime,
  createJARRuntime,
  createXAPRuntime,
  createDCRRuntime,
  RuntimeConfig,
} from "@graveyard-runtime/runtime";
import { Button, LoadingRing, ErrorDisplay } from "@ui";
import { RuntimeErrorBoundary } from "./error-boundary";

interface FileRecord {
  id: string;
  name: string;
  type: string;
  status: string;
  conversion_url?: string;
  storage_path?: string;
  metadata?: any;
  created_at: string;
}

interface LogEntry {
  id: string;
  message: string;
  level: string;
  timestamp: string;
}

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const fileId = params.id as string;

  const [file, setFile] = useState<FileRecord | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [runtimeError, setRuntimeError] = useState<Error | null>(null);

  useEffect(() => {
    if (fileId) {
      loadFile();
      loadLogs();
    }
  }, [fileId]);

  useEffect(() => {
    let runtimeInstance: any = null;
    
    if (file && containerRef) {
      initializeRuntime().then((instance) => {
        runtimeInstance = instance;
      });
    }
    
    // Cleanup on unmount
    return () => {
      if (runtimeInstance && typeof runtimeInstance.destroy === 'function') {
        runtimeInstance.destroy();
      }
    };
  }, [file, containerRef]);

  const loadFile = async () => {
    try {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("id", fileId)
        .single();

      if (error) throw error;
      if (data) {
        setFile(data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error loading file:", error);
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("graveyard_logs")
        .select("*")
        .eq("file_id", fileId)
        .order("timestamp", { ascending: false })
        .limit(20);

      if (error) throw error;
      if (data) {
        setLogs(
          data.map((log) => ({
            id: log.id,
            message: log.message,
            level: log.level,
            timestamp: log.timestamp,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading logs:", error);
    }
  };

  const initializeRuntime = async (): Promise<any> => {
    if (!file || !containerRef) {
      console.warn("[PlayPage] Cannot initialize runtime: file or containerRef missing", { file, containerRef });
      return null;
    }

    console.log("[PlayPage] Initializing runtime for file:", file.name, "type:", file.type);

    // Clear container first
    if (containerRef) {
      containerRef.innerHTML = "";
    }

    // Get the actual file URL from storage
    let fileUrl = file.conversion_url || "";
    if (!fileUrl && file.storage_path) {
      // If no conversion_url, use storage path to get public URL
      const { data } = supabase.storage.from("uploads").getPublicUrl(file.storage_path);
      fileUrl = data.publicUrl;
    }

    if (!fileUrl) {
      const error = new Error("No file URL available. File may not be uploaded or converted yet.");
      setRuntimeError(error);
      console.error("[PlayPage] No file URL available:", file);
      return;
    }

    console.log("[PlayPage] File URL:", fileUrl);

    const config: RuntimeConfig = {
      type: file.type as any,
      url: fileUrl,
      metadata: file.metadata || {
        name: file.name,
        type: file.type,
        size: 0,
        converted: true,
      },
    };

    try {
      console.log("[PlayPage] Creating runtime for type:", file.type.toLowerCase());
      let runtimeInstance: any = null;
      
      switch (file.type.toLowerCase()) {
        case "swf":
          // Use custom SWF runtime
          console.log("[PlayPage] Creating SWF runtime...");
          runtimeInstance = createSWFRuntime("runtime-container", config);
          console.log("[PlayPage] SWF runtime created");
          break;
        case "jar":
          // Use CheerpJ runtime for better compatibility
          const { createCheerpJRuntime } = await import("@graveyard-runtime/runtime");
          runtimeInstance = createCheerpJRuntime("runtime-container", config);
          break;
        case "xap":
          // Use custom XAP runtime
          runtimeInstance = createXAPRuntime("runtime-container", config);
          break;
        case "dcr":
          // Use custom DCR runtime
          runtimeInstance = createDCRRuntime("runtime-container", config);
          break;
        default:
          // Fallback to canvas runtime
          runtimeInstance = createCanvasRuntime("runtime-container", config);
          break;
      }
      
      return runtimeInstance;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setRuntimeError(err);
      console.error("Runtime initialization error:", error);
      
      // Log error to Supabase
      try {
        await supabase.from("graveyard_logs").insert({
          file_id: fileId,
          level: "error",
          message: `Runtime initialization failed: ${err.message}`,
          context: {
            fileType: file.type,
            fileUrl: fileUrl,
          },
          stack: err.stack,
          timestamp: new Date().toISOString(),
        });
      } catch (logError) {
        console.error("Failed to log error:", logError);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingRing />
          <p className="mt-4 text-accent-glow text-xl">Infusing Dark Energy...</p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-warning text-xl mb-4">Soul not found...</p>
          <Button variant="violet" onClick={() => router.push("/")}>
            Return to Graveyard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <RuntimeErrorBoundary>
      <div className="min-h-screen relative">
        {/* Fullscreen runtime container */}
        <div className="fixed inset-0 bg-background z-10">
          {runtimeError ? (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <ErrorDisplay
                error={runtimeError}
                onRetry={() => {
                  setRuntimeError(null);
                  initializeRuntime();
                }}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div
                id="runtime-container"
                ref={(el) => {
                  if (el && !containerRef) {
                    setContainerRef(el);
                    setRuntimeReady(true);
                  }
                }}
                className="w-full h-full max-w-7xl max-h-[90vh] relative"
              />
            </div>
          )}

        {/* Glowing border effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            boxShadow: [
              "0 0 20px rgba(168, 85, 247, 0.3)",
              "0 0 40px rgba(168, 85, 247, 0.5)",
              "0 0 20px rgba(168, 85, 247, 0.3)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
          <Button variant="violet" onClick={() => router.push("/")}>
            ← Back to Graveyard
          </Button>
          <Button
            variant="cyan"
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            {drawerOpen ? "Hide" : "Show"} Info
          </Button>
        </div>
      </div>

      {/* Side drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed top-0 right-0 h-full w-96 bg-shadow/95 backdrop-blur-sm border-l border-accent-glow/30 z-30 overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-accent-glow mb-4">
                Resurrection Info
              </h2>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-highlight mb-2">
                  File Details
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-text/60">Name:</span>{" "}
                    <span className="text-text">{file.name}</span>
                  </p>
                  <p>
                    <span className="text-text/60">Type:</span>{" "}
                    <span className="text-text">{file.type.toUpperCase()}</span>
                  </p>
                  <p>
                    <span className="text-text/60">Status:</span>{" "}
                    <span className="text-text">{file.status}</span>
                  </p>
                  <p>
                    <span className="text-text/60">Resurrected:</span>{" "}
                    <span className="text-text">
                      {new Date(file.created_at).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-highlight mb-2">
                  Resurrection Log
                </h3>
                <div className="space-y-2 font-mono text-xs max-h-96 overflow-y-auto">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2 rounded ${
                        log.level === "error"
                          ? "text-warning bg-warning/10"
                          : log.level === "success"
                          ? "text-highlight bg-highlight/10"
                          : "text-text bg-text/10"
                      }`}
                    >
                      <span className="text-text/50">
                        [{new Date(log.timestamp).toLocaleTimeString()}]
                      </span>{" "}
                      {log.message}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </RuntimeErrorBoundary>
  );
}

