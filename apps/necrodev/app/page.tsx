"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button, GlitchText } from "@ui";
import { useState, useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const [bloodMode, setBloodMode] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    // Fog animation background
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "-1";
    canvas.style.opacity = "0.3";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles: Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
      }> = [];

      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
        });
      }

      const animate = () => {
        ctx.fillStyle = "#0a0612";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

          ctx.fillStyle = "#a855f7";
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });

        requestAnimationFrame(animate);
      };

      animate();
    }

    return () => {
      document.body.removeChild(canvas);
    };
  }, []);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 3) {
      setBloodMode(!bloodMode);
      setClickCount(0);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background ${
        bloodMode ? "blood-mode" : ""
      }`}
      style={{ backgroundColor: "#0a0612", color: "#f5f5f5" }}
    >
      {/* Documentation button */}
      <div className="absolute top-8 right-8 z-50">
        <Button
          variant="violet"
          onClick={() => {
            const docsUrl = process.env.NEXT_PUBLIC_NECROPLAY_URL 
              ? `${process.env.NEXT_PUBLIC_NECROPLAY_URL}/docs`
              : "https://necroplay.netlify.app/docs";
            window.location.href = docsUrl;
          }}
          className="gap-2"
        >
          📚 Docs
        </Button>
      </div>

      {/* Data veins background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="data-veins absolute top-0"
            style={{
              left: `${20 + i * 20}%`,
              animationDelay: `${i * 2}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 relative"
        style={{ zIndex: 10 }}
      >
        <motion.h1
          className="text-6xl md:text-8xl font-bold mb-8 cursor-pointer"
          onClick={handleLogoClick}
          whileHover={{ scale: 1.05 }}
          style={{
            color: bloodMode ? "#ff006e" : "#a855f7",
            textShadow: bloodMode
              ? "0 0 20px rgba(255, 0, 110, 0.8)"
              : "0 0 20px rgba(168, 85, 247, 0.8)",
            position: "relative",
            zIndex: 10,
          }}
        >
          <GlitchText>Necroverse</GlitchText>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl mb-12 text-highlight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            color: "#00fff7",
            position: "relative",
            zIndex: 10,
          }}
        >
          Where Dead Tech Breathes Again
        </motion.p>

        <motion.div
          className="flex flex-col md:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ position: "relative", zIndex: 10 }}
        >
          <Button
            variant="violet"
            onClick={() => router.push("/lab")}
            className="text-lg px-8 py-4"
          >
            🧠 NecroDev
            <span className="block text-xs opacity-70">Resurrection Lab</span>
          </Button>
          <Button
            variant="cyan"
            onClick={() => {
              const necroplayUrl = process.env.NEXT_PUBLIC_NECROPLAY_URL || "https://necroplay.netlify.app";
              window.location.href = necroplayUrl;
            }}
            className="text-lg px-8 py-4"
          >
            💀 NecroPlay
            <span className="block text-xs opacity-70">Graveyard Arcade</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              const amironUrl = process.env.NEXT_PUBLIC_AMIRON_URL || "https://amiron.netlify.app";
              window.location.href = amironUrl;
            }}
            className="text-lg px-8 py-4 border-2 border-purple-500"
          >
            ☠️ Amiron Desktop
            <span className="block text-xs opacity-70">OS Realm</span>
          </Button>
        </motion.div>
      </motion.div>

      <style jsx>{`
        .blood-mode {
          --accent-glow: #ff006e;
        }
      `}</style>
    </div>
  );
}

