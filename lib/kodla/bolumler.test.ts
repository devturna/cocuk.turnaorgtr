import { describe, it, expect } from "vitest";
import { kursBul, tumKurslar } from "./kurslar";
import {
  bolumBul,
  bolumSiralamasi,
  bulmacaBul,
  bulmacaHaritasi,
  bulmacaSayisi,
  baslangicProgrami,
  kursBolumleri,
} from "./bolumler";
import { EN_AZ_KEZ, EN_FAZLA_KEZ } from "./program";

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
  const labirentBolumleri = bolumler.filter((bolum) => bolum.mekanik === "labirent");

  // On bes durak, elli sekiz bulmaca: kodlama-kapsam.md §4-5'teki rotanin
  // tamami. Sayi degisiyorsa once o belge degismeli.
  it("rota on bes durak ve elli sekiz bulmaca tasir", () => {
    expect(bolumler).toHaveLength(15);
    expect(bolumler.reduce((toplam, bolum) => toplam + bolum.bulmacalar.length, 0)).toBe(58);
  });

  it("rota gercek gocun sirasini izler", () => {
    expect(bolumSiralamasi("turna-yolu")).toEqual([
      "goksu-deltasi",
      "sultansazligi",
      "kapadokya",
      "seyfe-golu",
      "kizilirmak-deltasi",
      "kuyucuk-golu",
      "ercek-golu",
      "tuz-golu",
      "beysehir-golu",
      "burdur-golu",
      "pamukkale",
      "efes",
      "uluabat-golu",
      "manyas-kus-cenneti",
      "gala-golu",
    ]);
  });

  // Hata ayiklama duraklari dongunun ONUNDE gelir: cocuk once yazilmis bir
  // programi okuyup duzeltmeyi, sonra dongu yazmayi ogrenir.
  it("hata ayiklama duraklari dongunun onunde gelir", () => {
    const sira = bolumSiralamasi("turna-yolu");
    expect(sira.indexOf("kizilirmak-deltasi")).toBeLessThan(sira.indexOf("ercek-golu"));
    expect(sira.indexOf("kuyucuk-golu")).toBeLessThan(sira.indexOf("ercek-golu"));
  });

  // Dongu duraklari rotanin ORTASINA giriyor (Kapadokya'dan sonra): rota
  // gercek gocu izliyor, yeni durak sona eklenmiyor. Ilerleme kaydi durak
  // kimligine bagli oldugu icin bitmis duraklar bitmis kalir.
  it("dongu ogreten uc durak arka arkaya gelir", () => {
    const sira = bolumSiralamasi("turna-yolu");
    expect(sira.slice(sira.indexOf("ercek-golu"), sira.indexOf("ercek-golu") + 3)).toEqual([
      "ercek-golu",
      "tuz-golu",
      "beysehir-golu",
    ]);
  });

  it("bolum kimlikleri benzersizdir", () => {
    const kimlikler = bolumler.map((bolum) => bolum.id);
    expect(new Set(kimlikler).size).toBe(kimlikler.length);
  });

  it("siralama icerik dosyasindaki sirayi korur", () => {
    expect(bolumSiralamasi("turna-yolu")[0]).toBe("goksu-deltasi");
    expect(bolumSiralamasi("turna-yolu").at(-1)).toBe("gala-golu");
  });

  it("olmayan kurs icin bos liste doner", () => {
    expect(kursBolumleri("yok-boyle")).toEqual([]);
    expect(bolumBul("yok-boyle", "efes")).toBeUndefined();
  });

  it("her bolumun her bulmacasinin haritasi cozumlenebilir", () => {
    for (const bolum of labirentBolumleri) {
      for (const [sira, bulmaca] of bolum.bulmacalar.entries()) {
        expect(() => bulmacaHaritasi(bulmaca), `${bolum.id} bulmaca ${sira}`).not.toThrow();
      }
    }
  });

  // Testin adi "her bolumun" diyor: dizinin YALNIZCA ilk bulmacasina bakmak
  // bu sozu tutmuyordu (on bulmacanin altisi) ve bu daldaki her yeni bulmaca
  // denetimsiz giriyordu.
  it("her bolumun her bulmacasinin idealAdim degeri en az birdir", () => {
    for (const bolum of labirentBolumleri) {
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

  // Zihinsel dondurme yaklasik yedi yasta oturur, o yuzden donusler seti
  // rotanin SONUNDA acilir: Efes'ten oncesi mutlak yonlerle oynanir.
  it("donusler seti yalnizca rotanin sonunda kullanilir", () => {
    const donusluIlk = labirentBolumleri.findIndex((bolum) =>
      bolum.bulmacalar.some((bulmaca) => bulmaca.komutSeti === "donusler"),
    );
    expect(labirentBolumleri[donusluIlk].id).toBe("efes");
    for (const bolum of labirentBolumleri.slice(0, donusluIlk)) {
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
    if (bolum.mekanik !== "labirent") throw new Error("ilk durak labirent olmali");
    const harita = bulmacaHaritasi(bulmacaBul(bolum, 0)!);
    expect(harita.baslangic).toBeDefined();
    expect(harita.hedef).toBeDefined();
  });
});

describe("kucak alanlari", () => {
  // Kucak yalnizca komut dizen mekaniklerde vardir; olay duraklarinda
  // program bir kural kumesidir, blok bile yoktur.
  const bulmacalar = ["turna-yolu", "kilimin-izi"].flatMap((kurs) =>
    kursBolumleri(kurs)
      .filter((bolum) => bolum.mekanik !== "olay")
      .flatMap((bolum) =>
        bolum.bulmacalar.map((bulmaca, sira) => ({
          kimlik: `${bolum.id} bulmaca ${sira}`,
          bulmaca,
        })),
      ),
  );

  it("kucak tasiyan bulmacada enFazlaBlok da vardir", () => {
    for (const { kimlik, bulmaca } of bulmacalar) {
      if (!bulmaca.kucak) continue;
      expect(typeof bulmaca.enFazlaBlok, kimlik).toBe("number");
    }
  });

  it("kucak asamasi uc degerden biridir", () => {
    for (const { kimlik, bulmaca } of bulmacalar) {
      if (!bulmaca.kucak) continue;
      expect(["hazir", "oneri", "serbest"], kimlik).toContain(bulmaca.kucak.asama);
    }
  });

  it("hazir asamada kucak seritte hazir bekler ve kez degeri iki ile bes arasindadir", () => {
    for (const { kimlik, bulmaca } of bulmacalar) {
      if (bulmaca.kucak?.asama !== "hazir") continue;
      const kutular = baslangicProgrami(bulmaca).filter((blok) => blok.tur === "tekrar");
      expect(kutular.length, kimlik).toBeGreaterThan(0);
      for (const kutu of kutular) {
        expect(kutu.kez, kimlik).toBeGreaterThanOrEqual(EN_AZ_KEZ);
        expect(kutu.kez, kimlik).toBeLessThanOrEqual(EN_FAZLA_KEZ);
      }
    }
  });

  it("baslangic programi yalnizca kucakli bulmacada kucak tasir", () => {
    for (const { kimlik, bulmaca } of bulmacalar) {
      const kutuVar = baslangicProgrami(bulmaca).some((blok) => blok.tur === "tekrar");
      if (kutuVar) expect(bulmaca.kucak, kimlik).toBeDefined();
    }
  });

  it("enFazlaBlok yalnizca kucakli bulmacada anlamlidir", () => {
    for (const { kimlik, bulmaca } of bulmacalar) {
      if (bulmaca.enFazlaBlok === undefined) continue;
      expect(bulmaca.kucak, kimlik).toBeDefined();
    }
  });
});
