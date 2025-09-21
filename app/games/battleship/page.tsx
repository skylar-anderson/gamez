"use client";

import BattleshipGame from "./BattleshipGame"

export default function BattleshipPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Battleship</h1>
        <p className="text-zinc-400 text-center max-w-2xl mx-auto">
          Sink all enemy ships before they sink yours! Click on the enemy grid to fire. Ships include: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), and Destroyer (2).
        </p>
      </div>
      
      <BattleshipGame />
    </div>
  );
}