import { describe, it, expect } from "vitest";
import { eslestirTurSayisi, eslestirTuruUret, TURDAKI_CIFT } from "./eslestir";

describe("eslestirTuruUret", () => {
  it("her turda dort cift vardir", () => {
    for (let sira = 0; sira < eslestirTurSayisi(); sira++) {
      const tur = eslestirTuruUret(sira);
      expect(tur.sol).toHaveLength(TURDAKI_CIFT);
      expect(tur.sag).toHaveLength(TURDAKI_CIFT);
    }
  });

  it("sag taraf soldakilerin ayni kumesidir", () => {
    for (let sira = 0; sira < eslestirTurSayisi(); sira++) {
      const tur = eslestirTuruUret(sira);
      expect([...tur.sag].sort((a, b) => a - b)).toEqual([...tur.sol].sort((a, b) => a - b));
    }
  });

  it("sag taraf en az bir turda karisiktir", () => {
    const karisikTurlar = Array.from({ length: eslestirTurSayisi() }, (_, sira) =>
      eslestirTuruUret(sira),
    ).filter((tur) => tur.sag.join() !== tur.sol.join());
    expect(karisikTurlar.length).toBeGreaterThan(0);
  });

  it("turlar birden ona kadar butun sayilari kapsar", () => {
    const gorulen = new Set<number>();
    for (let sira = 0; sira < eslestirTurSayisi(); sira++) {
      for (const sayi of eslestirTuruUret(sira).sol) gorulen.add(sayi);
    }
    expect([...gorulen].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("sayilar bir ile on arasindadir", () => {
    for (let sira = 0; sira < eslestirTurSayisi(); sira++) {
      for (const sayi of eslestirTuruUret(sira).sol) {
        expect(sayi).toBeGreaterThanOrEqual(1);
        expect(sayi).toBeLessThanOrEqual(10);
      }
    }
  });

  it("sira disina cikan istek de gecerli bir tur verir", () => {
    expect(eslestirTuruUret(eslestirTurSayisi())).toEqual(eslestirTuruUret(0));
  });

  it("ayni tur her cagrida ayni gelir", () => {
    expect(eslestirTuruUret(1)).toEqual(eslestirTuruUret(1));
  });
});
