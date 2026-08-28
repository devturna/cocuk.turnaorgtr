import { describe, it, expect } from "vitest";
import { kursBul, tumKurslar } from "./kurslar";
import {
  bolumBul,
  bolumSiralamasi,
  bulmacaBul,
  bulmacaHaritasi,
  bulmacaSayisi,
  kursBolumleri,
} from "./bolumler";

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

  it("faz 4a ve 4b birlikte alti bolum icerir", () => {
    expect(bolumler).toHaveLength(6);
  });

  it("bolum kimlikleri benzersizdir", () => {
    const kimlikler = bolumler.map((bolum) => bolum.id);
    expect(new Set(kimlikler).size).toBe(kimlikler.length);
  });

  it("siralama icerik dosyasindaki sirayi korur", () => {
    expect(bolumSiralamasi("turna-yolu")[0]).toBe("goksu-deltasi");
    expect(bolumSiralamasi("turna-yolu").at(-1)).toBe("efes");
  });

  it("olmayan kurs icin bos liste doner", () => {
    expect(kursBolumleri("yok-boyle")).toEqual([]);
    expect(bolumBul("yok-boyle", "efes")).toBeUndefined();
  });

  it("her bolumun her bulmacasinin haritasi cozumlenebilir", () => {
    for (const bolum of bolumler) {
      for (const [sira, bulmaca] of bolum.bulmacalar.entries()) {
        expect(() => bulmacaHaritasi(bulmaca), `${bolum.id} bulmaca ${sira}`).not.toThrow();
      }
    }
  });

  // Testin adi "her bolumun" diyor: dizinin YALNIZCA ilk bulmacasina bakmak
  // bu sozu tutmuyordu (on bulmacanin altisi) ve bu daldaki her yeni bulmaca
  // denetimsiz giriyordu.
  it("her bolumun her bulmacasinin idealAdim degeri en az birdir", () => {
    for (const bolum of bolumler) {
      for (const [sira, bulmaca] of bolum.bulmacalar.entries()) {
        expect(bulmaca.idealAdim, `${bolum.id} bulmaca ${sira}`).toBeGreaterThanOrEqual(1);
      }
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

  it("bugunku butun bulmacalar mutlak yon setini kullanir", () => {
    for (const bolum of bolumler) {
      for (const [sira, bulmaca] of bolum.bulmacalar.entries()) {
        expect(bulmaca.komutSeti, `${bolum.id} bulmaca ${sira}`).toBe("yonler");
      }
    }
  });
});

describe("bulmaca dizisi", () => {
  it("her bolumun en az bir bulmacasi vardir", () => {
    for (const bolum of kursBolumleri("turna-yolu")) {
      expect(bulmacaSayisi(bolum), `${bolum.id} bulmacasiz`).toBeGreaterThan(0);
    }
  });

  it("bulmaca sirasi disina cikilinca undefined doner", () => {
    const bolum = kursBolumleri("turna-yolu")[0];
    expect(bulmacaBul(bolum, 0)).toBeDefined();
    expect(bulmacaBul(bolum, bulmacaSayisi(bolum))).toBeUndefined();
    expect(bulmacaBul(bolum, -1)).toBeUndefined();
  });

  it("bulmacanin haritasi cozulebilir bir baslangic ve hedef tasir", () => {
    const bolum = kursBolumleri("turna-yolu")[0];
    const harita = bulmacaHaritasi(bulmacaBul(bolum, 0)!);
    expect(harita.baslangic).toBeDefined();
    expect(harita.hedef).toBeDefined();
  });
});
