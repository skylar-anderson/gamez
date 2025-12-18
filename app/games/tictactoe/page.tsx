"use client";

import TicTacToeGame from "./TicTacToeGame";

export default function TicTacToePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Tic Tac Toe</h1>
        <p className="text-zinc-400 text-center max-w-2xl mx-auto">
          A classic two-player game. Players take turns marking spaces on a 3×3 grid. The first player to get three of their marks in a row (horizontally, vertically, or diagonally) wins!
        </p>
      </div>
      
      <TicTacToeGame />
    </div>
  );
}
