import { describe, it, expect } from "vitest";
import { kursBul, tumKurslar } from "./kurslar";
import { bolumBul, bolumHaritasi, bolumSiralamasi, kursBolumleri } from "./bolumler";

describe("kurslar", () => {
  it("turna-yolu kursu yayindadir", () => {
    expect(kursBul("turna-yolu")?.durum).toBe("yayinda");
    expect(kursBul("turna-yolu")?.yas).toBe("4-7");
  });

  it("kurs kimlikleri benzersizdir", () => {
    const kimlikler = tumKurslar().map((kurs) => kurs.id);
    expect(new Set(kimlikler).size).toBe(kimlikler.length);
  });

  it("olmayan kurs undefined doner", () => {
    expect(kursBul("yok-boyle")).toBeUndefined();
  });
});

describe("bolumler", () => {
  const bolumler = kursBolumleri("turna-yolu");

  it("faz 4a bes bolum icerir", () => {
    expect(bolumler).toHaveLength(5);
  });

  it("bolum kimlikleri benzersizdir", () => {
    const kimlikler = bolumler.map((bolum) => bolum.id);
    expect(new Set(kimlikler).size).toBe(kimlikler.length);
  });

  it("siralama icerik dosyasindaki sirayi korur", () => {
    expect(bolumSiralamasi("turna-yolu")[0]).toBe("sultansazligi");
    expect(bolumSiralamasi("turna-yolu").at(-1)).toBe("efes");
  });

  it("olmayan kurs icin bos liste doner", () => {
    expect(kursBolumleri("yok-boyle")).toEqual([]);
    expect(bolumBul("yok-boyle", "efes")).toBeUndefined();
  });

  it("her bolumun haritasi cozumlenebilir", () => {
    for (const bolum of bolumler) {
      expect(() => bolumHaritasi(bolum), bolum.id).not.toThrow();
    }
  });

  it("her bolumun idealAdim degeri en az birdir", () => {
    for (const bolum of bolumler) {
      expect(bolum.idealAdim, bolum.id).toBeGreaterThanOrEqual(1);
    }
  });

  it("durak konumlari harita uzerindedir", () => {
    for (const bolum of bolumler) {
      expect(bolum.durak.x, bolum.id).toBeGreaterThanOrEqual(0);
      expect(bolum.durak.x, bolum.id).toBeLessThanOrEqual(100);
      expect(bolum.durak.y, bolum.id).toBeGreaterThanOrEqual(0);
      expect(bolum.durak.y, bolum.id).toBeLessThanOrEqual(100);
    }
  });

  it("faz 4a bolumleri mutlak yon setini kullanir", () => {
    for (const bolum of bolumler) {
      expect(bolum.komutSeti, bolum.id).toBe("yonler");
    }
  });
});
