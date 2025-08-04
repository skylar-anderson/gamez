import SudokuGame from "./SudokuGame";

export default function SudokuPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Sudoku</h1>
        <p className="text-zinc-400">
          Fill the 9×9 grid so that every row, column, and 3×3 box contains the digits 1-9
        </p>
      </div>
      
      <SudokuGame />
    </div>
  );
}