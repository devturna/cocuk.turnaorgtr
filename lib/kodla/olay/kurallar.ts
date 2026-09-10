// Olay mekaniginin program modeli: kural kumesi.
//
// Onceki iki mekanikte program bir komut DIZISIYDI ve sirasi anlamliydi.
// Burada program bir KURAL KUMESIDIR: "suna dokununca su olsun". Sira
// anlamsizdir ve bir nesnenin en fazla bir kurali olur -- ikinci kural
// "hangisi once" sorusunu dogururdu, bu yasta o soru yok.
//
// Gerekceler docs/tasarim/kodlama-olaylar.md icinde.

export type Eylem = "zipla" | "ot" | "don" | "buyu";

export const EYLEMLER: Eylem[] = ["zipla", "ot", "don", "buyu"];

export type Kural = { nesne: string; eylem: Eylem };

/**
 * Kurali yazar. Nesnenin zaten bir kurali varsa YERINE gecer: bir nesnenin
 * bir kurali olur.
 */
export function kuralYaz(kurallar: Kural[], nesne: string, eylem: Eylem): Kural[] {
  const digerleri = kurallar.filter((kural) => kural.nesne !== nesne);
  return [...digerleri, { nesne, eylem }];
}

/** Nesnenin kuralini siler; yoksa liste degismeden doner. */
export function kuraliSil(kurallar: Kural[], nesne: string): Kural[] {
  const kalanlar = kurallar.filter((kural) => kural.nesne !== nesne);
  return kalanlar.length === kurallar.length ? kurallar : kalanlar;
}

export function kuralBul(kurallar: Kural[], nesne: string): Kural | undefined {
  return kurallar.find((kural) => kural.nesne === nesne);
}

/**
 * Bulmacanin istegi karsilandi mi.
 *
 * Istek yoksa (serbest oyun duragi) TEK BIR kural yeter: cocuk bir sey
 * yazdiysa o durak kazanilmistir.
 */
export function istekTamamMi(kurallar: Kural[], istek: Kural | undefined): boolean {
  if (istek === undefined) return kurallar.length > 0;
  return kuralBul(kurallar, istek.nesne)?.eylem === istek.eylem;
}
