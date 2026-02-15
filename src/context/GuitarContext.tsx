"use client";

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { getEngine, type GuitarEngine, type StepType } from "@/lib/audioEngine";
import { CHORDS, KEY_MAP, getSoundingRoot } from "@/lib/chords";

interface GuitarState {
    activeChord: string;
    capo: number;
    bpm: number;
    pattern: string;
    volume: number;
    isPlaying: boolean;
    isLoading: boolean;
    strumDirection: StepType | null;
    strumStep: number;
    switchMode: "quantised" | "freeplay";
    soundingRoot: string;
}

interface GuitarContextType extends GuitarState {
    setChord: (chordId: string) => void;
    setCapo: (capo: number) => void;
    setBpm: (bpm: number) => void;
    setPattern: (pattern: string) => void;
    setVolume: (volume: number) => void;
    togglePlay: () => void;
    setSwitchMode: (mode: "quantised" | "freeplay") => void;
}

const GuitarContext = createContext<GuitarContextType | null>(null);

export function GuitarProvider({ children }: { children: React.ReactNode }) {
    const [activeChord, setActiveChord] = useState("C");
    const [capo, setCapoState] = useState(0);
    const [bpm, setBpmState] = useState(120);
    const [pattern, setPatternState] = useState("D-X-D-U-X-U-D-U");
    const [volume, setVolumeState] = useState(72);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [strumDirection, setStrumDirection] = useState<StepType | null>(null);
    const [strumStep, setStrumStep] = useState(0);
    const [switchMode, setSwitchModeState] = useState<"quantised" | "freeplay">("quantised");
    const engineRef = useRef<GuitarEngine | null>(null);

    const soundingRoot = getSoundingRoot(
        CHORDS[activeChord]?.rootSemitones ?? 0,
        capo
    );

    // Initialize engine
    useEffect(() => {
        const engine = getEngine();
        engineRef.current = engine;
        engine.setStrumCallback((dir, step) => {
            setStrumDirection(dir);
            setStrumStep(step);
            // Update active chord from engine (may have changed via quantised switch)
            setActiveChord(engine.getActiveChord());
        });
        return () => {
            engine.dispose();
        };
    }, []);

    const setChord = useCallback((chordId: string) => {
        if (!CHORDS[chordId]) return;
        const engine = engineRef.current;
        if (engine) {
            engine.setChord(chordId);
            // In freeplay or when not playing, update UI immediately
            if (!engine.getIsPlaying() || true) {
                setActiveChord(engine.getActiveChord());
            }
        } else {
            setActiveChord(chordId);
        }
    }, []);

    const setCapo = useCallback((val: number) => {
        setCapoState(val);
        engineRef.current?.setCapo(val);
    }, []);

    const setBpm = useCallback((val: number) => {
        setBpmState(val);
        engineRef.current?.setBpm(val);
    }, []);

    const setPattern = useCallback((val: string) => {
        setPatternState(val);
        engineRef.current?.setPattern(val);
    }, []);

    const setVolume = useCallback((val: number) => {
        setVolumeState(val);
        engineRef.current?.setVolume(val);
    }, []);

    const togglePlay = useCallback(async () => {
        const engine = engineRef.current;
        if (!engine) return;
        setIsLoading(true);
        await engine.init();
        setIsLoading(false);
        if (engine.getIsPlaying()) {
            engine.stop();
            setIsPlaying(false);
            setStrumDirection(null);
        } else {
            engine.setPattern(pattern);
            engine.setBpm(bpm);
            engine.setCapo(capo);
            engine.setVolume(volume);
            engine.play();
            setIsPlaying(true);
        }
    }, [pattern, bpm, capo, volume]);

    const setSwitchMode = useCallback((mode: "quantised" | "freeplay") => {
        setSwitchModeState(mode);
        engineRef.current?.setSwitchMode(mode);
    }, []);

    // Keyboard listeners
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            )
                return;

            const key = e.key.toLowerCase();

            // Space toggles play/stop
            if (key === " ") {
                e.preventDefault();
                togglePlay();
                return;
            }

            // Chord keys
            const chordId = KEY_MAP[key];
            if (chordId) {
                e.preventDefault();
                setChord(chordId);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [togglePlay, setChord]);

    return (
        <GuitarContext.Provider
            value={{
                activeChord,
                capo,
                bpm,
                pattern,
                volume,
                isPlaying,
                isLoading,
                strumDirection,
                strumStep,
                switchMode,
                soundingRoot,
                setChord,
                setCapo,
                setBpm,
                setPattern,
                setVolume,
                togglePlay,
                setSwitchMode,
            }}
        >
            {children}
        </GuitarContext.Provider>
    );
}

export function useGuitar() {
    const ctx = useContext(GuitarContext);
    if (!ctx) throw new Error("useGuitar must be used inside GuitarProvider");
    return ctx;
}
