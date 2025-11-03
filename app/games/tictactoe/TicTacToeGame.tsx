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
        return board[a] as Player;
      }
    }

    return null;
  }

  // Handle cell click
  const handleCellClick = useCallback((index: number) => {
    setGameState(prev => {
      // Don't allow moves if game is over or cell is occupied
      if (prev.status !== "playing" || prev.board[index] !== null) {
        return prev;
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
        <div className="border-zinc-800 border p-6 rounded-lg shadow-md max-w-lg mx-auto">
          {/* Game board */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {gameState.board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                className={`w-24 h-24 border-2 border-zinc-700 rounded-lg text-4xl font-bold transition-colors ${
                  cell === null && gameState.status === "playing"
                    ? "hover:border-blue-400 hover:bg-zinc-800"
                    : ""
                } ${
                  cell === "X" ? "text-blue-500" : cell === "O" ? "text-red-500" : ""
                }`}
                disabled={gameState.status !== "playing" || cell !== null}
              >
                {cell}
              </button>
            ))}
          </div>

          {/* Game status */}
          <div className="text-center">
            {gameState.status === "playing" && (
              <p className="text-xl mb-4">
                Current Player: <span className={gameState.currentPlayer === "X" ? "text-blue-500 font-bold" : "text-red-500 font-bold"}>{gameState.currentPlayer}</span>
              </p>
            )}
            
            {gameState.status === "won" && (
              <div className="bg-green-800 border-green-700 border text-white p-4 rounded-lg mb-4">
                <p className="text-xl font-bold">
                  Player <span className={gameState.winner === "X" ? "text-blue-300" : "text-red-300"}>{gameState.winner}</span> wins! 🎉
                </p>
              </div>
            )}
            
            {gameState.status === "draw" && (
              <div className="bg-yellow-800 border-yellow-700 border text-white p-4 rounded-lg mb-4">
                <p className="text-xl font-bold">It&apos;s a draw! 🤝</p>
              </div>
            )}

            <button
              onClick={resetGame}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {gameState.status === "playing" ? "Restart Game" : "Play Again"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
