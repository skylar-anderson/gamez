"use client";

import { useState, useCallback } from "react";

// Game status types
type GameStatus = "playing" | "won" | "draw";
type Player = "X" | "O";
type Cell = Player | null;
type Board = Cell[];

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

  // Check for a winner
  function checkWinner(board: Board): Player | null {
    // All possible winning combinations
    const winPatterns = [
      [0, 1, 2], // Top row
      [3, 4, 5], // Middle row
      [6, 7, 8], // Bottom row
      [0, 3, 6], // Left column
      [1, 4, 7], // Middle column
      [2, 5, 8], // Right column
      [0, 4, 8], // Diagonal top-left to bottom-right
      [2, 4, 6], // Diagonal top-right to bottom-left
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] as Player;
      }
    }

    return null;
  }

  // Handle cell click
  const handleCellClick = useCallback((index: number) => {
    setGameState(prev => {
      // Don't allow moves if game is over or cell is already filled
      if (prev.status !== "playing" || prev.board[index]) {
        return prev;
      }

      // Update the board with the current player's move
      const newBoard = [...prev.board];
      newBoard[index] = prev.currentPlayer;

      // Check for a winner
      const winner = checkWinner(newBoard);

      // Check for a draw (no empty cells left)
      const isDraw = !winner && newBoard.every(cell => cell !== null);

      // Determine new game status
      let newStatus: GameStatus = "playing";
      if (winner) {
        newStatus = "won";
      } else if (isDraw) {
        newStatus = "draw";
      }

      return {
        ...prev,
        board: newBoard,
        currentPlayer: prev.currentPlayer === "X" ? "O" : "X",
        status: newStatus,
        winner,
      };
    });
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="w-full">
        <div className="border-zinc-800 border p-6 rounded-lg shadow-md max-w-md mx-auto">
          {/* Game status display */}
          <div className="mb-6 text-center">
            {gameState.status === "playing" && (
              <p className="text-xl font-semibold">
                Current Player: <span className="text-blue-600">{gameState.currentPlayer}</span>
              </p>
            )}
            {gameState.status === "won" && (
              <p className="text-xl font-semibold text-green-600">
                Player {gameState.winner} Wins!
              </p>
            )}
            {gameState.status === "draw" && (
              <p className="text-xl font-semibold text-yellow-600">
                It's a Draw!
              </p>
            )}
          </div>

          {/* Game board */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {gameState.board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={gameState.status !== "playing" || cell !== null}
                className={`
                  aspect-square w-full h-24 rounded-lg border-2 text-4xl font-bold
                  transition-all duration-200
                  ${cell === null && gameState.status === "playing"
                    ? "border-zinc-700 hover:border-blue-400 hover:bg-zinc-800/50 cursor-pointer"
                    : "border-zinc-700"
                  }
                  ${cell === "X" ? "text-blue-500" : cell === "O" ? "text-red-500" : ""}
                  ${cell !== null || gameState.status !== "playing" ? "cursor-not-allowed" : ""}
                `}
              >
                {cell}
              </button>
            ))}
          </div>

          {/* Reset button */}
          <div className="text-center">
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {gameState.status === "playing" ? "Restart Game" : "Play Again"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
