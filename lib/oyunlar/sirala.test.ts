import { describe, it, expect } from "vitest";
import {
  secimGecerliMi,
  siraDogruMu,
  siralaTurSayisi,
  siralaTuruUret,
  TURDAKI_NESNE,
} from "./sirala";

describe("siralaTuruUret", () => {
  it("her turda uc oge vardir", () => {
    for (let sira = 0; sira < siralaTurSayisi(); sira++) {
      expect(siralaTuruUret(sira)).toHaveLength(TURDAKI_NESNE);
    }
  });

  it("uc boy da tam bir kez gecer", () => {
    for (let sira = 0; sira < siralaTurSayisi(); sira++) {
      const boylar = siralaTuruUret(sira).map((oge) => oge.boy);
      expect([...boylar].sort()).toEqual([1, 2, 3]);
    }
  });

  it("bir turdaki butun ogeler ayni simgeyi tasir", () => {
    // Farkli nesneler olsaydi cocuk "gercekte hangisi buyuk" diye baska
    // bir soruya duserdi.
    for (let sira = 0; sira < siralaTurSayisi(); sira++) {
      const simgeler = new Set(siralaTuruUret(sira).map((oge) => oge.simge));
      expect(simgeler.size).toBe(1);
    }
  });

  it("ogeler en az bir turda karisik durur", () => {
    const karisikTurlar = Array.from({ length: siralaTurSayisi() }, (_, sira) =>
      siralaTuruUret(sira).map((oge) => oge.boy),
    ).filter((boylar) => boylar.join() !== "1,2,3");
    expect(karisikTurlar.length).toBeGreaterThan(0);
  });

  it("tur listesi basa sarar ve ayni tur ayni gelir", () => {
    expect(siralaTuruUret(siralaTurSayisi())).toEqual(siralaTuruUret(0));
    expect(siralaTuruUret(4)).toEqual(siralaTuruUret(4));
  });
});

describe("secimGecerliMi", () => {
  it("sirasi gelen boy kabul edilir", () => {
    expect(secimGecerliMi([], 1)).toBe(true);
    expect(secimGecerliMi([1], 2)).toBe(true);
    expect(secimGecerliMi([1, 2], 3)).toBe(true);
  });

  it("sirasi gelmeyen boy reddedilir", () => {
    expect(secimGecerliMi([], 2)).toBe(false);
    expect(secimGecerliMi([1], 3)).toBe(false);
    expect(secimGecerliMi([1, 2], 2)).toBe(false);
  });
});

describe("siraDogruMu", () => {
  it("eksiksiz ve dogru sira icin dogru", () => {
    expect(siraDogruMu([1, 2, 3])).toBe(true);
  });

  it("eksik veya yanlis sira icin yanlis", () => {
    expect(siraDogruMu([1, 2])).toBe(false);
    expect(siraDogruMu([2, 1, 3])).toBe(false);
    expect(siraDogruMu([])).toBe(false);
  });
});
