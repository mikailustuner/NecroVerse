"use client";

import { motion } from "framer-motion";
import { Button } from "@ui";

export interface AmironAppDescriptor {
  id: string;
  name: string;
  type: 'system';
  description: string;
  thumbnail: string;
  launch: () => void;
}

export const AmironApp: AmironAppDescriptor = {
  id: 'amiron-desktop',
  name: 'Amiron Desktop',
  type: 'system',
  description: 'AmigaOS-inspired desktop environment resurrected for the web',
  thumbnail: '🖥️',
  launch: () => {
    // Open Amiron in new tab
    const amironUrl = process.env.NEXT_PUBLIC_AMIRON_URL || 'http://localhost:3002';
    window.open(amironUrl, '_blank', 'width=1024,height=768');
  },
};

interface AmironLauncherProps {
  index?: number;
}

export function AmironLauncher({ index = 0 }: AmironLauncherProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative group"
    >
      <div className="bg-shadow/50 border-2 border-highlight/50 rounded-lg overflow-hidden vhs-corruption hover:border-highlight/80 transition-all cursor-pointer">
        {/* System app badge */}
        <div className="absolute top-2 right-2 z-20">
          <span className="px-2 py-1 bg-highlight/20 border border-highlight/50 rounded text-xs text-highlight font-bold">
            SYSTEM
          </span>
        </div>
        
        {/* Card content */}
        <div className="aspect-video bg-gradient-to-b from-background to-shadow/50 flex items-center justify-center relative">
          <div className="text-center z-10">
            <p className="text-6xl mb-2">{AmironApp.thumbnail}</p>
            <p className="text-sm text-highlight font-bold">
              DESKTOP OS
            </p>
          </div>
          
          {/* Hover effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 bg-highlight/10" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-highlight to-transparent animate-pulse" />
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-highlight mb-2">
            {AmironApp.name}
          </h3>
          <p className="text-xs text-text/60 mb-3 line-clamp-2">
            {AmironApp.description}
          </p>
          <Button
            variant="cyan"
            onClick={AmironApp.launch}
            className="w-full text-sm"
          >
            LAUNCH
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
