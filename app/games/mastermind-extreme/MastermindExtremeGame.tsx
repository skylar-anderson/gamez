"use client";

import { useState, useCallback, useEffect } from "react";

// Color options for the game - expanded from 6 to 8 colors
const COLORS = ["red", "green", "blue", "yellow", "purple", "orange", "teal", "pink"];

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    codeLength: 4,
    colors: COLORS.slice(0, 6), // Only 6 colors
    maxAttempts: 10,
    maxHints: 3
  },
  medium: {
    codeLength: 5,
    colors: COLORS, // All 8 colors
    maxAttempts: 8,
    maxHints: 2
  },
  hard: {
    codeLength: 6,
    colors: COLORS, // All 8 colors
    maxAttempts: 6,
    maxHints: 1
  }
};

// Game status types
type GameStatus = "playing" | "won" | "lost";
type Difficulty = "easy" | "medium" | "hard";

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
  startTime: number;
  endTime: number | null;
  hintsUsed: number;
  maxHints: number;
  score: number;
  difficulty: Difficulty;
  codeLength: number;
  availableColors: string[];
}

export default function MastermindExtremeGame() {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame("medium"));
  const [activePopover, setActivePopover] = useState<number | null>(null);
  const [showHint, setShowHint] = useState<number | null>(null);
  
  // Initialize a new game
  function initializeGame(difficulty: Difficulty): GameState {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    
    // Generate a random code based on the difficulty setting
    const secretCode = Array.from({ length: settings.codeLength }, () => 
      settings.colors[Math.floor(Math.random() * settings.colors.length)]
    );

    return {
      secretCode,
      attempts: [],
      feedback: [],
      currentAttempt: Array(settings.codeLength).fill(null),
      currentPegIndex: 0,
      maxAttempts: settings.maxAttempts,
      status: "playing",
      startTime: Date.now(),
      endTime: null,
      hintsUsed: 0,
      maxHints: settings.maxHints,
      score: 0,
      difficulty,
      codeLength: settings.codeLength,
      availableColors: [...settings.colors]
    };
  }

  // Calculate score based on attempts, time and hints used
  const calculateScore = useCallback(() => {
    if (gameState.status !== "won") return 0;
    
    const attemptsBonus = (gameState.maxAttempts - gameState.attempts.length) * 100;
    const timeBonus = Math.max(0, 3000 - Math.floor((gameState.endTime! - gameState.startTime) / 1000)) * 2;
    const hintsBonus = (gameState.maxHints - gameState.hintsUsed) * 150;
    const difficultyMultiplier = gameState.difficulty === "easy" ? 1 : gameState.difficulty === "medium" ? 1.5 : 2;
    
    return Math.floor((attemptsBonus + timeBonus + hintsBonus) * difficultyMultiplier);
  }, [gameState]);

  // Update score when game is won
  useEffect(() => {
    if (gameState.status === "won" && gameState.score === 0) {
      const finalScore = calculateScore();
      setGameState(prev => ({ ...prev, score: finalScore }));
    }
  }, [gameState.status, gameState.score, calculateScore]);

  // Reset the game
  const resetGame = useCallback((difficulty: Difficulty = gameState.difficulty) => {
    setGameState(initializeGame(difficulty));
    setActivePopover(null);
    setShowHint(null);
  }, [gameState.difficulty]);

  // Change difficulty
  const changeDifficulty = useCallback((difficulty: Difficulty) => {
    resetGame(difficulty);
  }, [resetGame]);

  // Set a peg color in the current attempt
  const setPeg = useCallback((pegIndex: number, color: string) => {
    if (gameState.status !== "playing") return;
    
    setGameState(prev => {
      const newAttempt = [...prev.currentAttempt];
      newAttempt[pegIndex] = color;
      
      return {
        ...prev,
        currentAttempt: newAttempt,
        currentPegIndex: pegIndex + 1 < prev.codeLength ? pegIndex + 1 : pegIndex,
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

  // Use a hint to reveal a peg
  const useHint = useCallback(() => {
    if (gameState.status !== "playing" || gameState.hintsUsed >= gameState.maxHints) return;
    
    // Find a position that hasn't been hinted yet
    let availablePositions = [];
    for (let i = 0; i < gameState.secretCode.length; i++) {
      if (showHint !== i) {
        availablePositions.push(i);
      }
    }
    
    if (availablePositions.length === 0) return;
    
    const randomPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    setShowHint(randomPosition);
    
    setGameState(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1
    }));
  }, [gameState.secretCode.length, gameState.status, gameState.hintsUsed, gameState.maxHints, showHint]);

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
      
      // Record end time if the game is over
      const endTime = (hasWon || hasLost) ? Date.now() : null;
      
      return {
        ...prev,
        attempts: newAttempts,
        feedback: newFeedback,
        currentAttempt: Array(prev.codeLength).fill(null),
        currentPegIndex: 0,
        status: newStatus,
        endTime: endTime
      };
    });
    
    // Close popover after submitting
    setActivePopover(null);
  }, [gameState.currentAttempt, gameState.secretCode, gameState.status, gameState.maxAttempts]);

  // Generate feedback for a guess
  function generateFeedback(guess: string[], code: string[]): Feedback {
    const codeLength = code.length;
    const result: Feedback = Array(codeLength).fill("incorrect");
    const codeUsed = Array(codeLength).fill(false);
    const guessUsed = Array(codeLength).fill(false);
    
    // First pass: find correct positions
    for (let i = 0; i < codeLength; i++) {
      if (guess[i] === code[i]) {
        result[i] = "correct";
        codeUsed[i] = true;
        guessUsed[i] = true;
      }
    }
    
    // Second pass: find wrong positions
    for (let i = 0; i < codeLength; i++) {
      if (guessUsed[i]) continue;
      
      for (let j = 0; j < codeLength; j++) {
        if (!codeUsed[j] && guess[i] === code[j]) {
          result[i] = "wrong-position";
          codeUsed[j] = true;
          break;
        }
      }
    }
    
    // In extreme mode, we don't sort the feedback pegs
    // This makes it harder for the player to know which positions are correct
    return result;
  }

  // Color picker popover component
  function ColorPickerPopover({ pegIndex }: { pegIndex: number }) {
    return (
      <div className="absolute z-10 mt-2 bg-white rounded-lg shadow-lg p-4 border" style={{ transform: "translateX(-25%)", minWidth: "150px" }}>
        <div className="grid grid-cols-4 gap-3">
          {gameState.availableColors.map(color => (
            <button
              key={color}
              className="w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
              onClick={() => setPeg(pegIndex, color)}
            />
          ))}
          <button
            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform hover:scale-110"
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
        <div className="border-zinc-800 border p-6 rounded-lg shadow-md max-w-3xl mx-auto">
          {/* Difficulty selector */}
          {gameState.status === "playing" && (
            <div className="mb-6 flex justify-center space-x-4">
              <button
                className={`px-3 py-1 rounded ${gameState.difficulty === 'easy' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                onClick={() => changeDifficulty('easy')}
              >
                Easy
              </button>
              <button
                className={`px-3 py-1 rounded ${gameState.difficulty === 'medium' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
                onClick={() => changeDifficulty('medium')}
              >
                Medium
              </button>
              <button
                className={`px-3 py-1 rounded ${gameState.difficulty === 'hard' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                onClick={() => changeDifficulty('hard')}
              >
                Hard
              </button>
            </div>
          )}
          
          {/* Game info */}
          <div className="mb-4 flex justify-between">
            <div>
              <p className="text-zinc-400">
                Attempts: {gameState.attempts.length}/{gameState.maxAttempts}
              </p>
            </div>
            <div>
              <p className="text-zinc-400">
                Hints: {gameState.maxHints - gameState.hintsUsed}/{gameState.maxHints}
              </p>
            </div>
          </div>
          
          {/* Game board */}
          <div className="space-y-4">
            {/* Previous attempts */}
            {gameState.attempts.map((attempt, rowIndex) => (
              <div key={rowIndex} className="flex items-center space-x-4">
                <div className="flex-1 flex space-x-2">
                  {attempt.map((color, pegIndex) => (
                    <div 
                      key={pegIndex}
                      className="w-10 h-10 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color || 'transparent' }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap w-28 h-12 gap-1 justify-center items-center">
                  {/* In extreme mode, the feedback is not sorted to make it more challenging */}
                  {gameState.feedback[rowIndex].map((feedback, i) => (
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
                        className="w-10 h-10 rounded-full border-2 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400"
                        style={{ backgroundColor: color || 'rgba(255, 255, 255, .2)' }}
                        onClick={() => togglePopover(pegIndex)}
                      />
                      {showHint === pegIndex && (
                        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 w-5 h-5 bg-yellow-400 rounded-full border border-white flex items-center justify-center text-xs font-bold">
                          !
                        </div>
                      )}
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
                      {Array(gameState.codeLength).fill(null).map((_, pegIndex) => (
                        <div 
                          key={pegIndex}
                          className="w-10 h-10 rounded-full border-2 border-dashed border-gray-200"
                        />
                      ))}
                    </div>
                    <div className="w-28 h-12"></div>
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
                  ? (
                    <>
                      <div className="text-xl font-bold">Congratulations! You cracked the code!</div>
                      <div className="mt-2">Your score: {gameState.score}</div>
                    </>
                  ) 
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
                  onClick={() => resetGame()}
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
          <div className="mt-6 max-w-3xl mx-auto flex justify-between">
            <div className="flex space-x-2">
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Restart Game
              </button>
            </div>
            {gameState.hintsUsed < gameState.maxHints && (
              <button
                onClick={useHint}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors flex items-center"
              >
                <span className="mr-1">Use Hint</span> ({gameState.maxHints - gameState.hintsUsed} left)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}