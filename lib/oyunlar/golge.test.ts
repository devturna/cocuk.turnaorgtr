import { describe, it, expect } from "vitest";
import { golgeTurSayisi, golgeTuruUret, GOLGE_SAYISI } from "./golge";

describe("golgeTuruUret", () => {
  it("her turda dort golge gosterir", () => {
    for (let sira = 0; sira < golgeTurSayisi(); sira++) {
      expect(golgeTuruUret(sira).golgeler).toHaveLength(GOLGE_SAYISI);
    }
  });

  it("golgelerden tam biri hedefin golgesidir", () => {
    for (let sira = 0; sira < golgeTurSayisi(); sira++) {
      const tur = golgeTuruUret(sira);
      const dogrular = tur.golgeler.filter((golge) => golge === tur.hedef);
      expect(dogrular).toHaveLength(1);
    }
  });

  it("golgeler benzersizdir", () => {
    for (let sira = 0; sira < golgeTurSayisi(); sira++) {
      const golgeler = golgeTuruUret(sira).golgeler;
      expect(new Set(golgeler).size).toBe(golgeler.length);
    }
  });

  it("her tur farkli bir hedef kullanir", () => {
    const hedefler = Array.from({ length: golgeTurSayisi() }, (_, sira) =>
      golgeTuruUret(sira).hedef,
    );
    expect(new Set(hedefler).size).toBe(golgeTurSayisi());
  });

  it("dogru golge her zaman ayni yerde durmaz", () => {
    const yerler = new Set<number>();
    for (let sira = 0; sira < golgeTurSayisi(); sira++) {
      const tur = golgeTuruUret(sira);
      yerler.add(tur.golgeler.indexOf(tur.hedef));
    }
    expect(yerler.size).toBeGreaterThan(1);
  });

  it("tur listesi basa sarar", () => {
    expect(golgeTuruUret(golgeTurSayisi())).toEqual(golgeTuruUret(0));
  });

  it("ayni tur her cagrida ayni gelir", () => {
    expect(golgeTuruUret(5)).toEqual(golgeTuruUret(5));
  });
});
