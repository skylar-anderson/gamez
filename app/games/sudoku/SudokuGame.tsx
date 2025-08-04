"use client";

import { useState, useCallback, useEffect } from "react";

type Cell = {
  value: number | null;
  isInitial: boolean;
  isValid: boolean;
};

type Grid = Cell[][];

type GameStatus = "playing" | "won" | "paused";

type Difficulty = "easy" | "medium" | "hard";

interface GameState {
  grid: Grid;
  solution: number[][];
  selectedCell: { row: number; col: number } | null;
  status: GameStatus;
  difficulty: Difficulty;
  startTime: number;
  elapsedTime: number;
}

const DIFFICULTIES = {
  easy: 40,
  medium: 50,
  hard: 60,
};

export default function SudokuGame() {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame("medium"));

  useEffect(() => {
    if (gameState.status === "playing") {
      const timer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          elapsedTime: Date.now() - prev.startTime,
        }));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState.status, gameState.startTime]);

  function initializeGame(difficulty: Difficulty): GameState {
    const solution = generateCompleteSudoku();
    const grid = createPuzzle(solution, DIFFICULTIES[difficulty]);
    
    return {
      grid,
      solution,
      selectedCell: null,
      status: "playing",
      difficulty,
      startTime: Date.now(),
      elapsedTime: 0,
    };
  }

  function generateCompleteSudoku(): number[][] {
    const grid: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));
    
    function isValid(grid: number[][], row: number, col: number, num: number): boolean {
      for (let i = 0; i < 9; i++) {
        if (grid[row][i] === num || grid[i][col] === num) return false;
      }
      
      const boxStartRow = Math.floor(row / 3) * 3;
      const boxStartCol = Math.floor(col / 3) * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (grid[boxStartRow + i][boxStartCol + j] === num) return false;
        }
      }
      
      return true;
    }
    
    function solve(grid: number[][]): boolean {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid[row][col] === 0) {
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
            for (const num of numbers) {
              if (isValid(grid, row, col, num)) {
                grid[row][col] = num;
                if (solve(grid)) return true;
                grid[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    }
    
    solve(grid);
    return grid;
  }

  function createPuzzle(solution: number[][], cellsToRemove: number): Grid {
    const grid: Grid = solution.map(row => 
      row.map(val => ({ value: val, isInitial: true, isValid: true }))
    );
    
    const cells = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        cells.push([i, j]);
      }
    }
    
    cells.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < cellsToRemove && i < cells.length; i++) {
      const [row, col] = cells[i];
      grid[row][col] = { value: null, isInitial: false, isValid: true };
    }
    
    return grid;
  }

  const selectCell = useCallback((row: number, col: number) => {
    if (gameState.status !== "playing") return;
    
    setGameState(prev => ({
      ...prev,
      selectedCell: { row, col },
    }));
  }, [gameState.status]);

  const setValue = useCallback((value: number | null) => {
    if (!gameState.selectedCell || gameState.status !== "playing") return;
    
    const { row, col } = gameState.selectedCell;
    if (gameState.grid[row][col].isInitial) return;
    
    setGameState(prev => {
      const newGrid = prev.grid.map(gridRow => 
        gridRow.map(cell => ({ ...cell }))
      );
      
      newGrid[row][col].value = value;
      newGrid[row][col].isValid = value === null || value === prev.solution[row][col];
      
      const isComplete = newGrid.every(gridRow => 
        gridRow.every(cell => cell.value !== null)
      );
      
      const isCorrect = isComplete && newGrid.every((gridRow, r) => 
        gridRow.every((cell, c) => cell.value === prev.solution[r][c])
      );
      
      return {
        ...prev,
        grid: newGrid,
        status: isCorrect ? "won" : prev.status,
      };
    });
  }, [gameState.selectedCell, gameState.status, gameState.grid]);

  const newGame = useCallback((difficulty: Difficulty) => {
    const solution = generateCompleteSudoku();
    const grid = createPuzzle(solution, DIFFICULTIES[difficulty]);
    
    setGameState({
      grid,
      solution,
      selectedCell: null,
      status: "playing",
      difficulty,
      startTime: Date.now(),
      elapsedTime: 0,
    });
  }, []);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameState.status !== "playing" || !gameState.selectedCell) return;
    
    const key = e.key;
    if (key >= '1' && key <= '9') {
      setValue(parseInt(key));
    } else if (key === 'Backspace' || key === 'Delete') {
      setValue(null);
    }
  }, [gameState.status, gameState.selectedCell, setValue]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="flex items-center justify-between w-full max-w-2xl">
        <div className="text-lg font-semibold">
          Time: {formatTime(gameState.elapsedTime)}
        </div>
        <div className="flex gap-2">
          <select 
            value={gameState.difficulty}
            onChange={(e) => newGame(e.target.value as Difficulty)}
            className="px-3 py-1 border rounded bg-white text-black"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button
            onClick={() => newGame(gameState.difficulty)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            New Game
          </button>
        </div>
      </div>

      <div className="grid grid-cols-9 gap-0 border-2 border-gray-800 bg-white">
        {gameState.grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isSelected = gameState.selectedCell?.row === rowIndex && 
                             gameState.selectedCell?.col === colIndex;
            const isHighlighted = gameState.selectedCell && (
              gameState.selectedCell.row === rowIndex ||
              gameState.selectedCell.col === colIndex ||
              (Math.floor(gameState.selectedCell.row / 3) === Math.floor(rowIndex / 3) &&
               Math.floor(gameState.selectedCell.col / 3) === Math.floor(colIndex / 3))
            );
            
            const borderClasses = [
              rowIndex % 3 === 0 ? 'border-t-2 border-t-gray-800' : 'border-t border-t-gray-400',
              colIndex % 3 === 0 ? 'border-l-2 border-l-gray-800' : 'border-l border-l-gray-400',
              rowIndex === 8 ? 'border-b-2 border-b-gray-800' : '',
              colIndex === 8 ? 'border-r-2 border-r-gray-800' : '',
            ].filter(Boolean).join(' ');
            
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-12 h-12 flex items-center justify-center text-lg font-semibold
                  ${isSelected ? 'bg-blue-200' : isHighlighted ? 'bg-gray-100' : 'bg-white'}
                  ${cell.isInitial ? 'text-black font-bold' : 'text-blue-600'}
                  ${!cell.isValid ? 'text-red-600 bg-red-50' : ''}
                  ${borderClasses}
                  hover:bg-gray-50
                `}
                onClick={() => selectCell(rowIndex, colIndex)}
              >
                {cell.value || ''}
              </button>
            );
          })
        )}
      </div>

      {gameState.selectedCell && !gameState.grid[gameState.selectedCell.row][gameState.selectedCell.col].isInitial && (
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => setValue(num)}
              className="w-12 h-12 border border-gray-400 rounded hover:bg-gray-100 font-semibold"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setValue(null)}
            className="w-12 h-12 border border-gray-400 rounded hover:bg-gray-100 text-red-600 font-semibold"
          >
            ✕
          </button>
        </div>
      )}

      {gameState.status === "won" && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded max-w-md text-center">
          <div className="font-bold">Congratulations!</div>
          <div>You solved the puzzle in {formatTime(gameState.elapsedTime)}!</div>
          <button
            onClick={() => newGame(gameState.difficulty)}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Play Again
          </button>
        </div>
      )}

      <div className="text-sm text-gray-600 max-w-md text-center">
        Click on a cell to select it, then use the number buttons or keyboard (1-9) to enter values. 
        Use Backspace or the ✕ button to clear a cell.
      </div>
    </div>
  );
}