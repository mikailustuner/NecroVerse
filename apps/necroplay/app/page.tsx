"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button, GlitchText } from "@ui";

interface FileRecord {
  id: string;
  name: string;
  type: string;
  status: string;
  conversion_url?: string;
  metadata?: any;
  created_at: string;
}

export default function GraveyardPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      console.log("[GraveyardPage] Loading files...");
      
      // Load all files (not just "ready" status)
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[GraveyardPage] Error loading files:", error);
        throw error;
      }
      
      if (data) {
        console.log("[GraveyardPage] Files loaded:", data.length);
        console.log("[GraveyardPage] File types:", data.map(f => f.type));
        console.log("[GraveyardPage] File statuses:", data.map(f => f.status));
        setFiles(data);
      } else {
        console.warn("[GraveyardPage] No files found");
      }
    } catch (error) {
      console.error("[GraveyardPage] Error loading files:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    // Also filter out files that don't have a valid type or are in error state
    const isValid = file.type && file.type.length > 0 && file.status !== "error";
    return matchesSearch && isValid;
  });
  
  console.log("[GraveyardPage] Filtered files:", filteredFiles.length, "out of", files.length);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-accent-glow">
            <GlitchText>NecroPlay</GlitchText>
          </h1>
          <p className="text-xl text-highlight mb-6">
            Graveyard Arcade - Resurrected Experiences
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <input
            type="text"
            placeholder="Search resurrected souls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md mx-auto block px-4 py-3 bg-shadow/50 border border-accent-glow/30 rounded-lg text-text placeholder:text-text/50 focus:outline-none focus:border-accent-glow/60 focus:ring-2 focus:ring-accent-glow/30"
          />
        </motion.div>

        {/* Grid of resurrected experiences */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-accent-glow text-xl">Loading graveyard...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="bg-shadow/50 border border-accent-glow/30 rounded-lg overflow-hidden vhs-corruption hover:border-accent-glow/60 transition-all cursor-pointer">
                  {/* Gravestone-style card */}
                  <div className="aspect-video bg-gradient-to-b from-background to-shadow/50 flex items-center justify-center relative">
                    <div className="text-center z-10">
                      <p className="text-4xl mb-2">💀</p>
                      <p className="text-sm text-accent-glow font-bold">
                        {file.type.toUpperCase()}
                      </p>
                    </div>
                    {/* VHS corruption overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 bg-accent-glow/10" />
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-glow to-transparent animate-pulse" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-accent-glow mb-2 truncate">
                      {file.name}
                    </h3>
                    <p className="text-xs text-text/60 mb-3">
                      Resurrected: {new Date(file.created_at).toLocaleDateString()}
                    </p>
                    <Button
                      variant="cyan"
                      onClick={() => router.push(`/play/${file.id}`)}
                      className="w-full text-sm"
                    >
                      PLAY
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredFiles.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-text/50 text-xl">
                  {searchQuery
                    ? "No souls found matching your search..."
                    : "No resurrected souls yet. Visit NecroDev to resurrect some!"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

