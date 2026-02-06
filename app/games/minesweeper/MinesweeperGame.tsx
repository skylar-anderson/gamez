"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type CellState = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};

type Difficulty = "beginner" | "intermediate" | "expert";
type GameStatus = "idle" | "playing" | "won" | "lost";

const DIFFICULTIES: Record<Difficulty, { rows: number; cols: number; mines: number; label: string }> = {
  beginner:     { rows: 9,  cols: 9,  mines: 10, label: "Beginner" },
  intermediate: { rows: 16, cols: 16, mines: 40, label: "Intermediate" },
  expert:       { rows: 16, cols: 30, mines: 99, label: "Expert" },
};

const NUMBER_COLORS: Record<number, string> = {
  1: "text-blue-500",
  2: "text-green-600",
  3: "text-red-500",
  4: "text-purple-700",
  5: "text-amber-800",
  6: "text-cyan-600",
  7: "text-black dark:text-white",
  8: "text-zinc-500",
};

function createEmptyBoard(rows: number, cols: number): CellState[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  );
}

function placeMines(
  board: CellState[][],
  rows: number,
  cols: number,
  mines: number,
  safeRow: number,
  safeCol: number
): CellState[][] {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  let placed = 0;

  // Create a safe zone around the first click
  const isSafe = (r: number, c: number) =>
    Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1;

  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!newBoard[r][c].isMine && !isSafe(r, c)) {
      newBoard[r][c].isMine = true;
      placed++;
    }
  }

  // Calculate adjacent mine counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newBoard[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) {
            count++;
          }
        }
      }
      newBoard[r][c].adjacentMines = count;
    }
  }

  return newBoard;
}

function floodReveal(board: CellState[][], rows: number, cols: number, row: number, col: number): CellState[][] {
  const newBoard = board.map((r) => r.map((c) => ({ ...c })));
  const stack: [number, number][] = [[row, col]];

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
    if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) continue;

    newBoard[r][c].isRevealed = true;

    if (newBoard[r][c].adjacentMines === 0 && !newBoard[r][c].isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          stack.push([r + dr, c + dc]);
        }
      }
    }
  }

  return newBoard;
}

function checkWin(board: CellState[][], rows: number, cols: number): boolean {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].isMine && !board[r][c].isRevealed) return false;
    }
  }
  return true;
}

