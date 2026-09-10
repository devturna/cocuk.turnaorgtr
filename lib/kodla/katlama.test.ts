import { describe, it, expect } from "vitest";
import { katla, katlamaOnerisi } from "./katlama";
import { komutBloku, EN_FAZLA_KEZ, type Blok } from "./program";
import type { Komut } from "./labirent/komutlar";
import { calistir } from "./labirent/calistir";
import { haritayiCoz } from "./labirent/harita";

const SAG: Komut = { tur: "git", yon: "sag" };
const YUKARI: Komut = { tur: "git", yon: "yukari" };

/** Ayni komuttan "adet" tane blok. */
function dizi(komut: Komut, adet: number): Blok[] {
  return Array.from({ length: adet }, () => komutBloku(komut));
}

describe("katlamaOnerisi", () => {
  it("ayni komuttan uc blok oneri dogurur", () => {
    expect(katlamaOnerisi(dizi(SAG, 3))).toEqual({ ust: 0, uzunluk: 3, kez: 3 });
  });

  it("iki blok oneri dogurmaz", () => {
    // Kutu (1) + govde (1) yine iki blok eder: katlamak hicbir sey kazandirmaz.
    expect(katlamaOnerisi(dizi(SAG, 2))).toBeNull();
  });

  it("farkli komutlar dizi saymaz", () => {
    expect(katlamaOnerisi([komutBloku(SAG), komutBloku(YUKARI), komutBloku(SAG)])).toBeNull();
  });

  it("birden fazla dizi varsa sonuncusunu onerir", () => {
    const program = [...dizi(SAG, 3), komutBloku(YUKARI), ...dizi(YUKARI, 3)];
    expect(katlamaOnerisi(program)).toEqual({ ust: 3, uzunluk: 4, kez: 4 });
  });

  it("en fazla kez degerinden uzun diziyi kirpar", () => {
    const oneri = katlamaOnerisi(dizi(SAG, EN_FAZLA_KEZ + 2))!;
    expect(oneri.uzunluk).toBe(EN_FAZLA_KEZ);
    expect(oneri.kez).toBe(EN_FAZLA_KEZ);
  });

  it("kutunun icindeki tekrari onermez", () => {
    const program: Blok[] = [{ tur: "tekrar", kez: 2, govde: dizi(SAG, 3) as never }];
    expect(katlamaOnerisi(program)).toBeNull();
  });

  it("kutu diziyi boler", () => {
    const program: Blok[] = [
      komutBloku(SAG),
      { tur: "tekrar", kez: 2, govde: [] },
      komutBloku(SAG),
      komutBloku(SAG),
    ];
    expect(katlamaOnerisi(program)).toBeNull();
  });

  it("bos programda oneri yok", () => {
    expect(katlamaOnerisi([])).toBeNull();
  });
});

describe("katla", () => {
  it("diziyi tek kucaga cevirir", () => {
    const program = dizi(SAG, 3);
    expect(katla(program, katlamaOnerisi(program)!)).toEqual([
      { tur: "tekrar", kez: 3, govde: [komutBloku(SAG)] },
    ]);
  });

  it("dizinin disindaki bloklara dokunmaz", () => {
    const program = [komutBloku(YUKARI), ...dizi(SAG, 3), komutBloku(YUKARI)];
    expect(katla(program, katlamaOnerisi(program)!)).toEqual([
      komutBloku(YUKARI),
      { tur: "tekrar", kez: 3, govde: [komutBloku(SAG)] },
      komutBloku(YUKARI),
    ]);
  });

  it("kirpilan dizide artan bloklar duz kalir", () => {
    const program = dizi(SAG, EN_FAZLA_KEZ + 2);
    const katlanan = katla(program, katlamaOnerisi(program)!);
    expect(katlanan).toHaveLength(3);
    expect(katlanan[0]).toEqual({ tur: "tekrar", kez: EN_FAZLA_KEZ, govde: [komutBloku(SAG)] });
    expect(katlanan.slice(1)).toEqual(dizi(SAG, 2));
  });

  it("girdiyi degistirmez", () => {
    const program = dizi(SAG, 3);
    katla(program, katlamaOnerisi(program)!);
    expect(program).toEqual(dizi(SAG, 3));
  });

  // Belgedeki soz: "dokunursa uc kutu tek kucaga katlanir ve HARITA HIC
  // DEGISMEZ". Burada test: katlamadan once ve sonra karakterin yasadigi
  // olaylar birebir ayni. blokYolu haric karsilastiriliyor, cunku bloklarin
  // adresi zaten degisiyor -- degismemesi gereken sey karakterin yolu.
  it("katlanmis program ayni yolu yurur", () => {
    const harita = haritayiCoz([".T....H"], "sag");
    const program = dizi(SAG, 5);
    const once = calistir(program, harita);
    const sonra = calistir(katla(program, katlamaOnerisi(program)!), harita);

    expect(sonra.basarili).toBe(once.basarili);
    expect(sonra.adimlar.map(({ karakter, olay }) => ({ karakter, olay }))).toEqual(
      once.adimlar.map(({ karakter, olay }) => ({ karakter, olay })),
    );
  });
});
