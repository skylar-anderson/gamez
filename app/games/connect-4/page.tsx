"use client";

import Connect4Game from "./Connect4Game";

export default function Connect4Page() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Connect 4</h1>
        <p className="text-zinc-400 text-center max-w-2xl mx-auto">
          Take turns dropping colored discs into a seven-column, six-row grid. The first player to get four of their discs in a row (horizontally, vertically, or diagonally) wins!
        </p>
      </div>
      
      <Connect4Game />
    </div>
  );
}
