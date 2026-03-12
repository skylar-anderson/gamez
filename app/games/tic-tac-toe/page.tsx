import Link from "next/link";
import TicTacToeGame from "./TicTacToeGame";

export default function TicTacToePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mr-4">
          ← Back to Games
        </Link>
      </div>
      <TicTacToeGame />
    </div>
  );
}