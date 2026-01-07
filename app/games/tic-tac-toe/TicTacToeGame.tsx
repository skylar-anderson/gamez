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

  // Check for a winner or draw
  function checkGameStatus(board: Board): { 
    status: GameStatus; 
    winner: Player | null;
    winningLine: number[] | null;
  } {
    // Winning combinations
    const lines = [
      [0, 1, 2], // top row
      [3, 4, 5], // middle row
      [6, 7, 8], // bottom row
      [0, 3, 6], // left column
      [1, 4, 7], // middle column
      [2, 5, 8], // right column
      [0, 4, 8], // diagonal top-left to bottom-right
      [2, 4, 6], // diagonal top-right to bottom-left
    ];

    // Check each winning combination
    for (const line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return {
          status: "won",
          winner: board[a] as Player,
          winningLine: line,
        };
      }
    }

    // Check for draw (all cells filled)
    if (board.every(cell => cell !== null)) {
      return {
        status: "draw",
        winner: null,
        winningLine: null,
      };
    }

    // Game is still ongoing
    return {
      status: "playing",
      winner: null,
      winningLine: null,
    };
  }

  // Handle cell click
  const handleCellClick = useCallback((index: number) => {
    setGameState(prev => {
      // Ignore clicks if game is over or cell is already filled
      if (prev.status !== "playing" || prev.board[index] !== null) {
        return prev;
      }

      // Create new board with the move
      const newBoard = [...prev.board];
      newBoard[index] = prev.currentPlayer;

      // Check game status
      const { status, winner, winningLine } = checkGameStatus(newBoard);

      // Switch player if game is still ongoing
      const nextPlayer: Player = prev.currentPlayer === "X" ? "O" : "X";

      return {
        board: newBoard,
        currentPlayer: status === "playing" ? nextPlayer : prev.currentPlayer,
        status,
        winner,
        winningLine,
      };
    });
  }, []);

  // Get cell style based on game state
  const getCellClassName = (index: number): string => {
    const baseClasses = "w-24 h-24 border-2 border-zinc-700 flex items-center justify-center text-4xl font-bold transition-colors";
    const isWinningCell = gameState.winningLine?.includes(index);
    const hoverClasses = gameState.status === "playing" && gameState.board[index] === null 
      ? "hover:bg-zinc-800 cursor-pointer" 
      : "";
    const winningClasses = isWinningCell ? "bg-green-900" : "";
    
    return `${baseClasses} ${hoverClasses} ${winningClasses}`;
  };

  return (
    <div className="flex flex-col gap-8 items-center">
      {/* Game status */}
      <div className="text-center">
        {gameState.status === "playing" && (
          <p className="text-2xl">
            Current player: <span className="font-bold text-blue-500">{gameState.currentPlayer}</span>
          </p>
        )}
        {gameState.status === "won" && (
          <div className="text-2xl text-green-500 font-bold">
            Player {gameState.winner} wins!
          </div>
        )}
        {gameState.status === "draw" && (
          <div className="text-2xl text-yellow-500 font-bold">
            It&apos;s a draw!
          </div>
        )}
      </div>

      {/* Game board */}
      <div className="grid grid-cols-3 gap-2 bg-zinc-900 p-4 rounded-lg shadow-lg">
        {gameState.board.map((cell, index) => (
          <button
            key={index}
            className={getCellClassName(index)}
            onClick={() => handleCellClick(index)}
            disabled={gameState.status !== "playing" || cell !== null}
          >
            {cell && (
              <span className={cell === "X" ? "text-blue-400" : "text-red-400"}>
                {cell}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Game controls */}
      <div className="text-center">
        <button
          onClick={resetGame}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {gameState.status === "playing" ? "Restart Game" : "Play Again"}
        </button>
      </div>
    </div>
  );
}
