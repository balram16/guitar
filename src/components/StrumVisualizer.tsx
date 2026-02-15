"use client";

import React, { useEffect, useState } from "react";
import { useGuitar } from "@/context/GuitarContext";

export default function StrumVisualizer() {
    const { strumDirection, strumStep, isPlaying, pattern } = useGuitar();
    const [animating, setAnimating] = useState(false);

    const patternArray = pattern
        .toUpperCase()
        .replace(/_/g, "X")
        .split(/[-\s,]+/)
        .filter((s) => s === "D" || s === "U" || s === "X");

    useEffect(() => {
        if (strumDirection && strumDirection !== "X") {
            setAnimating(true);
            const t = setTimeout(() => setAnimating(false), 200);
            return () => clearTimeout(t);
        }
    }, [strumDirection, strumStep]);

    return (
        <div className="glass-panel p-4 flex flex-col items-center">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Strum Pattern
            </h3>

            {/* Pattern display */}
            <div className="flex gap-1.5 mb-4 flex-wrap justify-center">
                {patternArray.map((dir, i) => {
                    const isActive = isPlaying && strumStep % patternArray.length === i;
                    const isRest = dir === "X";
                    return (
                        <div
                            key={i}
                            className={`
                w-10 h-12 rounded-lg flex flex-col items-center justify-center 
                text-sm font-bold transition-all duration-150
                ${isActive && !isRest
                                    ? "bg-cyan-500/30 text-cyan-300 scale-110 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/50"
                                    : isActive && isRest
                                        ? "bg-amber-500/20 text-amber-400 scale-105 ring-1 ring-amber-400/30"
                                        : isRest
                                            ? "bg-white/[0.02] text-gray-700 border border-dashed border-white/10"
                                            : "bg-white/5 text-gray-500"
                                }
              `}
                        >
                            <span className="text-lg">
                                {dir === "D" ? "↓" : dir === "U" ? "↑" : "·"}
                            </span>
                            <span className="text-[10px] opacity-70">{dir}</span>
                        </div>
                    );
                })}
            </div>

            {/* Strum indicator */}
            <div className="relative w-16 h-40 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                {/* Track line */}
                <div className="absolute left-1/2 top-4 bottom-4 w-0.5 bg-white/10 -translate-x-1/2" />

                {/* Animated pick */}
                <div
                    className={`
            absolute left-1/2 -translate-x-1/2 w-8 h-8 
            transition-all duration-200 ease-out
            ${animating ? "scale-110" : "scale-100"}
            ${strumDirection === "X" ? "opacity-40" : "opacity-100"}
          `}
                    style={{
                        top: !isPlaying
                            ? "50%"
                            : strumDirection === "D"
                                ? "70%"
                                : strumDirection === "U"
                                    ? "20%"
                                    : "50%",
                        transform: `translateX(-50%) translateY(-50%) ${strumDirection === "U" ? "rotate(180deg)" : ""
                            }`,
                    }}
                >
                    {/* Pick shape */}
                    <svg viewBox="0 0 32 32" className="w-full h-full">
                        <defs>
                            <linearGradient id="pickGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#d97706" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <path
                            d="M16 2 L26 12 Q26 28 16 30 Q6 28 6 12 Z"
                            fill="url(#pickGrad)"
                            stroke="#b45309"
                            strokeWidth="1"
                            filter={animating ? "url(#glow)" : ""}
                        />
                    </svg>
                </div>

                {/* Direction labels */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-gray-500">
                    UP
                </div>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-gray-500">
                    DN
                </div>
            </div>
        </div>
    );
}
