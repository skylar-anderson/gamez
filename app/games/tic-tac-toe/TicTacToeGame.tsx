"use client";

import { useState, useCallback } from "react";

type Player = "X" | "O" | null;
type Board = Player[];

interface GameState {
  board: Board;
  currentPlayer: "X" | "O";
  winner: Player | "draw" | null;
  gameOver: boolean;
}

export default function TicTacToeGame() {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame());

  // Initialize a new game
  function initializeGame(): GameState {
    return {
      board: Array(9).fill(null),
      currentPlayer: "X",
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
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6], // Diagonals
    ];

    // Check for winner
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    // Check for draw
    if (board.every(cell => cell !== null)) {
      return "draw";
    }

    return null;
  }, []);

  // Handle cell click
  const handleCellClick = useCallback((index: number) => {
    if (gameState.gameOver || gameState.board[index] !== null) {
      return;
    }

    setGameState(prev => {
      const newBoard = [...prev.board];
      newBoard[index] = prev.currentPlayer;

      const winner = checkWinner(newBoard);
      const gameOver = winner !== null;

      return {
        board: newBoard,
        currentPlayer: prev.currentPlayer === "X" ? "O" : "X",
        winner,
        gameOver,
      };
    });
  }, [gameState.gameOver, gameState.board, checkWinner]);

  // Get status message
  const getStatusMessage = () => {
    if (gameState.winner === "draw") {
      return "It's a draw!";
    }
    if (gameState.winner) {
      return `Player ${gameState.winner} wins!`;
    }
    return `Current player: ${gameState.currentPlayer}`;
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="w-full max-w-md">
        <div className="border-zinc-800 border p-6 rounded-lg shadow-md">
          {/* Status message */}
          <div className="mb-6 text-center">
            <p className={`text-lg font-semibold ${
              gameState.winner === "X" 
                ? "text-blue-600" 
                : gameState.winner === "O" 
                  ? "text-red-600" 
                  : gameState.winner === "draw"
                    ? "text-yellow-600"
                    : "text-zinc-300"
            }`}>
              {getStatusMessage()}
            </p>
          </div>

          {/* Game board */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {gameState.board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={gameState.gameOver || cell !== null}
                className={`
                  w-24 h-24 text-4xl font-bold rounded-lg
                  border-2 transition-all
                  ${cell === null 
                    ? "border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-600" 
                    : "border-zinc-600 bg-zinc-900"
                  }
                  ${cell === "X" 
                    ? "text-blue-500" 
                    : cell === "O" 
                      ? "text-red-500" 
                      : ""
                  }
                  ${gameState.gameOver || cell !== null 
                    ? "cursor-not-allowed opacity-75" 
                    : "cursor-pointer"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
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
              {gameState.gameOver ? "Play Again" : "Reset Game"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
