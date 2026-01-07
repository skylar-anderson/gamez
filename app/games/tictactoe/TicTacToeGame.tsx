"use client";

import { useState } from "react";

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

// Player emoji mapping - using ❌ and 0️⃣ emojis
const PLAYER_EMOJI = {
  X: "❌",
  O: "0️⃣",
};

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

  // Check for a winner
  function checkWinner(board: Board): Player | null {
    const winningCombinations = [
      [0, 1, 2], // top row
      [3, 4, 5], // middle row
      [6, 7, 8], // bottom row
      [0, 3, 6], // left column
      [1, 4, 7], // middle column
      [2, 5, 8], // right column
      [0, 4, 8], // diagonal top-left to bottom-right
      [2, 4, 6], // diagonal top-right to bottom-left
    ];

    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] as Player;
      }
    }

    return null;
  }

  // Handle cell click
  function handleCellClick(index: number) {
    // Don't allow moves if game is over or cell is already filled
    if (gameState.status !== "playing" || gameState.board[index]) {
      return;
    }

    // Make the move
    const newBoard = [...gameState.board];
    newBoard[index] = gameState.currentPlayer;

    // Check for winner
    const winner = checkWinner(newBoard);
    
    if (winner) {
      setGameState({
        ...gameState,
        board: newBoard,
        status: "won",
        winner,
      });
    } else if (newBoard.every(cell => cell !== null)) {
      // Check for draw
      setGameState({
        ...gameState,
        board: newBoard,
        status: "draw",
        winner: null,
      });
    } else {
      // Continue game with next player
      setGameState({
        ...gameState,
        board: newBoard,
        currentPlayer: gameState.currentPlayer === "X" ? "O" : "X",
      });
    }
  }

  // Reset the game
  function resetGame() {
    setGameState(initializeGame());
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* Game status */}
      <div className="text-center">
        {gameState.status === "playing" && (
          <p className="text-xl">
            Current Player: <span className="text-3xl">{PLAYER_EMOJI[gameState.currentPlayer]}</span>
          </p>
        )}
        {gameState.status === "won" && gameState.winner && (
          <p className="text-2xl font-bold text-green-500">
            Winner: {PLAYER_EMOJI[gameState.winner]}
          </p>
        )}
        {gameState.status === "draw" && (
          <p className="text-2xl font-bold text-yellow-500">
            It&apos;s a Draw!
          </p>
        )}
      </div>

      {/* Game board */}
      <div className="grid grid-cols-3 gap-2 w-fit">
        {gameState.board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            className={`
              w-24 h-24 
              border-2 border-zinc-700 
              rounded-lg 
              text-5xl
              flex items-center justify-center
              transition-all
              ${cell 
                ? "bg-zinc-800 cursor-not-allowed" 
                : "bg-zinc-900 hover:bg-zinc-800 hover:border-blue-600 cursor-pointer"
              }
              ${gameState.status !== "playing" ? "cursor-not-allowed opacity-70" : ""}
            `}
            disabled={gameState.status !== "playing" || cell !== null}
          >
            {cell && PLAYER_EMOJI[cell]}
          </button>
        ))}
      </div>

      {/* Reset button */}
      <button
        onClick={resetGame}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
      >
        New Game
      </button>
    </div>
  );
}
