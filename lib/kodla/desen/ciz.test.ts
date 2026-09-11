import { describe, it, expect } from "vitest";
import { ciz } from "./ciz";
import { anahtarKenari, deseniCoz, kenarAnahtari, type DesenVerisi } from "./desen";
import { komutBloku, type Blok } from "../program";
import type { Komut } from "../labirent/komutlar";

const ILERI: Komut = { tur: "ileri" };
const SAGA: Komut = { tur: "don", yon: "sag" };
const SOLA: Komut = { tur: "don", yon: "sol" };

/** Sol alt koseden baslayan 3x3 kose izgarasi, hedef bir birim kare. */
const KARE: DesenVerisi = {
  genislik: 3,
  yukseklik: 3,
  baslangic: { x: 0, y: 2, bakis: "sag" },
  kenarlar: ["0,2 1,2", "1,2 1,1", "1,1 0,1", "0,1 0,2"],
};

function programla(...komutlar: Komut[]): Blok[] {
  return komutlar.map(komutBloku);
}

describe("ciz", () => {
  it("ileri komutu kenar cizer ve kusu tasir", () => {
    const sonuc = ciz(programla(ILERI), deseniCoz(KARE));
    expect(sonuc.cizilenler).toEqual([kenarAnahtari({ x: 0, y: 2 }, { x: 1, y: 2 })]);
    expect(sonuc.adimlar[0].karakter).toEqual({ x: 1, y: 2, bakis: "sag" });
    expect(sonuc.basarili).toBe(false);
  });

  it("donme yer degistirmez", () => {
    const sonuc = ciz(programla(SAGA), deseniCoz(KARE));
    expect(sonuc.cizilenler).toEqual([]);
    expect(sonuc.adimlar[0]).toMatchObject({ olay: "dondu", karakter: { x: 0, y: 2, bakis: "asagi" } });
  });

  it("izgara disina cikan komut carpar ama programi bitirmez", () => {
    // Sol alt kosede sola donup ileri: izgaranin disi.
    const sonuc = ciz(programla(SAGA, SAGA, ILERI, SAGA, SAGA, ILERI), deseniCoz(KARE));
    expect(sonuc.adimlar.some((adim) => adim.olay === "carpti")).toBe(true);
    expect(sonuc.cizilenler).toHaveLength(1);
  });

  it("hedefin butun kenarlari cizilince basarili olur", () => {
    // Kare: ileri, sola don -- dort kez. (Ekran koordinatinda yukari
    // gitmek icin sola donuluyor.)
    const dongu: Blok[] = [
      { tur: "tekrar", kez: 4, govde: [komutBloku(ILERI), komutBloku(SOLA)] },
    ];
    const sonuc = ciz(dongu, deseniCoz(KARE));
    expect(sonuc.basarili).toBe(true);
    expect(sonuc.adimlar.at(-1)?.olay).toBe("bitti");
  });

  it("desen tamamlaninca program orada biter", () => {
    const dongu: Blok[] = [
      { tur: "tekrar", kez: 5, govde: [komutBloku(ILERI), komutBloku(SOLA)] },
    ];
    const sonuc = ciz(dongu, deseniCoz(KARE));
    // Bes tur yazilmis olsa da dordunculuk kenar cizilince duruyor.
    expect(sonuc.cizilenler).toHaveLength(4);
  });

  it("fazladan cizgi basariyi bozmaz", () => {
    // Once ust kareyi dolasir (hedefte olmayan uc kenar), sonra hedef
    // kareyi tamamlar. Ceza yok: fazla cizgi yalnizca blok sayisini
    // buyutur, altin yildizi kacirtir.
    const sonuc = ciz(
      programla(
        SOLA, ILERI, // (0,2)->(0,1): hedef kenar
        ILERI, // (0,1)->(0,0): fazla
        SAGA, ILERI, // (0,0)->(1,0): fazla
        SAGA, ILERI, // (1,0)->(1,1): fazla
        SAGA, ILERI, // (1,1)->(0,1): hedef kenar
        SOLA, ILERI, // (0,1)->(0,2): hedef kenar (zaten cizili degil)
        SOLA, ILERI, // (0,2)->(1,2): hedef kenar
        SOLA, ILERI, // (1,2)->(1,1): hedef kenar, desen tamamlanir
      ),
      deseniCoz(KARE),
    );
    expect(sonuc.basarili).toBe(true);
    expect(sonuc.cizilenler.length).toBeGreaterThan(4);
  });

  it("ayni kenari iki kez cizmek sayilmaz", () => {
    const sonuc = ciz(programla(ILERI, SAGA, SAGA, ILERI), deseniCoz(KARE));
    expect(sonuc.cizilenler).toHaveLength(1);
  });
});

describe("deseniCoz", () => {
  it("bozuk kenari reddeder", () => {
    expect(() => deseniCoz({ ...KARE, kenarlar: ["0,2 2,2"] })).toThrow(/komsu/);
    expect(() => deseniCoz({ ...KARE, kenarlar: ["sacma"] })).toThrow(/bicim/);
    expect(() => deseniCoz({ ...KARE, kenarlar: ["0,2 0,3"] })).toThrow(/disinda/);
  });

  it("kenarsiz deseni reddeder", () => {
    expect(() => deseniCoz({ ...KARE, kenarlar: [] })).toThrow(/kenari/);
  });

  it("baslangici izgara disinda olan deseni reddeder", () => {
    expect(() => deseniCoz({ ...KARE, baslangic: { x: 5, y: 0, bakis: "sag" } })).toThrow(/Baslangic/);
  });

  it("ayni kenari iki kez yazmak tek kenar sayilir", () => {
    expect(deseniCoz({ ...KARE, kenarlar: ["0,2 1,2", "1,2 0,2"] }).kenarlar.size).toBe(1);
  });
});

describe("anahtarKenari katiligi", () => {
  it("eksik veya fazla koordinat kabul edilmez", () => {
    // Gevsek bir ayristirma ",3" degerini (0,3) diye okur; boyle bir yazim
    // hatasi gecerli ama YANLIS bir hedef kenar uretir ve denetimden gecer.
    expect(anahtarKenari(",3 1,3")).toBeNull();
    expect(anahtarKenari("1,2,9 1,3")).toBeNull();
    expect(anahtarKenari("1 1,3")).toBeNull();
    expect(anahtarKenari("1,3")).toBeNull();
  });

  it("dogru yazilmis kenar YAZILDIGI sirayla cozulur", () => {
    // Siralama kenarAnahtari'nin isi; anahtarKenari yalnizca okur.
    expect(anahtarKenari("1,3 1,2")).toEqual([
      { x: 1, y: 3 },
      { x: 1, y: 2 },
    ]);
  });
});
