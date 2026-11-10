export function vesselSize(weight) {
  // The side length follows sqrt(weight), so the visible area follows weight.
  // A slightly larger base size gives the proportional marbles more breathing room.
  return 62 * Math.sqrt(weight);
}

export function marbleLayout(weight, base) {
  const vessel = vesselSize(weight);
  const columns = Math.ceil(Math.sqrt(base - 1));
  // Every term is derived from the vessel size. There are deliberately no
  // min/max caps: marble and vessel therefore always grow by the same factor.
  const gap = vessel * 0.025;
  const availableWidth = vessel * 0.7;
  const fittedSize = (availableWidth - gap * (columns - 1)) / columns;

  return {
    vessel: Math.round(vessel * 10) / 10,
    columns,
    gap: Math.round(gap * 10) / 10,
    marble: Math.round(fittedSize * 10) / 10,
  };
}
