import { describe, it, expect } from "vitest";
import { secenekUret, turSayisi, turUret, yerlesimUret } from "./say";

describe("yerlesimUret", () => {
  it("istenen sayida nesne yerlestirir", () => {
    for (let miktar = 1; miktar <= 10; miktar++) {
      expect(yerlesimUret(miktar, 3)).toHaveLength(miktar);
    }
  });

  it("nesneler sahnenin icinde kalir", () => {
    for (const { x, y } of yerlesimUret(10, 5)) {
      expect(x).toBeGreaterThanOrEqual(8);
      expect(x).toBeLessThanOrEqual(92);
      expect(y).toBeGreaterThanOrEqual(8);
      expect(y).toBeLessThanOrEqual(92);
    }
  });

  it("nesneler ust uste binmez", () => {
    // On nesnede izgara araligi %19'a iner; merkezler dokunma hedefinden
    // (sahnenin yaklasik %12'si) daha yakin olmamali.
    for (let miktar = 1; miktar <= 10; miktar++) {
      const yerlesimler = yerlesimUret(miktar, miktar);
      for (let i = 0; i < yerlesimler.length; i++) {
        for (let j = i + 1; j < yerlesimler.length; j++) {
          const uzaklik = Math.hypot(
            yerlesimler[i].x - yerlesimler[j].x,
            yerlesimler[i].y - yerlesimler[j].y,
          );
          expect(uzaklik, `${miktar} nesne, ${i}-${j}`).toBeGreaterThan(12);
        }
      }
    }
  });

  it("ayni tohum ayni yerlesimi verir", () => {
    expect(yerlesimUret(6, 2)).toEqual(yerlesimUret(6, 2));
  });

  it("farkli tohum farkli yerlesim verir", () => {
    expect(yerlesimUret(6, 2)).not.toEqual(yerlesimUret(6, 3));
  });
});

describe("secenekUret", () => {
  it("uc secenek sunar ve dogru cevap icindedir", () => {
    for (let dogru = 1; dogru <= 10; dogru++) {
      const secenekler = secenekUret(dogru, dogru);
      expect(secenekler).toHaveLength(3);
      expect(secenekler).toContain(dogru);
      expect(new Set(secenekler).size).toBe(3);
    }
  });

  it("secenekler kucukten buyuge sirali", () => {
    const secenekler = secenekUret(7, 1);
    expect([...secenekler].sort((a, b) => a - b)).toEqual(secenekler);
  });

  it("secenekler dogru cevaba yakindir", () => {
    // Uzak secenek sayma degil tahmin olurdu.
    for (let dogru = 1; dogru <= 10; dogru++) {
      for (const secenek of secenekUret(dogru, dogru)) {
        expect(Math.abs(secenek - dogru)).toBeLessThanOrEqual(2);
      }
    }
  });

  it("secenekler bir ile on arasindadir", () => {
    for (let dogru = 1; dogru <= 10; dogru++) {
      for (const secenek of secenekUret(dogru, dogru)) {
        expect(secenek).toBeGreaterThanOrEqual(1);
        expect(secenek).toBeLessThanOrEqual(10);
      }
    }
  });
});

describe("turUret", () => {
  it("turlar birden ona dogru ilerler", () => {
    expect(turUret(0).miktar).toBe(1);
    expect(turUret(4).miktar).toBe(5);
    expect(turUret(9).miktar).toBe(10);
  });

  it("tur sayisi sayilabilir miktarlar kadardir", () => {
    expect(turSayisi()).toBe(10);
  });

  it("ust uste turlar farkli simge kullanir", () => {
    // Ayni sey on kez sayilinca cocuk sayiyi degil resmi hatirlar.
    expect(turUret(0).simge).not.toBe(turUret(1).simge);
  });

  it("nesne sayisi miktarla ayni", () => {
    for (let sira = 0; sira < turSayisi(); sira++) {
      const tur = turUret(sira);
      expect(tur.yerlesimler).toHaveLength(tur.miktar);
    }
  });
});
