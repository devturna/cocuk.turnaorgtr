// Kodlama bolumunun tek yerel kayit modulu: yildizlar, deneme sayaci, demo
// bayragi, karakter secimi ve bulmaca ilerlemesi hep burada tutulur. Bolumun
// geri kalaninda localStorage'a dokunulmaz; Boyama'daki lib/boyama/yerelKayit.ts
// ayni isi gorur, bu dosya onun kodlama tarafindaki kardesidir.

import { karakterBul, varsayilanKarakter, type Karakter } from "./karakterler";

const ANAHTAR = "kodla:ilerleme";
const DENEME_ANAHTARI = "kodla:denemeler";
const DEMO_ANAHTARI = "kodla:demo";
const KARAKTER_ANAHTARI = "kodla:karakter";
const BULMACA_ANAHTARI = "kodla:bulmaca";

export type YildizTuru = "yildiz" | "altin";

/** Bir bulmacada bu kadar denendikten sonra sonraki durak sessizce acilir. */
export const EN_FAZLA_DENEME = 5;

/**
 * Bir DURAKTA (bulmacalara dagilmis olarak) bu kadar denendikten sonra da
 * sonraki durak sessizce acilir.
 *
 * Neden ikinci bir esik: EN_FAZLA_DENEME bulmaca BASINA okunur ve bu, gercek
 * anlamda tek bir bulmacada takilan cocuk icin dogru olcumdur. Ama bir durak
 * artik dort bulmaca uzunlugunda olabiliyor; yalnizca bulmaca basina okumak,
 * her bulmacada dorder kez basarisiz olan cocugu (toplam on alti deneme)
 * hicbir zaman kacis kapisina ulastirmaz. Oysa kural "kimse bir durakta
 * mahsur kalmamali" der, "kimse bir bulmacada mahsur kalmamali" demez.
 *
 * Neden 10 (= 2 x EN_FAZLA_DENEME): bugunku en uzun durak dort bulmacalik.
 * Kesfeden, arada bir carpan bir cocuk bulmaca basina iki denemeyi bulur
 * (dort bulmacada sekiz) - bu esik onun altinda kalmaz, yani "oynadigi icin"
 * durak acilmaz. Onunu bulmasi ise artik oynamak degil, tikanmaktir.
 */
export const EN_FAZLA_TOPLAM_DENEME = 2 * EN_FAZLA_DENEME;

