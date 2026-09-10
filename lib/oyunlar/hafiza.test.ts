import { describe, it, expect } from "vitest";
import {
  desteUret,
  eslesiyorMu,
  turBittiMi,
  turdakiKartSayisi,
  EN_AZ_KART,
  EN_FAZLA_KART,
} from "./hafiza";

describe("turdakiKartSayisi", () => {
  it("dortten baslar, ikiser artar, on ikide durur", () => {
    expect(turdakiKartSayisi(0)).toBe(EN_AZ_KART);
    expect(turdakiKartSayisi(1)).toBe(6);
    expect(turdakiKartSayisi(4)).toBe(EN_FAZLA_KART);
    expect(turdakiKartSayisi(9)).toBe(EN_FAZLA_KART);
  });
});

describe("desteUret", () => {
  it("her simgeden tam iki kart vardir", () => {
    for (let sira = 0; sira < 6; sira++) {
      const sayimlar = new Map<string, number>();
      for (const kart of desteUret(sira)) {
        sayimlar.set(kart.simge, (sayimlar.get(kart.simge) ?? 0) + 1);
      }
      for (const [simge, adet] of sayimlar) {
        expect(adet, `${sira}. tur, ${simge}`).toBe(2);
      }
    }
  });

  it("kart sayisi turun kart sayisidir", () => {
    for (let sira = 0; sira < 6; sira++) {
      expect(desteUret(sira)).toHaveLength(turdakiKartSayisi(sira));
    }
  });

  it("kart siralari sifirdan baslayip artar", () => {
    expect(desteUret(2).map((kart) => kart.sira)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("deste en az bir turda karisiktir", () => {
    // Cift kartlar hep yan yana gelseydi oyun hafiza oyunu olmazdi.
    const karisikTurlar = [0, 1, 2, 3, 4].filter((sira) => {
      const deste = desteUret(sira);
      return deste.some((kart, i) => i % 2 === 0 && deste[i + 1]?.simge !== kart.simge);
    });
    expect(karisikTurlar.length).toBeGreaterThan(0);
  });

  it("ayni tur her cagrida ayni deste verir", () => {
    expect(desteUret(3)).toEqual(desteUret(3));
  });

  it("farkli turlar farkli simge kumesi kullanir", () => {
    const ilk = new Set(desteUret(0).map((kart) => kart.simge));
    const ikinci = new Set(desteUret(1).map((kart) => kart.simge));
    expect([...ikinci].some((simge) => !ilk.has(simge))).toBe(true);
  });
});

describe("eslesiyorMu", () => {
  const deste = desteUret(0);

  it("ayni simgeli iki kart eslesir", () => {
    const ilk = 0;
    const ikinci = deste.findIndex(
      (kart, sira) => sira !== ilk && kart.simge === deste[ilk].simge,
    );
    expect(eslesiyorMu(deste, ilk, ikinci)).toBe(true);
  });

  it("farkli simgeli kartlar eslesmez", () => {
    const farkli = deste.findIndex((kart) => kart.simge !== deste[0].simge);
    expect(eslesiyorMu(deste, 0, farkli)).toBe(false);
  });

  it("ayni karta iki kez dokunmak eslesme degildir", () => {
    expect(eslesiyorMu(deste, 1, 1)).toBe(false);
  });

  it("olmayan kart eslesme uretmez", () => {
    expect(eslesiyorMu(deste, 0, 99)).toBe(false);
  });
});

describe("turBittiMi", () => {
  it("butun kartlar bulununca biter", () => {
    const deste = desteUret(0);
    const hepsi = deste.map((kart) => kart.sira);
    expect(turBittiMi(deste, hepsi)).toBe(true);
    expect(turBittiMi(deste, hepsi.slice(0, -1))).toBe(false);
  });

  it("bos deste bitmis sayilmaz", () => {
    expect(turBittiMi([], [])).toBe(false);
  });
});
