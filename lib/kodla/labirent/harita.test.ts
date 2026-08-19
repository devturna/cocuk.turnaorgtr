import { describe, it, expect } from "vitest";
import { haritayiCoz, engelMi, haritaDisiMi, kareAnahtari, kareEsit } from "./harita";

const SATIRLAR = [
  "..o..",
  ".T#..",
  "....H",
];

describe("haritayiCoz", () => {
  it("olculeri okur", () => {
    const harita = haritayiCoz(SATIRLAR, "sag");
    expect(harita.genislik).toBe(5);
    expect(harita.yukseklik).toBe(3);
  });

  it("baslangic, hedef, engel ve basaklari yerlestirir", () => {
    const harita = haritayiCoz(SATIRLAR, "sag");
    expect(harita.baslangic).toEqual({ x: 1, y: 1 });
    expect(harita.hedef).toEqual({ x: 4, y: 2 });
    expect(harita.engeller).toEqual([{ x: 2, y: 1 }]);
    expect(harita.basaklar).toEqual([{ x: 2, y: 0 }]);
  });

  it("baslangic bakisini saklar", () => {
    expect(haritayiCoz(SATIRLAR, "yukari").bakis).toBe("yukari");
  });

  it("satirlar esit uzunlukta degilse hata verir", () => {
    expect(() => haritayiCoz([".T.", "..H."], "sag")).toThrow(/esit uzunlukta/);
  });

  it("baslangic yoksa hata verir", () => {
    expect(() => haritayiCoz(["...", "..H"], "sag")).toThrow(/tam bir "T"/);
  });

  it("birden fazla hedef varsa hata verir", () => {
    expect(() => haritayiCoz([".T.", "H.H"], "sag")).toThrow(/tam bir "H"/);
  });

  it("bilinmeyen isaret hata verir", () => {
    expect(() => haritayiCoz([".T.", "..H", "..X"], "sag")).toThrow(/bilinmeyen isaret "X"/);
  });

  it("bos harita hata verir", () => {
    expect(() => haritayiCoz([], "sag")).toThrow(/en az bir satir/);
  });
});

describe("kare yardimcilari", () => {
  const harita = haritayiCoz(SATIRLAR, "sag");

  it("engeli tanir", () => {
    expect(engelMi(harita, { x: 2, y: 1 })).toBe(true);
    expect(engelMi(harita, { x: 0, y: 0 })).toBe(false);
  });

  it("harita disini tanir", () => {
    expect(haritaDisiMi(harita, { x: -1, y: 0 })).toBe(true);
    expect(haritaDisiMi(harita, { x: 5, y: 0 })).toBe(true);
    expect(haritaDisiMi(harita, { x: 0, y: 3 })).toBe(true);
    expect(haritaDisiMi(harita, { x: 4, y: 2 })).toBe(false);
  });

  it("kareyi metne cevirir ve karsilastirir", () => {
    expect(kareAnahtari({ x: 2, y: 3 })).toBe("2,3");
    expect(kareEsit({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(true);
    expect(kareEsit({ x: 1, y: 1 }, { x: 1, y: 2 })).toBe(false);
  });
});
