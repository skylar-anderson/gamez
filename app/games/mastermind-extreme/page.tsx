"use client";

import MastermindExtremeGame from "./MastermindExtremeGame"

export default function MastermindExtremePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Mastermind Extreme</h1>
        <p className="text-zinc-400 text-center max-w-2xl mx-auto">
          A challenging variant of the classic Mastermind game with more pegs, more colors, and a scoring system.
          Choose your difficulty level, use hints strategically, and solve the code as quickly as possible to maximize your score!
        </p>
        <div className="mt-4 max-w-2xl mx-auto">
          <h3 className="font-semibold text-center">Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="border border-zinc-800 rounded-lg p-4">
              <h4 className="font-medium mb-2">Difficulty Levels</h4>
              <ul className="list-disc list-inside text-sm text-zinc-400">
                <li><span className="text-green-500 font-medium">Easy:</span> 4 pegs, 6 colors, 10 attempts, 3 hints</li>
                <li><span className="text-yellow-500 font-medium">Medium:</span> 5 pegs, 8 colors, 8 attempts, 2 hints</li>
                <li><span className="text-red-500 font-medium">Hard:</span> 6 pegs, 8 colors, 6 attempts, 1 hint</li>
              </ul>
            </div>
            <div className="border border-zinc-800 rounded-lg p-4">
              <h4 className="font-medium mb-2">Scoring System</h4>
              <ul className="list-disc list-inside text-sm text-zinc-400">
                <li>Attempts remaining: 100 points each</li>
                <li>Unused hints: 150 points each</li>
                <li>Speed bonus: up to 3000 points</li>
                <li>Difficulty multiplier: Easy (1x), Medium (1.5x), Hard (2x)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <MastermindExtremeGame />
    </div>
  );
}