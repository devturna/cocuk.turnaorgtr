import { describe, it, expect } from "vitest";
import { enKisaDesenCozumu, DESEN_ARAMA_SINIRI } from "./cozucu";
import { deseniCoz, type DesenVerisi } from "./desen";
import { ciz } from "./ciz";
import { blokSayisi } from "../program";

const KARE: DesenVerisi = {
  genislik: 3,
  yukseklik: 3,
  baslangic: { x: 0, y: 2, bakis: "sag" },
  kenarlar: ["0,2 1,2", "1,2 1,1", "1,1 0,1", "0,1 0,2"],
};

describe("enKisaDesenCozumu", () => {
  it("kareyi iki bloklu bir kucakla cizer", () => {
    // ileri + don, dort kez: kutu (1) + govde (2) = 3 blok.
    const cozum = enKisaDesenCozumu(deseniCoz(KARE), "donusler", 3)!;
    expect(cozum).not.toBeNull();
    expect(blokSayisi(cozum)).toBe(3);
    expect(ciz(cozum, deseniCoz(KARE)).basarili).toBe(true);
  });

  it("sinira sigmayan desen icin null doner", () => {
    // Bir kucak (kutu + tek komut) kare cizemez: donmeden cizgi duz gider.
    expect(enKisaDesenCozumu(deseniCoz(KARE), "donusler", 2)).toBeNull();
  });

  it("arama sinirinin ustunde hata verir", () => {
    expect(() =>
      enKisaDesenCozumu(deseniCoz(KARE), "donusler", DESEN_ARAMA_SINIRI + 1),
    ).toThrow(/arama/);
  });

  it("govde siniri iki komutluk kucagi eler", () => {
    expect(enKisaDesenCozumu(deseniCoz(KARE), "donusler", 3, { enFazlaGovde: 1 })).toBeNull();
  });

  it("duz cizgiyi tek kucakla cizer", () => {
    const cizgi: DesenVerisi = {
      genislik: 4,
      yukseklik: 2,
      baslangic: { x: 0, y: 1, bakis: "sag" },
      kenarlar: ["0,1 1,1", "1,1 2,1", "2,1 3,1"],
    };
    const cozum = enKisaDesenCozumu(deseniCoz(cizgi), "donusler", 2)!;
    expect(blokSayisi(cozum)).toBe(2);
  });
});
