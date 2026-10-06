import { DECORATIONS } from "./data";
import type { DecorationPlacement, TerrainId } from "./types";

export interface FloorRect { minX: number; minY: number; maxX: number; maxY: number }

/** Tile-normalized rectangular floor, ending under the outside face of authored walls. */
export function mapFloorRects(tiles: TerrainId[], cols: number, rows: number, decorations: DecorationPlacement[]): Map<number, FloorRect> {
  const rects = new Map<number, FloorRect>();
  const width = Math.sqrt(3);
  const floor = (x: number, y: number) => x >= 0 && y >= 0 && x < cols && y < rows && tiles[y * cols + x] !== "void";
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (floor(x, y))
    rects.set(y * cols + x, { minX: x * width, maxX: (x + 1) * width, minY: y * 1.5, maxY: (y + 1) * 1.5 });
  for (const p of decorations) {
    const def = DECORATIONS[p.id];
    if (def?.model3d !== "wall" && def?.model3d !== "secretDoor") continue;
    const rect = rects.get(p.y * cols + p.x);
    if (!rect) continue;
    const half = 0.16 * (def.wallThicknessScale ?? 1);
    const cx = (p.x + 0.5) * width, cy = (p.y + 0.5) * 1.5;
    if (!floor(p.x - 1, p.y)) rect.minX = Math.max(rect.minX, cx - half);
    if (!floor(p.x + 1, p.y)) rect.maxX = Math.min(rect.maxX, cx + half);
    if (!floor(p.x, p.y - 1)) rect.minY = Math.max(rect.minY, cy - half);
    if (!floor(p.x, p.y + 1)) rect.maxY = Math.min(rect.maxY, cy + half);
  }
  return rects;
}
