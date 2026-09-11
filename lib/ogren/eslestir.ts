// Eslestir oyununun mantigi: solda rakamlar, sagda nokta gruplari.
//
// Say ve Bul tek bir sayiyi yoklar; Eslestir DORT sayiyi yan yana koyar ve
// cocuk aralarindaki farki gormek zorunda kalir. Ucu birlikte ayni bilgiyi
// uc farkli isle yokluyor.
//
// Rastgelelik yok: tur numarasindan turetilir (sunucu/tarayici ayni
// ciziyor, test gercek turu olcuyor).
import { HARFLER } from "./harfler";
import { sayilabilirMiktarlar } from "./sayilar";

/** Bir turdaki cift sayisi. Dortten fazlasi kucuk ekranda sigmiyor. */
export const TURDAKI_CIFT = 4;

export type EslestirTuru = {
  /** Soldaki rakamlar, kucukten buyuge. */
  sol: number[];
  /** Sagdaki nokta gruplari; ayni sayilar, karisik sirada. */
  sag: number[];
};

/**
 * Harf turu: solda buyuk harfler, sagda kucukleri karisik sirada.
 *
 * Sayi turuyle ayni fikir, ayni tur uzunlugu; degisen yalnizca eslesen
 * seyler. Turkce'de "I".toLowerCase() yanlis sonuc verdigi icin kucuk
 * harfler HARFLER listesinden okunur, cevrilerek uretilmez.
 */
export type EslestirHarfTuru = {
  sol: string[];
  sag: string[];
};

export function eslestirHarfTuruUret(sira: number): EslestirHarfTuru {
  const turSayisi = eslestirHarfTurSayisi();
  const guvenliSira = ((sira % turSayisi) + turSayisi) % turSayisi;
  const baslangic = Math.min(guvenliSira * TURDAKI_CIFT, HARFLER.length - TURDAKI_CIFT);
  const sol = HARFLER.slice(baslangic, baslangic + TURDAKI_CIFT);
  const sag = karistir(sol, tohumluSayi(guvenliSira + 51));
  return {
    sol: sol.map((harf) => harf.buyuk),
    sag: sag.map((harf) => harf.kucuk),
  };
}

export function eslestirHarfTurSayisi(): number {
  return Math.ceil(HARFLER.length / TURDAKI_CIFT);
}

/** Buyuk harfin kucugu; liste disi harf icin null. */
export function kucugu(buyuk: string): string | null {
  return HARFLER.find((harf) => harf.buyuk === buyuk)?.kucuk ?? null;
}

function tohumluSayi(tohum: number): () => number {
  let durum = tohum * 1597334677 + 11;
  return () => {
    durum = (durum * 1103515245 + 12345) % 2147483648;
    return durum / 2147483648;
  };
}

/** Fisher-Yates; tohumlu oldugu icin sonuc her zaman ayni. */
function karistirTek<T>(dizi: T[], rastgele: () => number): T[] {
  const kopya = [...dizi];
  for (let i = kopya.length - 1; i > 0; i--) {
    const j = Math.floor(rastgele() * (i + 1));
    [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
  }
  return kopya;
}

/**
 * Karistirir ve sonucun GIRDIYLE AYNI olmamasini garanti eder.
 *
 * Tohumlu karistirma bazen birim permutasyon uretiyor (harf turlarinin
 * sonuncusunda oluyordu): sag sutun sol sutunla ayni sirada dizilince
 * cocuk harflere hic bakmadan satir satir eslestirip turu bitiriyor, oyun
 * o turda hicbir sey ogretmiyordu. Ayni durumda son iki oge yer degistirir.
 */
function karistir<T>(dizi: T[], rastgele: () => number): T[] {
  const karisik = karistirTek(dizi, rastgele);
  if (dizi.length < 2) return karisik;
  const ayniMi = karisik.every((oge, sira) => oge === dizi[sira]);
  if (!ayniMi) return karisik;
  const son = karisik.length - 1;
  [karisik[son - 1], karisik[son]] = [karisik[son], karisik[son - 1]];
  return karisik;
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
