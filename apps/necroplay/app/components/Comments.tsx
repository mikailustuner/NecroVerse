"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@ui";
import { supabase } from "@/lib/supabase";

export interface CommentsProps {
  fileId: string;
  className?: string;
}

export interface Comment {
  id: string;
  file_id: string;
  user_id?: string;
  content: string;
  x?: number;
  y?: number;
  created_at: string;
  updated_at?: string;
}

export function Comments({ fileId, className = "" }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [fileId]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from("graveyard_comments")
        .select("*")
        .eq("file_id", fileId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading comments:", error);
        return;
      }

      setComments(data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { data, error } = await supabase
        .from("graveyard_comments")
        .insert({
          file_id: fileId,
          content: newComment,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding comment:", error);
        return;
      }

      setComments([data, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (loading) {
    return (
      <div className={`bg-[#0a0612] border border-[#a855f7]/30 rounded-lg p-4 ${className}`}>
        <div className="text-sm text-[#a855f7]">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className={`bg-[#0a0612] border border-[#a855f7]/30 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-[#a855f7] font-orbitron mb-4">
        Comments ({comments.length})
      </h3>

      {/* Add Comment */}
      <div className="mb-4 space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full bg-[#1a0f2e] border border-[#a855f7]/20 rounded-lg px-3 py-2 text-sm text-[#f5f5f5] resize-none"
          rows={3}
        />
        <Button
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          variant="violet"
          className="w-full py-2"
        >
          Add Comment
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#1a0f2e] rounded-lg p-3 border border-[#a855f7]/20"
            >
              <div className="text-xs text-[#f5f5f5] mb-2">{comment.content}</div>
              <div className="text-xs text-[#a855f7]">
                {new Date(comment.created_at).toLocaleString()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <div className="text-xs text-[#f5f5f5] text-center py-4">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
}

