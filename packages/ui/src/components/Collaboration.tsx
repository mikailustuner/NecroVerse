"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";

export interface CollaborationProps {
  fileId: string;
  userId?: string;
  onPlaybackUpdate?: (state: PlaybackState) => void;
  className?: string;
}

export interface PlaybackState {
  currentFrame: number;
  isPlaying: boolean;
  speed: number;
}

export interface ActiveUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  frame?: number;
  position?: { x: number; y: number };
}

export function Collaboration({
  fileId,
  userId,
  onPlaybackUpdate,
  className = "",
}: CollaborationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    currentFrame: 0,
    isPlaying: false,
    speed: 1.0,
  });
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    connectWebSocket();

    return () => {
      // Cleanup
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [fileId, userId]);

  const connectWebSocket = () => {
    try {
      // In a full implementation, this would connect to a WebSocket server
      // For now, we'll use a placeholder
      const wsUrl = `ws://localhost:3000/api/collaboration/ws?fileId=${fileId}&userId=${userId || "anonymous"}`;
      
      // WebSocket connection would be established here
      // wsRef.current = new WebSocket(wsUrl);
      
      // For now, simulate connection
      setIsConnected(true);
      
      // Simulate active users
      setActiveUsers([
        { id: userId || "anonymous", name: "You", color: "#a855f7" },
      ]);
    } catch (error) {
      console.error("[Collaboration] WebSocket connection failed:", error);
      setIsConnected(false);
      
      // Retry connection
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 3000);
    }
  };

  const handlePlaybackUpdate = (state: PlaybackState) => {
    setPlaybackState(state);
    
    // Broadcast to other users via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "playbackUpdate",
        fileId,
        userId,
        state,
      }));
    }
    
    onPlaybackUpdate?.(state);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      userId: userId || "anonymous",
      userName: "You",
      text: newComment,
      timestamp: Date.now(),
      frame: playbackState.currentFrame,
    };

    setComments([...comments, comment]);
    setNewComment("");

    // Broadcast comment via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "addComment",
        fileId,
        userId,
        comment,
      }));
    }
  };

  return (
    <div className={`bg-[#0a0612] border border-[#a855f7]/30 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#a855f7] font-orbitron">Collaboration</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-xs text-[#f5f5f5]">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Active Users */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-[#a855f7] mb-2">Active Users ({activeUsers.length})</h4>
        <div className="flex flex-wrap gap-2">
          {activeUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 px-2 py-1 bg-[#1a0f2e] rounded border border-[#a855f7]/20"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: user.color }}
              />
              <span className="text-xs text-[#f5f5f5]">{user.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-[#a855f7]">Comments ({comments.length})</h4>
          <Button
            onClick={() => setShowComments(!showComments)}
            variant="secondary"
            className="px-2 py-1 text-xs"
          >
            {showComments ? "Hide" : "Show"}
          </Button>
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 max-h-48 overflow-y-auto"
            >
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-[#1a0f2e] rounded p-2 border border-[#a855f7]/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#a855f7]">{comment.userName}</span>
                    <span className="text-xs text-[#f5f5f5]">
                      {new Date(comment.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#f5f5f5]">{comment.text}</p>
                  {comment.frame !== undefined && (
                    <span className="text-xs text-[#a855f7]">Frame {comment.frame}</span>
                  )}
                </div>
              ))}

              {/* Add Comment */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddComment();
                    }
                  }}
                  placeholder="Add a comment..."
                  className="flex-1 bg-[#1a0f2e] border border-[#a855f7]/30 rounded px-2 py-1 text-xs text-[#f5f5f5] focus:outline-none focus:border-[#a855f7]"
                />
                <Button
                  onClick={handleAddComment}
                  variant="primary"
                  className="px-3 py-1 text-xs"
                >
                  Send
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shared Playback Info */}
      <div className="text-xs text-[#f5f5f5]">
        <div>Frame: {playbackState.currentFrame}</div>
        <div>Speed: {playbackState.speed}x</div>
        <div>Status: {playbackState.isPlaying ? "Playing" : "Paused"}</div>
      </div>
    </div>
  );
}

