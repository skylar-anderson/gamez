"use client";

import { useState, useCallback } from "react";

// Ship types with their sizes
const SHIPS = [
  { name: "Carrier", size: 5, id: "carrier" },
  { name: "Battleship", size: 4, id: "battleship" },
  { name: "Cruiser", size: 3, id: "cruiser" },
  { name: "Submarine", size: 3, id: "submarine" },
  { name: "Destroyer", size: 2, id: "destroyer" },
];

const BOARD_SIZE = 10;

type CellStatus = "empty" | "ship" | "hit" | "miss";
type GamePhase = "setup-p1" | "setup-p2" | "handoff" | "playing-p1" | "playing-p2" | "game-over";
type Orientation = "horizontal" | "vertical";

interface Cell {
  status: CellStatus;
  shipId?: string;
}

interface Ship {
  id: string;
  name: string;
  size: number;
  placed: boolean;
  positions: { row: number; col: number }[];
}

interface PlayerBoard {
  grid: Cell[][];
  ships: Ship[];
}

interface GameState {
  phase: GamePhase;
  player1: PlayerBoard;
  player2: PlayerBoard;
  currentPlayer: 1 | 2;
  winner: 1 | 2 | null;
  currentShipIndex: number;
  currentOrientation: Orientation;
  handoffMessage: string;
}

function createEmptyBoard(): Cell[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({ status: "empty" }))
  );
}

function createShips(): Ship[] {
  return SHIPS.map((ship) => ({
    ...ship,
    placed: false,
    positions: [],
  }));
}

