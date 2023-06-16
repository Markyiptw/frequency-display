import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { PitchDetector } from "pitchy";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [options, setOptions] = useState({
    frequency: generateNotes()[0].frequency,
  });

  const [detected, setDetected] = useState(null);
  const [clarity, setClarity] = useState(null);

  return (
    <>
      <select
        value={options.frequency}
        onChange={(e) =>
          setOptions((options) => ({ ...options, frequency: e.target.value }))
        }
      >
        {generateNotes().map(({ note, frequency }) => (
          <option key={frequency} value={frequency}>
            {note}: {frequency}
          </option>
        ))}
      </select>

      <div>perfect fifth: {(options.frequency * 3) / 2}</div>

      <button
        className="block"
        onClick={() => {
          const audioContext = new AudioContext();
          const mainGainNode = audioContext.createGain();
          mainGainNode.connect(audioContext.destination);
          mainGainNode.gain.value = 1;
          const osc = audioContext.createOscillator();
          osc.connect(mainGainNode);
          osc.frequency.value = options.frequency;
          osc.start();
          setTimeout(osc.stop.bind(osc), 5000);
        }}
      >
        play for 5 seconds
      </button>
      <button
        onClick={async () => {
          const audioContext = new AudioContext();
          const analyserNode = audioContext.createAnalyser();
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          audioContext.createMediaStreamSource(stream).connect(analyserNode);
          const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
          const input = new Float32Array(detector.inputLength);
          function update() {
            setTimeout(update, 100);
            analyserNode.getFloatTimeDomainData(input);
            const [pitch, clarity] = detector.findPitch(
              input,
              audioContext.sampleRate
            );
            setClarity(clarity);
            if (clarity > 0.9) {
              setDetected(pitch);
            } else setDetected(null);
          }
          update();
        }}
      >
        start pitch detection (once started can't stop, unless refresh page)
      </button>
      <div>
        {detected !== null
          ? `${Math.round(detected * 10) / 10} Hz`
          : "cannot detect pitch"}
      </div>
    </>
  );
}

function generateNotes() {
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
}

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
