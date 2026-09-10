// Golge oyununun mantigi: ustte bir nesne, altta golgeler.
//
// Golgeler ayri bir gorsel DEGIL: ayni simge, karartilmis haliyle cizilir
// (CSS filter). Boylece oyun yeni bir varlik dosyasi gerektirmez ve golge
// ile nesne birbirinden asla sapamaz.
//
// Rastgelelik yok: her tur numarasindan turetilir.

/** Bir turda kac golge gosterilir. */
export const GOLGE_SAYISI = 4;

// Sekilleri BIRBIRINDEN AYIRT EDILEBILIR seciyoruz: golge yalnizca dis
// hatti gosterdigi icin birbirine benzeyen iki hayvan (kedi/kopek) golge
// halinde ayirt edilemezdi.
const SIMGELER = [
  "🦋", "🐢", "🌳", "🚌", "⛵", "🐘", "🍐", "🦒", "🏠", "🐟", "✏️", "🌂",
];

function tohumluSayi(tohum: number): () => number {
  let durum = tohum * 374761393 + 23;
  return () => {
    durum = (durum * 1103515245 + 12345) % 2147483648;
    return durum / 2147483648;
  };
}

function karistir<T>(dizi: T[], rastgele: () => number): T[] {
  const kopya = [...dizi];
  for (let i = kopya.length - 1; i > 0; i--) {
    const j = Math.floor(rastgele() * (i + 1));
    [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
  }
  return kopya;
}

export type GolgeTuru = {
  /** Ustte, renkli haliyle duran nesne. */
  hedef: string;
  /** Alttaki golgeler; biri hedefin golgesidir. */
  golgeler: string[];
};

export function golgeTuruUret(sira: number): GolgeTuru {
  const guvenliSira = ((sira % SIMGELER.length) + SIMGELER.length) % SIMGELER.length;
  const hedef = SIMGELER[guvenliSira];
  const rastgele = tohumluSayi(guvenliSira + 1);
  const digerleri = karistir(
    SIMGELER.filter((simge) => simge !== hedef),
    rastgele,
  ).slice(0, GOLGE_SAYISI - 1);
  return { hedef, golgeler: karistir([hedef, ...digerleri], rastgele) };
}

export function golgeTurSayisi(): number {
  return SIMGELER.length;
}
