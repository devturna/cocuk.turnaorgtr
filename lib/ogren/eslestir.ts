// Eslestir oyununun mantigi: solda rakamlar, sagda nokta gruplari.
//
// Say ve Bul tek bir sayiyi yoklar; Eslestir DORT sayiyi yan yana koyar ve
// cocuk aralarindaki farki gormek zorunda kalir. Ucu birlikte ayni bilgiyi
// uc farkli isle yokluyor.
//
// Rastgelelik yok: tur numarasindan turetilir (sunucu/tarayici ayni
// ciziyor, test gercek turu olcuyor).
import { sayilabilirMiktarlar } from "./sayilar";

/** Bir turdaki cift sayisi. Dortten fazlasi kucuk ekranda sigmiyor. */
export const TURDAKI_CIFT = 4;

export type EslestirTuru = {
  /** Soldaki rakamlar, kucukten buyuge. */
  sol: number[];
  /** Sagdaki nokta gruplari; ayni sayilar, karisik sirada. */
  sag: number[];
};

function tohumluSayi(tohum: number): () => number {
  let durum = tohum * 1597334677 + 11;
  return () => {
    durum = (durum * 1103515245 + 12345) % 2147483648;
    return durum / 2147483648;
  };
}

/** Fisher-Yates; tohumlu oldugu icin sonuc her zaman ayni. */
function karistir<T>(dizi: T[], rastgele: () => number): T[] {
  const kopya = [...dizi];
  for (let i = kopya.length - 1; i > 0; i--) {
    const j = Math.floor(rastgele() * (i + 1));
    [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
  }
  return kopya;
}

/**
 * Turlar birden ona kadar butun sayilari kapsar.
 *
 * Son tur oncekiyle KISMEN CAKISIR (7-10): on sayi dorde tam bolunmuyor ve
 * iki ciftlik bir tur, dordune alismis cocuga yarim kalmis gorunurdu.
 * Cakisma tekrar demektir, tekrar da bu yasta kayip degil kazanctir.
 */
export function eslestirTuruUret(sira: number): EslestirTuru {
  const miktarlar = sayilabilirMiktarlar().map((sayi) => sayi.rakam);
  const turSayisi = eslestirTurSayisi();
  const guvenliSira = ((sira % turSayisi) + turSayisi) % turSayisi;
  const baslangic = Math.min(guvenliSira * TURDAKI_CIFT, miktarlar.length - TURDAKI_CIFT);
  const sol = miktarlar.slice(baslangic, baslangic + TURDAKI_CIFT);
  return { sol, sag: karistir(sol, tohumluSayi(guvenliSira + 1)) };
}

export function eslestirTurSayisi(): number {
  return Math.ceil(sayilabilirMiktarlar().length / TURDAKI_CIFT);
}