export default function BattleshipGame() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    phase: "setup-p1",
    player1: {
      grid: createEmptyBoard(),
      ships: createShips(),
    },
    player2: {
      grid: createEmptyBoard(),
      ships: createShips(),
    },
    currentPlayer: 1,
    winner: null,
    currentShipIndex: 0,
    currentOrientation: "horizontal",
    handoffMessage: "",
  }));

  const [hoverCells, setHoverCells] = useState<{ row: number; col: number }[]>([]);

  const resetGame = useCallback(() => {
    setGameState({
      phase: "setup-p1",
      player1: {
        grid: createEmptyBoard(),
        ships: createShips(),
      },
      player2: {
        grid: createEmptyBoard(),
        ships: createShips(),
      },
      currentPlayer: 1,
      winner: null,
      currentShipIndex: 0,
      currentOrientation: "horizontal",
      handoffMessage: "",
    });
    setHoverCells([]);
  }, []);

  const toggleOrientation = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      currentOrientation: prev.currentOrientation === "horizontal" ? "vertical" : "horizontal",
    }));
  }, []);

  const canPlaceShip = (
    board: PlayerBoard,
    row: number,
    col: number,
    size: number,
    orientation: Orientation
  ): boolean => {
    const cells: { row: number; col: number }[] = [];

    for (let i = 0; i < size; i++) {
      const r = orientation === "horizontal" ? row : row + i;
      const c = orientation === "horizontal" ? col + i : col;

      if (r >= BOARD_SIZE || c >= BOARD_SIZE) return false;
      if (board.grid[r][c].status !== "empty") return false;

      cells.push({ row: r, col: c });
    }

    return true;
  };

  const getShipCells = (
    row: number,
    col: number,
    size: number,
    orientation: Orientation
  ): { row: number; col: number }[] => {
    const cells: { row: number; col: number }[] = [];
    for (let i = 0; i < size; i++) {
      const r = orientation === "horizontal" ? row : row + i;
      const c = orientation === "horizontal" ? col + i : col;
      cells.push({ row: r, col: c });
    }
    return cells;
  };

  const handleCellHover = (row: number, col: number) => {
    if (gameState.phase !== "setup-p1" && gameState.phase !== "setup-p2") {
      setHoverCells([]);
      return;
    }

    const currentBoard = gameState.currentPlayer === 1 ? gameState.player1 : gameState.player2;
    const currentShip = currentBoard.ships[gameState.currentShipIndex];

    if (!currentShip || currentShip.placed) {
      setHoverCells([]);
      return;
    }

    if (canPlaceShip(currentBoard, row, col, currentShip.size, gameState.currentOrientation)) {
      setHoverCells(getShipCells(row, col, currentShip.size, gameState.currentOrientation));
    } else {
      setHoverCells([]);
    }
  };

  const placeShip = (row: number, col: number) => {
    if (gameState.phase !== "setup-p1" && gameState.phase !== "setup-p2") return;

    setGameState((prev) => {
      const currentBoard = prev.currentPlayer === 1 ? prev.player1 : prev.player2;
      const currentShip = currentBoard.ships[prev.currentShipIndex];

      if (!currentShip || currentShip.placed) return prev;

      if (!canPlaceShip(currentBoard, row, col, currentShip.size, prev.currentOrientation)) {
        return prev;
      }

      const newGrid = currentBoard.grid.map((r) => r.map((c) => ({ ...c })));
      const positions = getShipCells(row, col, currentShip.size, prev.currentOrientation);

      positions.forEach(({ row: r, col: c }) => {
        newGrid[r][c] = { status: "ship", shipId: currentShip.id };
      });

      const newShips = [...currentBoard.ships];
      newShips[prev.currentShipIndex] = {
        ...currentShip,
        placed: true,
        positions,
      };

      const newBoard = { grid: newGrid, ships: newShips };
      const allShipsPlaced = newShips.every((ship) => ship.placed);

      let newPhase = prev.phase;
      let newCurrentPlayer = prev.currentPlayer;
      let newHandoffMessage = "";

      if (allShipsPlaced) {
        if (prev.phase === "setup-p1") {
          newPhase = "handoff";
          newCurrentPlayer = 2;
          newHandoffMessage = "Player 1 setup complete! Pass to Player 2 for ship placement.";
        } else if (prev.phase === "setup-p2") {
          newPhase = "handoff";
          newCurrentPlayer = 1;
          newHandoffMessage = "Player 2 setup complete! Player 1 will start the game.";
        }
      }

      return {
        ...prev,
        ...(prev.currentPlayer === 1 ? { player1: newBoard } : { player2: newBoard }),
        currentShipIndex: prev.currentShipIndex + 1,
        phase: newPhase,
        currentPlayer: newCurrentPlayer,
        handoffMessage: newHandoffMessage,
      };
    });

    setHoverCells([]);
  };

  const handleHandoffContinue = () => {
    setGameState((prev) => {
      if (prev.phase !== "handoff") return prev;

      const allP1ShipsPlaced = prev.player1.ships.every((ship) => ship.placed);
      const allP2ShipsPlaced = prev.player2.ships.every((ship) => ship.placed);

      if (allP1ShipsPlaced && !allP2ShipsPlaced) {
        return {
          ...prev,
          phase: "setup-p2",
          currentShipIndex: 0,
        };
      } else if (allP1ShipsPlaced && allP2ShipsPlaced) {
        return {
          ...prev,
          phase: "playing-p1",
        };
      }

      return prev;
    });
  };

  const handleAttack = (row: number, col: number) => {
    if (gameState.phase !== "playing-p1" && gameState.phase !== "playing-p2") return;

    setGameState((prev) => {
      const targetBoard = prev.currentPlayer === 1 ? prev.player2 : prev.player1;
      const targetCell = targetBoard.grid[row][col];

      if (targetCell.status === "hit" || targetCell.status === "miss") {
        return prev; // Already attacked
      }

      const newGrid = targetBoard.grid.map((r) => r.map((c) => ({ ...c })));
      const isHit = targetCell.status === "ship";
      newGrid[row][col] = {
        ...targetCell,
        status: isHit ? "hit" : "miss",
      };

      const newShips = targetBoard.ships.map((ship) => ({ ...ship }));
      const newBoard = { grid: newGrid, ships: newShips };

      // Check if any ship is sunk
      let allShipsSunk = true;
      newShips.forEach((ship) => {
        const allHit = ship.positions.every(
          (pos) => newGrid[pos.row][pos.col].status === "hit"
        );
        if (!allHit) allShipsSunk = false;
      });

      if (allShipsSunk) {
        return {
          ...prev,
          ...(prev.currentPlayer === 1 ? { player2: newBoard } : { player1: newBoard }),
          phase: "game-over",
          winner: prev.currentPlayer,
        };
      }

      // Switch turn
      const nextPlayer = prev.currentPlayer === 1 ? 2 : 1;
      return {
        ...prev,
        ...(prev.currentPlayer === 1 ? { player2: newBoard } : { player1: newBoard }),
        phase: "handoff",
        currentPlayer: nextPlayer,
        handoffMessage: `Player ${prev.currentPlayer}'s turn complete. Pass to Player ${nextPlayer}.`,
      };
    });
  };

  const renderSetupBoard = () => {
    const currentBoard = gameState.currentPlayer === 1 ? gameState.player1 : gameState.player2;
    const currentShip = currentBoard.ships[gameState.currentShipIndex];

    return (
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">
            Player {gameState.currentPlayer} - Place Your Ships
          </h2>
          {currentShip && (
            <div className="space-y-2">
              <p className="text-lg">
                Place your <span className="font-semibold">{currentShip.name}</span> (
                {currentShip.size} cells)
              </p>
              <button
                onClick={toggleOrientation}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Rotate ({gameState.currentOrientation})
              </button>
            </div>
          )}
        </div>

        <div className="inline-grid gap-0 border-2 border-gray-400">
          {currentBoard.grid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => {
                const isHover = hoverCells.some(
                  (h) => h.row === rowIndex && h.col === colIndex
                );
                return (
                  <div
                    key={colIndex}
                    className={`w-10 h-10 border border-gray-300 cursor-pointer transition-colors ${
                      cell.status === "ship"
                        ? "bg-gray-600"
                        : isHover
                        ? "bg-green-300"
                        : "bg-blue-100 hover:bg-blue-200"
                    }`}
                    onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                    onMouseLeave={() => setHoverCells([])}
                    onClick={() => placeShip(rowIndex, colIndex)}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="text-sm text-gray-400">
          Ships remaining:{" "}
          {currentBoard.ships.filter((s) => !s.placed).length} / {SHIPS.length}
        </div>
      </div>
    );
  };

  const renderPlayingBoard = () => {
    const playerBoard = gameState.currentPlayer === 1 ? gameState.player1 : gameState.player2;
    const opponentBoard = gameState.currentPlayer === 1 ? gameState.player2 : gameState.player1;

    return (
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-2xl font-bold">Player {gameState.currentPlayer}&apos;s Turn</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Player's own board */}
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-xl font-semibold">Your Fleet</h3>
            <div className="inline-grid gap-0 border-2 border-gray-400">
              {playerBoard.grid.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell, colIndex) => (
                    <div
                      key={colIndex}
                      className={`w-8 h-8 border border-gray-300 ${
                        cell.status === "ship"
                          ? "bg-gray-600"
                          : cell.status === "hit"
                          ? "bg-red-600"
                          : cell.status === "miss"
                          ? "bg-blue-300"
                          : "bg-blue-100"
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Opponent's board (hidden ships) */}
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-xl font-semibold">Enemy Waters</h3>
            <div className="inline-grid gap-0 border-2 border-gray-400">
              {opponentBoard.grid.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell, colIndex) => (
                    <div
                      key={colIndex}
                      className={`w-8 h-8 border border-gray-300 cursor-pointer transition-colors ${
                        cell.status === "hit"
                          ? "bg-red-600"
                          : cell.status === "miss"
                          ? "bg-blue-300"
                          : "bg-blue-100 hover:bg-blue-200"
                      }`}
                      onClick={() => handleAttack(rowIndex, colIndex)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHandoffScreen = () => {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <h2 className="text-3xl font-bold">Pass the Device</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">{gameState.handoffMessage}</p>
          <button
            onClick={handleHandoffContinue}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg"
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  const renderGameOver = () => {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-green-600">Game Over!</h2>
          <p className="text-2xl">Player {gameState.winner} Wins! 🎉</p>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {gameState.phase === "handoff" && renderHandoffScreen()}
      
      {(gameState.phase === "setup-p1" || gameState.phase === "setup-p2") && renderSetupBoard()}
      
      {(gameState.phase === "playing-p1" || gameState.phase === "playing-p2") && renderPlayingBoard()}
      
      {gameState.phase === "game-over" && renderGameOver()}

      <button
        onClick={resetGame}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
      >
        Reset Game
      </button>
    </div>
  );
}
