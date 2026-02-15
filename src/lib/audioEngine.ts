"use client";

import * as Tone from "tone";
import { getChordNotes } from "./chords";

// Strum step: D = down, U = up, X = rest (hand moves but no sound)
type StepType = "D" | "U" | "X";
type StrumCallback = (direction: StepType, stepIndex: number) => void;

// High-quality MusyngKite acoustic guitar samples — EVERY chromatic note loaded
// so zero pitch shifting is needed (pitch shifting causes the "computer" sound)
const SAMPLE_BASE_NYLON =
    "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/acoustic_guitar_nylon-mp3";
const SAMPLE_BASE_STEEL =
    "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/acoustic_guitar_steel-mp3";

// Load every note in the guitar range E2 → G5 — no pitch shifting needed!
function buildFullSampleMap(base: string): Record<string, string> {
    const notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    const map: Record<string, string> = {};
    for (let octave = 2; octave <= 5; octave++) {
        for (const note of notes) {
            const key = `${note}${octave}`;
            map[key] = `${base}/${key}.mp3`;
        }
    }
    return map;
}

/**
 * Guitar Engine v4 — Crisp, accurate guitar with rest/pause support.
 *
 * Changes from v3:
 * 1. Strum pattern now supports X (rest/pause) — the silent beats in D_DU_UDU
 * 2. Crisper tone: steel layer boosted, reverb reduced, filter opened up
 * 3. Tighter strum spread for snappier feel
 * 4. On chord change, previous notes are damped (like real hand technique)
 */
class GuitarEngine {
    private nylonSampler: Tone.Sampler | null = null;
    private steelSampler: Tone.Sampler | null = null;
    private nylonGain: Tone.Gain | null = null;
    private steelGain: Tone.Gain | null = null;
    private reverb: Tone.Reverb | null = null;
    private compressor: Tone.Compressor | null = null;
    private limiter: Tone.Limiter | null = null;
    private masterGain: Tone.Gain | null = null;
    private warmth: Tone.Filter | null = null;

    private sequenceId: number | null = null;
    private isPlaying = false;
    private pattern: StepType[] = ["D", "X", "D", "U", "X", "U", "D", "U"];
    private bpm = 120;
    private currentStep = 0;
    private activeChord = "C";
    private prevChord = "C";
    private capo = 0;
    private pendingChord: string | null = null;
    private switchMode: "quantised" | "freeplay" = "quantised";
    private strumCallback: StrumCallback | null = null;
    private initialized = false;
    private loaded = false;
    private loadCount = 0;

    async init() {
        if (this.initialized) return;
        await Tone.start();

        // Tighter compression for crisp attack
        this.compressor = new Tone.Compressor({
            threshold: -18,
            ratio: 3,
            attack: 0.003,  // Fast attack to catch transients
            release: 0.15,
        });

        // Body filter — opened up more for crispness
        this.warmth = new Tone.Filter({
            type: "lowpass",
            frequency: 6500,  // Higher = crisper bright tone
            rolloff: -12,
            Q: 0.5,
        });

        // Less reverb for crispness
        this.reverb = new Tone.Reverb({
            decay: 1.2,       // Shorter decay
            wet: 0.08,        // Less wet = drier/crisper
            preDelay: 0.01,
        });

        this.masterGain = new Tone.Gain(1.3);
        this.limiter = new Tone.Limiter(-0.5);

        // Nylon — warm body foundation
        this.nylonGain = new Tone.Gain(0.85);
        // Steel — crisp bright attack
        this.steelGain = new Tone.Gain(0.7);

        const loadPromise = new Promise<void>((resolve) => {
            const checkLoaded = () => {
                this.loadCount++;
                if (this.loadCount >= 2) {
                    this.loaded = true;
                    console.log("🎸 Guitar samples loaded!");
                    resolve();
                }
            };

            this.nylonSampler = new Tone.Sampler({
                urls: buildFullSampleMap(SAMPLE_BASE_NYLON),
                onload: checkLoaded,
                onerror: (err) => {
                    console.error("Nylon load error:", err);
                    checkLoaded();
                },
                release: 1.8,
                curve: "exponential",
            });

            this.steelSampler = new Tone.Sampler({
                urls: buildFullSampleMap(SAMPLE_BASE_STEEL),
                onload: checkLoaded,
                onerror: (err) => {
                    console.error("Steel load error:", err);
                    checkLoaded();
                },
                release: 1.5,
                curve: "exponential",
            });

            // Nylon → nylonGain → compressor → warmth → reverb → master → limiter → out
            this.nylonSampler.chain(
                this.nylonGain!,
                this.compressor!,
                this.warmth!,
                this.reverb!,
                this.masterGain!,
                this.limiter!,
                Tone.getDestination()
            );

            // Steel → steelGain → compressor (joins shared chain)
            this.steelSampler.chain(
                this.steelGain!,
                this.compressor!
            );
        });

        this.initialized = true;
        await loadPromise;
    }

    isLoaded() {
        return this.loaded;
    }

    // Volume control — 0 to 100 slider, maps to gain
    setVolume(percent: number) {
        const clamped = Math.max(0, Math.min(100, percent));
        // Convert percentage to gain (0-100 → 0.0-1.5)
        const gain = (clamped / 100) * 1.5;
        if (this.masterGain) {
            this.masterGain.gain.rampTo(gain, 0.05);
        }
    }

    setStrumCallback(cb: StrumCallback) {
        this.strumCallback = cb;
    }

