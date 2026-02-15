// Chord definitions with accurate guitar voicings
// Note names use FLAT notation (Db, Eb, Gb, Ab, Bb) to match MusyngKite sample file names

export interface ChordDefinition {
  name: string;
  key: string;
  rootSemitones: number;
  notes: (string | null)[];
  frets: number[];
  fingers: number[];
}

export const CHORDS: Record<string, ChordDefinition> = {
  C: {
    name: "C Major",
    key: "c",
    rootSemitones: 0,
    notes: [null, "C3", "E3", "G3", "C4", "E4"],
    frets: [-1, 3, 2, 0, 1, 0],
    fingers: [0, 3, 2, 0, 1, 0],
  },
  D: {
    name: "D Major",
    key: "d",
    rootSemitones: 2,
    notes: [null, null, "D3", "A3", "D4", "Gb4"],
    frets: [-1, -1, 0, 2, 3, 2],
    fingers: [0, 0, 0, 1, 3, 2],
  },
  E: {
    name: "E Major",
    key: "e",
    rootSemitones: 4,
    notes: ["E2", "B2", "E3", "Ab3", "B3", "E4"],
    frets: [0, 2, 2, 1, 0, 0],
    fingers: [0, 2, 3, 1, 0, 0],
  },
  F: {
    name: "F Major",
    key: "f",
    rootSemitones: 5,
    notes: [null, null, "F3", "A3", "C4", "F4"],
    frets: [-1, -1, 3, 2, 1, 1],
    fingers: [0, 0, 3, 2, 1, 1],
  },
  G: {
    name: "G Major",
    key: "g",
    rootSemitones: 7,
    notes: ["G2", "B2", "D3", "G3", "B3", "G4"],
    frets: [3, 2, 0, 0, 0, 3],
    fingers: [2, 1, 0, 0, 0, 3],
  },
  A: {
    name: "A Major",
    key: "a",
    rootSemitones: 9,
    notes: [null, "A2", "E3", "A3", "Db4", "E4"],
    frets: [-1, 0, 2, 2, 2, 0],
    fingers: [0, 0, 1, 2, 3, 0],
  },
  Am: {
    name: "A Minor",
    key: "q",
    rootSemitones: 9,
    notes: [null, "A2", "E3", "A3", "C4", "E4"],
    frets: [-1, 0, 2, 2, 1, 0],
    fingers: [0, 0, 2, 3, 1, 0],
  },
  Dm: {
    name: "D Minor",
    key: "r",
    rootSemitones: 2,
    notes: [null, null, "D3", "A3", "D4", "F4"],
    frets: [-1, -1, 0, 2, 3, 1],
    fingers: [0, 0, 0, 2, 3, 1],
  },
  Em: {
    name: "E Minor",
    key: "w",
    rootSemitones: 4,
    notes: ["E2", "B2", "E3", "G3", "B3", "E4"],
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
  },
  B7: {
    name: "B7",
    key: "b",
    rootSemitones: 11,
    notes: [null, "B2", "Eb3", "A3", "B3", "Gb4"],
    frets: [-1, 2, 1, 2, 0, 2],
    fingers: [0, 2, 1, 3, 0, 4],
  },
  C7: {
    name: "C7",
    key: "v",
    rootSemitones: 0,
    notes: [null, "C3", "E3", "Bb3", "C4", "E4"],
    frets: [-1, 3, 2, 3, 1, 0],
    fingers: [0, 3, 2, 4, 1, 0],
  },
  G7: {
    name: "G7",
    key: "h",
    rootSemitones: 7,
    notes: ["G2", "B2", "D3", "G3", "B3", "F4"],
    frets: [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, 0, 0, 0, 1],
  },
};

// Key -> Chord ID mapping
export const KEY_MAP: Record<string, string> = {};
Object.entries(CHORDS).forEach(([id, chord]) => {
  KEY_MAP[chord.key] = id;
});

// Note names — sharps for display, flats for sample file matching
const NOTE_NAMES_DISPLAY = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_NAMES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

export function getSoundingRoot(rootSemitones: number, capo: number): string {
  return NOTE_NAMES_DISPLAY[(rootSemitones + capo) % 12];
}

// Get chromatic index for any note name (sharp or flat)
function getNoteIndex(noteName: string): number {
  let idx = NOTE_NAMES_FLAT.indexOf(noteName);
  if (idx !== -1) return idx;
  idx = NOTE_NAMES_DISPLAY.indexOf(noteName);
  if (idx !== -1) return idx;
  return -1;
}

// Transpose a note name by semitones — outputs FLAT notation for sample file matching
export function transposeNote(note: string, semitones: number): string {
  const match = note.match(/^([A-G][#b]?)(\d)$/);
  if (!match) return note;
  const noteName = match[1];
  const octave = parseInt(match[2]);

  const noteIndex = getNoteIndex(noteName);
  if (noteIndex === -1) return note;

  if (semitones === 0) {
    // Normalize to flat notation even with 0 transposition
    const flatName = NOTE_NAMES_FLAT[noteIndex];
    return `${flatName}${octave}`;
  }

  const newIndex = noteIndex + semitones;
  const newOctave = octave + Math.floor(newIndex / 12);
  const newNoteName = NOTE_NAMES_FLAT[((newIndex % 12) + 12) % 12];
  return `${newNoteName}${newOctave}`;
}

// Get chord notes as note names, transposed by capo (flat notation)
export function getChordNotes(chordId: string, capo: number): string[] {
  const chord = CHORDS[chordId];
  if (!chord) return [];
  return chord.notes
    .filter((n): n is string => n !== null)
    .map((note) => transposeNote(note, capo));
}
