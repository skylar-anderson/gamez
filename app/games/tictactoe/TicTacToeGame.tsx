"use client";

import { useState, useCallback } from "react";

// Game types
type Player = "X" | "O";
type Square = Player | null;
type Board = Square[];
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

  // Handle square click
  const handleSquareClick = useCallback((index: number) => {
    if (gameState.status !== "playing" || gameState.board[index]) {
      return; // Don't do anything if the game is over or the square is already filled
    }

    setGameState(prev => {
      const newBoard = [...prev.board];
      newBoard[index] = prev.currentPlayer;

      // Check for a winner
      const { winner, line } = checkWinner(newBoard);

      // Check for a draw
      const isDraw = !winner && newBoard.every(square => square !== null);

      // Determine the new game status
      let newStatus: GameStatus = "playing";
      if (winner) newStatus = "won";
      if (isDraw) newStatus = "draw";

      return {
        ...prev,
        board: newBoard,
        currentPlayer: prev.currentPlayer === "X" ? "O" : "X",
        status: newStatus,
        winner,
        winningLine: line,
      };
    });
  }, [gameState.status, gameState.board]);

  return (
    <div className="flex flex-col gap-8">
      <div className="w-full">
        <div className="border-zinc-800 border p-6 rounded-lg shadow-md max-w-md mx-auto">
          {/* Game board */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {gameState.board.map((square, index) => {
              const isWinningSquare = gameState.winningLine?.includes(index);
              return (
                <button
                  key={index}
                  onClick={() => handleSquareClick(index)}
                  disabled={gameState.status !== "playing" || square !== null}
                  className={`w-24 h-24 border-2 border-zinc-700 rounded-lg text-4xl font-bold transition-all
                    ${square ? "" : "hover:bg-zinc-800"}
                    ${isWinningSquare ? "bg-green-900 border-green-600" : ""}
                    ${square === "X" ? "text-blue-400" : "text-red-400"}
                    ${!square && gameState.status === "playing" ? "cursor-pointer" : "cursor-default"}
                  `}
                >
                  {square}
                </button>
              );
            })}
          </div>

          {/* Game status */}
          {gameState.status === "playing" && (
            <div className="text-center text-lg mb-4">
              Current player: <span className={`font-bold ${gameState.currentPlayer === "X" ? "text-blue-400" : "text-red-400"}`}>
                {gameState.currentPlayer}
              </span>
            </div>
          )}

          {/* Game result message */}
          {gameState.status !== "playing" && (
            <div className={`p-4 rounded-lg mb-4 ${
              gameState.status === "won" 
                ? "bg-green-800 border-green-700 border text-white" 
                : "bg-yellow-800 border-yellow-700 border text-white"
            }`}>
              {gameState.status === "won" 
                ? `Player ${gameState.winner} wins!` 
                : "It's a draw!"}
            </div>
          )}

          {/* Reset button */}
          <div className="text-center">
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {gameState.status === "playing" ? "Restart Game" : "Play Again"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
