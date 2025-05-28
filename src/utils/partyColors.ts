// Utility for assigning a unique, consistent color to each party by id or name

// A color palette (expand as needed)
const PARTY_COLOR_PALETTE = [
  '#1f77b4', // blue
  '#ff7f0e', // orange
  '#2ca02c', // green
  '#d62728', // red
  '#9467bd', // purple
  '#8c564b', // brown
  '#e377c2', // pink
  '#7f7f7f', // gray
  '#bcbd22', // olive
  '#17becf', // cyan
  '#f44336', // bright red
  '#00bcd4', // teal
  '#ffc107', // amber
  '#4caf50', // deep green
  '#9c27b0', // deep purple
  '#607d8b', // blue gray
];

// Simple hash function to map a string to a palette index
function hashStringToIndex(str: string, paletteSize: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) % paletteSize;
}

// Main function: get color for a party (by id preferred, fallback to name)
export function getPartyColor(party: { id?: string; name: string }): string {
  const key = party.id || party.name;
  const idx = hashStringToIndex(key, PARTY_COLOR_PALETTE.length);
  return PARTY_COLOR_PALETTE[idx];
}

// Optionally, export the palette for legends, etc.
export { PARTY_COLOR_PALETTE };
