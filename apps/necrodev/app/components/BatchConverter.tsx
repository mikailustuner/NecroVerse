"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@ui";

export interface BatchConverterProps {
  onConvert: (files: File[]) => Promise<void>;
  className?: string;
}

export function BatchConverter({ onConvert, className = "" }: BatchConverterProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles([...files, ...selectedFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setConverting(true);
    setProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        await onConvert([files[i]]);
        setProgress(((i + 1) / files.length) * 100);
      }
    } catch (error) {
      console.error("Batch conversion error:", error);
    } finally {
      setConverting(false);
      setProgress(0);
    }
  };

  return (
    <div className={`bg-[#0a0612] border border-[#a855f7]/30 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-[#a855f7] font-orbitron mb-4">
        Batch Conversion
      </h3>

      <div className="space-y-4">
        {/* File Input */}
        <div>
          <input
            type="file"
            multiple
            accept=".swf,.jar,.xap,.dcr"
            onChange={handleFileSelect}
            className="hidden"
            id="batch-file-input"
          />
          <label
            htmlFor="batch-file-input"
            className="block w-full p-4 border-2 border-dashed border-[#a855f7]/30 rounded-lg cursor-pointer hover:border-[#a855f7]/50 transition-colors"
          >
            <div className="text-center">
              <div className="text-sm text-[#a855f7] mb-2">Click to select files</div>
              <div className="text-xs text-[#f5f5f5]">
                Supports: SWF, JAR, XAP, DCR
              </div>
            </div>
          </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-[#1a0f2e] rounded-lg p-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[#f5f5f5] truncate">{file.name}</div>
                  <div className="text-xs text-[#a855f7]">
                    {(file.size / 1024).toFixed(2)} KB
                  </div>
                </div>
                <Button
                  onClick={() => handleRemoveFile(index)}
                  variant="magenta"
                  className="px-2 py-1 text-xs ml-2"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Progress */}
        {converting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#f5f5f5]">Converting...</span>
              <span className="text-[#a855f7]">{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-[#1a0f2e] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#a855f7]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Convert Button */}
        <Button
          onClick={handleConvert}
          disabled={files.length === 0 || converting}
          variant="violet"
          className="w-full py-2"
        >
          {converting ? `Converting... ${files.length} files` : `Convert ${files.length} Files`}
        </Button>
      </div>
    </div>
  );
}

