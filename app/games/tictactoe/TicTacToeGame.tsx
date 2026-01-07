"use client";

import { useState, useCallback } from "react";

// Types for the game
type Player = "X" | "O";
type Cell = Player | null;
type Board = Cell[];
type GameStatus = "playing" | "won" | "draw";

interface GameState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  winningLine: number[] | null;
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
      winningLine: null,
    };
  }

  // Reset the game
  const resetGame = useCallback(() => {
    setGameState(initializeGame());
  }, []);

  // Check for a winner
  function checkWinner(board: Board): { winner: Player | null; line: number[] | null } {
    const lines = [
      [0, 1, 2], // Top row
      [3, 4, 5], // Middle row
      [6, 7, 8], // Bottom row
      [0, 3, 6], // Left column
      [1, 4, 7], // Middle column
      [2, 5, 8], // Right column
      [0, 4, 8], // Diagonal top-left to bottom-right
      [2, 4, 6], // Diagonal top-right to bottom-left
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a] as Player, line };
      }
    }

    return { winner: null, line: null };
  }

  // Handle cell click
  const handleCellClick = useCallback((index: number) => {
    if (gameState.status !== "playing" || gameState.board[index] !== null) {
      return; // Don't allow moves if game is over or cell is occupied
    }

    setGameState((prev) => {
      const newBoard = [...prev.board];
      newBoard[index] = prev.currentPlayer;

      // Check for winner
      const { winner, line } = checkWinner(newBoard);

      if (winner) {
        return {
          ...prev,
          board: newBoard,
          status: "won",
          winner,
          winningLine: line,
        };
      }

      // Check for draw
      const isDraw = newBoard.every((cell) => cell !== null);
      if (isDraw) {
        return {
          ...prev,
          board: newBoard,
          status: "draw",
        };
      }

      // Continue game with next player
      return {
        ...prev,
        board: newBoard,
        currentPlayer: prev.currentPlayer === "X" ? "O" : "X",
      };
    });
  }, [gameState.status, gameState.board]);

  // Check if a cell is part of the winning line
  const isWinningCell = (index: number): boolean => {
    return gameState.winningLine?.includes(index) || false;
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="w-full">
        <div className="border-zinc-800 border p-6 rounded-lg shadow-md max-w-md mx-auto">
          {/* Game status */}
          <div className="text-center mb-6">
            {gameState.status === "playing" && (
              <p className="text-xl font-semibold">
                Current Player: <span className="text-blue-500">{gameState.currentPlayer}</span>
              </p>
            )}
            {gameState.status === "won" && (
              <div className="bg-green-800 border-green-700 border text-white p-4 rounded-lg">
                <p className="text-xl font-bold">
                  Player {gameState.winner} wins! 🎉
                </p>
              </div>
            )}
            {gameState.status === "draw" && (
              <div className="bg-yellow-800 border-yellow-700 border text-white p-4 rounded-lg">
                <p className="text-xl font-bold">
                  It&apos;s a draw! 🤝
                </p>
              </div>
            )}
          </div>

          {/* Game board */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {gameState.board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={gameState.status !== "playing" || cell !== null}
                className={`
                  w-24 h-24 text-4xl font-bold rounded-lg border-2 
                  transition-all duration-200
                  ${cell === null && gameState.status === "playing"
                    ? "border-zinc-700 hover:border-blue-500 hover:bg-zinc-800"
                    : "border-zinc-700"
                  }
                  ${isWinningCell(index) ? "bg-green-900 border-green-700" : "bg-zinc-900"}
                  ${cell !== null ? "cursor-default" : "cursor-pointer"}
                  disabled:cursor-not-allowed
                `}
              >
                {cell && (
                  <span className={cell === "X" ? "text-blue-500" : "text-red-500"}>
                    {cell}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Reset button */}
          <div className="text-center">
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {gameState.status === "playing" ? "Restart Game" : "Play Again"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
