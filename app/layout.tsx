import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reid and Grey Games - A Collection of Games",
  description: "Play various games in your browser",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased min-h-screen flex flex-col"
      >
        <header className="bg-zinc-900 border-b border-zinc-800">
          <div className="container mx-auto py-4 px-4 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              Reid and Grey Games
            </Link>
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link href="/" className="hover:text-blue-600 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/games/mastermind" className="hover:text-blue-600 transition-colors">
                    Mastermind
                  </Link>
                </li>
                <li>
                  <Link href="/games/mastermind-extreme" className="hover:text-blue-600 transition-colors">
                    Mastermind Extreme
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}
