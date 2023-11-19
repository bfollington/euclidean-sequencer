export function generateEuclideanRhythm(
  beats: number,
  steps: number,
  phase: number = 0
) {
  if (steps === 0) return [];
  if (beats >= steps) return Array(steps).fill(1);
  if (beats === 0) return Array(steps).fill(0);

  let pattern = new Array(steps).fill(0);
  let count = 0;
  for (let i = 0; i < steps; i++) {
    count += beats;
    if (count >= steps) {
      count -= steps;
      pattern[i] = 1;
    }
  }

  // Adjusting for phase (shifting the pattern)
  while (phase < 0) phase += steps; // Normalize negative phase
  for (let i = 0; i < phase; i++) {
    pattern.unshift(pattern.pop()); // Rotate the pattern right
  }

  return pattern;
}
