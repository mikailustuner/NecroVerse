"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@ui";

export interface ShareDialogProps {
  fileId: string;
  fileUrl: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function ShareDialog({
  fileId,
  fileUrl,
  isOpen,
  onClose,
  className = "",
}: ShareDialogProps) {
  const [shareLink, setShareLink] = useState("");
  const [embedCode, setEmbedCode] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/play/${fileId}`;
    setShareLink(link);
    return link;
  };

  const generateEmbedCode = () => {
    const code = `<iframe src="${window.location.origin}/play/${fileId}" width="800" height="600" frameborder="0"></iframe>`;
    setEmbedCode(code);
    return code;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-[#0a0612] border border-[#a855f7]/30 rounded-lg p-6 max-w-md w-full mx-4 ${className}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#a855f7] font-orbitron">Share</h2>
            <button
              onClick={onClose}
              className="text-[#a855f7] hover:text-[#00fff7] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Visibility Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#f5f5f5]">Public</span>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isPublic ? "bg-[#a855f7]" : "bg-[#1a0f2e]"
                }`}
              >
                <motion.div
                  className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                  animate={{ x: isPublic ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Share Link */}
            <div className="space-y-2">
              <label className="text-sm text-[#a855f7] font-semibold">Share Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink || generateShareLink()}
                  readOnly
                  className="flex-1 bg-[#1a0f2e] border border-[#a855f7]/20 rounded-lg px-3 py-2 text-sm text-[#f5f5f5]"
                />
                <Button
                  onClick={() => copyToClipboard(shareLink || generateShareLink())}
                  variant="cyan"
                  className="px-3 py-2"
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            {/* Embed Code */}
            <div className="space-y-2">
              <label className="text-sm text-[#a855f7] font-semibold">Embed Code</label>
              <div className="flex gap-2">
                <textarea
                  value={embedCode || generateEmbedCode()}
                  readOnly
                  rows={3}
                  className="flex-1 bg-[#1a0f2e] border border-[#a855f7]/20 rounded-lg px-3 py-2 text-sm text-[#f5f5f5] font-mono"
                />
                <Button
                  onClick={() => copyToClipboard(embedCode || generateEmbedCode())}
                  variant="cyan"
                  className="px-3 py-2"
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

