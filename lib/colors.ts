export const WHEEL_COLORS = [
  "#b48ead", // dusty rose
  "#a3be8c", // sage
  "#d08770", // warm coral
  "#ebcb8b", // soft amber
  "#81a1c1", // slate blue
  "#88c0d0", // muted teal
  "#bf616a", // muted berry
  "#c9a5e0", // lavender
  "#8fbcbb", // eucalyptus
  "#d4956a", // terracotta
  "#a0c4a8", // mint
  "#c2869a", // mauve
];

export function sliceColor(index: number): string {
  return WHEEL_COLORS[index % WHEEL_COLORS.length];
}
