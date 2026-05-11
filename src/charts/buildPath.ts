export type XY = { x: number; y: number }

export type ChartViewport = {
  width: number
  height: number
  padLeft: number
  padRight: number
  padTop: number
  padBottom: number
}

export type ChartScales = {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  xOf: (x: number) => number
  yOf: (y: number) => number
}

export function buildScales(points: XY[], viewport: ChartViewport): ChartScales {
  const plotW = viewport.width - viewport.padLeft - viewport.padRight
  const plotH = viewport.height - viewport.padTop - viewport.padBottom

  let xMin = Infinity
  let xMax = -Infinity
  let yMin = Infinity
  let yMax = -Infinity
  for (const p of points) {
    if (p.x < xMin) xMin = p.x
    if (p.x > xMax) xMax = p.x
    if (p.y < yMin) yMin = p.y
    if (p.y > yMax) yMax = p.y
  }
  if (yMax - yMin < 10) yMax = yMin + 10
  const xSpan = xMax - xMin || 1

  const xOf = (x: number) =>
    viewport.padLeft + ((x - xMin) / xSpan) * plotW
  const yOf = (y: number) =>
    viewport.padTop + plotH - ((y - yMin) / (yMax - yMin)) * plotH

  return { xMin, xMax, yMin, yMax, xOf, yOf }
}

export type ChartPaths = {
  linePath: string
  areaPath: string
}

export function buildPaths(
  points: XY[],
  viewport: ChartViewport,
  scales: ChartScales,
): ChartPaths {
  if (points.length < 2) return { linePath: '', areaPath: '' }
  const plotBottom =
    viewport.padTop + (viewport.height - viewport.padTop - viewport.padBottom)

  let line = ''
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    line += i === 0 ? 'M' : 'L'
    line += `${scales.xOf(p.x).toFixed(1)} ${scales.yOf(p.y).toFixed(1)} `
  }
  const first = points[0]
  const last = points[points.length - 1]
  const area =
    line +
    `L${scales.xOf(last.x).toFixed(1)} ${plotBottom.toFixed(1)} ` +
    `L${scales.xOf(first.x).toFixed(1)} ${plotBottom.toFixed(1)} Z`

  return { linePath: line.trim(), areaPath: area }
}
