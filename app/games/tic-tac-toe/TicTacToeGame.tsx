"use client";

import { useState } from "react";

type Player = "X" | "O";
type Square = Player | null;

export default function TicTacToeGame() {
  const [board, setBoard] = useState<Square[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player | "Draw" | null>(null);

  const checkWinner = (squares: Square[]): Player | "Draw" | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    if (squares.every((square) => square !== null)) {
      return "Draw";
    }

    return null;
  };

  const handleSquareClick = (index: number) => {
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
          <div className="text-xl">Current Player: <span className="font-bold">{currentPlayer}</span></div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 w-[300px] h-[300px]">
        {board.map((square, index) => (
          <button
            key={index}
            onClick={() => handleSquareClick(index)}
            className={`
              border-2 border-zinc-700 rounded-lg
              text-4xl font-bold
              transition-all
              hover:bg-zinc-800
              ${square === "X" ? "text-blue-500" : "text-red-500"}
              ${!square && !winner ? "cursor-pointer" : "cursor-not-allowed"}
            `}
            disabled={!!square || !!winner}
          >
            {square}
          </button>
        ))}
      </div>

      <button
        onClick={resetGame}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
      >
        New Game
      </button>
    </div>
  );
}
