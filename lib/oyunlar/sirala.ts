// Sirala oyununun mantigi: uc nesne, kucukten buyuge dizilecek.
//
// Diger iki oyundan farki, cocugun SIRA kurmasi: hafizada esleme, golgede
// tanima var; burada karsilastirma var. Ucu birlikte bolumun "ogretmeyen
// ama bos da olmayan" cizgisini koruyor.
//
// Rastgelelik yok: her tur numarasindan turetilir.

/** Turdaki nesne sayisi. Uc, bu yasta karsilastirmanin sindigi en buyuk sayi. */
export const TURDAKI_NESNE = 3;

export type SiralaOgesi = {
  /** Ekrandaki simge. */
  simge: string;
  /** Boy: 1 en kucuk, 3 en buyuk. Dogru sira budur. */
  boy: number;
};

const SIMGELER = ["🌸", "🐟", "⭐", "🍀", "🐞", "🎈", "🌰", "🐚", "🍋", "🦋"];

function tohumluSayi(tohum: number): () => number {
  let durum = tohum * 2246822507 + 29;
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

/**
 * Turun ogeleri, EKRANDA duracaklari sirayla.
 *
 * Ayni simgenin uc boyu kullaniliyor: farkli nesneler olsaydi cocuk
 * "hangisi gercekte buyuk" (fil mi kelebek mi) diye baska bir soruya
 * duserdi. Burada sorulan tek sey EKRANDAKI buyukluk.
 */
export function siralaTuruUret(sira: number): SiralaOgesi[] {
  const guvenliSira = ((sira % SIMGELER.length) + SIMGELER.length) % SIMGELER.length;
  const simge = SIMGELER[guvenliSira];
  const boylar = karistir([1, 2, 3], tohumluSayi(guvenliSira + 1));
  return boylar.map((boy) => ({ simge, boy }));
}

export function siralaTurSayisi(): number {
  return SIMGELER.length;
}

/** Secilen boylar dogru sirada mi (kucukten buyuge, eksiksiz). */
export function siraDogruMu(secilenler: number[]): boolean {
  if (secilenler.length !== TURDAKI_NESNE) return false;
  return secilenler.every((boy, sira) => boy === sira + 1);
}

/** Su ana kadarki secim dogru yolda mi: her secim bir oncekinden buyuk olmali. */
export function secimGecerliMi(secilenler: number[], yeni: number): boolean {
  return yeni === secilenler.length + 1;
}
