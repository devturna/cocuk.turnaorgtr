import { describe, it, expect } from "vitest";
import { karakterBul, kursKarakterleri, varsayilanKarakter } from "./karakterler";
import { yayindakiKurslar } from "./kurslar";
// Bir bilesenden import: VARSAYILAN_PALET sunucuda uretilen HTML'in
// rengidir ve katalogdaki turna girdisinin bir KOPYASIDIR. Ikisini
// birbirine baglayan tek sey asagidaki testtir.
import { VARSAYILAN_PALET } from "@/components/kodla/labirent/Simgeler";

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
      expect(k.palet.kanat, k.id).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("her karakterin kanadi govdesinden farklidir", () => {
    // Kanat govdenin golgesidir; ikisi ayni olursa kus duz bir lekeye
    // doner ve pozlar birbirinden ayirt edilemez.
    for (const k of kursKarakterleri("turna-yolu")) {
      expect(k.palet.kanat, k.id).not.toBe(k.palet.govde);
    }
  });

  it("cizimdeki varsayilan palet, katalogdaki turna ile aynidir", () => {
    // Sunucuda uretilen HTML VARSAYILAN_PALET ile cizilir, tarayici ise
    // katalogdaki paleti kullanir. Ayrisirlarsa sayfa ilk acilista bir
    // renkte cizilip effect calisinca digerine atlar - kimse fark etmez,
    // hicbir test dusmez. Bu test o bagi tutar.
    expect(VARSAYILAN_PALET).toEqual(karakterBul("turna-yolu", "turna")?.palet);
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
