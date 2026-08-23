/** Wheel slice palette — cycles when there are more podcasts than colors. */
export const WHEEL_COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#ec4899",
  "#06b6d4",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#a855f7",
  "#0ea5e9",
  "#f97316",
  "#14b8a6",
  "#e11d48",
];

export function sliceColor(index: number): string {
  return WHEEL_COLORS[index % WHEEL_COLORS.length];
}
