import { describe, it, expect } from "vitest";
import { bulHarfTurSayisi, bulHarfTuruUret, bulTurSayisi, bulTuruUret } from "./bul";

describe("bulTuruUret", () => {
  it("hedefler birden ona dogru ilerler", () => {
    expect(bulTuruUret(0).hedef).toBe(1);
    expect(bulTuruUret(9).hedef).toBe(10);
    expect(bulTurSayisi()).toBe(10);
  });

  it("uc secenek sunar ve dogru miktar icindedir", () => {
    for (let sira = 0; sira < bulTurSayisi(); sira++) {
      const tur = bulTuruUret(sira);
      expect(tur.secenekler).toHaveLength(3);
      expect(tur.secenekler.map((secenek) => secenek.miktar)).toContain(tur.hedef);
    }
  });

  it("secenek miktarlari benzersizdir", () => {
    for (let sira = 0; sira < bulTurSayisi(); sira++) {
      const miktarlar = bulTuruUret(sira).secenekler.map((secenek) => secenek.miktar);
      expect(new Set(miktarlar).size).toBe(miktarlar.length);
    }
  });

  it("secenekler hedefe yakindir", () => {
    for (let sira = 0; sira < bulTurSayisi(); sira++) {
      const tur = bulTuruUret(sira);
      for (const secenek of tur.secenekler) {
        expect(Math.abs(secenek.miktar - tur.hedef)).toBeLessThanOrEqual(2);
        expect(secenek.miktar).toBeGreaterThanOrEqual(1);
        expect(secenek.miktar).toBeLessThanOrEqual(10);
      }
    }
  });

  it("dogru secenek her zaman ayni yerde durmaz", () => {
    // Konumu ogrenmek sayiyi ogrenmek degildir.
    const yerler = new Set<number>();
    for (let sira = 0; sira < bulTurSayisi(); sira++) {
      const tur = bulTuruUret(sira);
      yerler.add(tur.secenekler.findIndex((secenek) => secenek.miktar === tur.hedef));
    }
    expect(yerler.size).toBeGreaterThan(1);
  });

  it("ayni tur her cagrida ayni gelir", () => {
    expect(bulTuruUret(4)).toEqual(bulTuruUret(4));
  });
});

describe("secenek siralamasi", () => {
  it("dogru secenek turlara dengeli dagilir", () => {
    // Tutarsiz bir sort karsilastiricisi ("rastgele() - 0.5") kullanildiginda
    // dogru cevap son bes turun HEPSINDE basa dusuyordu. Olcu bu: hicbir
    // konum turlarin yarisindan fazlasini almamali.
    const sayimlar = [0, 0, 0];
    for (let sira = 0; sira < bulTurSayisi(); sira++) {
      const tur = bulTuruUret(sira);
      sayimlar[tur.secenekler.findIndex((secenek) => secenek.miktar === tur.hedef)]++;
    }
    for (const sayim of sayimlar) {
      expect(sayim).toBeLessThanOrEqual(Math.ceil(bulTurSayisi() / 2));
    }
  });
});

describe("bulHarfTuruUret", () => {
  it("uc secenek sunar ve dogru kelime icindedir", () => {
    for (let sira = 0; sira < bulHarfTurSayisi(); sira++) {
      const tur = bulHarfTuruUret(sira);
      expect(tur.secenekler).toHaveLength(3);
      expect(tur.secenekler.map((secenek) => secenek.harf)).toContain(tur.hedef);
    }
  });

  it("secenekler benzersizdir", () => {
    for (let sira = 0; sira < bulHarfTurSayisi(); sira++) {
      const harfler = bulHarfTuruUret(sira).secenekler.map((secenek) => secenek.harf);
      expect(new Set(harfler).size).toBe(3);
    }
  });

  it("Ğ hedef olmaz", () => {
    // Hicbir Turkce kelime Ğ ile baslamaz.
    for (let sira = 0; sira < bulHarfTurSayisi(); sira++) {
      expect(bulHarfTuruUret(sira).hedef).not.toBe("Ğ");
    }
    expect(bulHarfTurSayisi()).toBe(28);
  });

  it("her harf bir kez hedef olur", () => {
    const hedefler = Array.from({ length: bulHarfTurSayisi() }, (_, sira) =>
      bulHarfTuruUret(sira).hedef,
    );
    expect(new Set(hedefler).size).toBe(bulHarfTurSayisi());
  });

  it("dogru secenek her zaman ayni yerde durmaz", () => {
    const yerler = new Set<number>();
    for (let sira = 0; sira < bulHarfTurSayisi(); sira++) {
      const tur = bulHarfTuruUret(sira);
      yerler.add(tur.secenekler.findIndex((secenek) => secenek.harf === tur.hedef));
    }
    expect(yerler.size).toBeGreaterThan(1);
  });

  it("ayni tur her cagrida ayni gelir", () => {
    expect(bulHarfTuruUret(6)).toEqual(bulHarfTuruUret(6));
  });
});
