import { describe, it, expect } from "vitest";
import {
  yeniIzleme,
  parmakGecti,
  vurusBittiMi,
  hepsiBittiMi,
  tamamlanmaOrani,
} from "./izleme";

// Iki vuruslu bir sekil: her vurusta iki kontrol noktasi.
const KONTROLLER = [
  [{ x: 0, y: 0 }, { x: 100, y: 0 }],
  [{ x: 0, y: 100 }, { x: 100, y: 100 }],
];

describe("yeniIzleme", () => {
  it("hicbir nokta tamamlanmamis olarak baslar", () => {
    const durum = yeniIzleme(KONTROLLER);
    expect(durum.tamamlanan).toEqual([[false, false], [false, false]]);
    expect(durum.aktifVurus).toBe(0);
  });
});

describe("parmakGecti", () => {
  it("yakindan gecilen noktayi tamamlar", () => {
    let durum = yeniIzleme(KONTROLLER);
    durum = parmakGecti(durum, KONTROLLER, { x: 5, y: 5 }, 30);
    expect(durum.tamamlanan[0][0]).toBe(true);
  });

  it("uzaktan gecilen noktayi tamamlamaz", () => {
    let durum = yeniIzleme(KONTROLLER);
    durum = parmakGecti(durum, KONTROLLER, { x: 60, y: 60 }, 30);
    expect(durum.tamamlanan[0]).toEqual([false, false]);
  });

  it("yalnizca aktif vurusun noktalarini tamamlar", () => {
    // Ikinci vurusun noktasindan gecilse bile sira ilk vurustadir.
    let durum = yeniIzleme(KONTROLLER);
    durum = parmakGecti(durum, KONTROLLER, { x: 0, y: 100 }, 30);
    expect(durum.tamamlanan[1]).toEqual([false, false]);
  });

  it("vurus bitince siradaki vurusa gecer", () => {
    let durum = yeniIzleme(KONTROLLER);
    durum = parmakGecti(durum, KONTROLLER, { x: 0, y: 0 }, 30);
    durum = parmakGecti(durum, KONTROLLER, { x: 100, y: 0 }, 30);
    expect(durum.aktifVurus).toBe(1);
  });

  it("onceki durumu degistirmez", () => {
    const once = yeniIzleme(KONTROLLER);
    parmakGecti(once, KONTROLLER, { x: 0, y: 0 }, 30);
    expect(once.tamamlanan[0][0]).toBe(false);
  });
});

describe("vurusBittiMi", () => {
  it("butun noktalar tamamlaninca dogrudur", () => {
    let durum = yeniIzleme(KONTROLLER);
    expect(vurusBittiMi(durum, 0)).toBe(false);
    durum = parmakGecti(durum, KONTROLLER, { x: 0, y: 0 }, 30);
    durum = parmakGecti(durum, KONTROLLER, { x: 100, y: 0 }, 30);
    expect(vurusBittiMi(durum, 0)).toBe(true);
  });
});

describe("hepsiBittiMi", () => {
  it("butun vuruslar bitince dogrudur", () => {
    let durum = yeniIzleme(KONTROLLER);
    for (const nokta of [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 0, y: 100 },
      { x: 100, y: 100 },
    ]) {
      durum = parmakGecti(durum, KONTROLLER, nokta, 30);
    }
    expect(hepsiBittiMi(durum)).toBe(true);
  });

  it("yarim kalmissa yanlistir", () => {
    let durum = yeniIzleme(KONTROLLER);
    durum = parmakGecti(durum, KONTROLLER, { x: 0, y: 0 }, 30);
    expect(hepsiBittiMi(durum)).toBe(false);
  });
});

describe("tamamlanmaOrani", () => {
  it("bastayken sifirdir", () => {
    expect(tamamlanmaOrani(yeniIzleme(KONTROLLER))).toBe(0);
  });

  it("yarisinda 0.5 olur", () => {
    let durum = yeniIzleme(KONTROLLER);
    durum = parmakGecti(durum, KONTROLLER, { x: 0, y: 0 }, 30);
    durum = parmakGecti(durum, KONTROLLER, { x: 100, y: 0 }, 30);
    expect(tamamlanmaOrani(durum)).toBe(0.5);
  });
});
