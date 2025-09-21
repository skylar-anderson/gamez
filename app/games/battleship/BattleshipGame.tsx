"use client";

import { useState, useCallback, useEffect } from "react";

// Grid size
const GRID_SIZE = 10;

// Ship definitions
const SHIPS = [
  { name: "Carrier", size: 5, count: 1 },
  { name: "Battleship", size: 4, count: 1 },
  { name: "Cruiser", size: 3, count: 1 },
  { name: "Submarine", size: 3, count: 1 },
  { name: "Destroyer", size: 2, count: 1 },
];

// Cell states
type CellState = "empty" | "ship" | "hit" | "miss" | "sunk";
type Grid = CellState[][];

// Game status
type GameStatus = "playing" | "won" | "lost";

// Ship placement info
interface Ship {
  name: string;
  size: number;
  positions: { row: number; col: number }[];
  hits: number;
}

interface GameState {
  playerGrid: Grid;
  computerGrid: Grid;
  playerShips: Ship[];
  computerShips: Ship[];
  gameStatus: GameStatus;
  currentPlayer: "player" | "computer";
  message: string;
}

export default function BattleshipGame() {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame());

  // Initialize a new game
  function initializeGame(): GameState {
    const playerGrid = createEmptyGrid();
    const computerGrid = createEmptyGrid();
    const playerShips = placeShipsRandomly();
    const computerShips = placeShipsRandomly();
    
    // Mark player ship positions on grid (visible to player)
    playerShips.forEach(ship => {
      ship.positions.forEach(({ row, col }) => {
        playerGrid[row][col] = "ship";
      });
    });
    
    return {
      playerGrid,
      computerGrid,
      playerShips,
      computerShips,
      gameStatus: "playing",
      currentPlayer: "player",
      message: "Your turn! Click on the enemy grid to fire.",
    };
  }

  // Create an empty 10x10 grid
  function createEmptyGrid(): Grid {
    return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill("empty"));
  }

  // Place ships randomly on the grid
  function placeShipsRandomly(): Ship[] {
    const ships: Ship[] = [];
    const occupiedPositions = new Set<string>();

    SHIPS.forEach(({ name, size }) => {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const horizontal = Math.random() < 0.5;
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);
        
        if (canPlaceShip(row, col, size, horizontal, occupiedPositions)) {
          const positions = [];
          for (let i = 0; i < size; i++) {
            const shipRow = horizontal ? row : row + i;
            const shipCol = horizontal ? col + i : col;
            positions.push({ row: shipRow, col: shipCol });
            occupiedPositions.add(`${shipRow}-${shipCol}`);
          }
          
          ships.push({
            name,
            size,
            positions,
            hits: 0,
          });
          placed = true;
        }
        attempts++;
      }
    });

    return ships;
  }

  // Check if a ship can be placed at the given position
  function canPlaceShip(
    row: number,
    col: number,
    size: number,
    horizontal: boolean,
    occupiedPositions: Set<string>
  ): boolean {
    // Check bounds
    if (horizontal && col + size > GRID_SIZE) return false;
    if (!horizontal && row + size > GRID_SIZE) return false;

    // Check for overlaps
    for (let i = 0; i < size; i++) {
      const shipRow = horizontal ? row : row + i;
      const shipCol = horizontal ? col + i : col;
      if (occupiedPositions.has(`${shipRow}-${shipCol}`)) return false;
    }

    return true;
  }

  // Handle player firing at computer grid
  const handlePlayerFire = useCallback((row: number, col: number) => {
    setGameState(prev => {
      if (prev.gameStatus !== "playing" || prev.currentPlayer !== "player") {
        return prev;
      }

      // Check if already fired at this position
      if (prev.computerGrid[row][col] !== "empty") {
        return prev;
      }

      const newState = { ...prev };
      
      // Check if hit
      const hitShip = newState.computerShips.find(ship =>
        ship.positions.some(pos => pos.row === row && pos.col === col)
      );

      if (hitShip) {
        // Hit!
        newState.computerGrid[row][col] = "hit";
        hitShip.hits++;
        
        // Check if ship is sunk
        if (hitShip.hits === hitShip.size) {
          // Mark all positions as sunk
          hitShip.positions.forEach(pos => {
            newState.computerGrid[pos.row][pos.col] = "sunk";
          });
          newState.message = `You sank the enemy ${hitShip.name}!`;
        } else {
          newState.message = "Hit!";
        }
      } else {
        // Miss
        newState.computerGrid[row][col] = "miss";
        newState.message = "Miss!";
        newState.currentPlayer = "computer";
      }

      // Check for win condition
      const allComputerShipsSunk = newState.computerShips.every(ship => ship.hits === ship.size);
      if (allComputerShipsSunk) {
        newState.gameStatus = "won";
        newState.message = "Congratulations! You won!";
      }

      return newState;
    });
  }, []);

  // Handle computer turn
  useEffect(() => {
    if (gameState.currentPlayer === "computer" && gameState.gameStatus === "playing") {
      const timer = setTimeout(() => {
        setGameState(prev => {
          const newState = { ...prev };
          
          // Find a random empty cell on player grid
          let attempts = 0;
          let fired = false;
          
          while (!fired && attempts < 100) {
            const row = Math.floor(Math.random() * GRID_SIZE);
            const col = Math.floor(Math.random() * GRID_SIZE);
            
            if (newState.playerGrid[row][col] === "empty" || newState.playerGrid[row][col] === "ship") {
              const hitShip = newState.playerShips.find(ship =>
                ship.positions.some(pos => pos.row === row && pos.col === col)
              );

              if (hitShip) {
                // Computer hit player ship
                newState.playerGrid[row][col] = "hit";
                hitShip.hits++;
                
                if (hitShip.hits === hitShip.size) {
                  // Ship is sunk
                  hitShip.positions.forEach(pos => {
                    newState.playerGrid[pos.row][pos.col] = "sunk";
                  });
                  newState.message = `Computer sank your ${hitShip.name}!`;
                } else {
                  newState.message = "Computer hit your ship!";
                }
              } else {
                // Computer missed
                newState.playerGrid[row][col] = "miss";
                newState.message = "Computer missed!";
                newState.currentPlayer = "player";
              }
              
              fired = true;
            }
            attempts++;
          }

          // Check for lose condition
          const allPlayerShipsSunk = newState.playerShips.every(ship => ship.hits === ship.size);
          if (allPlayerShipsSunk) {
            newState.gameStatus = "lost";
            newState.message = "Game Over! Computer won!";
          }

          return newState;
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.gameStatus]);

  // Reset the game
  const resetGame = useCallback(() => {
    setGameState(initializeGame());
  }, []);

  // Get cell class name based on state
  const getCellClassName = (cellState: CellState, isPlayerGrid: boolean) => {
    const baseClass = "w-8 h-8 border border-gray-300 cursor-pointer transition-colors";
    
    switch (cellState) {
      case "empty":
        return `${baseClass} bg-blue-100 hover:bg-blue-200`;
      case "ship":
        return `${baseClass} ${isPlayerGrid ? "bg-gray-400" : "bg-blue-100 hover:bg-blue-200"}`;
      case "hit":
        return `${baseClass} bg-red-500`;
      case "miss":
        return `${baseClass} bg-white`;
      case "sunk":
        return `${baseClass} bg-red-800`;
      default:
        return baseClass;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <div className="mb-4">
          <span className="text-lg font-semibold">{gameState.message}</span>
        </div>
        
        {gameState.gameStatus !== "playing" && (
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            New Game
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">
        {/* Player Grid */}
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4">Your Fleet</h3>
          <div className="grid grid-cols-10 gap-0 border-2 border-gray-400">
            {gameState.playerGrid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`player-${rowIndex}-${colIndex}`}
                  className={getCellClassName(cell, true)}
                />
              ))
            )}
          </div>
          <div className="mt-4 text-sm">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-400 border"></div>
                <span>Ship</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 border"></div>
                <span>Hit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border"></div>
                <span>Miss</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-800 border"></div>
                <span>Sunk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Computer Grid */}
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4">Enemy Waters</h3>
          <div className="grid grid-cols-10 gap-0 border-2 border-gray-400">
            {gameState.computerGrid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`computer-${rowIndex}-${colIndex}`}
                  className={getCellClassName(cell, false)}
                  onClick={() => handlePlayerFire(rowIndex, colIndex)}
                />
              ))
            )}
          </div>
          <div className="mt-4 text-sm text-center">
            <p>Click to fire!</p>
          </div>
        </div>
      </div>

      {/* Ship Status */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="text-center">
          <h4 className="text-lg font-semibold mb-3">Your Ships</h4>
          <div className="space-y-2">
            {gameState.playerShips.map((ship, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{ship.name}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  ship.hits === ship.size ? "bg-red-500 text-white" : "bg-green-500 text-white"
                }`}>
                  {ship.hits === ship.size ? "Sunk" : `${ship.size - ship.hits} left`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <h4 className="text-lg font-semibold mb-3">Enemy Ships</h4>
          <div className="space-y-2">
            {gameState.computerShips.map((ship, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{ship.name}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  ship.hits === ship.size ? "bg-red-500 text-white" : "bg-gray-500 text-white"
                }`}>
                  {ship.hits === ship.size ? "Sunk" : "Active"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}