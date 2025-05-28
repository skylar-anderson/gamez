"use client";

import MastermindGame from "./MastermindGame"

export default function MastermindPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Mastermind</h1>
        <p className="text-zinc-400 text-center max-w-2xl mx-auto">
          You have 10 tries to guess the code. Red pins mean a peg is the correct color and in the correct position. White pins mean a peg is the correct color but in the wrong position.
        </p>
      </div>
      
      <MastermindGame />
    </div>
  );
} 