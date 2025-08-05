"use client";

import SudokuGame from "./SudokuGame"

export default function SudokuPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Sudoku</h1>
        <p className="text-zinc-400 text-center max-w-2xl mx-auto">
          Fill the 9×9 grid with numbers 1-9 so that each row, column, and 3×3 box contains all digits exactly once. 
          Use note mode to mark possible numbers, get hints when stuck, and undo mistakes!
        </p>
      </div>
      
      <SudokuGame />
    </div>
  );
}