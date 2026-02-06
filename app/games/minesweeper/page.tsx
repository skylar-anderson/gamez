"use client";

import MinesweeperGame from "./MinesweeperGame";

export default function MinesweeperPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Minesweeper</h1>
      <p className="text-zinc-400 mb-6">
        Clear the minefield without detonating any mines. Numbers indicate how many adjacent cells contain mines.
      </p>
      <MinesweeperGame />
    </div>
  );
}
