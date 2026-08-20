import { describe, it, expect } from "vitest";
import { karakterBul, kursKarakterleri, varsayilanKarakter } from "./karakterler";
import { yayindakiKurslar } from "./kurslar";
// Bir bilesenden import: VARSAYILAN_PALET sunucuda uretilen HTML'in
// rengidir ve katalogdaki turna girdisinin bir KOPYASIDIR. Ikisini
// birbirine baglayan tek sey asagidaki testtir.
import { VARSAYILAN_PALET } from "@/components/kodla/labirent/Simgeler";

/** WCAG bagil parlaklik (0-1); hex "#rrggbb" formatinda beklenir. */
function goreceliParlaklik(hex: string): number {
  const kanallar = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const dogrusallastir = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = kanallar.map(dogrusallastir);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG kontrast orani (1:1 - 21:1 arasi). */
function kontrastOrani(hex1: string, hex2: string): number {
  const [acik, koyu] = [goreceliParlaklik(hex1), goreceliParlaklik(hex2)].sort((a, b) => b - a);
  return (acik + 0.05) / (koyu + 0.05);
}

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

  it("her karakterin kanadi govdesinden gorunur bicimde ayrisir (kontrast)", () => {
    // Kanat govdenin golgesidir; birbirine cok yakin renkler olursa kus
    // duz bir lekeye doner ve pozlar birbirinden ayirt edilemez. Onceki
    // surum yalnizca `kanat !== govde` diyordu - #f2a2b9, #f2a2b8'den
    // TEK basamak farkli bir kanadi da gecirirdi. Gercek esik bir kontrast
    // oranidir.
    //
    // WCAG metin-disi elemanlar icin 3:1 onerir; bugun HICBIR kus buna
    // ulasmiyor (Turna ~1.57:1, Flamingo ~1.80:1 - bkz.
    // docs/kodlama-bolumu-hazirlama.md). Esigi 3:1'e sabitleyip iki kusu
    // da koyulastirmak GORSEL bir karardir ve burada alinmiyor; esik
    // bunun yerine bugun gemiye cikan en dusuk degerin (Turna) hemen
    // altina, 1.5:1'e konur - amac gercek bir gerilemeyi (kanat govdeyle
    // neredeyse ayni renge donerse) yakalamak.
    const ESIK = 1.5;
    for (const k of kursKarakterleri("turna-yolu")) {
      expect(kontrastOrani(k.palet.kanat, k.palet.govde), k.id).toBeGreaterThanOrEqual(ESIK);
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
