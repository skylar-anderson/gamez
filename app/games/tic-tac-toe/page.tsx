"use client";

import TicTacToeGame from "./TicTacToeGame"

export default function TicTacToePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Tic Tac Toe</h1>
        <p className="text-zinc-400 text-center max-w-2xl mx-auto">
          Two players take turns marking spaces in a 3×3 grid. The player who succeeds in placing three of their marks in a horizontal, vertical, or diagonal row wins the game.
        </p>
      </div>
      
      <TicTacToeGame />
    </div>
  );
}
