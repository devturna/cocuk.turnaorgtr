import { describe, it, expect, beforeEach } from "vitest";
import {
  EN_FAZLA_DENEME,
  bolumAcikMi,
  bolumSonucu,
  bolumSonucuKaydet,
  denemeArtir,
  denemeSayisi,
  ilerlemeyiSil,
  kursYildizSayisi,
  tumIlerleme,
} from "./ilerleme";

const KURS = "turna-yolu";
const SIRALI = ["sultansazligi", "kapadokya", "tuz-golu"];

beforeEach(() => {
  localStorage.clear();
});

describe("bolum sonucu", () => {
  it("kayit yoksa bos doner", () => {
    expect(tumIlerleme()).toEqual({});
    expect(bolumSonucu(KURS, "kapadokya")).toBeUndefined();
  });

  it("kaydedilen sonucu geri verir", () => {
    bolumSonucuKaydet(KURS, "kapadokya", "yildiz");
    expect(bolumSonucu(KURS, "kapadokya")).toBe("yildiz");
  });

  it("altin yildiz normale dusurulmez", () => {
    bolumSonucuKaydet(KURS, "kapadokya", "altin");
    bolumSonucuKaydet(KURS, "kapadokya", "yildiz");
    expect(bolumSonucu(KURS, "kapadokya")).toBe("altin");
  });

  it("normal yildiz altina yukseltilebilir", () => {
    bolumSonucuKaydet(KURS, "kapadokya", "yildiz");
    bolumSonucuKaydet(KURS, "kapadokya", "altin");
    expect(bolumSonucu(KURS, "kapadokya")).toBe("altin");
  });

  it("kurslar birbirini etkilemez", () => {
    bolumSonucuKaydet(KURS, "kapadokya", "altin");
    expect(bolumSonucu("baska-kurs", "kapadokya")).toBeUndefined();
    expect(kursYildizSayisi(KURS)).toBe(1);
    expect(kursYildizSayisi("baska-kurs")).toBe(0);
  });

  it("bozuk kayit bos sayilir", () => {
    localStorage.setItem("kodla:ilerleme", "{bozuk");
    expect(tumIlerleme()).toEqual({});
  });
});

describe("deneme sayaci", () => {
  it("sifirdan baslar ve artar", () => {
    expect(denemeSayisi(KURS, "kapadokya")).toBe(0);
    expect(denemeArtir(KURS, "kapadokya")).toBe(1);
    expect(denemeArtir(KURS, "kapadokya")).toBe(2);
    expect(denemeSayisi(KURS, "kapadokya")).toBe(2);
  });
});

describe("kilit kurali", () => {
  it("ilk bolum her zaman aciktir", () => {
    expect(bolumAcikMi(KURS, "sultansazligi", SIRALI)).toBe(true);
  });

  it("onceki bitmeden sonraki kilitlidir", () => {
    expect(bolumAcikMi(KURS, "kapadokya", SIRALI)).toBe(false);
  });

  it("onceki bitince sonraki acilir", () => {
    bolumSonucuKaydet(KURS, "sultansazligi", "yildiz");
    expect(bolumAcikMi(KURS, "kapadokya", SIRALI)).toBe(true);
    expect(bolumAcikMi(KURS, "tuz-golu", SIRALI)).toBe(false);
  });

  it("bes denemeden sonra sonraki bolum sessizce acilir", () => {
    for (let i = 0; i < EN_FAZLA_DENEME; i++) denemeArtir(KURS, "sultansazligi");
    expect(bolumAcikMi(KURS, "kapadokya", SIRALI)).toBe(true);
  });

  it("dort deneme yetmez", () => {
    for (let i = 0; i < EN_FAZLA_DENEME - 1; i++) denemeArtir(KURS, "sultansazligi");
    expect(bolumAcikMi(KURS, "kapadokya", SIRALI)).toBe(false);
  });

  it("listede olmayan bolum kapalidir", () => {
    expect(bolumAcikMi(KURS, "yok-boyle", SIRALI)).toBe(false);
  });
});

describe("ilerlemeyiSil", () => {
  it("yildizlari ve denemeleri siler", () => {
    bolumSonucuKaydet(KURS, "kapadokya", "altin");
    denemeArtir(KURS, "kapadokya");
    ilerlemeyiSil();
    expect(tumIlerleme()).toEqual({});
    expect(denemeSayisi(KURS, "kapadokya")).toBe(0);
  });
});
