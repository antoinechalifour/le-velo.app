export function haversine(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number,
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const meanLat = (((lat1 + lat2) / 2) * Math.PI) / 180
  const x = dLng * Math.cos(meanLat)
  return Math.sqrt(x * x + dLat * dLat) * 6_371_000
}
