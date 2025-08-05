"use client";

import { useState, useCallback, useEffect } from "react";

// Types for the game
type CellValue = number | null;
type GameStatus = "playing" | "won" | "paused";
type Difficulty = "easy" | "medium" | "hard";

interface CellState {
  value: CellValue;
  isGiven: boolean;
  hasError: boolean;
  notes: Set<number>;
}

interface GameState {
  grid: CellState[][];
  selectedCell: { row: number; col: number } | null;
  selectedNumber: number | null;
  status: GameStatus;
  difficulty: Difficulty;
  startTime: number;
  elapsedTime: number;
  hintsUsed: number;
  maxHints: number;
  moves: { grid: CellState[][]; action: string }[];
}

export default function SudokuGame() {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame("medium"));
  const [noteMode, setNoteMode] = useState(false);

  // Initialize a new game
  function initializeGame(difficulty: Difficulty): GameState {
    const puzzle = generateSudokuPuzzle(difficulty);
    
    return {
      grid: puzzle,
      selectedCell: null,
      selectedNumber: null,
      status: "playing",
      difficulty,
      startTime: Date.now(),
      elapsedTime: 0,
      hintsUsed: 0,
      maxHints: difficulty === "easy" ? 5 : difficulty === "medium" ? 3 : 1,
      moves: [],
    };
  }

  // Generate a Sudoku puzzle
  function generateSudokuPuzzle(difficulty: Difficulty): CellState[][] {
    // Create empty grid
    const grid: CellState[][] = Array(9).fill(null).map(() =>
      Array(9).fill(null).map(() => ({
        value: null,
        isGiven: false,
        hasError: false,
        notes: new Set<number>(),
      }))
    );

    // Fill the grid with a valid solution
    fillGrid(grid);
    
    // Remove cells based on difficulty
    const cellsToRemove = difficulty === "easy" ? 35 : difficulty === "medium" ? 45 : 55;
    removeCells(grid, cellsToRemove);
    
    return grid;
  }

  // Fill grid with valid Sudoku solution
  function fillGrid(grid: CellState[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col].value === null) {
          const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          
          for (const num of numbers) {
            if (isValidMove(grid, row, col, num)) {
              grid[row][col].value = num;
              
              if (fillGrid(grid)) {
                return true;
              }
              
              grid[row][col].value = null;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  // Remove cells to create puzzle
  function removeCells(grid: CellState[][], count: number) {
    const cells = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        cells.push({ row, col });
      }
    }
    
    // Shuffle cells
    cells.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < count && i < cells.length; i++) {
      const { row, col } = cells[i];
      grid[row][col].value = null;
      grid[row][col].isGiven = false;
    }
    
    // Mark remaining cells as given
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col].value !== null) {
          grid[row][col].isGiven = true;
        }
      }
    }
  }

  // Check if a move is valid
  function isValidMove(grid: CellState[][], row: number, col: number, num: number): boolean {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && grid[row][c].value === num) {
        return false;
      }
    }
    
    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && grid[r][col].value === num) {
        return false;
      }
    }
    
    // Check 3x3 box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if ((r !== row || c !== col) && grid[r][c].value === num) {
          return false;
        }
      }
    }
    
    return true;
  }

  // Update error states
  function updateErrorStates(grid: CellState[][]) {
    // Reset all errors
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        grid[row][col].hasError = false;
      }
    }
    
    // Check for conflicts
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = grid[row][col].value;
        if (value !== null && !isValidMove(grid, row, col, value)) {
          grid[row][col].hasError = true;
        }
      }
    }
  }

  // Check if puzzle is completed
  function isPuzzleComplete(grid: CellState[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col].value === null || grid[row][col].hasError) {
          return false;
        }
      }
    }
    return true;
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState.status === "playing") {
      interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          elapsedTime: Date.now() - prev.startTime,
        }));
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [gameState.status, gameState.startTime]);

  // Select cell
  const selectCell = useCallback((row: number, col: number) => {
    if (gameState.status !== "playing") return;
    
    setGameState(prev => ({
      ...prev,
      selectedCell: { row, col },
      selectedNumber: prev.grid[row][col].value,
    }));
  }, [gameState.status]);

  // Set cell value
  const setCellValue = useCallback((row: number, col: number, value: number | null) => {
    if (gameState.status !== "playing" || gameState.grid[row][col].isGiven) return;
    
    setGameState(prev => {
      const newGrid = prev.grid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
      
      // Save current state for undo
      const newMoves = [...prev.moves, { 
        grid: prev.grid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) }))), 
        action: `Set ${row},${col} to ${value}` 
      }];
      
      if (noteMode && value !== null) {
        // Toggle note
        if (newGrid[row][col].notes.has(value)) {
          newGrid[row][col].notes.delete(value);
        } else {
          newGrid[row][col].notes.add(value);
        }
      } else {
        // Set value and clear notes
        newGrid[row][col].value = value;
        newGrid[row][col].notes.clear();
      }
      
      updateErrorStates(newGrid);
      
      const isComplete = isPuzzleComplete(newGrid);
      
      return {
        ...prev,
        grid: newGrid,
        moves: newMoves.slice(-50), // Keep last 50 moves
        status: isComplete ? "won" : "playing",
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.status, noteMode]);

  // Select number for input
  const selectNumber = useCallback((num: number) => {
    setGameState(prev => ({
      ...prev,
      selectedNumber: prev.selectedNumber === num ? null : num,
    }));
  }, []);

  // Input number in selected cell
  const inputNumber = useCallback((num: number) => {
    if (gameState.selectedCell) {
      setCellValue(gameState.selectedCell.row, gameState.selectedCell.col, num);
    }
  }, [gameState.selectedCell, setCellValue]);

  // Clear cell
  const clearCell = useCallback(() => {
    if (gameState.selectedCell) {
      setCellValue(gameState.selectedCell.row, gameState.selectedCell.col, null);
    }
  }, [gameState.selectedCell, setCellValue]);

  // Undo last move
  const undoMove = useCallback(() => {
    if (gameState.moves.length === 0) return;
    
    setGameState(prev => {
      const lastMove = prev.moves[prev.moves.length - 1];
      return {
        ...prev,
        grid: lastMove.grid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) }))),
        moves: prev.moves.slice(0, -1),
      };
    });
  }, [gameState.moves]);

  // Get hint
  const getHint = useCallback(() => {
    if (gameState.hintsUsed >= gameState.maxHints) return;
    
    // Find empty cells
    const emptyCells = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (gameState.grid[row][col].value === null) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    if (emptyCells.length === 0) return;
    
    // Pick random empty cell and find valid number
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    for (let num = 1; num <= 9; num++) {
      if (isValidMove(gameState.grid, randomCell.row, randomCell.col, num)) {
        setCellValue(randomCell.row, randomCell.col, num);
        setGameState(prev => ({
          ...prev,
          hintsUsed: prev.hintsUsed + 1,
        }));
        break;
      }
    }
  }, [gameState.grid, gameState.hintsUsed, gameState.maxHints, setCellValue]);

  // Start new game
  const startNewGame = useCallback((difficulty: Difficulty) => {
    setGameState(initializeGame(difficulty));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format time
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold">
            Time: {formatTime(gameState.elapsedTime)}
          </div>
          <div className="text-lg">
            Difficulty: <span className="capitalize font-semibold text-blue-400">{gameState.difficulty}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNoteMode(!noteMode)}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              noteMode 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {noteMode ? "Note Mode ON" : "Note Mode OFF"}
          </button>
          <button
            onClick={undoMove}
            disabled={gameState.moves.length === 0}
            className="px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
          >
            Undo
          </button>
          <button
            onClick={getHint}
            disabled={gameState.hintsUsed >= gameState.maxHints}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
          >
            Hint ({gameState.hintsUsed}/{gameState.maxHints})
          </button>
        </div>
      </div>

      {/* Sudoku Grid */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="grid grid-cols-9 gap-1 w-fit mx-auto" style={{ maxWidth: "450px" }}>
          {gameState.grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isSelected = 
                gameState.selectedCell?.row === rowIndex && gameState.selectedCell?.col === colIndex;
              const isHighlighted = 
                gameState.selectedNumber !== null && 
                cell.value === gameState.selectedNumber;
              const isInSameRowOrCol = 
                gameState.selectedCell && 
                (gameState.selectedCell.row === rowIndex || gameState.selectedCell.col === colIndex);
              const isInSameBox = 
                gameState.selectedCell && 
                Math.floor(gameState.selectedCell.row / 3) === Math.floor(rowIndex / 3) &&
                Math.floor(gameState.selectedCell.col / 3) === Math.floor(colIndex / 3);

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => selectCell(rowIndex, colIndex)}
                  className={`
                    w-12 h-12 text-lg font-bold border transition-all relative
                    ${isSelected ? "bg-blue-200 border-blue-500 border-2" : ""}
                    ${isHighlighted ? "bg-blue-100" : ""}
                    ${isInSameRowOrCol && !isSelected ? "bg-gray-100" : ""}
                    ${isInSameBox && !isSelected && !isInSameRowOrCol ? "bg-gray-50" : ""}
                    ${cell.hasError ? "bg-red-100 text-red-600" : ""}
                    ${cell.isGiven ? "bg-gray-200 text-black font-extrabold" : "text-blue-600"}
                    ${(rowIndex + 1) % 3 === 0 && rowIndex !== 8 ? "border-b-2 border-black" : ""}
                    ${(colIndex + 1) % 3 === 0 && colIndex !== 8 ? "border-r-2 border-black" : ""}
                    ${rowIndex % 3 === 0 && rowIndex !== 0 ? "border-t-2 border-black" : ""}
                    ${colIndex % 3 === 0 && colIndex !== 0 ? "border-l-2 border-black" : ""}
                    hover:bg-gray-50
                  `}
                >
                  {cell.value || ""}
                  {cell.notes.size > 0 && !cell.value && (
                    <div className="absolute inset-0 grid grid-cols-3 gap-0 text-xs text-gray-400 p-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <div key={num} className="text-center">
                          {cell.notes.has(num) ? num : ""}
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Number Input */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="flex justify-center gap-2 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => {
                selectNumber(num);
                inputNumber(num);
              }}
              className={`
                w-12 h-12 text-xl font-bold rounded transition-all
                ${gameState.selectedNumber === num 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }
              `}
            >
              {num}
            </button>
          ))}
          <button
            onClick={clearCell}
            className="w-12 h-12 text-xl font-bold rounded bg-red-100 text-red-600 hover:bg-red-200 transition-all"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-3">Start New Game</h3>
        <div className="flex gap-2 flex-wrap">
          {(["easy", "medium", "hard"] as Difficulty[]).map(difficulty => (
            <button
              key={difficulty}
              onClick={() => startNewGame(difficulty)}
              className={`
                px-4 py-2 rounded font-medium transition-colors capitalize
                ${gameState.difficulty === difficulty 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }
              `}
            >
              {difficulty}
            </button>
          ))}
        </div>
      </div>

      {/* Win Message */}
      {gameState.status === "won" && (
        <div className="bg-green-800 border-green-700 border text-white p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-2">🎉 Congratulations! 🎉</h2>
          <p className="text-lg">
            You completed the {gameState.difficulty} puzzle in {formatTime(gameState.elapsedTime)}!
          </p>
          <p className="text-sm mt-2 opacity-90">
            Hints used: {gameState.hintsUsed}/{gameState.maxHints}
          </p>
        </div>
      )}
    </div>
  );
}