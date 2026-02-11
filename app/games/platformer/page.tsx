"use client";

import PlatformerGame from "./PlatformerGame";

export default function PlatformerPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2 text-center">Pixel Runner</h1>
        <p className="text-zinc-400 text-center max-w-2xl mx-auto">
          Run, jump, and collect coins while avoiding enemies! Use arrow keys or WASD to move, and Space to jump.
        </p>
      </div>

      <PlatformerGame />
    </div>
  );
}
