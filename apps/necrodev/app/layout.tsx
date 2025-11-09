import type { Metadata } from "next";
import "./globals.css";
import { CRTOverlay } from "@ui/components/CRTOverlay";

export const metadata: Metadata = {
  title: "NecroDev - Resurrection Lab",
  description: "Where Dead Tech Breathes Again",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-text font-primary">
        {children}
        <CRTOverlay />
      </body>
    </html>
  );
}

