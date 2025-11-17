"use client";

import { useState } from "react";

type Player = "X" | "O";
type Board = (Player | null)[];

export default function TicTacToeGame() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player | "Draw" | null>(null);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  const checkWinner = (board: Board): Player | "Draw" | null => {
    // Check for winner
    for (const [a, b, c] of winningCombinations) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    // Check for draw
    if (board.every(cell => cell !== null)) {
      return "Draw";
    }

    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        {winner ? (
          <div className="text-2xl font-bold">
            {winner === "Draw" ? "It's a Draw!" : `Player ${winner} Wins!`}
          </div>
        ) : (
          <div className="text-xl">
            Current Player: <span className="font-bold">{currentPlayer}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 w-[300px] h-[300px]">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className={`
              border-2 border-zinc-700 rounded-lg
              text-4xl font-bold
              hover:bg-zinc-800 transition-colors
              ${cell ? "cursor-not-allowed" : "cursor-pointer"}
              ${winner ? "cursor-not-allowed" : ""}
            `}
            disabled={!!cell || !!winner}
          >
            {cell}
          </button>
        ))}
      </div>

      <button
        onClick={resetGame}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
      >
        New Game
      </button>
    </div>
  );
}
