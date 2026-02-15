"use client";

import React from "react";
import { useGuitar } from "@/context/GuitarContext";
import { CHORDS } from "@/lib/chords";

export default function KeyboardHint() {
    const { activeChord, setChord } = useGuitar();

    const chordIds = Object.keys(CHORDS);

    return (
        <div className="glass-panel p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Chords{" "}
                <span className="text-gray-600 normal-case font-normal">
                    (press key to switch)
                </span>
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {chordIds.map((id) => {
                    const chord = CHORDS[id];
                    const isActive = activeChord === id;
                    return (
                        <button
                            key={id}
                            onClick={() => setChord(id)}
                            className={`
                relative group flex flex-col items-center py-2.5 px-2 rounded-xl
                transition-all duration-200 cursor-pointer
                ${isActive
                                    ? "bg-gradient-to-br from-cyan-500/20 to-blue-600/20 ring-1 ring-cyan-400/50 shadow-lg shadow-cyan-500/10 scale-105"
                                    : "bg-white/5 hover:bg-white/10 hover:scale-105"
                                }
              `}
                        >
                            <span
                                className={`text-lg font-bold ${isActive ? "text-cyan-300" : "text-gray-300"
                                    }`}
                            >
                                {id}
                            </span>
                            <kbd
                                className={`mt-1 text-[10px] px-1.5 py-0.5 rounded ${isActive
                                        ? "bg-cyan-500/20 text-cyan-400"
                                        : "bg-white/5 text-gray-600"
                                    }`}
                            >
                                {chord.key.toUpperCase()}
                            </kbd>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
