"use client";

import { useState, useCallback } from "react";

// Types
type Player = "X" | "O";
type Cell = Player | null;
type Board = Cell[];
type GameStatus = "playing" | "won" | "draw";

interface GameState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
}

export default function TicTacToeGame() {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame());

  // Initialize a new game
  function initializeGame(): GameState {
    return {
      board: Array(9).fill(null),
      currentPlayer: "X",
      status: "playing",
      winner: null,
    };
  }

  // Reset the game
  const resetGame = useCallback(() => {
    setGameState(initializeGame());
  }, []);

  // Handle cell click
  const handleCellClick = useCallback((index: number) => {
    setGameState(prev => {
      if (prev.status !== "playing" || prev.board[index] !== null) {
        return prev;
      }

      const newBoard = [...prev.board];
      newBoard[index] = prev.currentPlayer;

      // Check for winner
      const winner = checkWinner(newBoard);
      
      // Check for draw
      const isDraw = !winner && newBoard.every(cell => cell !== null);

      return {
        ...prev,
        board: newBoard,
        currentPlayer: prev.currentPlayer === "X" ? "O" : "X",
        status: winner ? "won" : isDraw ? "draw" : "playing",
        winner: winner,
      };
    });
  }, []);

  // Check for a winner
  function checkWinner(board: Board): Player | null {
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

    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] as Player;
      }
    }

    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="w-full max-w-md mx-auto">
        <div className="border-zinc-800 border p-6 rounded-lg shadow-md">
          {/* Game board */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {gameState.board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={gameState.status !== "playing" || cell !== null}
                className={`w-full aspect-square flex items-center justify-center text-4xl font-bold rounded-lg border-2 transition-all ${
                  cell === null && gameState.status === "playing"
                    ? "border-zinc-700 hover:border-blue-500 hover:bg-zinc-800"
                    : "border-zinc-700"
                } ${
                  cell === "X" ? "text-blue-500" : cell === "O" ? "text-green-500" : ""
                }`}
              >
                {cell}
              </button>
            ))}
          </div>

          {/* Status message */}
          <div className="text-center mb-4">
            {gameState.status === "playing" && (
              <p className="text-lg">
                Current player: <span className={gameState.currentPlayer === "X" ? "text-blue-500" : "text-green-500"}>{gameState.currentPlayer}</span>
              </p>
            )}
            {gameState.status === "won" && (
              <div className="p-4 rounded-lg bg-green-800 border-green-700 border text-white">
                <p className="text-xl font-bold">Player {gameState.winner} wins!</p>
              </div>
            )}
            {gameState.status === "draw" && (
              <div className="p-4 rounded-lg bg-yellow-800 border-yellow-700 border text-white">
                <p className="text-xl font-bold">It&apos;s a draw!</p>
              </div>
            )}
          </div>

          {/* Reset button */}
          <button
            onClick={resetGame}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {gameState.status === "playing" ? "Restart Game" : "Play Again"}
          </button>
        </div>
      </div>
    </div>
  );
}
