import { describe, it, expect } from "vitest";
import { HARFLER, harfBul } from "./harfler";
import { HARF_YOLLARI } from "./harfYollari";
import { TUVAL_BOYU } from "./rakamYollari";

describe("HARFLER", () => {
  it("Turk alfabesindeki yirmi dokuz harfi tasir", () => {
    expect(HARFLER).toHaveLength(29);
  });

  it("Q, W ve X yoktur", () => {
    const buyukler = HARFLER.map((harf) => harf.buyuk);
    for (const yabanci of ["Q", "W", "X"]) expect(buyukler).not.toContain(yabanci);
  });

  it("Turkceye ozgu harfler vardir", () => {
    const buyukler = HARFLER.map((harf) => harf.buyuk);
    for (const harf of ["Ç", "Ğ", "I", "İ", "Ö", "Ş", "Ü"]) {
      expect(buyukler).toContain(harf);
    }
  });

  it("her harfin buyugu kucugunun buyuk hali degildir -- I ve i ayri harftir", () => {
    // Turkce'de "I".toLowerCase() JavaScript'te "i" verir, oysa dogru
    // karsilik "ı"dir. Liste bu yuzden elle yazilir.
    expect(harfBul("I")?.kucuk).toBe("ı");
    expect(harfBul("İ")?.kucuk).toBe("i");
  });

  it("ornek kelime harfle baslar (Ğ haric)", () => {
    for (const harf of HARFLER) {
      if (harf.basindaGecmez) {
        expect(harf.ornekKelime.toLocaleUpperCase("tr")).toContain(harf.buyuk);
        continue;
      }
      expect(harf.ornekKelime.slice(0, 1)).toBe(harf.buyuk);
    }
  });

  it("her harfin bir simgesi vardir", () => {
    for (const harf of HARFLER) expect(harf.simge.length).toBeGreaterThan(0);
  });
});

describe("HARF_YOLLARI", () => {
  it("her harfin cizim yolu vardir", () => {
    for (const harf of HARFLER) {
      expect(HARF_YOLLARI[harf.buyuk], harf.buyuk).toBeDefined();
    }
  });

  it("fazladan yol yoktur", () => {
    const buyukler = new Set(HARFLER.map((harf) => harf.buyuk));
    for (const anahtar of Object.keys(HARF_YOLLARI)) {
      expect(buyukler.has(anahtar), anahtar).toBe(true);
    }
  });

  it("butun noktalar tuvalin icindedir", () => {
    for (const [harf, vuruslar] of Object.entries(HARF_YOLLARI)) {
      for (const vurus of vuruslar) {
        for (const nokta of vurus.noktalar) {
          expect(nokta.x, `${harf} x`).toBeGreaterThanOrEqual(0);
          expect(nokta.x, `${harf} x`).toBeLessThanOrEqual(TUVAL_BOYU);
          expect(nokta.y, `${harf} y`).toBeGreaterThanOrEqual(0);
          expect(nokta.y, `${harf} y`).toBeLessThanOrEqual(TUVAL_BOYU);
        }
      }
    }
  });

  it("her vurus en az iki nokta tasir", () => {
    for (const [harf, vuruslar] of Object.entries(HARF_YOLLARI)) {
      for (const [sira, vurus] of vuruslar.entries()) {
        expect(vurus.noktalar.length, `${harf} vurus ${sira}`).toBeGreaterThanOrEqual(2);
      }
    }
  });
});
