import { describe, it, expect, beforeEach } from "vitest";
import {
  ogeAnahtari,
  yildizEkle,
  yildizVarMi,
  oyunYildizSayisi,
  tumYildizlar,
  yildizlariSil,
} from "./yildiz";

beforeEach(() => {
  localStorage.clear();
});

describe("ogeAnahtari", () => {
  it("tur ve degeri birlestirir", () => {
    expect(ogeAnahtari("sayi", "3")).toBe("sayi:3");
    expect(ogeAnahtari("harf", "A")).toBe("harf:A");
  });
});

describe("yildizEkle ve yildizVarMi", () => {
  it("eklenen yildizi bulur", () => {
    yildizEkle("sayi:3", "yaz");
    expect(yildizVarMi("sayi:3", "yaz")).toBe(true);
  });

  it("eklenmemis yildiz icin yanlis doner", () => {
    expect(yildizVarMi("sayi:3", "yaz")).toBe(false);
  });

  it("oyunlari birbirinden ayri tutar", () => {
    yildizEkle("sayi:3", "yaz");
    expect(yildizVarMi("sayi:3", "bul")).toBe(false);
  });

  it("ayni yildizi iki kez eklemez", () => {
    yildizEkle("sayi:3", "yaz");
    yildizEkle("sayi:3", "yaz");
    expect(tumYildizlar()["sayi:3"]).toEqual(["yaz"]);
  });

  it("ayni oge icin farkli oyunlari biriktirir", () => {
    yildizEkle("sayi:3", "yaz");
    yildizEkle("sayi:3", "bul");
    expect(tumYildizlar()["sayi:3"].sort()).toEqual(["bul", "yaz"]);
  });
});

describe("oyunYildizSayisi", () => {
  it("bos basladiginda sifirdir", () => {
    expect(oyunYildizSayisi("yaz")).toBe(0);
  });

  it("o oyunda tamamlanan oge sayisini verir", () => {
    yildizEkle("sayi:1", "yaz");
    yildizEkle("sayi:2", "yaz");
    yildizEkle("sayi:3", "bul");
    expect(oyunYildizSayisi("yaz")).toBe(2);
    expect(oyunYildizSayisi("bul")).toBe(1);
  });
});

describe("tumYildizlar", () => {
  it("bozuk kayit icin bos nesne doner", () => {
    localStorage.setItem("ogren:yildizlar", "bu gecerli json degil");
    expect(tumYildizlar()).toEqual({});
  });

  it("beklenen sekilde olmayan kayit icin bos nesne doner", () => {
    localStorage.setItem("ogren:yildizlar", JSON.stringify([1, 2, 3]));
    expect(tumYildizlar()).toEqual({});
  });
});

describe("yildizlariSil", () => {
  it("butun kaydi temizler", () => {
    yildizEkle("sayi:3", "yaz");
    yildizlariSil();
    expect(tumYildizlar()).toEqual({});
  });
});