    /**
     * Parse pattern string. Supports:
     *   D = down strum, U = up strum, X or _ = rest/pause
     * Examples:
     *   "D-X-D-U-X-U-D-U"  (the classic D_DU_UDU)
     *   "D D U U D U"
     *   "D,X,D,U,X,U,D,U"
     */
    setPattern(patternStr: string) {
        const parsed = patternStr
            .toUpperCase()
            .replace(/_/g, "X")  // treat _ as rest too
            .split(/[-\s,]+/)
            .filter((s) => s === "D" || s === "U" || s === "X") as StepType[];
        if (parsed.length > 0) {
            this.pattern = parsed;
        }
    }

    getPattern() {
        return this.pattern;
    }

    setBpm(bpm: number) {
        this.bpm = Math.max(40, Math.min(240, bpm));
        if (this.isPlaying) {
            this.stop();
            this.play();
        }
    }

    setChord(chordId: string) {
        if (this.switchMode === "freeplay" || !this.isPlaying) {
            this.prevChord = this.activeChord;
            this.activeChord = chordId;
            this.pendingChord = null;
            // Damp previous strings on chord change (like real guitar technique)
            if (this.prevChord !== chordId) {
                this.dampStrings();
            }
        } else {
            this.pendingChord = chordId;
        }
    }

    getActiveChord() {
        return this.activeChord;
    }

    setCapo(capo: number) {
        this.capo = Math.max(0, Math.min(12, capo));
    }

    setSwitchMode(mode: "quantised" | "freeplay") {
        this.switchMode = mode;
    }

    // Damp strings — quick fade out, like placing hand on strings
    private dampStrings() {
        const now = Tone.now();
        this.nylonSampler?.releaseAll(now + 0.03);
        this.steelSampler?.releaseAll(now + 0.03);
    }

    private triggerStrum(direction: "D" | "U") {
        if (!this.nylonSampler || !this.loaded) return;

        // Apply pending chord
        if (this.pendingChord) {
            this.prevChord = this.activeChord;
            this.activeChord = this.pendingChord;
            this.pendingChord = null;
            // Damp old chord when switching
            if (this.prevChord !== this.activeChord) {
                this.dampStrings();
            }
        }

        const notes = getChordNotes(this.activeChord, this.capo);
        if (notes.length === 0) return;

        // CRITICAL: Release previous notes to prevent polyphony buildup (causes static/crackling)
        // Short 20ms fadeout so it's not an abrupt cut
        const releaseTime = Tone.now();
        this.nylonSampler!.releaseAll(releaseTime + 0.02);
        this.steelSampler?.releaseAll(releaseTime + 0.02);

        // Order: down = low to high, up = high to low
        const orderedNotes = direction === "D" ? [...notes] : [...notes].reverse();

        const now = Tone.now() + 0.005;

        // Tighter, crisper strum spread — 25-40ms
        const baseSpread = direction === "D" ? 0.035 : 0.025;
        const bpmFactor = Math.max(0.7, 120 / this.bpm);
        const totalSpread = baseSpread * bpmFactor;

        orderedNotes.forEach((note, i) => {
            const progress = i / Math.max(1, orderedNotes.length - 1);

            // Pick acceleration curve
            const timingCurve = Math.pow(progress, 0.8);
            const delay = timingCurve * totalSpread;

            // Humanize: ±3ms
            const humanize = (Math.random() - 0.5) * 0.006;

            // Velocity — crisper, more dynamic
            let velocity: number;
            if (direction === "D") {
                velocity = 0.72 - progress * 0.12;
            } else {
                velocity = 0.55 + progress * 0.12;
            }
            velocity += (Math.random() - 0.5) * 0.10;
            velocity = Math.max(0.25, Math.min(0.9, velocity));

            const triggerTime = now + delay + humanize;

            // Shorter note duration to prevent polyphony buildup
            this.nylonSampler!.triggerAttackRelease(
                note, "4n", triggerTime, velocity
            );

            if (this.steelSampler && this.loaded) {
                this.steelSampler.triggerAttackRelease(
                    note, "4n", triggerTime, velocity * 0.65
                );
            }
        });

        // Notify UI
        if (this.strumCallback) {
            this.strumCallback(direction, this.currentStep);
        }
    }

    play() {
        if (!this.loaded || this.isPlaying) return;
        this.isPlaying = true;
        this.currentStep = 0;

        // Each step = one eighth note
        const intervalMs = (60 / this.bpm) * 1000 * 0.5;

        const tick = () => {
            if (!this.isPlaying) return;

            const step = this.pattern[this.currentStep % this.pattern.length];

            if (step === "X") {
                // Rest — no sound, just advance the beat
                // Notify UI so visualizer shows the pause
                if (this.strumCallback) {
                    this.strumCallback("X", this.currentStep);
                }
            } else {
                this.triggerStrum(step);
            }

            this.currentStep++;
            this.sequenceId = window.setTimeout(tick, intervalMs);
        };

        tick();
    }

    stop() {
        this.isPlaying = false;
        if (this.sequenceId !== null) {
            clearTimeout(this.sequenceId);
            this.sequenceId = null;
        }
        this.currentStep = 0;
        this.nylonSampler?.releaseAll(Tone.now() + 0.1);
        this.steelSampler?.releaseAll(Tone.now() + 0.1);
    }

    getIsPlaying() {
        return this.isPlaying;
    }

    dispose() {
        this.stop();
        this.nylonSampler?.dispose();
        this.steelSampler?.dispose();
        this.nylonGain?.dispose();
        this.steelGain?.dispose();
        this.reverb?.dispose();
        this.compressor?.dispose();
        this.warmth?.dispose();
        this.masterGain?.dispose();
        this.limiter?.dispose();
        this.initialized = false;
        this.loaded = false;
    }
}

// Singleton
let engineInstance: GuitarEngine | null = null;

export function getEngine(): GuitarEngine {
    if (!engineInstance) {
        engineInstance = new GuitarEngine();
    }
    return engineInstance;
}

export type { GuitarEngine, StepType };
