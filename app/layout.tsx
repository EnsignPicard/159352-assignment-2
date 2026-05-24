import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "DairyFlat Air",
  description: "Online booking system for DairyFlat Air",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="bg-sky-700 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90">
            <img src="/logo.svg" alt="DairyFlat Air" className="h-10 w-10" />
            <span className="text-xl font-bold tracking-tight">DairyFlat Air</span>
          </Link>
          <nav className="flex gap-6 text-sm font-medium">
            <Link href="/search" className="hover:text-sky-200 transition-colors">
              Search Flights
            </Link>
            <Link href="/bookings" className="hover:text-sky-200 transition-colors">
              My Bookings
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        {children}
      </main>
      <footer className="bg-gray-800 text-gray-400 text-sm text-center py-4">
        DairyFlat Air &mdash; Dairy Flat Airport, Auckland
      </footer>
      </body>
      </html>
  );
}