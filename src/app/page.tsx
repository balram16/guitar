"use client";

import { GuitarProvider } from "@/context/GuitarContext";
import ChordDisplay from "@/components/ChordDisplay";
import Fretboard from "@/components/Fretboard";
import StrumVisualizer from "@/components/StrumVisualizer";
import Controls from "@/components/Controls";
import KeyboardHint from "@/components/KeyboardHint";

export default function Home() {
  return (
    <GuitarProvider>
      <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              Live Guitar Engine
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Strum patterns • Chord switching • Capo transposition
          </p>
        </header>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left column — Chord + Fretboard */}
          <div className="lg:col-span-4 space-y-5">
            <ChordDisplay />
            <Fretboard />
          </div>

          {/* Center column — Visualizer */}
          <div className="lg:col-span-4 space-y-5">
            <StrumVisualizer />
            <KeyboardHint />
          </div>

          {/* Right column — Controls */}
          <div className="lg:col-span-4 space-y-5">
            <Controls />

            {/* Info card */}
            <div className="glass-panel p-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                How to Play
              </h3>
              <ul className="text-xs text-gray-500 space-y-1.5 list-none">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-0.5">▸</span>
                  Press <kbd className="kbd mx-1">Space</kbd> to start/stop the
                  strum loop
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-0.5">▸</span>
                  Press letter keys to switch chords instantly
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-0.5">▸</span>
                  Adjust the capo to transpose all chords up
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-0.5">▸</span>
                  Type a pattern like{" "}
                  <code className="text-cyan-400/80 font-mono">D-X-D-U-X-U-D-U</code>{" "}
                  to change the rhythm (X = rest)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-0.5">▸</span>
                  <strong>Quantised</strong> mode changes chord on next beat;{" "}
                  <strong>Free Play</strong> changes instantly
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-10 text-xs text-gray-700">
          Built with Next.js, Tailwind CSS &amp; Tone.js
        </footer>
      </main>
    </GuitarProvider>
  );
}
