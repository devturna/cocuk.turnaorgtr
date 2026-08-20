import { describe, it, expect } from "vitest";
import { karakterBul, kursKarakterleri, varsayilanKarakter } from "./karakterler";
import { yayindakiKurslar } from "./kurslar";

describe("karakter katalogu", () => {
  it("turna-yolu kursunda iki karakter vardir", () => {
    const karakterler = kursKarakterleri("turna-yolu");
    expect(karakterler.map((k) => k.id)).toEqual(["turna", "flamingo"]);
  });

  it("yayindaki her kursun en az bir karakteri vardir", () => {
    for (const kurs of yayindakiKurslar()) {
      expect(kursKarakterleri(kurs.id).length, kurs.id).toBeGreaterThan(0);
    }
  });

  it("kimlikler kurs icinde benzersizdir", () => {
    const kimlikler = kursKarakterleri("turna-yolu").map((k) => k.id);
    expect(new Set(kimlikler).size).toBe(kimlikler.length);
  });

  it("her karakterin paleti gecerli renklerden olusur", () => {
    for (const k of kursKarakterleri("turna-yolu")) {
      expect(k.palet.govde, k.id).toMatch(/^#[0-9a-f]{6}$/i);
      expect(k.palet.gaga, k.id).toMatch(/^#[0-9a-f]{6}$/i);
      expect(k.palet.bacak, k.id).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("her karakterin ebeveyne yazilmis bir bilgisi vardir", () => {
    for (const k of kursKarakterleri("turna-yolu")) {
      expect(k.bilgi.trim().length, k.id).toBeGreaterThan(10);
    }
  });

  it("varsayilan, listedeki ilk karakterdir", () => {
    expect(varsayilanKarakter("turna-yolu")?.id).toBe("turna");
  });

  it("olmayan kurs bos liste ve tanimsiz varsayilan verir", () => {
    expect(kursKarakterleri("yok-boyle")).toEqual([]);
    expect(varsayilanKarakter("yok-boyle")).toBeUndefined();
  });

  it("olmayan karakter undefined doner", () => {
    expect(karakterBul("turna-yolu", "devekusu")).toBeUndefined();
    expect(karakterBul("turna-yolu", "flamingo")?.ad).toBe("Flamingo");
  });
});
