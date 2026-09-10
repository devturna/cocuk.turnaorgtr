import { describe, it, expect } from "vitest";
import { istekTamamMi, kuralBul, kuraliSil, kuralYaz, type Kural } from "./kurallar";

describe("kuralYaz", () => {
  it("yeni kural ekler", () => {
    expect(kuralYaz([], "kurbaga", "zipla")).toEqual([{ nesne: "kurbaga", eylem: "zipla" }]);
  });

  it("bir nesnenin ikinci kurali oncekinin yerine gecer", () => {
    const kurallar = kuralYaz(kuralYaz([], "kurbaga", "zipla"), "kurbaga", "ot");
    expect(kurallar).toEqual([{ nesne: "kurbaga", eylem: "ot" }]);
  });

  it("baska nesnenin kuralina dokunmaz", () => {
    const kurallar = kuralYaz(kuralYaz([], "kus", "ot"), "kurbaga", "zipla");
    expect(kurallar).toHaveLength(2);
    expect(kuralBul(kurallar, "kus")?.eylem).toBe("ot");
  });

  it("girdiyi degistirmez", () => {
    const kurallar: Kural[] = [{ nesne: "kus", eylem: "ot" }];
    kuralYaz(kurallar, "kus", "zipla");
    expect(kurallar).toEqual([{ nesne: "kus", eylem: "ot" }]);
  });
});

describe("kuraliSil", () => {
  it("kurali kaldirir", () => {
    expect(kuraliSil([{ nesne: "kus", eylem: "ot" }], "kus")).toEqual([]);
  });

  it("olmayan kural icin ayni listeyi doner", () => {
    const kurallar: Kural[] = [{ nesne: "kus", eylem: "ot" }];
    expect(kuraliSil(kurallar, "kurbaga")).toBe(kurallar);
  });
});

describe("istekTamamMi", () => {
  const istek: Kural = { nesne: "kurbaga", eylem: "zipla" };

  it("istenen kural yazilinca tamamdir", () => {
    expect(istekTamamMi([istek], istek)).toBe(true);
  });

  it("baska eylem yeterli degildir", () => {
    expect(istekTamamMi([{ nesne: "kurbaga", eylem: "ot" }], istek)).toBe(false);
  });

  it("baska nesneye yazilan kural yeterli degildir", () => {
    expect(istekTamamMi([{ nesne: "kus", eylem: "zipla" }], istek)).toBe(false);
  });

  it("fazladan kural sonucu bozmaz", () => {
    expect(istekTamamMi([{ nesne: "kus", eylem: "ot" }, istek], istek)).toBe(true);
  });

  it("serbest oyunda tek kural yeter", () => {
    expect(istekTamamMi([], undefined)).toBe(false);
    expect(istekTamamMi([{ nesne: "kus", eylem: "don" }], undefined)).toBe(true);
  });
});
