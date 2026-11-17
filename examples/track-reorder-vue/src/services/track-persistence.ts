/** Synthetic persistence boundary. The adapter never edits this source. */
export const persistence = { writes: [] as string[][] };

export function saveTrackOrder(order: string[]): void {
  persistence.writes.push(order.slice());
}
