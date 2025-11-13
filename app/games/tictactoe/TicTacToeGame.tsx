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

  function initializeGame(): GameState {
    return {
      board: Array(9).fill(null),
      currentPlayer: "X",
      status: "playing",
      winner: null,
      winningLine: null,
    };
  }

  const checkWinner = useCallback((board: Board): { winner: Player | null; line: number[] | null } => {
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
        return { winner: board[a] as Player, line: pattern };
      }
    }

    return { winner: null, line: null };
  }, []);

  const handleCellClick = useCallback((index: number) => {
    if (gameState.status !== "playing" || gameState.board[index] !== null) {
      return;
    }

    setGameState(prev => {
      const newBoard = [...prev.board];
      newBoard[index] = prev.currentPlayer;

      const { winner, line } = checkWinner(newBoard);

      let newStatus: GameStatus = "playing";
      let newWinner: Player | null = null;

      if (winner) {
        newStatus = "won";
        newWinner = winner;
      } else if (newBoard.every(cell => cell !== null)) {
        newStatus = "draw";
      }

      return {
        board: newBoard,
        currentPlayer: prev.currentPlayer === "X" ? "O" : "X",
        status: newStatus,
        winner: newWinner,
        winningLine: line,
      };
    });
  }, [gameState.status, gameState.board, checkWinner]);

  const resetGame = useCallback(() => {
    setGameState(initializeGame());
  }, []);

  const isCellInWinningLine = (index: number): boolean => {
    return gameState.winningLine?.includes(index) || false;
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="w-full max-w-md">
        <div className="border-zinc-800 border p-6 rounded-lg shadow-md">
          {/* Game board */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {gameState.board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={gameState.status !== "playing" || cell !== null}
                className={`
                  w-full aspect-square text-5xl font-bold rounded-lg
                  transition-all duration-200
                  ${cell === null && gameState.status === "playing"
                    ? "bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                    : "bg-zinc-800"
                  }
                  ${isCellInWinningLine(index) ? "bg-green-800" : ""}
                  ${cell === "X" ? "text-blue-400" : "text-red-400"}
                `}
              >
                {cell}
              </button>
            ))}
          </div>

          {/* Game status */}
          <div className="text-center">
            {gameState.status === "playing" && (
              <p className="text-xl mb-4">
                Current player: <span className={gameState.currentPlayer === "X" ? "text-blue-400 font-bold" : "text-red-400 font-bold"}>
                  {gameState.currentPlayer}
                </span>
              </p>
            )}

            {gameState.status === "won" && (
              <div className="mb-4 p-4 rounded-lg bg-green-800 border-green-700 border text-white">
                <p className="text-xl font-bold">
                  Player {gameState.winner} wins!
                </p>
              </div>
            )}

            {gameState.status === "draw" && (
              <div className="mb-4 p-4 rounded-lg bg-yellow-800 border-yellow-700 border text-white">
                <p className="text-xl font-bold">
                  It's a draw!
                </p>
              </div>
            )}

            <button
              onClick={resetGame}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {gameState.status === "playing" ? "Restart Game" : "Play Again"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
