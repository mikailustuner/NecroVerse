"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { convertFile } from "@graveyard-runtime/converters";
import { Button, LoadingRing, Toast } from "@ui";
import { useRouter } from "next/navigation";

interface LogEntry {
  id: string;
  message: string;
  level: string;
  timestamp: string;
}

interface FileRecord {
  id: string;
  name: string;
  type: string;
  status: string;
  created_at: string;
}

export default function LabPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Load initial files
    loadFiles();

    // Load initial logs
    loadLogs();

    // Subscribe to real-time logs
    const logsChannel = supabase
      .channel("graveyard_logs")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "graveyard_logs",
        },
        (payload) => {
          setLogs((prev) => [
            {
              id: payload.new.id,
              message: payload.new.message,
              level: payload.new.level,
              timestamp: payload.new.timestamp,
            },
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      logsChannel.unsubscribe();
    };
  }, []);

  const loadFiles = async () => {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setFiles(data);
    }
  };

  const loadLogs = async () => {
    const { data, error } = await supabase
      .from("graveyard_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(50);

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
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);

    try {
      // Create log entry
      await supabase.from("graveyard_logs").insert({
        message: `[reviving…] ${file.name}`,
        level: "info",
      });

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("uploads").getPublicUrl(filePath);

      // Create file record
      const { data: fileData, error: fileError } = await supabase
        .from("files")
        .insert({
          name: file.name,
          type: fileExt || "unknown",
          size: file.size,
          status: "uploading",
          storage_path: filePath,
        })
        .select()
        .single();

      if (fileError) throw fileError;

      // Update log
      await supabase.from("graveyard_logs").insert({
        file_id: fileData.id,
        message: `[byte infusion complete] ${file.name}`,
        level: "success",
      });

      // Convert file
      await supabase.from("graveyard_logs").insert({
        file_id: fileData.id,
        message: `[converting…] ${file.name}`,
        level: "info",
      });

      const conversionResult = await convertFile(file, publicUrl);

      // Update file record with conversion result
      await supabase
        .from("files")
        .update({
          status: conversionResult.success ? "ready" : "failed",
          conversion_url: conversionResult.outputUrl,
          metadata: conversionResult.metadata,
        })
        .eq("id", fileData.id);

      await supabase.from("graveyard_logs").insert({
        file_id: fileData.id,
        message: conversionResult.success
          ? `[resurrection successful] ${file.name}`
          : `[resurrection failed] ${file.name}: ${conversionResult.error}`,
        level: conversionResult.success ? "success" : "error",
      });

      setToast({
        message: `☠ File resurrected successfully: ${file.name}`,
        visible: true,
      });

      setTimeout(() => setToast({ message: "", visible: false }), 3000);

      loadFiles();
    } catch (error) {
      console.error("Upload error:", error);
      await supabase.from("graveyard_logs").insert({
        message: `[error] ${error instanceof Error ? error.message : "Unknown error"}`,
        level: "error",
      });
      setToast({
        message: `☠ Resurrection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        visible: true,
      });
      setTimeout(() => setToast({ message: "", visible: false }), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <motion.h1
            className="text-4xl font-bold text-accent-glow"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            NecroDev - Resurrection Lab
          </motion.h1>
          <Button variant="violet" onClick={() => router.push("/")}>
            ← Back to Portal
          </Button>
        </div>

        {/* Main split panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left: Upload Zone */}
          <motion.div
            className="bg-shadow/50 border border-accent-glow/30 rounded-lg p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-highlight">
              Upload Zone
            </h2>
            <div
              className={`
                border-2 border-dashed rounded-lg p-12 text-center
                transition-all duration-300
                ${
                  isDragging
                    ? "border-accent-glow bg-accent-glow/10"
                    : "border-accent-glow/50"
                }
                ${isUploading ? "opacity-50 pointer-events-none" : ""}
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-4">
                  <LoadingRing />
                  <p className="text-accent-glow">Resurrecting...</p>
                </div>
              ) : (
                <>
                  <p className="text-lg mb-4">
                    Drag & drop files here or click to browse
                  </p>
                  <p className="text-sm text-text/60 mb-4">
                    Supported: .swf, .jar, .xap, .dcr
                  </p>
                  <Button
                    variant="violet"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".swf,.jar,.xap,.dcr"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                </>
              )}
            </div>
          </motion.div>

          {/* Right: Console Log Feed */}
          <motion.div
            className="bg-shadow/50 border border-accent-glow/30 rounded-lg p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-highlight">
              Resurrection Log
            </h2>
            <div className="bg-background rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
              <AnimatePresence>
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mb-2 ${
                      log.level === "error"
                        ? "text-warning"
                        : log.level === "success"
                        ? "text-highlight"
                        : "text-text"
                    }`}
                  >
                    <span className="text-text/50">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>{" "}
                    {log.message}
                  </motion.div>
                ))}
              </AnimatePresence>
              {logs.length === 0 && (
                <p className="text-text/50">No logs yet...</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Archive: Resurrected Souls */}
        <motion.div
          className="bg-shadow/50 border border-accent-glow/30 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-highlight">
            Resurrected Souls Archive
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <motion.div
                key={file.id}
                className="bg-background border border-accent-glow/30 rounded-lg p-4 hover:border-accent-glow/60 transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <p className="font-bold text-accent-glow">{file.name}</p>
                <p className="text-sm text-text/60 mt-2">
                  Type: {file.type} | Status: {file.status}
                </p>
                <p className="text-xs text-text/40 mt-1">
                  {new Date(file.created_at).toLocaleString()}
                </p>
              </motion.div>
            ))}
            {files.length === 0 && (
              <p className="text-text/50 col-span-full text-center py-8">
                No resurrected souls yet...
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {toast.visible && (
        <Toast
          message={toast.message}
          isVisible={toast.visible}
          onClose={() => setToast({ message: "", visible: false })}
        />
      )}
    </div>
  );
}