// Deger tipi bilerek `unknown`: bu dosyada dort ayri anahtar okunuyor ve
// sekilleri ayni degil (ilerleme ve denemeler ic ice nesne tutar, karakter
// secimi duz bir dizedir). Daraltmayi her erisimci kendi yapar; boylece
// tek bir "hepsine uyan" donus tipi uydurup sonra cift cast ile kirmak
// gerekmiyor.
function nesneOku(anahtar: string): Record<string, unknown> {
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
      return cozulmus as Record<string, unknown>;
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

export type DurakIlerlemesi = {
  /** Bu durakta bugune kadar cozulen bulmaca sayisi. */
  cozulen: number;
  /** Cozulenlerin HEPSI ideal adimda mi bitti: durak altin yildizi bunu ister. */
  hepsiIdeal: boolean;
};

function tumDurakIlerlemesi(): Record<string, Record<string, unknown>> {
  return nesneOku(BULMACA_ANAHTARI) as Record<string, Record<string, unknown>>;
}

export function durakIlerlemesi(kursId: string, bolumId: string): DurakIlerlemesi {
  const ham = tumDurakIlerlemesi()[kursId]?.[bolumId];
  // Hic oynanmamis durak "sifir cozuldu, hepsi ideal" sayilir: bos kume
  // uzerinde "hepsi" dogrudur ve ilk bulmaca ideal biterse altin yolu acik
  // kalir.
  if (!ham || typeof ham !== "object") return { cozulen: 0, hepsiIdeal: true };
  const girdi = ham as Record<string, unknown>;
  return {
    cozulen: typeof girdi.cozulen === "number" ? girdi.cozulen : 0,
    hepsiIdeal: girdi.hepsiIdeal !== false,
  };
}

export function bulmacaCozuldu(
  kursId: string,
  bolumId: string,
  idealMi: boolean,
): DurakIlerlemesi {
  const onceki = durakIlerlemesi(kursId, bolumId);
  const yeni: DurakIlerlemesi = {
    cozulen: onceki.cozulen + 1,
    hepsiIdeal: onceki.hepsiIdeal && idealMi,
  };
  const hepsi = tumDurakIlerlemesi();
  const kurs = hepsi[kursId] ?? {};
  nesneYaz(BULMACA_ANAHTARI, { ...hepsi, [kursId]: { ...kurs, [bolumId]: yeni } });
  return yeni;
}

/** Durak bastan oynanirken cagrilir: sayac ve altin sansi sifirlanir. */
export function durakIlerlemesiniSil(kursId: string, bolumId: string): void {
  const hepsi = tumDurakIlerlemesi();
  const kurs = { ...(hepsi[kursId] ?? {}) };
  delete kurs[bolumId];
  nesneYaz(BULMACA_ANAHTARI, { ...hepsi, [kursId]: kurs });
}

function tumDenemeler(): Record<string, Record<string, unknown>> {
  return nesneOku(DENEME_ANAHTARI) as Record<string, Record<string, unknown>>;
}

function durakDenemeleri(kursId: string, bolumId: string): Record<string, unknown> {
  const ham = tumDenemeler()[kursId]?.[bolumId];
  // Bir durak tek bulmaca tutarken bu deger duz bir sayiydi. O kayit ATILMAZ,
  // tasinir: eski cihazda deger yalnizca o duragin (tek) bulmacasini
  // sayiyordu, yani bugunku 0. bulmacanin sayacidir. Atmak zararsiz degil -
  // bes denemeyle sessizce acilmis bir durak, guncellemeden sonra yeniden
  // KILITLENIR ve takilan cocuk, yani kuralin korumak icin var oldugu cocuk,
  // sayaci sifirlanmis halde bastan mahsur kalir.
  if (typeof ham === "number") return { "0": ham };
  if (!ham || typeof ham !== "object") return {};
  return ham as Record<string, unknown>;
}

export function denemeSayisi(kursId: string, bolumId: string, bulmacaSirasi: number): number {
  const deger = durakDenemeleri(kursId, bolumId)[String(bulmacaSirasi)];
  return typeof deger === "number" ? deger : 0;
}

export function denemeArtir(kursId: string, bolumId: string, bulmacaSirasi: number): number {
  const hepsi = tumDenemeler();
  const kurs = hepsi[kursId] ?? {};
  const durak = durakDenemeleri(kursId, bolumId);
  const yeni = denemeSayisi(kursId, bolumId, bulmacaSirasi) + 1;
  nesneYaz(DENEME_ANAHTARI, {
    ...hepsi,
    [kursId]: { ...kurs, [bolumId]: { ...durak, [String(bulmacaSirasi)]: yeni } },
  });
  return yeni;
}

/**
 * Cocuk bu durakta takildi mi: ya TEK bir bulmacada EN_FAZLA_DENEME kadar,
 * ya da durak genelinde EN_FAZLA_TOPLAM_DENEME kadar denedi mi. Iki okuma
 * birlikte gerekli; gerekcesi iki sabitin yanindaki yorumlarda.
 */
export function durakTakildiMi(kursId: string, bolumId: string): boolean {
  const sayilar = Object.values(durakDenemeleri(kursId, bolumId)).filter(
    (deger) => typeof deger === "number",
  );
  if (sayilar.some((deger) => deger >= EN_FAZLA_DENEME)) return true;
  return sayilar.reduce((toplam, deger) => toplam + deger, 0) >= EN_FAZLA_TOPLAM_DENEME;
}

/**
 * Siradaki durak aciktir, sonrasi kilitlidir. Bir duragi (bkz.
 * durakTakildiMi: bir bulmacada EN_FAZLA_DENEME, ya da durak genelinde
 * EN_FAZLA_TOPLAM_DENEME deneme) gecemeyen cocuga sonraki durak sessizce
 * acilir: kimse bir durakta mahsur kalmamali.
 */
export function bolumAcikMi(kursId: string, bolumId: string, sirali: string[]): boolean {
  const sira = sirali.indexOf(bolumId);
  if (sira === -1) return false;
  if (sira === 0) return true;

  const onceki = sirali[sira - 1];
  if (bolumSonucu(kursId, onceki) !== undefined) return true;
  return durakTakildiMi(kursId, onceki);
}

export function ilerlemeyiSil(): void {
  try {
    localStorage.removeItem(ANAHTAR);
    localStorage.removeItem(DENEME_ANAHTARI);
    localStorage.removeItem(DEMO_ANAHTARI);
    localStorage.removeItem(KARAKTER_ANAHTARI);
    localStorage.removeItem(BULMACA_ANAHTARI);
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
  const deger = nesneOku(KARAKTER_ANAHTARI)[kursId];
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

/**
 * Goc haritasi acilirken "Kiminle ucalim?" sorulmali mi?
 *
 * Iki kural birlikte:
 *
 * 1. Kursta secilecek en az iki kus yoksa sorulmaz. Tek kusluk bir kursta
 *    kart ekrani cocugu bir secenek icin durdurmus olurdu.
 * 2. Kayitli secim, kursun BUGUNKU listesinde gercekten bulunmalidir.
 *    Yalnizca "kayit var mi" diye bakmak yetmez: katalogdan cikarilmis bir
 *    kusla kaydedilmis cocuk sessizce listedeki ilk kusla ucar ve bir daha
 *    hic sorulmaz (seciliKarakter varsayilana duser).
 */
export function secimSorulmaliMi(kursId: string, karakterler: Karakter[]): boolean {
  if (karakterler.length < 2) return false;
  const id = seciliKarakterId(kursId);
  return karakterler.every((karakter) => karakter.id !== id);
}
