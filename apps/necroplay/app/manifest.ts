import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NecroPlay - Graveyard Arcade",
    short_name: "NecroPlay",
    description: "Play legacy file formats in modern browsers",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0612",
    theme_color: "#a855f7",
    orientation: "any",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Play",
        short_name: "Play",
        description: "Play a file",
        url: "/play",
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
        ],
      },
      {
        name: "Analytics",
        short_name: "Analytics",
        description: "View analytics",
        url: "/analytics",
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
        ],
      },
    ],
    categories: ["entertainment", "games", "utilities"],
  };
}