export default function MinesweeperGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [board, setBoard] = useState<CellState[][]>(() => {
    const { rows, cols } = DIFFICULTIES[difficulty];
    return createEmptyBoard(rows, cols);
  });
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { rows, cols, mines } = DIFFICULTIES[difficulty];

  useEffect(() => {
    if (gameStatus === "playing") {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => Math.min(prev + 1, 999));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStatus]);

  const resetGame = useCallback((diff?: Difficulty) => {
    const d = diff ?? difficulty;
    const { rows: r, cols: c } = DIFFICULTIES[d];
    setBoard(createEmptyBoard(r, c));
    setGameStatus("idle");
    setElapsed(0);
    setFlagCount(0);
    if (diff) setDifficulty(diff);
  }, [difficulty]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (gameStatus === "won" || gameStatus === "lost") return;
      if (board[row][col].isFlagged || board[row][col].isRevealed) return;

      let currentBoard = board;

      // First click: place mines, ensuring safe zone
      if (gameStatus === "idle") {
        currentBoard = placeMines(currentBoard, rows, cols, mines, row, col);
        setGameStatus("playing");
      }

      // If mine, game over
      if (currentBoard[row][col].isMine) {
        const revealedBoard = currentBoard.map((r) =>
          r.map((c) => ({
            ...c,
            isRevealed: c.isMine ? true : c.isRevealed,
          }))
        );
        revealedBoard[row][col] = { ...revealedBoard[row][col], isRevealed: true };
        setBoard(revealedBoard);
        setGameStatus("lost");
        return;
      }

      // Flood reveal
      const newBoard = floodReveal(currentBoard, rows, cols, row, col);
      setBoard(newBoard);

      if (checkWin(newBoard, rows, cols)) {
        setGameStatus("won");
      }
    },
    [board, gameStatus, rows, cols, mines]
  );

  const handleCellRightClick = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      e.preventDefault();
      if (gameStatus === "won" || gameStatus === "lost" || gameStatus === "idle") return;
      if (board[row][col].isRevealed) return;

      const newBoard = board.map((r) => r.map((c) => ({ ...c })));
      const cell = newBoard[row][col];
      cell.isFlagged = !cell.isFlagged;
      setBoard(newBoard);
      setFlagCount((prev) => prev + (cell.isFlagged ? 1 : -1));
    },
    [board, gameStatus]
  );

  const handleChordClick = useCallback(
    (row: number, col: number) => {
      if (gameStatus !== "playing") return;
      const cell = board[row][col];
      if (!cell.isRevealed || cell.adjacentMines === 0) return;

      // Count adjacent flags
      let adjFlags = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isFlagged) {
            adjFlags++;
          }
        }
      }

      if (adjFlags !== cell.adjacentMines) return;

      let newBoard = board.map((r) => r.map((c) => ({ ...c })));
      let hitMine = false;

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            const neighbor = newBoard[nr][nc];
            if (!neighbor.isRevealed && !neighbor.isFlagged) {
              if (neighbor.isMine) {
                hitMine = true;
                // Reveal all mines
                newBoard = newBoard.map((r) =>
                  r.map((c) => ({
                    ...c,
                    isRevealed: c.isMine ? true : c.isRevealed,
                  }))
                );
              } else {
                newBoard = floodReveal(newBoard, rows, cols, nr, nc);
              }
            }
          }
        }
      }

      setBoard(newBoard);
      if (hitMine) {
        setGameStatus("lost");
      } else if (checkWin(newBoard, rows, cols)) {
        setGameStatus("won");
      }
    },
    [board, gameStatus, rows, cols]
  );

  const remainingMines = mines - flagCount;

  const statusEmoji =
    gameStatus === "won" ? "😎" : gameStatus === "lost" ? "💀" : "🙂";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Difficulty selector */}
      <div className="flex gap-2">
        {(Object.keys(DIFFICULTIES) as Difficulty[]).map((diff) => (
          <button
            key={diff}
            onClick={() => resetGame(diff)}
            className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
              difficulty === diff
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {DIFFICULTIES[diff].label}
          </button>
        ))}
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 bg-zinc-800 rounded-lg px-4 py-2 font-mono text-lg">
        <div className="text-red-500 min-w-[3ch] text-right" title="Remaining mines">
          {String(Math.max(0, remainingMines)).padStart(3, "0")}
        </div>
        <button
          onClick={() => resetGame()}
          className="text-2xl hover:scale-110 transition-transform px-2"
          title="New game"
        >
          {statusEmoji}
        </button>
        <div className="text-red-500 min-w-[3ch] text-right" title="Time elapsed">
          {String(elapsed).padStart(3, "0")}
        </div>
      </div>

      {/* Game board */}
      <div
        className="inline-grid border border-zinc-700 bg-zinc-900 select-none"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => (
            <Cell
              key={`${r}-${c}`}
              cell={cell}
              gameStatus={gameStatus}
              onClick={() => handleCellClick(r, c)}
              onContextMenu={(e) => handleCellRightClick(e, r, c)}
              onDoubleClick={() => handleChordClick(r, c)}
            />
          ))
        )}
      </div>

      {/* Instructions */}
      <div className="text-zinc-500 text-sm text-center max-w-md">
        <p>Click to reveal a cell. Right-click to place a flag.</p>
        <p>Double-click a number to reveal its unflagged neighbors (chord).</p>
      </div>
    </div>
  );
}

function Cell({
  cell,
  gameStatus,
  onClick,
  onContextMenu,
  onDoubleClick,
}: {
  cell: CellState;
  gameStatus: GameStatus;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
}) {
  const { isMine, isRevealed, isFlagged, adjacentMines } = cell;

  let content: React.ReactNode = null;
  let bgClass = "bg-zinc-700 hover:bg-zinc-600 border-zinc-600";

  if (isRevealed) {
    bgClass = "bg-zinc-800 border-zinc-700";
    if (isMine) {
      content = <span>💣</span>;
      bgClass = "bg-red-900/60 border-zinc-700";
    } else if (adjacentMines > 0) {
      content = (
        <span className={`font-bold text-sm ${NUMBER_COLORS[adjacentMines] ?? "text-white"}`}>
          {adjacentMines}
        </span>
      );
    }
  } else if (isFlagged) {
    content = <span>🚩</span>;
    bgClass = "bg-zinc-700 hover:bg-zinc-600 border-zinc-600";
  } else if (gameStatus === "lost" && isMine) {
    content = <span>💣</span>;
    bgClass = "bg-zinc-800 border-zinc-700";
  }

  return (
    <button
      className={`w-7 h-7 flex items-center justify-center border text-xs leading-none transition-colors ${bgClass}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
    >
      {content}
    </button>
  );
}
