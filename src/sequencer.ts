import * as Tone from "tone";
import { generateEuclideanRhythm } from "./euclidean";

let listeners: ((note: string, velocity: number) => void)[] = [];
export function addListener(
  listener: (note: string, velocity: number) => void
) {
  listeners.push(listener);
}

// Define the minor pentatonic scale
const pentatonicScale = ["C4", "Eb4", "F4", "G4", "Bb4"];
const pentatonicScaleOct = ["C5", "Eb5", "F5", "G5", "Bb5"];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const noteTypes = ["4n", "4n.", "8n", "8n."];

function chooseFrom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const delay = new Tone.FeedbackDelay(chooseFrom(noteTypes), 0.25);
const reverb = new Tone.Reverb({
  decay: 4,
  wet: 0.5,
  preDelay: 0.1,
});
// Euclidean rhythm pattern
const pattern = generateEuclideanRhythm(
  randomInt(1, 7),
  randomInt(5, 10),
  randomInt(1, 7)
); // Example: 4 beats in 8 steps
const subpattern = generateEuclideanRhythm(
  randomInt(1, 7),
  randomInt(5, 10),
  randomInt(1, 7)
); // Example: 4 beats in 8 steps

// Create a synth
const synth = new Tone.PolySynth();
synth.connect(delay);
synth.connect(reverb);
delay.connect(reverb);
synth.toDestination();
delay.toDestination();
reverb.toDestination();

// Create a sequence
const sequence = new Tone.Sequence((time, step) => {
  if (pattern[step]) {
    // Randomly pick a note from the scale
    const note =
      pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];
    const velocity = Math.random() * 0.5;
    synth.triggerAttackRelease(note, chooseFrom(noteTypes), time, velocity);
    onNote(note, velocity);
  }
}, Array.from(Array(8).keys()));

const subsequence = new Tone.Sequence(
  (time, step) => {
    if (subpattern[step]) {
      // Randomly pick a note from the scale
      const note =
        pentatonicScaleOct[Math.floor(Math.random() * pentatonicScale.length)];
      const velocity = Math.random() * 0.5;
      synth.triggerAttackRelease(note, chooseFrom(noteTypes), time, velocity);
      onNote(note, velocity);
    }
  },
  Array.from(Array(8).keys()),
  chooseFrom(noteTypes)
);

export function start() {
  // Start the sequence
  Tone.Transport.start();
  sequence.start();
  subsequence.start();
  Tone.start();
}

function onNote(note: string, velocity: number) {
  console.log(note, velocity);
  listeners.forEach((listener) => listener(note, velocity));
}
