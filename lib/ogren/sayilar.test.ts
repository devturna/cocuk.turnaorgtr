import { describe, it, expect } from "vitest";
import { SAYILAR, yazilabilirRakamlar, sayilabilirMiktarlar } from "./sayilar";

describe("SAYILAR", () => {
  it("sifirdan ona kadar on bir sayi icerir", () => {
    expect(SAYILAR.map((s) => s.rakam)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("her sayinin Turkce adi vardir", () => {
    for (const sayi of SAYILAR) {
      expect(sayi.ad.length, `${sayi.rakam} icin ad bos`).toBeGreaterThan(0);
    }
  });

  it("adlar dogrudur", () => {
    expect(SAYILAR[0].ad).toBe("Sıfır");
    expect(SAYILAR[3].ad).toBe("Üç");
    expect(SAYILAR[10].ad).toBe("On");
  });
});

describe("yazilabilirRakamlar", () => {
  it("sifirdan dokuza kadar doner", () => {
    // Yaz oyunu tek haneli rakamlari ogretir; on iki isarettir.
    expect(yazilabilirRakamlar().map((s) => s.rakam)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

describe("sayilabilirMiktarlar", () => {
  it("birden ona kadar doner", () => {
    // Sifir nesne sayilamaz, on sayilabilir.
    expect(sayilabilirMiktarlar().map((s) => s.rakam)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});
