"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function AnalyticsPage() {
  const [fileStats, setFileStats] = useState<any[]>([]);
  const [errorStats, setErrorStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Load file statistics
      const { data: files, error: filesError } = await supabase
        .from("files")
        .select("id, name, type, created_at, metadata")
        .order("created_at", { ascending: false })
        .limit(100);

      if (filesError) {
        console.error("Error loading files:", filesError);
        return;
      }

      // Load error statistics
      const { data: errors, error: errorsError } = await supabase
        .from("graveyard_logs")
        .select("*")
        .eq("level", "error")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (errorsError) {
        console.error("Error loading errors:", errorsError);
        return;
      }

      setFileStats(files || []);
      setErrorStats(errors || []);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-[#a855f7] mb-4">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0612] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#a855f7] font-orbitron mb-8">
          Analytics Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* File Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0612] border border-[#a855f7]/30 rounded-lg p-6"
          >
            <h2 className="text-xl font-bold text-[#a855f7] font-orbitron mb-4">
              File Statistics
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#f5f5f5]">Total Files</span>
                <span className="text-lg font-bold text-[#a855f7]">{fileStats.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#f5f5f5]">By Type</span>
                <div className="text-xs text-[#a855f7]">
                  {Object.entries(
                    fileStats.reduce((acc, file) => {
                      acc[file.type] = (acc[file.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => `${type}: ${count}`).join(", ")}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Error Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0612] border border-[#ff006e]/30 rounded-lg p-6"
          >
            <h2 className="text-xl font-bold text-[#ff006e] font-orbitron mb-4">
              Error Statistics
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#f5f5f5]">Total Errors</span>
                <span className="text-lg font-bold text-[#ff006e]">{errorStats.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#f5f5f5]">Last 24h</span>
                <span className="text-xs text-[#ff006e]">
                  {errorStats.filter(
                    (e) => new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                  ).length}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Error List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0612] border border-[#ff006e]/30 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold text-[#ff006e] font-orbitron mb-4">
            Recent Errors
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {errorStats.slice(0, 20).map((error) => (
              <div
                key={error.id}
                className="bg-[#1a0f2e] rounded-lg p-3 border border-[#ff006e]/20"
              >
                <div className="text-xs text-[#f5f5f5] mb-1">{error.message}</div>
                <div className="text-xs text-[#ff006e]">
                  {new Date(error.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

