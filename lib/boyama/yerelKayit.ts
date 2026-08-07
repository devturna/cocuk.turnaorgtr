// Yarim kalan cizimleri tarayicida saklar.
// Buradaki hicbir veri cihazdan disari cikmaz; sunucuya gonderilmez.
import type { BoyamaDurumu } from "./durum";

const ONEK = "boyama:";

function anahtar(resimId: string): string {
  return ONEK + resimId;
}

export function durumuKaydet(resimId: string, durum: BoyamaDurumu): void {
  try {
    localStorage.setItem(anahtar(resimId), JSON.stringify(durum));
  } catch {
    // Depolama dolu veya kapali olabilir. Cizim kaydedilmez ama uygulama calismaya devam eder.
  }
}

export function durumuYukle(resimId: string): BoyamaDurumu | null {
  let ham: string | null;
  try {
    ham = localStorage.getItem(anahtar(resimId));
  } catch {
    return null;
  }
  if (ham === null) return null;

  try {
    const cozulmus = JSON.parse(ham);
    // Eski veya bozuk kayitlar cizimi kirmasin diye seklini dogruluyoruz.
    if (
      cozulmus &&
      typeof cozulmus === "object" &&
      typeof cozulmus.dolgular === "object" &&
      cozulmus.dolgular !== null &&
      Array.isArray(cozulmus.fircaCizgileri)
    ) {
      return cozulmus as BoyamaDurumu;
    }
    return null;
  } catch {
    return null;
  }
}

export function durumuSil(resimId: string): void {
  try {
    localStorage.removeItem(anahtar(resimId));
  } catch {
    // Yok sayilir.
  }
}

/** Cocugun daha once baslamis oldugu resimlerin kimlikleri. Galeride isaret gostermek icin. */
export function baslanmisResimler(): string[] {
  const kimlikler: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const anahtarAdi = localStorage.key(i);
      if (anahtarAdi && anahtarAdi.startsWith(ONEK)) {
        kimlikler.push(anahtarAdi.slice(ONEK.length));
      }
    }
  } catch {
    return [];
  }
  return kimlikler;
}
