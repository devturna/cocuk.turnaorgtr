import { describe, it, expect } from "vitest";
import { duraklariYay, type Nokta } from "./haritaYerlesimi";

/** Yerlesim, gercek konumlari saklamali: cizim kayar, cografya kalir. */
describe("duraklariYay", () => {
  it("uzak duraklari oldugu yerde birakir", () => {
    const noktalar: Nokta[] = [
      { x: 10, y: 20 },
      { x: 90, y: 80 },
    ];
    const yerlesim = duraklariYay(noktalar);
    expect(yerlesim[0].cizim).toEqual(noktalar[0]);
    expect(yerlesim[1].cizim).toEqual(noktalar[1]);
    expect(yerlesim.every((y) => !y.kaydi)).toBe(true);
  });

  it("ust uste binen duraklari ayirir", () => {
    const yerlesim = duraklariYay([
      { x: 50, y: 61 },
      { x: 48, y: 56 },
    ]);
    const dx = yerlesim[0].cizim.x - yerlesim[1].cizim.x;
    const dy = (yerlesim[0].cizim.y - yerlesim[1].cizim.y) * (422 / 1000);
    expect(Math.hypot(dx, dy)).toBeGreaterThanOrEqual(11.1);
  });

  it("tam ayni noktadaki iki duragi da ayirir", () => {
    const yerlesim = duraklariYay([
      { x: 40, y: 40 },
      { x: 40, y: 40 },
    ]);
    expect(yerlesim[0].cizim).not.toEqual(yerlesim[1].cizim);
    expect(yerlesim.every((y) => y.kaydi)).toBe(true);
  });

  it("gercek konumu her zaman saklar", () => {
    const noktalar: Nokta[] = [
      { x: 50, y: 61 },
      { x: 48, y: 56 },
      { x: 45, y: 47 },
    ];
    expect(duraklariYay(noktalar).map((y) => y.gercek)).toEqual(noktalar);
  });

  it("isareti haritanin disina tasirmaz", () => {
    const yerlesim = duraklariYay([
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 2 },
    ]);
    for (const { cizim } of yerlesim) {
      expect(cizim.x).toBeGreaterThanOrEqual(0);
      expect(cizim.x).toBeLessThanOrEqual(100);
      expect(cizim.y).toBeGreaterThanOrEqual(0);
      expect(cizim.y).toBeLessThanOrEqual(100);
    }
  });

  it("ayni girdi icin ayni sonucu verir", () => {
    const noktalar: Nokta[] = [
      { x: 50, y: 61 },
      { x: 48, y: 56 },
      { x: 45, y: 47 },
      { x: 43, y: 92 },
    ];
    expect(duraklariYay(noktalar)).toEqual(duraklariYay(noktalar));
  });
});

describe("kayma siniri", () => {
  it("isaret gercek noktasindan cok uzaklasmaz", () => {
    // Ayni noktaya yigilmis alti durak: itme onlari ayirmaya calisir ama
    // hicbiri gercek konumundan kopmaz.
    const yigin: Nokta[] = Array.from({ length: 6 }, () => ({ x: 50, y: 50 }));
    for (const { cizim, gercek } of duraklariYay(yigin)) {
      const dx = cizim.x - gercek.x;
      const dy = (cizim.y - gercek.y) * (422 / 1000);
      expect(Math.hypot(dx, dy)).toBeLessThanOrEqual(5.01);
    }
  });

  it("cakisma yokken hicbir sey kaymaz", () => {
    const noktalar: Nokta[] = [
      { x: 20, y: 20 },
      { x: 60, y: 20 },
      { x: 20, y: 90 },
    ];
    expect(duraklariYay(noktalar, 3).map((y) => y.cizim)).toEqual(noktalar);
  });
});
