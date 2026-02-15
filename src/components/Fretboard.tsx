"use client";

import React from "react";
import { useGuitar } from "@/context/GuitarContext";
import { CHORDS } from "@/lib/chords";

const STRING_NAMES = ["E", "A", "D", "G", "B", "e"];
const FRET_COUNT = 5;

export default function Fretboard() {
    const { activeChord } = useGuitar();
    const chord = CHORDS[activeChord];

    if (!chord) return null;

    const frets = chord.frets;
    const fingers = chord.fingers;

    // SVG dimensions
    const width = 220;
    const height = 280;
    const fretboardTop = 40;
    const fretboardLeft = 45;
    const stringSpacing = 26;
    const fretSpacing = 44;
    const numStrings = 6;

    return (
        <div className="glass-panel p-4 flex flex-col items-center">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Fretboard
            </h3>
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="select-none"
            >
                {/* Nut */}
                <rect
                    x={fretboardLeft - 2}
                    y={fretboardTop - 2}
                    width={stringSpacing * (numStrings - 1) + 4}
                    height={5}
                    rx={2}
                    fill="#d4a86a"
                />

                {/* Frets */}
                {Array.from({ length: FRET_COUNT + 1 }).map((_, i) => (
                    <line
                        key={`fret-${i}`}
                        x1={fretboardLeft}
                        y1={fretboardTop + i * fretSpacing}
                        x2={fretboardLeft + stringSpacing * (numStrings - 1)}
                        y2={fretboardTop + i * fretSpacing}
                        stroke="#555"
                        strokeWidth={i === 0 ? 3 : 1.5}
                    />
                ))}

                {/* Strings */}
                {Array.from({ length: numStrings }).map((_, i) => (
                    <line
                        key={`string-${i}`}
                        x1={fretboardLeft + i * stringSpacing}
                        y1={fretboardTop}
                        x2={fretboardLeft + i * stringSpacing}
                        y2={fretboardTop + FRET_COUNT * fretSpacing}
                        stroke={i < 3 ? "#c0a070" : "#d0d0d0"}
                        strokeWidth={2.2 - i * 0.25}
                        opacity={0.8}
                    />
                ))}

                {/* Fret position dots (3rd and 5th fret markers) */}
                {[3, 5].filter(f => f <= FRET_COUNT).map((fretNum) => (
                    <circle
                        key={`dot-${fretNum}`}
                        cx={fretboardLeft + (stringSpacing * (numStrings - 1)) / 2}
                        cy={fretboardTop + (fretNum - 0.5) * fretSpacing}
                        r={4}
                        fill="#333"
                        opacity={0.5}
                    />
                ))}

                {/* String labels */}
                {STRING_NAMES.map((name, i) => (
                    <text
                        key={`label-${i}`}
                        x={fretboardLeft + i * stringSpacing}
                        y={fretboardTop + FRET_COUNT * fretSpacing + 20}
                        textAnchor="middle"
                        fill="#888"
                        fontSize="11"
                        fontFamily="monospace"
                    >
                        {name}
                    </text>
                ))}

                {/* Open / Muted indicators above nut */}
                {frets.map((fret, i) => {
                    const x = fretboardLeft + i * stringSpacing;
                    const y = fretboardTop - 15;
                    if (fret === 0) {
                        // Open string
                        return (
                            <circle
                                key={`open-${i}`}
                                cx={x}
                                cy={y}
                                r={7}
                                fill="none"
                                stroke="#22d3ee"
                                strokeWidth={2}
                            />
                        );
                    } else if (fret === -1) {
                        // Muted
                        return (
                            <text
                                key={`mute-${i}`}
                                x={x}
                                y={y + 5}
                                textAnchor="middle"
                                fill="#ef4444"
                                fontSize="14"
                                fontWeight="bold"
                            >
                                ✕
                            </text>
                        );
                    }
                    return null;
                })}

                {/* Finger positions */}
                {frets.map((fret, stringIdx) => {
                    if (fret <= 0) return null;
                    const x = fretboardLeft + stringIdx * stringSpacing;
                    const y = fretboardTop + (fret - 0.5) * fretSpacing;
                    const finger = fingers[stringIdx];

                    return (
                        <g key={`finger-${stringIdx}`}>
                            {/* Glow effect */}
                            <circle
                                cx={x}
                                cy={y}
                                r={12}
                                fill="rgba(59, 130, 246, 0.3)"
                                className="animate-pulse"
                            />
                            {/* Finger dot */}
                            <circle
                                cx={x}
                                cy={y}
                                r={9}
                                fill="url(#fingerGrad)"
                                stroke="#60a5fa"
                                strokeWidth={1.5}
                            />
                            {/* Finger number */}
                            {finger > 0 && (
                                <text
                                    x={x}
                                    y={y + 4}
                                    textAnchor="middle"
                                    fill="white"
                                    fontSize="10"
                                    fontWeight="bold"
                                >
                                    {finger}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* Gradient def */}
                <defs>
                    <radialGradient id="fingerGrad" cx="40%" cy="35%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                    </radialGradient>
                </defs>
            </svg>
        </div>
    );
}
