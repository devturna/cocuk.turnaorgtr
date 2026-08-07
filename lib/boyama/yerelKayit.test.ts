import { describe, it, expect, beforeEach } from "vitest";
import { durumuKaydet, durumuYukle, durumuSil, baslanmisResimler } from "./yerelKayit";

const DURUM = { dolgular: { govde: "#ff0000" }, fircaCizgileri: [] };

beforeEach(() => {
  localStorage.clear();
});

describe("durumuKaydet ve durumuYukle", () => {
  it("kaydedileni geri okur", () => {
    durumuKaydet("kedi", DURUM);
    expect(durumuYukle("kedi")).toEqual(DURUM);
  });

  it("hic kaydedilmemis resim icin null doner", () => {
    expect(durumuYukle("kopek")).toBeNull();
  });

  it("bozuk kayit icin null doner", () => {
    localStorage.setItem("boyama:kedi", "bu gecerli json degil");
    expect(durumuYukle("kedi")).toBeNull();
  });

  it("beklenen alanlari tasimayan kayit icin null doner", () => {
    localStorage.setItem("boyama:kedi", JSON.stringify({ baska: 1 }));
    expect(durumuYukle("kedi")).toBeNull();
  });

  it("resimleri birbirinden ayri tutar", () => {
    durumuKaydet("kedi", DURUM);
    expect(durumuYukle("balik")).toBeNull();
  });
});

describe("durumuSil", () => {
  it("kaydi kaldirir", () => {
    durumuKaydet("kedi", DURUM);
    durumuSil("kedi");
    expect(durumuYukle("kedi")).toBeNull();
  });
});

describe("baslanmisResimler", () => {
  it("bos basladiginda bos dizi doner", () => {
    expect(baslanmisResimler()).toEqual([]);
  });

  it("kaydi olan resimlerin kimliklerini doner", () => {
    durumuKaydet("kedi", DURUM);
    durumuKaydet("balik", DURUM);
    expect(baslanmisResimler().sort()).toEqual(["balik", "kedi"]);
  });

  it("bize ait olmayan anahtarlari yok sayar", () => {
    localStorage.setItem("baska-uygulama:x", "1");
    durumuKaydet("kedi", DURUM);
    expect(baslanmisResimler()).toEqual(["kedi"]);
  });
});
