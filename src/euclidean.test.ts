import { generateEuclideanRhythm } from "./euclidean";

describe("generateEuclideanRhythm", () => {
  test("distributes beats evenly", () => {
    expect(generateEuclideanRhythm(3, 8)).toEqual([0, 0, 1, 0, 0, 1, 0, 1]);
    expect(generateEuclideanRhythm(2, 5)).toEqual([0, 0, 1, 0, 1]);
  });

  test("handles more beats than steps", () => {
    expect(generateEuclideanRhythm(5, 3)).toEqual([1, 1, 1]);
  });

  test("handles no beats", () => {
    expect(generateEuclideanRhythm(0, 5)).toEqual([0, 0, 0, 0, 0]);
  });

  test("handles beats equal to steps", () => {
    expect(generateEuclideanRhythm(4, 4)).toEqual([1, 1, 1, 1]);
  });

  test("returns empty array for no steps", () => {
    expect(generateEuclideanRhythm(3, 0)).toEqual([]);
  });
});

describe("generateEuclideanRhythm with phase", () => {
  test("applies phase shift correctly", () => {
    expect(generateEuclideanRhythm(3, 8, 2)).toEqual([1, 0, 0, 0, 1, 0, 1, 0]);
    expect(generateEuclideanRhythm(2, 5, 3)).toEqual([0, 1, 0, 0, 1]);
  });

  test("handles phase larger than steps", () => {
    expect(generateEuclideanRhythm(2, 5, 8)).toEqual([0, 1, 0, 1, 0]);
  });

  test("handles negative phase", () => {
    expect(generateEuclideanRhythm(3, 8, -2)).toEqual([1, 0, 1, 0, 0, 0, 1, 0]);
  });
});
