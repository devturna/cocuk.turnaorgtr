import { describe, it, expect } from "vitest";
import { haritayiCoz } from "./harita";
import { calistir } from "./calistir";
import type { Komut } from "./komutlar";
import { komutBloku, type Blok } from "../program";

const k = (blok: Komut): Blok => komutBloku(blok);

const git = (yon: "yukari" | "asagi" | "sol" | "sag"): Komut => ({ tur: "git", yon });
const ileri: Komut = { tur: "ileri" };
const don = (yon: "sol" | "sag"): Komut => ({ tur: "don", yon });

// .T.H  ->  saga iki adim
const DUZ = haritayiCoz([".T.H"], "sag");

describe("yurume", () => {
  it("hedefe varinca basarili olur", () => {
    const sonuc = calistir([k(git("sag")), k(git("sag"))], DUZ);
    expect(sonuc.basarili).toBe(true);
    expect(sonuc.adimlar.at(-1)?.olay).toBe("vardi");
  });

  it("hedefe varilmazsa basarisiz olur", () => {
    const sonuc = calistir([k(git("sag"))], DUZ);
    expect(sonuc.basarili).toBe(false);
  });

  it("her adim onu ureten blogun yolunu tasir", () => {
    const sonuc = calistir([k(git("sag")), k(git("sag"))], DUZ);
    expect(sonuc.adimlar.map((adim) => adim.blokYolu)).toEqual([
      { ust: 0, ic: null },
      { ust: 1, ic: null },
      { ust: 1, ic: null },
    ]);
  });

  it("hedefe varinca kalan bloklar calistirilmaz", () => {
    const sonuc = calistir([k(git("sag")), k(git("sag")), k(git("sol")), k(git("sol"))], DUZ);
    expect(sonuc.basarili).toBe(true);
    expect(sonuc.adimlar.at(-1)?.karakter).toEqual({ x: 3, y: 0, bakis: "sag" });
  });
});

describe("carpma cezalandirilmaz", () => {
  const ENGELLI = haritayiCoz([".T#H"], "sag");

  it("engele giren komut etkisizdir ama program surer", () => {
    const sonuc = calistir([k(git("sag")), k(git("sag"))], ENGELLI);
    expect(sonuc.adimlar.map((adim) => adim.olay)).toEqual(["carpti", "carpti"]);
    expect(sonuc.adimlar.at(-1)?.karakter).toEqual({ x: 1, y: 0, bakis: "sag" });
    expect(sonuc.basarili).toBe(false);
  });

  it("harita disina cikmak da carpmadir", () => {
    const sonuc = calistir([k(git("yukari"))], DUZ);
    expect(sonuc.adimlar[0].olay).toBe("carpti");
    expect(sonuc.adimlar[0].karakter).toEqual({ x: 1, y: 0, bakis: "yukari" });
  });

  it("carpmadan sonraki bloklar yine calisir", () => {
    const sonuc = calistir([k(git("yukari")), k(git("sag")), k(git("sag"))], DUZ);
    expect(sonuc.basarili).toBe(true);
  });
});

describe("basaklar", () => {
  const BASAKLI = haritayiCoz([".ToH"], "sag");

  it("basak toplanir ve ayri bir adim uretir", () => {
    const sonuc = calistir([k(git("sag")), k(git("sag"))], BASAKLI);
    expect(sonuc.adimlar.map((adim) => adim.olay)).toEqual([
      "yurudu",
      "topladi",
      "yurudu",
      "vardi",
    ]);
    expect(sonuc.basarili).toBe(true);
  });

  it("toplanmamis basak varken hedefe varmak yetmez", () => {
    const YAN_BASAK = haritayiCoz(["oTH"], "sag");
    const sonuc = calistir([k(git("sag"))], YAN_BASAK);
    expect(sonuc.basarili).toBe(false);
    expect(sonuc.adimlar.map((adim) => adim.olay)).toEqual(["yurudu"]);
  });

  it("ayni basak iki kez sayilmaz", () => {
    const sonuc = calistir([k(git("sag")), k(git("sol")), k(git("sag")), k(git("sag"))], BASAKLI);
    const toplama = sonuc.adimlar.filter((adim) => adim.olay === "topladi");
    expect(toplama).toHaveLength(1);
    expect(sonuc.basarili).toBe(true);
  });
});

