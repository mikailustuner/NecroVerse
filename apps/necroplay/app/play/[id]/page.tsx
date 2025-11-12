// Static export için generateStaticParams - build zamanında çalışır
// Supabase'den tüm file ID'lerini çeker
// NOT: Bu fonksiyon "use client" direktifinden ÖNCE olmalı
export async function generateStaticParams() {
  try {
    // Build zamanında Supabase'den tüm file ID'lerini çek
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xbbucipuftdncjzcluuk.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiYnVjaXB1ZnRkbmNqemNsdXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1ODUyNDMsImV4cCI6MjA3ODE2MTI0M30.NdfkEKbCOOdVuYWB400tszsxsai26wAIw19_EFWzvfM";
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase credentials missing, returning empty array for generateStaticParams");
      return [];
    }

    const { createClient } = await import("@supabase/supabase-js");
    const buildSupabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await buildSupabase
      .from("files")
      .select("id")
      .limit(1000); // Maksimum 1000 dosya (Next.js limit)

    if (error) {
      console.warn("Error fetching file IDs for generateStaticParams:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Next.js format: [{ id: '...' }, { id: '...' }]
    return data.map((file) => ({
      id: file.id,
    }));
  } catch (error) {
    console.warn("Error in generateStaticParams:", error);
    // Hata durumunda boş array döndür, client-side routing ile çalışmaya devam eder
    return [];
  }
}

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  const [pathname, setPathname] = useState<string>("");
  
  // Pathname'i takip et (static export için)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
      
      // Pathname değişikliklerini dinle (popstate event)
      const handlePopState = () => {
        setPathname(window.location.pathname);
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);
  
  // Static export için fallback: URL'den ID'yi parse et
  const fileId = useMemo((): string | null => {
    // Önce Next.js params'dan dene
    if (params?.id) {
      return params.id as string;
    }
    
    // Static export'ta params çalışmaz, URL'den parse et
    const currentPathname = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
    if (currentPathname) {
      // BasePath'i hesaba kat (örn: /NecroVerse/play/[id] veya /play/[id])
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      // BasePath varsa onu kaldır, yoksa direkt pathname'i kullan
      const pathWithoutBase = basePath 
        ? currentPathname.replace(new RegExp(`^${basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), '')
        : currentPathname;
      
      // /play/[id] veya /play/[id]/ formatını parse et
      const match = pathWithoutBase.match(/\/play\/([^\/]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }, [params?.id, pathname]);

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
    } else {
      // ID bulunamadıysa loading'i durdur
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]); // loadFile ve loadLogs zaten fileId'ye bağlı, bu yüzden sadece fileId yeterli

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

  const loadFile = useCallback(async () => {
    if (!fileId) {
      setLoading(false);
      return;
    }
    
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
  }, [fileId]);

  const loadLogs = useCallback(async () => {
    if (!fileId) return;
    
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
  }, [fileId]);

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

