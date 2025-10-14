"use client";

import { useState, useCallback } from "react";

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

    setGameState(prev => {
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
      const isDraw = newBoard.every(cell => cell !== null);
      if (isDraw) {
        return {
          ...prev,
          board: newBoard,
          status: "draw",
        };
      }

      // Continue playing, switch player
      return {
        ...prev,
        board: newBoard,
        currentPlayer: prev.currentPlayer === "X" ? "O" : "X",
      };
    });
  }, [gameState.status, gameState.board]);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="w-full max-w-md">
        {/* Game status */}
        <div className="mb-6 text-center">
          {gameState.status === "playing" && (
            <div className="text-xl">
              Current Player: <span className="font-bold text-blue-500">{gameState.currentPlayer}</span>
            </div>
          )}
          {gameState.status === "won" && (
            <div className="text-2xl font-bold text-green-500">
              Player {gameState.winner} Wins! 🎉
            </div>
          )}
          {gameState.status === "draw" && (
            <div className="text-2xl font-bold text-yellow-500">
              It&apos;s a Draw! 🤝
            </div>
          )}
        </div>

        {/* Game board */}
        <div className="border-zinc-800 border rounded-lg p-6 shadow-lg bg-zinc-900">
          <div className="grid grid-cols-3 gap-3">
            {gameState.board.map((cell, index) => {
              const isWinningCell = gameState.winningLine?.includes(index);
              return (
                <button
                  key={index}
                  onClick={() => handleCellClick(index)}
                  disabled={gameState.status !== "playing" || cell !== null}
                  className={`
                    w-24 h-24 
                    border-2 rounded-lg
                    text-4xl font-bold
                    transition-all duration-200
                    ${cell === null && gameState.status === "playing"
                      ? "border-zinc-700 hover:border-blue-500 hover:bg-zinc-800 cursor-pointer"
                      : "border-zinc-700"
                    }
                    ${cell === "X" ? "text-blue-500" : ""}
                    ${cell === "O" ? "text-red-500" : ""}
                    ${isWinningCell ? "bg-green-900 border-green-500" : ""}
                    ${cell === null ? "" : "cursor-not-allowed"}
                  `}
                >
                  {cell}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reset button */}
        <div className="mt-6 text-center">
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            New Game
          </button>
        </div>

        {/* Game info */}
        <div className="mt-8 text-center text-zinc-400 text-sm">
          <p>Two players take turns marking X or O on a 3×3 grid.</p>
          <p className="mt-2">The first player to get 3 marks in a row wins!</p>
        </div>
      </div>
    </div>
  );
}
