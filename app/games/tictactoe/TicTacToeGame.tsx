"use client";

import { useState, useCallback } from "react";

// Game status types
type GameStatus = "playing" | "won" | "draw";
type Player = "X" | "O";
type Cell = Player | null;

interface GameState {
  board: Cell[];
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
}

// Initialize a new game
function initializeGame(): GameState {
  return {
    board: Array(9).fill(null),
    currentPlayer: "X",
    status: "playing",
    winner: null,
  };
}

// Check for a winner
function checkWinner(board: Cell[]): Player | null {
  const winningCombinations = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal top-left to bottom-right
    [2, 4, 6], // Diagonal top-right to bottom-left
  ];

  for (const [a, b, c] of winningCombinations) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

export default function TicTacToeGame() {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame());

  // Reset the game
  const resetGame = useCallback(() => {
    setGameState(initializeGame());
  }, []);

  // Handle cell click
  const handleCellClick = useCallback((index: number) => {
    setGameState(prev => {
      if (prev.status !== "playing" || prev.board[index] !== null) {
        return prev; // Don't allow moves on occupied cells or when game is over
      }

      const newBoard = [...prev.board];
      newBoard[index] = prev.currentPlayer;

      // Check for winner
      const winner = checkWinner(newBoard);
      
      // Check for draw
      const isDraw = !winner && newBoard.every(cell => cell !== null);

      let newStatus: GameStatus = "playing";
      if (winner) {
        newStatus = "won";
      } else if (isDraw) {
        newStatus = "draw";
      }

      return {
        board: newBoard,
        currentPlayer: prev.currentPlayer === "X" ? "O" : "X",
        status: newStatus,
        winner: winner,
      };
    });
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="w-full">
        <div className="border-zinc-800 border p-6 rounded-lg shadow-md max-w-2xl mx-auto">
          {/* Game board */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {gameState.board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={gameState.status !== "playing" || cell !== null}
                className={`
                  w-24 h-24 text-4xl font-bold rounded-lg border-2
                  transition-all duration-200
                  ${cell === "X" ? "text-blue-500" : "text-red-500"}
                  ${gameState.status === "playing" && cell === null
                    ? "border-zinc-700 hover:border-blue-400 hover:bg-zinc-800/50 cursor-pointer"
                    : "border-zinc-700 cursor-not-allowed"
                  }
                `}
              >
                {cell}
              </button>
            ))}
          </div>

          {/* Game status */}
          {gameState.status === "playing" && (
            <div className="text-center text-xl mb-4">
              Current Player: <span className={gameState.currentPlayer === "X" ? "text-blue-500 font-bold" : "text-red-500 font-bold"}>{gameState.currentPlayer}</span>
            </div>
          )}

          {/* Game result message */}
          {gameState.status !== "playing" && (
            <div className={`mt-4 p-4 rounded-lg ${
              gameState.status === "won" 
                ? "bg-green-800 border-green-700 border text-white" 
                : "bg-yellow-800 border-yellow-700 border text-white"
            }`}>
              {gameState.status === "won" 
                ? `Player ${gameState.winner} wins!` 
                : "It's a draw!"}
              <button
                onClick={resetGame}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 block w-full"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* Game controls */}
        {gameState.status === "playing" && (
          <div className="mt-6 max-w-2xl mx-auto text-center">
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Restart Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
