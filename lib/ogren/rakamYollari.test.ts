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

// Rakamlarin SEKLI dogru mu?
//
// Yollar nokta listesi oldugu icin sekil bozukluklari sessizce gecebiliyor:
// bir yayin ters yone supurulmesi ekranda "2"yi cukur, "5"i sola bakan bir
// kase yapiyor ama hicbir test bunu gormuyordu. Asagidaki olcumler o
// bozukluklarin her birini yakalar.
describe("rakam sekilleri", () => {
  const noktalar = (rakam: number, vurus = 0) => RAKAM_YOLLARI[rakam][vurus].noktalar;
  const enUst = (n: { y: number }[]) => Math.min(...n.map((p) => p.y));
  const enSag = (n: { x: number }[]) => Math.max(...n.map((p) => p.x));

  it("ikinin ust yayi tepe yapar, cukur degil", () => {
    const n = noktalar(2);
    // Yay soldan baslar; tepesi baslangic noktasinin belirgin sekilde ustunde olmali.
    expect(enUst(n)).toBeLessThan(n[0].y - 40);
  });

  it("ucun ust kasesi saga sisip tepe yapar", () => {
    const n = noktalar(3);
    expect(enUst(n)).toBeLessThan(n[0].y - 40);
    expect(enSag(n)).toBeGreaterThan(240);
  });

  it("besin alt kasesi saga sisar", () => {
    const n = noktalar(5, 1);
    expect(enSag(n)).toBeGreaterThan(240);
  });

  it("sekizde halkalari birlestiren duz cizgi yoktur", () => {
    const n = noktalar(8);
    let enBuyukAtlama = 0;
    for (let i = 1; i < n.length; i++) {
      enBuyukAtlama = Math.max(
        enBuyukAtlama,
        Math.hypot(n[i].x - n[i - 1].x, n[i].y - n[i - 1].y),
      );
    }
    // Iki halka da yogun noktalarla cizilir; buyuk bir atlama, halkalari
    // birlestiren istenmeyen bir cizgi demektir.
    expect(enBuyukAtlama).toBeLessThan(40);
  });
});
