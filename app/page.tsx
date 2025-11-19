import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Game Collection</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GameCard 
          title="Mastermind" 
          description="A code-breaking game where you try to guess the pattern of colored pegs selected by the computer."
          href="/games/mastermind"
        />
        <GameCard 
          title="Tic Tac Toe" 
          description="Classic tic-tac-toe game. Take turns placing X and O to get three in a row!"
          href="/games/tic-tac-toe"
        />
        <GameCard 
          title="Connect 4" 
          description="Drop colored discs and be the first to get four in a row horizontally, vertically, or diagonally!"
          href="/games/connect-4"
        />
        {/* Add more game cards here as you implement them */}
      </div>
    </div>
  );
}

function GameCard({ title, description, href }: { 
  title: string; 
  description: string; 
  href: string;
}) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-zinc-400 mb-4">{description}</p>
        <Link href={href} className="text-blue-600 hover:text-blue-800 font-medium">
          Play Now →
        </Link>
      </div>
    </div>
  );
}
