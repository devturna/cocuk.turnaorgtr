import { describe, expect, it } from "vitest";
import { baslangicBulmacasi, bulmacaSonrasi } from "./durak";

describe("baslangicBulmacasi", () => {
  it("yarim kalan duraga kalindigi yerden devam eder", () => {
    expect(baslangicBulmacasi(2, 4)).toBe(2);
  });

  it("hic oynanmamis durak bastan baslar", () => {
    expect(baslangicBulmacasi(0, 4)).toBe(0);
  });

  it("bitmis durak yeniden oynanirken bastan baslar", () => {
    expect(baslangicBulmacasi(4, 4)).toBe(0);
  });

  it("icerik kisalirsa eski kayit tasmaz", () => {
    // Bir durakta dort bulmaca cozulmusken icerik ikiye indirilirse,
    // kayit "4 cozuldu" der ama dizi iki elemanlidir. Bastan baslamak
    // tanimsiz bulmaca acmaktan iyidir.
    expect(baslangicBulmacasi(4, 2)).toBe(0);
  });
});

describe("bulmacaSonrasi", () => {
  it("ortadaki bulmaca bitince sonrakine gecer", () => {
    expect(bulmacaSonrasi(0, 4, true)).toEqual({ tur: "bulmaca", sira: 1 });
    expect(bulmacaSonrasi(2, 4, false)).toEqual({ tur: "bulmaca", sira: 3 });
  });

  it("son bulmaca bitince durak biter", () => {
    expect(bulmacaSonrasi(3, 4, false)).toEqual({ tur: "bitti", yildiz: "yildiz" });
  });

  it("hepsi ideal cozulduyse altin yildiz verir", () => {
    expect(bulmacaSonrasi(3, 4, true)).toEqual({ tur: "bitti", yildiz: "altin" });
  });

  it("tek bulmacalik durak ilk bulmacada biter", () => {
    expect(bulmacaSonrasi(0, 1, true)).toEqual({ tur: "bitti", yildiz: "altin" });
  });
});
