"use client";

import React from "react";
import { useGuitar } from "@/context/GuitarContext";

export default function Controls() {
    const {
        bpm,
        setBpm,
        capo,
        setCapo,
        pattern,
        setPattern,
        volume,
        setVolume,
        isPlaying,
        isLoading,
        togglePlay,
        switchMode,
        setSwitchMode,
    } = useGuitar();

    return (
        <div className="glass-panel p-5 space-y-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Controls
            </h3>

            {/* Pattern Input */}
            <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                    Strum Pattern{" "}
                    <span className="text-gray-600">(D=down, U=up, X=rest)</span>
                </label>
                <input
                    type="text"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 
                     text-white text-sm font-mono focus:outline-none focus:ring-2 
                     focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all
                     placeholder-gray-600"
                    placeholder="D-X-D-U-X-U-D-U"
                />
            </div>

            {/* BPM Slider */}
            <div>
                <label className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>BPM</span>
                    <span className="text-cyan-400 font-mono font-bold">{bpm}</span>
                </label>
                <input
                    type="range"
                    min={40}
                    max={240}
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-full slider"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                    <span>40</span>
                    <span>240</span>
                </div>
            </div>

            {/* Volume Slider */}
            <div>
                <label className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>🔊 Volume</span>
                    <span className="text-emerald-400 font-mono font-bold">{volume}%</span>
                </label>
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full slider"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                    <span>0</span>
                    <span>100</span>
                </div>
            </div>

            {/* Capo Slider */}
            <div>
                <label className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Capo</span>
                    <span className="text-amber-400 font-mono font-bold">
                        {capo === 0 ? "None" : `Fret ${capo}`}
                    </span>
                </label>
                <input
                    type="range"
                    min={0}
                    max={12}
                    value={capo}
                    onChange={(e) => setCapo(Number(e.target.value))}
                    className="w-full slider"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                    <span>0</span>
                    <span>12</span>
                </div>
            </div>

            {/* Switch Mode */}
            <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                    Chord Switch Mode
                </label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSwitchMode("quantised")}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${switchMode === "quantised"
                            ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40"
                            : "bg-white/5 text-gray-500 hover:bg-white/10"
                            }`}
                    >
                        Quantised
                    </button>
                    <button
                        onClick={() => setSwitchMode("freeplay")}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${switchMode === "freeplay"
                            ? "bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/40"
                            : "bg-white/5 text-gray-500 hover:bg-white/10"
                            }`}
                    >
                        Free Play
                    </button>
                </div>
            </div>

            {/* Play / Stop */}
            <button
                onClick={togglePlay}
                disabled={isLoading}
                className={`
          w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider
          transition-all duration-200 disabled:opacity-50 disabled:cursor-wait
          ${isPlaying
                        ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/40 hover:bg-red-500/30"
                        : "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40 hover:bg-emerald-500/30"
                    }
        `}
            >
                {isLoading ? "⏳  Loading Samples..." : isPlaying ? "■  Stop" : "▶  Play"}
            </button>

            <p className="text-[10px] text-gray-600 text-center">
                Press <kbd className="kbd">Space</kbd> to toggle play
            </p>
        </div>
    );
}
