"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@ui";
import { supabase } from "@/lib/supabase";

export interface VersionHistoryProps {
  fileId: string;
  className?: string;
}

export interface Version {
  id: string;
  version: number;
  createdAt: string;
  size: number;
  url: string;
  metadata?: any;
}

export function VersionHistory({ fileId, className = "" }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, [fileId]);

  const loadVersions = async () => {
    try {
      // In a real implementation, this would fetch version history from database
      // For now, we'll use the file's metadata
      const { data, error } = await supabase
        .from("graveyard_files")
        .select("*")
        .eq("id", fileId)
        .single();

      if (error) {
        console.error("Error loading versions:", error);
        return;
      }

      // Parse version history from metadata
      const versionHistory = data.metadata?.versions || [];
      setVersions(versionHistory);
    } catch (error) {
      console.error("Error loading versions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-[#0a0612] border border-[#a855f7]/30 rounded-lg p-4 ${className}`}>
        <div className="text-sm text-[#a855f7]">Loading version history...</div>
      </div>
    );
  }

  return (
    <div className={`bg-[#0a0612] border border-[#a855f7]/30 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-[#a855f7] font-orbitron mb-4">
        Version History
      </h3>

      {versions.length === 0 ? (
        <div className="text-xs text-[#f5f5f5] text-center py-4">
          No version history available
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {versions.map((version) => (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#1a0f2e] rounded-lg p-3 border border-[#a855f7]/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#a855f7]">
                      Version {version.version}
                    </div>
                    <div className="text-xs text-[#f5f5f5] mt-1">
                      {new Date(version.createdAt).toLocaleString()}
                    </div>
                    <div className="text-xs text-[#a855f7] mt-1">
                      {(version.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                  <Button
                    onClick={() => window.open(version.url, "_blank")}
                    variant="cyan"
                    className="px-3 py-1 text-xs"
                  >
                    View
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

