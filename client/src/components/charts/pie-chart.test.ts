import { describe, expect, it } from "vitest";
import { donutSegmentPath } from "@/components/charts/pie-chart";

const base = {
  center: 100,
  outerRadius: 80,
  innerRadius: 50,
  startAngle: -90,
};

describe("donutSegmentPath", () => {
  it("dessine un anneau quand une seule part fait 360°", () => {
    const path = donutSegmentPath({ ...base, angle: 360 });
    expect(path).not.toBe("");
    expect(path.match(/A /g)?.length).toBeGreaterThanOrEqual(4);
  });

  it("reste un seul secteur pour un angle partiel", () => {
    const path = donutSegmentPath({ ...base, angle: 90 });
    expect(path.match(/A /g)?.length).toBe(2);
    expect(path.endsWith("Z")).toBe(true);
  });
});
