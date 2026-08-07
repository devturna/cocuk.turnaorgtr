import { describe, it, expect } from "vitest";
import { RAKAM_YOLLARI, vurusYolu, kontrolNoktalari, TUVAL_BOYU } from "./rakamYollari";

describe("RAKAM_YOLLARI", () => {
  it("sifirdan dokuza kadar butun rakamlari icerir", () => {
    expect(
      Object.keys(RAKAM_YOLLARI)
        .map(Number)
        .sort((a, b) => a - b),
    ).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("her rakamin en az bir vurusu vardir", () => {
    for (const [rakam, vuruslar] of Object.entries(RAKAM_YOLLARI)) {
      expect(vuruslar.length, `${rakam} icin vurus yok`).toBeGreaterThan(0);
    }
  });

  it("her vurusta en az iki nokta vardir", () => {
    for (const [rakam, vuruslar] of Object.entries(RAKAM_YOLLARI)) {
      vuruslar.forEach((vurus, i) => {
        expect(vurus.noktalar.length, `${rakam} vurus ${i} cok kisa`).toBeGreaterThanOrEqual(2);
      });
    }
  });

  it("butun noktalar tuvalin icindedir", () => {
    for (const [rakam, vuruslar] of Object.entries(RAKAM_YOLLARI)) {
      for (const vurus of vuruslar) {
        for (const nokta of vurus.noktalar) {
          expect(nokta.x, `${rakam} tuval disinda`).toBeGreaterThanOrEqual(0);
          expect(nokta.x, `${rakam} tuval disinda`).toBeLessThanOrEqual(TUVAL_BOYU);
          expect(nokta.y, `${rakam} tuval disinda`).toBeGreaterThanOrEqual(0);
          expect(nokta.y, `${rakam} tuval disinda`).toBeLessThanOrEqual(TUVAL_BOYU);
        }
      }
    }
  });
});

describe("vurusYolu", () => {
  it("noktalari SVG yoluna cevirir", () => {
    const vurus = { noktalar: [{ x: 10, y: 20 }, { x: 30, y: 40 }] };
    expect(vurusYolu(vurus)).toBe("M10 20 L30 40");
  });
});

describe("kontrolNoktalari", () => {
  it("ilk ve son noktayi her zaman icerir", () => {
    const vurus = { noktalar: [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 100, y: 0 }] };
    const noktalar = kontrolNoktalari(vurus, 40);
    expect(noktalar[0]).toEqual({ x: 0, y: 0 });
    expect(noktalar[noktalar.length - 1]).toEqual({ x: 100, y: 0 });
  });

  it("birbirine cok yakin noktalari eler", () => {
    // 5 birim otedeki nokta 40 birimlik aralikta atlanmali.
    const vurus = { noktalar: [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 100, y: 0 }] };
    expect(kontrolNoktalari(vurus, 40)).toEqual([{ x: 0, y: 0 }, { x: 100, y: 0 }]);
  });

  it("uzak noktalari korur", () => {
    const vurus = { noktalar: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 100, y: 0 }] };
    expect(kontrolNoktalari(vurus, 40)).toHaveLength(3);
  });
});
