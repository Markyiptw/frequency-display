import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

function getFrequency(note) {
  const notes = {
    C: 16.35,
    "C#": 17.32,
    D: 18.35,
    "D#": 19.45,
    E: 20.6,
    F: 21.83,
    "F#": 23.12,
    G: 24.5,
    "G#": 25.96,
    A: 27.5,
    "A#": 29.14,
    B: 30.87,
  };
  const octave = parseInt(note.slice(-1));
  const key = note.slice(0, -1);
  return notes[key] * Math.pow(2, octave - 1);
}

const generateNotes = () => {
  const pianoKeys = [];
  for (let i = 0; i < 7; i++) {
    const octave = i + 1;
    const whiteKeys = ["A", "B", "C", "D", "E", "F", "G"];
    const blackKeys = ["A#", "C#", "D#", "F#", "G#"];

    whiteKeys.forEach((key) => {
      const note = key + octave;
      const frequency = getFrequency(note);
      pianoKeys.push({ note, frequency });
    });

    blackKeys.forEach((key) => {
      const note = key + octave;
      const frequency = getFrequency(note);
      pianoKeys.push({ note, frequency });
    });
  }

  return pianoKeys;
};

export default function Home() {
  return (
    <select>
      {generateNotes().map(({ note, frequency }) => (
        <option key={frequency}>
          {note}: {frequency}
        </option>
      ))}
    </select>
  );
}
