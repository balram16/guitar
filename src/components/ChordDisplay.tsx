"use client";

import React from "react";
import { useGuitar } from "@/context/GuitarContext";
import { CHORDS } from "@/lib/chords";

export default function ChordDisplay() {
    const { activeChord, capo, soundingRoot } = useGuitar();
    const chord = CHORDS[activeChord];

    if (!chord) return null;

    const chordType = chord.name.replace(chord.name.match(/^[A-G]#?/)?.[0] || "", "");
    const displayRoot = chord.name.match(/^[A-G]#?/)?.[0] || "";

    return (
        <div className="glass-panel p-6 flex flex-col items-center text-center">
            {/* Active chord */}
            <div className="mb-1">
                <span className="text-6xl font-black bg-gradient-to-br from-cyan-300 to-blue-500 bg-clip-text text-transparent leading-none">
                    {displayRoot}
                </span>
                <span className="text-3xl font-bold text-gray-400 ml-1">
                    {chordType}
                </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">{chord.name}</p>

            {/* Capo / Sounding info */}
            {capo > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2 mb-3">
                    <p className="text-xs text-amber-400">
                        Capo {capo} → Sounds as{" "}
                        <span className="font-bold text-amber-300">
                            {soundingRoot}
                            {chordType}
                        </span>
                    </p>
                </div>
            )}

            {/* Key shortcut */}
            <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>Key:</span>
                <kbd className="kbd text-sm">{chord.key.toUpperCase()}</kbd>
            </div>
        </div>
    );
}
