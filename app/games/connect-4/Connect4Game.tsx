"use client";

import { useState, useCallback } from "react";

type Player = "Red" | "Yellow" | null;
type Board = Player[][];

interface GameState {
  board: Board;
  currentPlayer: "Red" | "Yellow";
  winner: Player | "draw" | null;
  gameOver: boolean;
}

const ROWS = 6;
const COLS = 7;

export default function Connect4Game() {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame());

  // Initialize a new game
  function initializeGame(): GameState {
    return {
      board: Array(ROWS).fill(null).map(() => Array(COLS).fill(null)),
      currentPlayer: "Red",
      winner: null,
      gameOver: false,
    };
  }

  // Reset the game
  const resetGame = useCallback(() => {
    setGameState(initializeGame());
  }, []);

  // Check for winner or draw
  const checkWinner = useCallback((board: Board): Player | "draw" | null => {
    // Check horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col <= COLS - 4; col++) {
        const player = board[row][col];
        if (
          player &&
          player === board[row][col + 1] &&
          player === board[row][col + 2] &&
          player === board[row][col + 3]
        ) {
          return player;
        }
      }
    }

    // Check vertical
    for (let row = 0; row <= ROWS - 4; row++) {
      for (let col = 0; col < COLS; col++) {
        const player = board[row][col];
        if (
          player &&
          player === board[row + 1][col] &&
          player === board[row + 2][col] &&
          player === board[row + 3][col]
        ) {
          return player;
        }
      }
    }

    // Check diagonal (down-right)
    for (let row = 0; row <= ROWS - 4; row++) {
      for (let col = 0; col <= COLS - 4; col++) {
        const player = board[row][col];
        if (
          player &&
          player === board[row + 1][col + 1] &&
          player === board[row + 2][col + 2] &&
          player === board[row + 3][col + 3]
        ) {
          return player;
        }
      }
    }

    // Check diagonal (down-left)
    for (let row = 0; row <= ROWS - 4; row++) {
      for (let col = 3; col < COLS; col++) {
        const player = board[row][col];
        if (
          player &&
          player === board[row + 1][col - 1] &&
          player === board[row + 2][col - 2] &&
          player === board[row + 3][col - 3]
        ) {
          return player;
        }
      }
    }

    // Check for draw
    if (board.every(row => row.every(cell => cell !== null))) {
      return "draw";
    }

    return null;
  }, []);

  // Handle column click (drop piece)
  const handleColumnClick = useCallback((col: number) => {
    if (gameState.gameOver) {
      return;
    }

    setGameState(prev => {
      // Find the lowest empty row in the column
      let row = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (prev.board[r][col] === null) {
          row = r;
          break;
        }
      }

      // Column is full
      if (row === -1) {
        return prev;
      }

      const newBoard = prev.board.map(r => [...r]);
      newBoard[row][col] = prev.currentPlayer;

      const winner = checkWinner(newBoard);
      const gameOver = winner !== null;

      return {
        board: newBoard,
        currentPlayer: prev.currentPlayer === "Red" ? "Yellow" : "Red",
        winner,
        gameOver,
      };
    });
  }, [gameState.gameOver, checkWinner]);

  // Get status message
  const getStatusMessage = () => {
    if (gameState.winner === "draw") {
      return "It's a draw!";
    }
    if (gameState.winner) {
      return `${gameState.winner} wins!`;
    }
    return `Current player: ${gameState.currentPlayer}`;
  };

  // Check if column is full
  const isColumnFull = (col: number) => {
    return gameState.board[0][col] !== null;
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="w-full max-w-2xl">
        <div className="border-zinc-800 border p-6 rounded-lg shadow-md">
          {/* Status message */}
          <div className="mb-6 text-center">
            <p className={`text-lg font-semibold ${
              gameState.winner === "Red" 
                ? "text-red-500" 
                : gameState.winner === "Yellow" 
                  ? "text-yellow-500" 
                  : gameState.winner === "draw"
                    ? "text-zinc-400"
                    : gameState.currentPlayer === "Red"
                      ? "text-red-500"
                      : "text-yellow-500"
            }`}>
              {getStatusMessage()}
            </p>
          </div>

          {/* Game board */}
          <div className="inline-block bg-blue-700 p-4 rounded-lg">
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
              {Array.from({ length: COLS }).map((_, col) => (
                <div key={col} className="flex flex-col gap-2">
                  {/* Column button */}
                  <button
                    onClick={() => handleColumnClick(col)}
                    disabled={gameState.gameOver || isColumnFull(col)}
                    className={`
                      w-16 h-8 rounded-t-lg transition-all font-medium text-sm
                      ${gameState.gameOver || isColumnFull(col)
                        ? "bg-zinc-600 cursor-not-allowed opacity-50" 
                        : gameState.currentPlayer === "Red"
                          ? "bg-red-500 hover:bg-red-600 cursor-pointer"
                          : "bg-yellow-400 hover:bg-yellow-500 cursor-pointer"
                      }
                    `}
                  >
                    ↓
                  </button>
                  {/* Column cells */}
                  {Array.from({ length: ROWS }).map((_, row) => {
                    const cell = gameState.board[row][col];
                    return (
                      <div
                        key={`${row}-${col}`}
                        className={`
                          w-16 h-16 rounded-full border-2
                          ${cell === null 
                            ? "bg-white border-zinc-300" 
                            : cell === "Red"
                              ? "bg-red-500 border-red-600"
                              : "bg-yellow-400 border-yellow-500"
                          }
                        `}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <div className="text-center mt-6">
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {gameState.gameOver ? "Play Again" : "Reset Game"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