describe("donusler seti", () => {
  // T saga bakiyor; asagi inmek icin once saga donmeli.
  const KOSE = haritayiCoz([".T..", "...H"], "sag");

  it("don komutu yalnizca bakisi degistirir", () => {
    const sonuc = calistir([k(don("sag"))], KOSE);
    expect(sonuc.adimlar[0].olay).toBe("dondu");
    expect(sonuc.adimlar[0].karakter).toEqual({ x: 1, y: 0, bakis: "asagi" });
  });

  it("sola donus saat tersine calisir", () => {
    const sonuc = calistir([k(don("sol"))], KOSE);
    expect(sonuc.adimlar[0].karakter.bakis).toBe("yukari");
  });

  it("ileri baktigi yone yurur", () => {
    const sonuc = calistir([k(ileri), k(ileri), k(don("sag")), k(ileri)], KOSE);
    expect(sonuc.basarili).toBe(true);
  });

  it("bos program hicbir adim uretmez", () => {
    const sonuc = calistir([], KOSE);
    expect(sonuc.adimlar).toEqual([]);
    expect(sonuc.basarili).toBe(false);
  });
});

describe("tekrar kutusu", () => {
  // .T...H  ->  saga dort adim
  const UZUN = haritayiCoz([".T...H"], "sag");

  it("govdeyi kez defa acarak yurur", () => {
    const sonuc = calistir([{ tur: "tekrar", kez: 4, govde: [komutBloku(git("sag"))] }], UZUN);
    expect(sonuc.basarili).toBe(true);
  });

  it("kez yetmezse hedefe varilmaz", () => {
    const sonuc = calistir([{ tur: "tekrar", kez: 3, govde: [komutBloku(git("sag"))] }], UZUN);
    expect(sonuc.basarili).toBe(false);
  });

  it("govdedeki her adim kutunun ve govdenin yolunu tasir", () => {
    const sonuc = calistir([{ tur: "tekrar", kez: 2, govde: [komutBloku(git("sag"))] }], UZUN);
    expect(sonuc.adimlar.map((adim) => adim.blokYolu)).toEqual([
      { ust: 0, ic: 0 },
      { ust: 0, ic: 0 },
    ]);
  });

  it("iki bloklu govde sirayla calisir", () => {
    // .T..  /  ....  : saga sonra asagi, iki kez -> (3,2)
    const KOSE = haritayiCoz([".T..", "....", "...H"], "sag");
    const sonuc = calistir(
      [{ tur: "tekrar", kez: 2, govde: [komutBloku(git("sag")), komutBloku(git("asagi"))] }],
      KOSE,
    );
    expect(sonuc.basarili).toBe(true);
    expect(sonuc.adimlar.map((adim) => adim.blokYolu)).toEqual([
      { ust: 0, ic: 0 },
      { ust: 0, ic: 1 },
      { ust: 0, ic: 0 },
      { ust: 0, ic: 1 },
      { ust: 0, ic: 1 },
    ]);
  });

  it("bos govde hicbir adim uretmez", () => {
    const sonuc = calistir([{ tur: "tekrar", kez: 5, govde: [] }], UZUN);
    expect(sonuc.adimlar).toEqual([]);
  });

  it("kutunun icinde hedefe varilinca kalan tekrarlar calismaz", () => {
    const sonuc = calistir([{ tur: "tekrar", kez: 5, govde: [komutBloku(git("sag"))] }], UZUN);
    expect(sonuc.basarili).toBe(true);
    expect(sonuc.adimlar.at(-1)?.karakter).toEqual({ x: 5, y: 0, bakis: "sag" });
  });

  it("kutudan sonraki blok da calisir", () => {
    const sonuc = calistir(
      [{ tur: "tekrar", kez: 3, govde: [komutBloku(git("sag"))] }, komutBloku(git("sag"))],
      UZUN,
    );
    expect(sonuc.basarili).toBe(true);
    expect(sonuc.adimlar.at(-1)?.blokYolu).toEqual({ ust: 1, ic: null });
  });

  it("kutu icinde carpan komut turu bitirmez, kutudan sonraki blok yine calisir", () => {
    // .T#.H : saginda engel var, tekrar boyunca hep carpar.
    const ENGELLI = haritayiCoz([".T#.H"], "sag");
    const sonuc = calistir(
      [{ tur: "tekrar", kez: 3, govde: [komutBloku(git("sag"))] }, komutBloku(git("sol"))],
      ENGELLI,
    );
    expect(sonuc.adimlar.map((adim) => adim.olay)).toEqual([
      "carpti",
      "carpti",
      "carpti",
      "yurudu",
    ]);
    expect(sonuc.adimlar.at(-1)?.blokYolu).toEqual({ ust: 1, ic: null });
    expect(sonuc.basarili).toBe(false);
  });
});
