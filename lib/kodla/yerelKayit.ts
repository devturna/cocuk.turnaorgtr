// Kodlama bolumunun tek yerel kayit modulu: yildizlar, deneme sayaci, demo
// bayragi ve karakter secimi hep burada tutulur. Bolumun geri kalaninda
// localStorage'a dokunulmaz; Boyama'daki lib/boyama/yerelKayit.ts ayni isi
// gorur, bu dosya onun kodlama tarafindaki kardesidir.

import { karakterBul, varsayilanKarakter, type Karakter } from "./karakterler";

const ANAHTAR = "kodla:ilerleme";
const DENEME_ANAHTARI = "kodla:denemeler";
const DEMO_ANAHTARI = "kodla:demo";
const KARAKTER_ANAHTARI = "kodla:karakter";

export type YildizTuru = "yildiz" | "altin";

/** Bir bolumde bu kadar denendikten sonra sonraki durak sessizce acilir. */
export const EN_FAZLA_DENEME = 5;

function nesneOku(anahtar: string): Record<string, Record<string, unknown>> {
  let ham: string | null;
  try {
    ham = localStorage.getItem(anahtar);
  } catch {
    return {};
  }
  if (ham === null) return {};

  try {
    const cozulmus = JSON.parse(ham);
    // Bozuk veya eski bir kayit oyunu kirmasin diye seklini dogruluyoruz.
    if (cozulmus && typeof cozulmus === "object" && !Array.isArray(cozulmus)) {
      return cozulmus as Record<string, Record<string, unknown>>;
    }
    return {};
  } catch {
    return {};
  }
}

function nesneYaz(anahtar: string, deger: unknown): void {
  try {
    localStorage.setItem(anahtar, JSON.stringify(deger));
  } catch {
    // Depolama dolu veya kapali olabilir. Kayit tutulmaz ama oyun surer.
  }
}

export function tumIlerleme(): Record<string, Record<string, YildizTuru>> {
  return nesneOku(ANAHTAR) as Record<string, Record<string, YildizTuru>>;
}

export function bolumSonucu(kursId: string, bolumId: string): YildizTuru | undefined {
  return tumIlerleme()[kursId]?.[bolumId];
}

export function bolumSonucuKaydet(kursId: string, bolumId: string, tur: YildizTuru): void {
  const ilerleme = tumIlerleme();
  const kurs = ilerleme[kursId] ?? {};
  // Bir kez kazanilan altin yildiz geri alinmaz.
  if (kurs[bolumId] === "altin") return;
  nesneYaz(ANAHTAR, { ...ilerleme, [kursId]: { ...kurs, [bolumId]: tur } });
}

export function kursYildizSayisi(kursId: string): number {
  return Object.keys(tumIlerleme()[kursId] ?? {}).length;
}

function tumDenemeler(): Record<string, Record<string, number>> {
  return nesneOku(DENEME_ANAHTARI) as Record<string, Record<string, number>>;
}

export function denemeSayisi(kursId: string, bolumId: string): number {
  const deger = tumDenemeler()[kursId]?.[bolumId];
  return typeof deger === "number" ? deger : 0;
}

export function denemeArtir(kursId: string, bolumId: string): number {
  const denemeler = tumDenemeler();
  const kurs = denemeler[kursId] ?? {};
  const yeni = denemeSayisi(kursId, bolumId) + 1;
  nesneYaz(DENEME_ANAHTARI, { ...denemeler, [kursId]: { ...kurs, [bolumId]: yeni } });
  return yeni;
}

/**
 * Siradaki durak aciktir, sonrasi kilitlidir. Bir bolumde EN_FAZLA_DENEME
 * kadar denedigi halde gecemeyen cocuga sonraki durak sessizce acilir:
 * kimse bir bolumde mahsur kalmamali.
 */
export function bolumAcikMi(kursId: string, bolumId: string, sirali: string[]): boolean {
  const sira = sirali.indexOf(bolumId);
  if (sira === -1) return false;
  if (sira === 0) return true;

  const onceki = sirali[sira - 1];
  if (bolumSonucu(kursId, onceki) !== undefined) return true;
  return denemeSayisi(kursId, onceki) >= EN_FAZLA_DENEME;
}

export function ilerlemeyiSil(): void {
  try {
    localStorage.removeItem(ANAHTAR);
    localStorage.removeItem(DENEME_ANAHTARI);
    localStorage.removeItem(DEMO_ANAHTARI);
    localStorage.removeItem(KARAKTER_ANAHTARI);
  } catch {
    // Yok sayilir.
  }
}

/**
 * Sessiz demo bir kez oynatilir. Bayrak burada duruyor cunku localStorage'a
 * yalnizca bu dosya dokunur.
 */
export function demoGosterildiMi(): boolean {
  try {
    return localStorage.getItem(DEMO_ANAHTARI) === "evet";
  } catch {
    return false;
  }
}

export function demoGosterildi(): void {
  try {
    localStorage.setItem(DEMO_ANAHTARI, "evet");
  } catch {
    // Depolama kapali olabilir; demo her acilista oynar, oyun surer.
  }
}

/** Kurs basina secilen karakterin kimligi. */
export function seciliKarakterId(kursId: string): string | undefined {
  const secimler = nesneOku(KARAKTER_ANAHTARI) as unknown as Record<string, unknown>;
  const deger = secimler[kursId];
  return typeof deger === "string" ? deger : undefined;
}

export function karakterSec(kursId: string, karakterId: string): void {
  const secimler = nesneOku(KARAKTER_ANAHTARI);
  nesneYaz(KARAKTER_ANAHTARI, { ...secimler, [kursId]: karakterId });
}

/**
 * Ekranda gosterilecek karakter.
 *
 * Secim yoksa, katalogda bulunmayan bir secim varsa (eski kayit ya da elle
 * bozulmus veri) varsayilana duser: oyun her halukarda bir kusla acilir.
 */
export function seciliKarakter(kursId: string): Karakter | undefined {
  const id = seciliKarakterId(kursId);
  return (id ? karakterBul(kursId, id) : undefined) ?? varsayilanKarakter(kursId);
}
