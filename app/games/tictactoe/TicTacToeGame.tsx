"use client";

import { useState } from "react";

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

function calculateWinner(board: Board): Player | null {
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

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

export default function TicTacToeGame() {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame());

  function initializeGame(): GameState {
    return {
      board: Array(9).fill(null),
      currentPlayer: "X",
      status: "playing",
      winner: null,
    };
  }

  function handleCellClick(index: number) {
    if (gameState.status !== "playing" || gameState.board[index] !== null) {
      return;
    }

    const newBoard = [...gameState.board];
    newBoard[index] = gameState.currentPlayer;

    const winner = calculateWinner(newBoard);
    const isFull = isBoardFull(newBoard);

    let status: GameStatus = "playing";
    if (winner) {
      status = "won";
    } else if (isFull) {
      status = "draw";
    }

    setGameState({
      board: newBoard,
      currentPlayer: gameState.currentPlayer === "X" ? "O" : "X",
      status,
      winner,
    });
  }

  function resetGame() {
    setGameState(initializeGame());
  }

  function getStatusMessage() {
    if (gameState.status === "won") {
      return `Player ${gameState.winner} wins!`;
    } else if (gameState.status === "draw") {
      return "It's a draw!";
    } else {
      return `Current Player: ${gameState.currentPlayer}`;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-center">
          {getStatusMessage()}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {gameState.board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            className={`w-24 h-24 text-4xl font-bold border-2 rounded-lg transition-all ${
              cell === null
                ? "border-zinc-600 hover:border-blue-500 hover:bg-zinc-800"
                : "border-zinc-700"
            } ${
              gameState.status !== "playing" || cell !== null
                ? "cursor-not-allowed"
                : "cursor-pointer"
            } ${cell === "X" ? "text-blue-500" : cell === "O" ? "text-red-500" : ""}`}
            disabled={gameState.status !== "playing" || cell !== null}
          >
            {cell}
          </button>
        ))}
      </div>

      <button
        onClick={resetGame}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
      >
        New Game
      </button>
    </div>
  );
}
