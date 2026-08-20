import { describe, it, expect } from "vitest";
import { haritayiCoz } from "./harita";
import { calistir } from "./calistir";
import type { Komut } from "./komutlar";

const git = (yon: "yukari" | "asagi" | "sol" | "sag"): Komut => ({ tur: "git", yon });
const ileri: Komut = { tur: "ileri" };
const don = (yon: "sol" | "sag"): Komut => ({ tur: "don", yon });

// .T.H  ->  saga iki adim
const DUZ = haritayiCoz([".T.H"], "sag");

describe("yurume", () => {
  it("hedefe varinca basarili olur", () => {
    const sonuc = calistir([git("sag"), git("sag")], DUZ);
    expect(sonuc.basarili).toBe(true);
    expect(sonuc.adimlar.at(-1)?.olay).toBe("vardi");
  });

  it("hedefe varilmazsa basarisiz olur", () => {
    const sonuc = calistir([git("sag")], DUZ);
    expect(sonuc.basarili).toBe(false);
  });

  it("her adim onu ureten blogun sirasini tasir", () => {
    const sonuc = calistir([git("sag"), git("sag")], DUZ);
    expect(sonuc.adimlar.map((adim) => adim.blokSirasi)).toEqual([0, 1, 1]);
  });

  it("hedefe varinca kalan bloklar calistirilmaz", () => {
    const sonuc = calistir([git("sag"), git("sag"), git("sol"), git("sol")], DUZ);
    expect(sonuc.basarili).toBe(true);
    expect(sonuc.adimlar.at(-1)?.karakter).toEqual({ x: 3, y: 0, bakis: "sag" });
  });
});

describe("carpma cezalandirilmaz", () => {
  const ENGELLI = haritayiCoz([".T#H"], "sag");

  it("engele giren komut etkisizdir ama program surer", () => {
    const sonuc = calistir([git("sag"), git("sag")], ENGELLI);
    expect(sonuc.adimlar.map((adim) => adim.olay)).toEqual(["carpti", "carpti"]);
    expect(sonuc.adimlar.at(-1)?.karakter).toEqual({ x: 1, y: 0, bakis: "sag" });
    expect(sonuc.basarili).toBe(false);
  });

  it("harita disina cikmak da carpmadir", () => {
    const sonuc = calistir([git("yukari")], DUZ);
    expect(sonuc.adimlar[0].olay).toBe("carpti");
    expect(sonuc.adimlar[0].karakter).toEqual({ x: 1, y: 0, bakis: "yukari" });
  });

  it("carpmadan sonraki bloklar yine calisir", () => {
    const sonuc = calistir([git("yukari"), git("sag"), git("sag")], DUZ);
    expect(sonuc.basarili).toBe(true);
  });
});

describe("basaklar", () => {
  const BASAKLI = haritayiCoz([".ToH"], "sag");

  it("basak toplanir ve ayri bir adim uretir", () => {
    const sonuc = calistir([git("sag"), git("sag")], BASAKLI);
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
    const sonuc = calistir([git("sag")], YAN_BASAK);
    expect(sonuc.basarili).toBe(false);
    expect(sonuc.adimlar.map((adim) => adim.olay)).toEqual(["yurudu"]);
  });

  it("ayni basak iki kez sayilmaz", () => {
    const sonuc = calistir([git("sag"), git("sol"), git("sag"), git("sag")], BASAKLI);
    const toplama = sonuc.adimlar.filter((adim) => adim.olay === "topladi");
    expect(toplama).toHaveLength(1);
    expect(sonuc.basarili).toBe(true);
  });
});

describe("donusler seti", () => {
  // T saga bakiyor; asagi inmek icin once saga donmeli.
  const KOSE = haritayiCoz([".T..", "...H"], "sag");

  it("don komutu yalnizca bakisi degistirir", () => {
    const sonuc = calistir([don("sag")], KOSE);
    expect(sonuc.adimlar[0].olay).toBe("dondu");
    expect(sonuc.adimlar[0].karakter).toEqual({ x: 1, y: 0, bakis: "asagi" });
  });

  it("sola donus saat tersine calisir", () => {
    const sonuc = calistir([don("sol")], KOSE);
    expect(sonuc.adimlar[0].karakter.bakis).toBe("yukari");
  });

  it("ileri baktigi yone yurur", () => {
    const sonuc = calistir([ileri, ileri, don("sag"), ileri], KOSE);
    expect(sonuc.basarili).toBe(true);
  });

  it("bos program hicbir adim uretmez", () => {
    const sonuc = calistir([], KOSE);
    expect(sonuc.adimlar).toEqual([]);
    expect(sonuc.basarili).toBe(false);
  });
});
