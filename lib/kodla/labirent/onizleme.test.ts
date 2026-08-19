import { describe, it, expect } from "vitest";
import { haritayiCoz } from "./harita";
import { onizlemeYolu } from "./onizleme";
import type { Komut } from "./komutlar";

const git = (yon: "yukari" | "asagi" | "sol" | "sag"): Komut => ({ tur: "git", yon });

describe("onizlemeYolu", () => {
  it("bos program bos yol verir", () => {
    expect(onizlemeYolu([], haritayiCoz([".T.H"], "sag"))).toEqual([]);
  });

  it("her yurume adimi bir parca uretir", () => {
    const yol = onizlemeYolu([git("sag"), git("sag")], haritayiCoz([".T.H"], "sag"));
    expect(yol).toEqual([
      { tur: "adim", baslangic: { x: 1, y: 0 }, bitis: { x: 2, y: 0 }, blokSirasi: 0 },
      { tur: "adim", baslangic: { x: 2, y: 0 }, bitis: { x: 3, y: 0 }, blokSirasi: 1 },
    ]);
  });

  it("carpma ayri bir parca turudur ve yonunu tasir", () => {
    const yol = onizlemeYolu([git("yukari")], haritayiCoz([".T.H"], "sag"));
    expect(yol).toEqual([
      { tur: "carpma", kare: { x: 1, y: 0 }, yon: "yukari", blokSirasi: 0 },
    ]);
  });

  it("carpmadan sonraki adimlar da yola girer", () => {
    const yol = onizlemeYolu([git("yukari"), git("sag")], haritayiCoz([".T.H"], "sag"));
    expect(yol).toHaveLength(2);
    expect(yol[0].tur).toBe("carpma");
    expect(yol[1]).toEqual({
      tur: "adim",
      baslangic: { x: 1, y: 0 },
      bitis: { x: 2, y: 0 },
      blokSirasi: 1,
    });
  });

  it("donme yol parcasi uretmez", () => {
    const harita = haritayiCoz([".T..", "...H"], "sag");
    const yol = onizlemeYolu([{ tur: "don", yon: "sag" }], harita);
    expect(yol).toEqual([]);
  });

  it("basak toplama ayri parca uretmez", () => {
    const yol = onizlemeYolu([git("sag")], haritayiCoz([".ToH"], "sag"));
    expect(yol).toHaveLength(1);
    expect(yol[0].tur).toBe("adim");
  });

  it("hedefe varinca kalan bloklar yola girmez", () => {
    const yol = onizlemeYolu(
      [git("sag"), git("sag"), git("sol")],
      haritayiCoz([".T.H"], "sag"),
    );
    expect(yol).toHaveLength(2);
  });
});
