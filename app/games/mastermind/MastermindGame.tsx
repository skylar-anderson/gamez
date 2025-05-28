"use client";

import { useState, useCallback } from "react";

// Color options for the game
const COLORS = ["red", "green", "blue", "yellow", "purple", "orange"];

// Game status types
type GameStatus = "playing" | "won" | "lost";

// Types for the game
type Peg = string | null;
type Row = Peg[];
type Feedback = ("correct" | "wrong-position" | "incorrect")[];

interface GameState {
  secretCode: string[];
  attempts: Row[];
  feedback: Feedback[];
  currentAttempt: Row;
  currentPegIndex: number;
  maxAttempts: number;
  status: GameStatus;
}

export default function MastermindGame() {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame());
  const [activePopover, setActivePopover] = useState<number | null>(null);

  // Initialize a new game
  function initializeGame(): GameState {
    // Generate a random code of 4 colors
    const secretCode = Array.from({ length: 4 }, () => 
      COLORS[Math.floor(Math.random() * COLORS.length)]
    );

    return {
      secretCode,
      attempts: [],
      feedback: [],
      currentAttempt: Array(4).fill(null),
      currentPegIndex: 0,
      maxAttempts: 10,
      status: "playing",
    };
  }

  // Reset the game
  const resetGame = useCallback(() => {
    setGameState(initializeGame());
    setActivePopover(null);
  }, []);

  // Set a peg color in the current attempt
  const setPeg = useCallback((pegIndex: number, color: string) => {
    if (gameState.status !== "playing") return;
    
    setGameState(prev => {
      const newAttempt = [...prev.currentAttempt];
      newAttempt[pegIndex] = color;
      
      return {
        ...prev,
        currentAttempt: newAttempt,
        currentPegIndex: pegIndex + 1 < 4 ? pegIndex + 1 : pegIndex,
      };
    });
    
    // Close the popover after selecting a color
    setActivePopover(null);
  }, [gameState.status]);

  // Clear the current peg
  const clearPeg = useCallback((pegIndex: number) => {
    if (gameState.status !== "playing") return;
    
    setGameState(prev => {
      const newAttempt = [...prev.currentAttempt];
      newAttempt[pegIndex] = null;
      
      return {
        ...prev,
        currentAttempt: newAttempt,
      };
    });
  }, [gameState.status]);

  // Toggle popover for a peg
  const togglePopover = useCallback((pegIndex: number) => {
    if (gameState.status !== "playing") return;
    
    setActivePopover(current => current === pegIndex ? null : pegIndex);
  }, [gameState.status]);

  // Close popover when clicking outside
  const closePopover = useCallback(() => {
    setActivePopover(null);
  }, []);

  // Submit the current attempt
  const submitGuess = useCallback(() => {
    if (gameState.status !== "playing" || gameState.currentAttempt.includes(null)) {
      return; // Don't submit if the game is over or the attempt is incomplete
    }

    // Create a copy of the current attempt for type safety
    const currentGuess = [...gameState.currentAttempt] as string[];
    
    // Generate feedback for the current guess
    const feedback = generateFeedback(currentGuess, gameState.secretCode);
    
    setGameState(prev => {
      const newAttempts = [...prev.attempts, currentGuess];
      const newFeedback = [...prev.feedback, feedback];
      
      // Check if the player won
      const hasWon = feedback.every(item => item === "correct");
      
      // Check if the player lost (used all attempts)
      const hasLost = newAttempts.length >= prev.maxAttempts && !hasWon;
      
      // Determine the new game status
      let newStatus: GameStatus = "playing";
      if (hasWon) newStatus = "won";
      if (hasLost) newStatus = "lost";
      
      return {
        ...prev,
        attempts: newAttempts,
        feedback: newFeedback,
        currentAttempt: Array(4).fill(null),
        currentPegIndex: 0,
        status: newStatus,
      };
    });
    
    // Close popover after submitting
    setActivePopover(null);
  }, [gameState.currentAttempt, gameState.secretCode, gameState.status]);

  // Generate feedback for a guess
  function generateFeedback(guess: string[], code: string[]): Feedback {
    const result: Feedback = Array(4).fill("incorrect");
    const codeUsed = Array(4).fill(false);
    const guessUsed = Array(4).fill(false);
    
    // First pass: find correct positions
    for (let i = 0; i < 4; i++) {
      if (guess[i] === code[i]) {
        result[i] = "correct";
        codeUsed[i] = true;
        guessUsed[i] = true;
      }
    }
    
    // Second pass: find wrong positions
    for (let i = 0; i < 4; i++) {
      if (guessUsed[i]) continue;
      
      for (let j = 0; j < 4; j++) {
        if (!codeUsed[j] && guess[i] === code[j]) {
          result[i] = "wrong-position";
          codeUsed[j] = true;
          break;
        }
      }
    }
    
    return result;
  }

  // Color picker popover component
  function ColorPickerPopover({ pegIndex }: { pegIndex: number }) {
    return (
      <div className="absolute z-10 mt-2 bg-white rounded-lg shadow-lg p-4 border" style={{ transform: "translateX(-25%)", minWidth: "120px" }}>
        <div className="grid grid-cols-3 gap-3">
          {COLORS.map(color => (
            <button
              key={color}
              className="w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
              onClick={() => setPeg(pegIndex, color)}
            />
          ))}
          <button
            className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform hover:scale-110"
            onClick={() => {
              clearPeg(pegIndex);
              setActivePopover(null);
            }}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8" onClick={closePopover}>
      <div className="w-full">
        <div className="border-zinc-800 border p-6 rounded-lg shadow-md max-w-2xl mx-auto">
          {/* Game board */}
          <div className="space-y-4">
            {/* Previous attempts */}
            {gameState.attempts.map((attempt, rowIndex) => (
              <div key={rowIndex} className="flex items-center space-x-4">
                <div className="flex-1 flex space-x-2">
                  {attempt.map((color, pegIndex) => (
                    <div 
                      key={pegIndex}
                      className="w-12 h-12 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color || 'transparent' }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap w-20 h-12 gap-1 justify-center items-center">
                  {/* Sort feedback to show red first, then white, to avoid revealing positions */}
                  {[...gameState.feedback[rowIndex]]
                    .sort((a, b) => {
                      if (a === "correct" && b !== "correct") return -1;
                      if (a !== "correct" && b === "correct") return 1;
                      if (a === "wrong-position" && b === "incorrect") return -1;
                      if (a === "incorrect" && b === "wrong-position") return 1;
                      return 0;
                    })
                    .map((feedback, i) => (
                    <div 
                      key={i} 
                      className={`w-4 h-4 rounded-full ${
                        feedback === "correct" 
                          ? "bg-red-600" 
                          : feedback === "wrong-position" 
                            ? "bg-white border border-gray-300" 
                            : "bg-black"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Current attempt */}
            {gameState.status === "playing" && (
              <div className="flex items-center space-x-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex-1 flex space-x-2">
                  {gameState.currentAttempt.map((color, pegIndex) => (
                    <div key={pegIndex} className="relative">
                      <button 
                        className="w-12 h-12 rounded-full border-2 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400"
                        style={{ backgroundColor: color || 'rgba(255, 255, 255, .2)' }}
                        onClick={() => togglePopover(pegIndex)}
                      />
                      {activePopover === pegIndex && (
                        <ColorPickerPopover pegIndex={pegIndex} />
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={submitGuess}
                  disabled={gameState.currentAttempt.includes(null)}
                  className={`px-3 py-2 rounded ${
                    gameState.currentAttempt.includes(null)
                      ? "bg-gray-300 text-gray-500"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Submit
                </button>
              </div>
            )}

            {/* Empty rows for remaining attempts */}
            {gameState.status === "playing" &&
              Array.from(
                { length: gameState.maxAttempts - gameState.attempts.length - 1 },
                (_, i) => (
                  <div key={`empty-${i}`} className="flex items-center space-x-4">
                    <div className="flex-1 flex space-x-2">
                      {Array(4).fill(null).map((_, pegIndex) => (
                        <div 
                          key={pegIndex}
                          className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200"
                        />
                      ))}
                    </div>
                    <div className="w-20 h-12"></div>
                  </div>
                )
              )}

            {/* Game result message */}
            {gameState.status !== "playing" && (
              <div className={`mt-4 p-4 rounded-lg ${
                gameState.status === "won" 
                  ? "bg-green-800 border-green-700 border text-white" 
                  : "bg-red-800 border-red-700 border text-white"
              }`}>
                {gameState.status === "won" 
                  ? "Congratulations! You cracked the code!" 
                  : "Game over! You didn't crack the code."}
                <div className="mt-2 flex space-x-2">
                  <div className="text-sm">Secret code:</div>
                  <div className="flex space-x-1">
                    {gameState.secretCode.map((color, i) => (
                      <div 
                        key={i} 
                        className="w-6 h-6 rounded-full" 
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={resetGame}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Game controls */}
        {gameState.status === "playing" && (
          <div className="mt-6 max-w-2xl mx-auto text-center">
            <p className="text-zinc-400 mb-2">Attempts remaining: {gameState.maxAttempts - gameState.attempts.length}</p>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Restart Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 