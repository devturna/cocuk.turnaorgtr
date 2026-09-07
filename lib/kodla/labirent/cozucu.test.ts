import { describe, it, expect } from "vitest";
import { haritayiCoz } from "./harita";
import { calistir } from "./calistir";
import { ARAMA_BLOK_SINIRI, enKisaBlokCozumu, enKisaCozum, enKisaCozumYolu } from "./cozucu";
import { blokSayisi, komutBloku } from "../program";

describe("enKisaCozum, yonler seti", () => {
  it("duz yolda adim sayisini bulur", () => {
    expect(enKisaCozum(haritayiCoz([".T.H"], "sag"), "yonler")).toBe(2);
  });

  it("engelin etrafindan dolasir", () => {
    // (1,1) ve (2,1) kapali: asagi inen dogrudan yol yok.
    const harita = haritayiCoz([".T..", ".##.", "...H"], "sag");
    expect(enKisaCozum(harita, "yonler")).toBe(4);
  });

  it("cozumu olmayan haritada null doner", () => {
    expect(enKisaCozum(haritayiCoz([".T#H"], "sag"), "yonler")).toBeNull();
  });

  it("yoldaki basagi hesaba katar", () => {
    expect(enKisaCozum(haritayiCoz([".ToH"], "sag"), "yonler")).toBe(2);
  });

  it("yolda olmayan basak icin sapmayi hesaba katar", () => {
    expect(enKisaCozum(haritayiCoz(["oTH"], "sag"), "yonler")).toBe(3);
  });

  it("butun basaklar toplanmadan hedef sayilmaz", () => {
    // (1,1) -> (0,1) -> (0,0) basak -> (1,0) -> (2,0) basak -> (2,1) -> (2,2)
    const harita = haritayiCoz(["o.o", ".T.", "..H"], "sag");
    expect(enKisaCozum(harita, "yonler")).toBe(6);
  });
});

describe("enKisaCozumYolu", () => {
  it("bulunan yol gercekten bolumu bitirir", () => {
    const harita = haritayiCoz(["..o..", ".T#..", "....H"], "sag");
    const yol = enKisaCozumYolu(harita, "yonler")!;
    expect(yol).not.toBeNull();
    expect(calistir(yol.map(komutBloku), harita).basarili).toBe(true);
  });

  it("adim sayisi enKisaCozum ile ayni", () => {
    const harita = haritayiCoz([".T.H"], "sag");
    expect(enKisaCozumYolu(harita, "yonler")!.length).toBe(enKisaCozum(harita, "yonler"));
  });

  it("cozumu olmayan haritada null doner", () => {
    expect(enKisaCozumYolu(haritayiCoz([".T#H"], "sag"), "yonler")).toBeNull();
  });
});

describe("enKisaCozum, donusler seti", () => {
  it("donus adimlarini da sayar", () => {
    // T saga bakiyor: ileri, ileri, saga don, ileri
    const harita = haritayiCoz([".T..", "...H"], "sag");
    expect(enKisaCozum(harita, "donusler")).toBe(4);
  });

  it("baslangic bakisi sonucu degistirir", () => {
    // T (1,0)'da asagi bakiyor, hedef (3,1):
    // ileri -> (1,1), sola don (asagi -> sag), ileri -> (2,1), ileri -> (3,1)
    const asagiBakan = haritayiCoz([".T..", "...H"], "asagi");
    expect(enKisaCozum(asagiBakan, "donusler")).toBe(4);
  });
});

describe("enKisaBlokCozumu", () => {
  // .T....H  ->  saga bes adim; duz yazmak bes blok ister.
  const UZUN = haritayiCoz([".T....H"], "sag");

  it("duz cozumun sigmadigi yerde dongulu cozum bulur", () => {
    const cozum = enKisaBlokCozumu(UZUN, "yonler", 3)!;
    expect(cozum).not.toBeNull();
    expect(blokSayisi(cozum)).toBeLessThanOrEqual(3);
    expect(calistir(cozum, UZUN).basarili).toBe(true);
  });

  it("en az blogu bulur", () => {
    // Kutu (1) + tek bloklu govde (1) = 2 blok, kez 5.
    expect(blokSayisi(enKisaBlokCozumu(UZUN, "yonler", 4)!)).toBe(2);
  });

  it("duz cozum sigiyorsa onu bulur", () => {
    const kisa = haritayiCoz([".T.H"], "sag");
    const cozum = enKisaBlokCozumu(kisa, "yonler", 4)!;
    expect(blokSayisi(cozum)).toBe(2);
    expect(calistir(cozum, kisa).basarili).toBe(true);
  });

  it("sinira sigan cozum yoksa null doner", () => {
    // Alti adimlik yol; iki blokla (kutu + tek komut) en fazla bes adim.
    const cokUzun = haritayiCoz([".T......H"], "sag");
    expect(enKisaBlokCozumu(cokUzun, "yonler", 2)).toBeNull();
  });

  it("cozumu olmayan haritada null doner", () => {
    expect(enKisaBlokCozumu(haritayiCoz([".T#H"], "sag"), "yonler", 4)).toBeNull();
  });

  it("arama sinirinin ustunde hata verir", () => {
    expect(() => enKisaBlokCozumu(UZUN, "yonler", ARAMA_BLOK_SINIRI + 1)).toThrow(
      /arama/,
    );
  });

  it("donusler setiyle de calisir", () => {
    const harita = haritayiCoz([".T....H"], "sag");
    const cozum = enKisaBlokCozumu(harita, "donusler", 3)!;
    expect(calistir(cozum, harita).basarili).toBe(true);
  });

  it("cozumu olmayan haritada tavan butceyi tarayip null doner", () => {
    // Tavanin en kotu durumu: hicbir program basarili olmadigi icin butun
    // arama uzayi taranir. Bu test yavaslarsa ARAMA_BLOK_SINIRI cok yuksektir.
    expect(enKisaBlokCozumu(haritayiCoz([".T#H"], "sag"), "yonler", ARAMA_BLOK_SINIRI)).toBeNull();
  });
});
