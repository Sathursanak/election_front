// Utility for assigning a unique, consistent color to each party by id or name

// A color palette (expand as needed)
const PARTY_COLOR_PALETTE = [
"#0A3A6B", // Darker blue
    "#165A9A", // Darker sky blue
    "#1F6B5B", // Darker teal
    "#534A75", // Darker purple
    "#B58E50", // Darker gold
    "#6D3D1F", // Darker brown
    "#2F5A04", // Darker green
    "#753A39", // Darker red
    "#333333", // Darker gray
    "#5F5F5F", // Darker medium gray,
"#0D4E8B", // Official EC blue (primary)
    "#1E6FBA", // Deep sky blue
    "#2C8C76", // Muted teal (for environmental parties)
    "#6B5B95", // Soft purple
    "#D4A76A", // Warm gold (accent)
    "#8B572A", // Neutral brown
    "#417505", // Olive green
    "#955251", // Dusty red
    "#4A4A4A", // Dark gray (independent/other)
    "#7F7F7F", // Medium gray (minor parties)
];

// Keep track of assigned colors
const assignedColors = new Map<string, string>();

// Main function: get color for a party (by id preferred, fallback to name)
export function getPartyColor(party: { id?: string; name: string }): string {
  const key = party.id || party.name;

  // If this party already has a color assigned, return it
  if (assignedColors.has(key)) {
    return assignedColors.get(key)!;
  }

  // Find the first unused color
  const usedColors = new Set(assignedColors.values());
  const availableColor = PARTY_COLOR_PALETTE.find(color => !usedColors.has(color));

  if (!availableColor) {
    // If we run out of colors, cycle through the palette
    const colorIndex = assignedColors.size % PARTY_COLOR_PALETTE.length;
    const color = PARTY_COLOR_PALETTE[colorIndex];
    assignedColors.set(key, color);
    return color;
  }

  // Assign the first available color to this party
  assignedColors.set(key, availableColor);
  return availableColor;
}

// Reset assigned colors (useful for testing or when parties change)
export function resetPartyColors(): void {
  assignedColors.clear();
}

// Optionally, export the palette for legends, etc.
export { PARTY_COLOR_PALETTE };
