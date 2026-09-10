// Say oyununun mantigi: kac nesne cizilecek, nerede duracaklar ve soruya
// hangi secenekler sunulacak.
//
// React bilmez ve rastgelelik TASIMAZ: her tur, tur numarasindan
// turetilir. Bunun iki sebebi var. Birincisi sunucuda uretilen HTML ile
// tarayicidaki ilk cizimin ayni olmasi (Math.random ikisini ayirirdi).
// Ikincisi testin gercek yerlesimi olcebilmesi.

import { sayilabilirMiktarlar, type Sayi } from "./sayilar";

/** Nesnenin sahnedeki yeri; yuzde olarak. */
export type Yerlesim = { x: number; y: number };

export type Tur = {
  /** Kac nesne var. Sorunun cevabi budur. */
  miktar: number;
  /** Nesnelerin cizildigi simge. */
  simge: string;
  yerlesimler: Yerlesim[];
  /** Soruda sunulan uc rakam; kucukten buyuge. */
  secenekler: number[];
};

// Nesneler tur basina degisir: ayni sey on kez sayilinca cocuk sayiyi
// degil resmi hatirlar.
const SIMGELER = ["🍎", "🦆", "🌼", "🐟", "⭐", "🍒", "🐞", "🥕", "🐝", "🍋"];

// Basit, deterministik bir sozde-rastgele: ayni tohum ayni diziyi verir.
// Kutuphane eklemeye degmez, tek ihtiyac "dagilmis ama sabit" sayilar.
function tohumluSayi(tohum: number): () => number {
  let durum = tohum * 2654435761 + 1;
  return () => {
    durum = (durum * 1103515245 + 12345) % 2147483648;
    return durum / 2147483648;
  };
}

/**
 * Nesneleri catisdirmadan yerlestirir.
 *
 * Izgaraya oturtup her hucrede biraz kaydiriyoruz: duz izgara "sayilacak
 * nesne" degil "tablo" gibi gorunuyordu, tamamen rastgele yerlestirmede
 * ise nesneler ust uste biniyor ve dokunma hedefi kayboluyordu.
 */
export function yerlesimUret(miktar: number, tohum: number): Yerlesim[] {
  const rastgele = tohumluSayi(tohum);
  const sutun = Math.ceil(Math.sqrt(miktar));
  const satir = Math.ceil(miktar / sutun);
  const yerlesimler: Yerlesim[] = [];

  // Kayma hucre araliginin CEYREGINI gecmez: daha buyugu komsu iki nesneyi
  // dokunma hedefi kalmayacak kadar yaklastiriyordu.
  const araX = 76 / sutun;
  const araY = 76 / satir;

  for (let sira = 0; sira < miktar; sira++) {
    const s = sira % sutun;
    const y = Math.floor(sira / sutun);
    // Hucre merkezleri; kenarlarda %12'lik guvenli bosluk kaliyor.
    const merkezX = 12 + (s + 0.5) * araX;
    const merkezY = 12 + (y + 0.5) * araY;
    const kaymaX = (rastgele() - 0.5) * araX * 0.5;
    const kaymaY = (rastgele() - 0.5) * araY * 0.5;
    yerlesimler.push({
      x: Math.min(92, Math.max(8, merkezX + kaymaX)),
      y: Math.min(92, Math.max(8, merkezY + kaymaY)),
    });
  }

  return yerlesimler;
}

/**
 * Soruda sunulacak uc rakam. Dogru cevap her zaman icindedir; digerleri
 * ona YAKIN sayilardir -- 3 ile 9 arasindaki secim sayma degil tahmin
 * olurdu.
 */
export function secenekUret(dogru: number, tohum: number): number[] {
  const rastgele = tohumluSayi(tohum + 7);
  const adaylar = [dogru - 2, dogru - 1, dogru + 1, dogru + 2].filter(
    (sayi) => sayi >= 1 && sayi <= 10 && sayi !== dogru,
  );

  const secilenler = new Set<number>([dogru]);
  while (secilenler.size < 3 && adaylar.length > 0) {
    const sira = Math.floor(rastgele() * adaylar.length);
    secilenler.add(adaylar.splice(sira, 1)[0]);
  }

  return [...secilenler].sort((a, b) => a - b);
}

/** Sirasi verilen turu kurar. Sira 0'dan baslar. */
export function turUret(sira: number): Tur {
  const miktarlar = sayilabilirMiktarlar();
  const sayi: Sayi = miktarlar[sira % miktarlar.length];
  return {
    miktar: sayi.rakam,
    simge: SIMGELER[sira % SIMGELER.length],
    yerlesimler: yerlesimUret(sayi.rakam, sira + 1),
    secenekler: secenekUret(sayi.rakam, sira + 1),
  };
}

/** Kac tur var: her sayilabilir miktar icin bir tur. */
export function turSayisi(): number {
  return sayilabilirMiktarlar().length;
}
