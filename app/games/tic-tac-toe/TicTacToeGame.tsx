'use client';

import { useState } from 'react';

type Player = 'X' | 'O' | null;
type Board = Player[];

export default function TicTacToeGame() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);

  const checkWinner = (board: Board): Player | 'Draw' | null => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    if (board.every(cell => cell !== null)) {
      return 'Draw';
    }

    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    
    setBoard(newBoard);
    
    const gameResult = checkWinner(newBoard);
    if (gameResult) {
      setWinner(gameResult);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
  };

  const getStatusMessage = () => {
    if (winner === 'Draw') return "It&apos;s a draw!";
    if (winner) return `Player ${winner} wins!`;
    return `Player ${currentPlayer}&apos;s turn`;
  };

  const getCellClassName = (cell: Player) => {
    const baseClasses = 'w-20 h-20 border-2 border-gray-300 rounded-lg text-3xl font-bold transition-all duration-200';
    const playerColor = cell === 'X' ? 'text-blue-600' : cell === 'O' ? 'text-red-600' : '';
    const interactionClasses = winner 
      ? 'cursor-not-allowed' 
      : 'cursor-pointer hover:scale-105 hover:bg-gray-100';
    
    return `${baseClasses} ${playerColor} ${interactionClasses}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-8">
      <h1 className="text-4xl font-bold mb-8">Tic Tac Toe</h1>
      
      <div className="mb-6">
        <p className="text-xl font-semibold text-center">
          {getStatusMessage()}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-8">
        {board.map((cell, index) => (
          <button
            key={index}
            className={getCellClassName(cell)}
            onClick={() => handleCellClick(index)}
            disabled={!!winner}
          >
            {cell}
          </button>
        ))}
      </div>

      <button
        onClick={resetGame}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
      >
        New Game
      </button>

      <div className="mt-8 max-w-md text-center text-gray-600">
        <h3 className="font-semibold mb-2">How to Play:</h3>
        <p className="text-sm">
          Take turns placing X&apos;s and O&apos;s on the grid. The first player to get three in a row 
          (horizontally, vertically, or diagonally) wins!
        </p>
      </div>
    </div>
  );
}