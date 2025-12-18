"use client";

import { useState, useCallback } from "react";

// Type for cell value
type CellValue = "X" | "O" | null;

// Type for game board
type Board = CellValue[];

// Game status types
type GameStatus = "playing" | "won" | "draw";

interface GameState {
  board: Board;
  currentPlayer: "X" | "O";
  status: GameStatus;
  winner: "X" | "O" | null;
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
  function checkWinner(board: Board): { winner: CellValue; line: number[] | null } {
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
        return { winner: board[a], line };
      }
    }

    return { winner: null, line: null };
  }

  // Handle cell click
  const handleCellClick = useCallback((index: number) => {
    setGameState((prev) => {
      if (prev.status !== "playing" || prev.board[index] !== null) {
        return prev;
      }

      const newBoard = [...prev.board];
      newBoard[index] = prev.currentPlayer;

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
      if (newBoard.every((cell) => cell !== null)) {
        return {
          ...prev,
          board: newBoard,
          status: "draw",
        };
      }

      // Switch player
      return {
        ...prev,
        board: newBoard,
        currentPlayer: prev.currentPlayer === "X" ? "O" : "X",
      };
    });
  }, []);

  // Render a cell
  function Cell({ index }: { index: number }) {
    const value = gameState.board[index];
    const isWinningCell = gameState.winningLine?.includes(index);

    return (
      <button
        onClick={() => handleCellClick(index)}
        className={`w-24 h-24 border-2 border-zinc-700 flex items-center justify-center text-4xl font-bold transition-colors ${
          gameState.status === "playing" && !value
            ? "hover:bg-zinc-800 cursor-pointer"
            : "cursor-default"
        } ${
          isWinningCell
            ? "bg-green-800 border-green-600"
            : ""
        }`}
        disabled={gameState.status !== "playing" || value !== null}
      >
        {value && (
          <span className={value === "X" ? "text-blue-400" : "text-red-400"}>
            {value}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="w-full">
        <div className="border-zinc-800 border p-6 rounded-lg shadow-md max-w-2xl mx-auto">
          {/* Game status */}
          <div className="text-center mb-6">
            {gameState.status === "playing" && (
              <p className="text-xl">
                Current player:{" "}
                <span
                  className={`font-bold ${
                    gameState.currentPlayer === "X"
                      ? "text-blue-400"
                      : "text-red-400"
                  }`}
                >
                  {gameState.currentPlayer}
                </span>
              </p>
            )}
            {gameState.status === "won" && (
              <div className="bg-green-800 border-green-700 border text-white p-4 rounded-lg">
                <p className="text-xl font-bold">
                  Player{" "}
                  <span
                    className={
                      gameState.winner === "X" ? "text-blue-300" : "text-red-300"
                    }
                  >
                    {gameState.winner}
                  </span>{" "}
                  wins!
                </p>
                <button
                  onClick={resetGame}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Play Again
                </button>
              </div>
            )}
            {gameState.status === "draw" && (
              <div className="bg-zinc-800 border-zinc-700 border text-white p-4 rounded-lg">
                <p className="text-xl font-bold">It&apos;s a draw!</p>
                <button
                  onClick={resetGame}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>

          {/* Game board */}
          <div className="grid grid-cols-3 gap-0 w-fit mx-auto">
            {Array.from({ length: 9 }, (_, i) => (
              <Cell key={i} index={i} />
            ))}
          </div>
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
