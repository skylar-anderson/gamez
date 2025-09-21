"use client";

import { useState } from 'react';

type Player = 'X' | 'O';
type Cell = Player | null;
type Board = Cell[];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6] // diagonals
];

export default function TicTacToeGame() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'tie' | null>(null);
  const [scores, setScores] = useState({ X: 0, O: 0, ties: 0 });

  const checkWinner = (board: Board): Player | 'tie' | null => {
    // Check for winning combinations
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] as Player;
      }
    }
    
    // Check for tie
    if (board.every(cell => cell !== null)) {
      return 'tie';
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
      // Update scores
      if (gameResult === 'tie') {
        setScores(prev => ({ ...prev, ties: prev.ties + 1 }));
      } else {
        setScores(prev => ({ ...prev, [gameResult]: prev[gameResult] + 1 }));
      }
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, ties: 0 });
  };

  const getGameStatus = () => {
    if (winner === 'tie') return "It's a tie! 🤝";
    if (winner) return `Player ${winner} wins! 🎉`;
    return `Player ${currentPlayer}'s turn`;
  };

  const getCellClasses = (cell: Cell, index: number) => {
    let classes = "w-20 h-20 border-2 border-zinc-600 flex items-center justify-center text-3xl font-bold cursor-pointer transition-colors ";
    
    if (cell) {
      classes += cell === 'X' ? 'text-blue-500' : 'text-red-500';
    } else {
      classes += 'hover:bg-zinc-800';
    }
    
    if (winner && cell) {
      // Check if this cell is part of winning combination
      const winningCombo = WINNING_COMBINATIONS.find(combo => 
        combo.every(pos => board[pos] === winner)
      );
      if (winningCombo?.includes(index)) {
        classes += ' bg-green-900/20 border-green-500';
      }
    }
    
    return classes;
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Game Status */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">{getGameStatus()}</h2>
        {!winner && (
          <div className="text-lg">
            Current player: 
            <span className={`ml-2 font-bold ${currentPlayer === 'X' ? 'text-blue-500' : 'text-red-500'}`}>
              {currentPlayer}
            </span>
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-1 mb-6 mx-auto w-fit">
        {board.map((cell, index) => (
          <button
            key={index}
            className={getCellClasses(cell, index)}
            onClick={() => handleCellClick(index)}
            disabled={!!cell || !!winner}
          >
            {cell}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-4 justify-center mb-6">
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          New Game
        </button>
        <button
          onClick={resetScores}
          className="px-4 py-2 bg-zinc-600 text-white rounded hover:bg-zinc-700 transition-colors"
        >
          Reset Scores
        </button>
      </div>

      {/* Score Board */}
      <div className="bg-zinc-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3 text-center">Score Board</h3>
        <div className="flex justify-around text-center">
          <div>
            <div className="text-2xl font-bold text-blue-500">{scores.X}</div>
            <div className="text-sm text-zinc-400">Player X</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-400">{scores.ties}</div>
            <div className="text-sm text-zinc-400">Ties</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">{scores.O}</div>
            <div className="text-sm text-zinc-400">Player O</div>
          </div>
        </div>
      </div>

      {/* Game Rules */}
      <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
        <h4 className="font-semibold mb-2">How to Play:</h4>
        <ul className="text-sm text-zinc-300 space-y-1">
          <li>• Players take turns placing X&apos;s and O&apos;s on the grid</li>
          <li>• Get three of your symbols in a row (horizontal, vertical, or diagonal) to win</li>
          <li>• If all 9 squares are filled with no winner, it&apos;s a tie</li>
          <li>• Player X always goes first</li>
        </ul>
      </div>
    </div>
  );
}