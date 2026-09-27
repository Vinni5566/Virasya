/**
 * Deterministic pseudo-random number generator for stable procedural layouts.
 * Uses a linear congruential generator (LCG) derived from a seed string.
 */
export function createSeededRandom(seed: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  let state = h >>> 0;

  return {
    /**
     * Returns a float between 0 (inclusive) and 1 (exclusive)
     */
    next(): number {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    },

    /**
     * Returns an integer between min and max (inclusive)
     */
    nextInt(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },

    /**
     * Picks one item from an array deterministically
     */
    pick<T>(items: T[]): T {
      if (!items || items.length === 0) {
        throw new Error('Cannot pick from empty array');
      }
      return items[this.nextInt(0, items.length - 1)];
    },
  };
}
