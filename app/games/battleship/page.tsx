"use client";

import BattleshipGame from "./BattleshipGame";

export default function BattleshipPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Battleship</h1>
        <p className="text-zinc-400 text-center max-w-2xl mx-auto">
          A classic two-player naval combat game. Take turns placing your ships and attacking your opponent&apos;s fleet. Sink all enemy ships to win!
        </p>
      </div>
      
      <BattleshipGame />
    </div>
  );
}
