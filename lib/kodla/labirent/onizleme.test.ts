import { describe, it, expect } from "vitest";
import { haritayiCoz } from "./harita";
import { onizlemeYolu } from "./onizleme";
import type { Komut } from "./komutlar";
import { komutBloku } from "../program";

const git = (yon: "yukari" | "asagi" | "sol" | "sag"): Komut => ({ tur: "git", yon });

describe("onizlemeYolu", () => {
  it("bos program bos yol verir", () => {
    expect(onizlemeYolu([], haritayiCoz([".T.H"], "sag"))).toEqual([]);
  });

  it("her yurume adimi bir parca uretir", () => {
    const yol = onizlemeYolu(
      [komutBloku(git("sag")), komutBloku(git("sag"))],
      haritayiCoz([".T.H"], "sag"),
    );
    expect(yol).toEqual([
      {
        tur: "adim",
        baslangic: { x: 1, y: 0 },
        bitis: { x: 2, y: 0 },
        blokYolu: { ust: 0, ic: null },
        adimSirasi: 0,
      },
      {
        tur: "adim",
        baslangic: { x: 2, y: 0 },
        bitis: { x: 3, y: 0 },
        blokYolu: { ust: 1, ic: null },
        adimSirasi: 1,
      },
    ]);
  });

  it("carpma ayri bir parca turudur ve yonunu tasir", () => {
    const yol = onizlemeYolu([komutBloku(git("yukari"))], haritayiCoz([".T.H"], "sag"));
    expect(yol).toEqual([
      {
        tur: "carpma",
        kare: { x: 1, y: 0 },
        yon: "yukari",
        blokYolu: { ust: 0, ic: null },
        adimSirasi: 0,
      },
    ]);
  });

  it("carpmadan sonraki adimlar da yola girer", () => {
    const yol = onizlemeYolu(
      [komutBloku(git("yukari")), komutBloku(git("sag"))],
      haritayiCoz([".T.H"], "sag"),
    );
    expect(yol).toHaveLength(2);
    expect(yol[0].tur).toBe("carpma");
    expect(yol[1]).toEqual({
      tur: "adim",
      baslangic: { x: 1, y: 0 },
      bitis: { x: 2, y: 0 },
      blokYolu: { ust: 1, ic: null },
      adimSirasi: 1,
    });
  });

  it("donme yol parcasi uretmez", () => {
    const harita = haritayiCoz([".T..", "...H"], "sag");
    const yol = onizlemeYolu([komutBloku({ tur: "don", yon: "sag" })], harita);
    expect(yol).toEqual([]);
  });

  it("basak toplama ayri parca uretmez", () => {
    const yol = onizlemeYolu([komutBloku(git("sag"))], haritayiCoz([".ToH"], "sag"));
    expect(yol).toHaveLength(1);
    expect(yol[0].tur).toBe("adim");
  });

  it("hedefe varinca kalan bloklar yola girmez", () => {
    const yol = onizlemeYolu(
      [komutBloku(git("sag")), komutBloku(git("sag")), komutBloku(git("sol"))],
      haritayiCoz([".T.H"], "sag"),
    );
    expect(yol).toHaveLength(2);
  });

  it("tekrarin her turu ayri bir yol parcasi ve ayri adim sirasi uretir", () => {
    const harita = haritayiCoz([".T..H"], "sag");
    const parcalar = onizlemeYolu(
      [{ tur: "tekrar", kez: 3, govde: [komutBloku(git("sag"))] }],
      harita,
    );
    expect(parcalar).toHaveLength(3);
    expect(parcalar.map((parca) => parca.adimSirasi)).toEqual([0, 1, 2]);
    // Uc parca da AYNI bloktan gelir: vurgu yolu tekrar boyunca degismez.
    expect(parcalar.every((parca) => parca.blokYolu.ic === 0)).toBe(true);
  });
});
