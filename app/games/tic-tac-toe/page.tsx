"use client";

import TicTacToeGame from "./TicTacToeGame"

export default function TicTacToePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Tic Tac Toe</h1>
        <p className="text-zinc-400 text-center max-w-2xl mx-auto">
          Take turns placing X&apos;s and O&apos;s on the grid. Get three in a row, column, or diagonal to win!
        </p>
      </div>
      
      <TicTacToeGame />
    </div>
  );
}