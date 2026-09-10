// Kurslarin bolum icerigi.
//
// Her kursun bolumleri kendi JSON dosyasindadir; yeni bir yas grubu eklemek
// buraya bir satir eklemektir.
import turnaYolu from "@/content/kodla/turna-yolu.json";
import { haritayiCoz, type Harita } from "./labirent/harita";
import { anahtarKomutu, type KomutSeti, type Yon } from "./labirent/komutlar";
import { komutBloku, type Blok, type KomutBloku } from "./program";

/**
 * Bulmacanin kucak (tekrar kutusu) asamasi: cocugun elinde HANGI ARACLAR var.
 *
 * Uc asama ust uste biner (docs/tasarim/kodlama-arayuz.md §5):
 *   hazir   — kucak seritte hazir bekler (baslangicProgrami ile konur),
 *             cocuk yalnizca icini doldurur; ne katlama onerisi ne palet
 *             kutusu vardir.
 *   oneri   — serit bos baslar; cocuk ayni komutu ust uste yazinca altta
 *             katlama onerisi belirir.
 *   serbest — onerinin ustune palet kutu dugmesi de gelir; cocuk kutuyu
 *             kendi koyar, sayiyi noktalarla bulur.
 *
 * "serbest" asamasi "oneri"nin gosterdigi her seyi de gosterir.
 */
export type Kucak = { asama: "hazir" | "oneri" | "serbest" };

/**
 * Icerikte yazilan hazir blok: ya komut anahtari ("git:sag") ya da bir
 * kucak. Kucagin govdesi yalnizca komut tutar -- ic ice dongu yok kurali
 * icerik semasinda da gecerli.
 */
export type BaslangicBloku = string | { kez: number; govde: string[] };

export type BulmacaVerisi = {
  komutSeti: KomutSeti;
  idealAdim: number;
  harita: { bakis: Yon; satirlar: string[] };
  // Kucagin VARLIGI "bu bir dongu bulmacasi" demektir: idealAdim "en kisa
  // cozumun BLOK sayisi" olur ve denetim dongulu cozumu arar; alan yokken
  // idealAdim duz adim sayisidir. Tek alan olmasi, dongu gerektiren ama
  // kucagi olmayan (yani cozulemeyen) bir bulmacayi temsil edilemez kilar.
  kucak?: Kucak;
  /**
   * Bulmaca acildiginda seritte NE DURUYOR.
   *
   * Iki isi birden gorur: dongu duraklarinda hazir kucagi koyar
   * (`[{ "kez": 3, "govde": [] }]`), hata ayiklama duraklarinda BOZUK bir
   * program verir ve cocuk onu duzeltir. Ikisi tek mekanizma cunku ikisi
   * ayni sey: "serit bos baslamiyor".
   */
  baslangicProgrami?: BaslangicBloku[];
  // Seridin aldigi blok sayisi. Yoksa EN_FAZLA_BLOK gecerlidir. Atil bir
  // belge alani DEGIL: BolumEkrani.tsx blokEklendi bu degeri gercekten
  // blokEkle'ye gecirir, serit siniri buradan okunur.
  enFazlaBlok?: number;
};

export type BolumVerisi = {
  id: string;
  ad: string;
  mekanik: "labirent";
  tema: string;
  durak: { x: number; y: number };
  ipucu: string;
  bulmacalar: BulmacaVerisi[];
};

const KURS_BOLUMLERI: Record<string, BolumVerisi[]> = {
  "turna-yolu": turnaYolu as BolumVerisi[],
};

export function kursBolumleri(kursId: string): BolumVerisi[] {
  return KURS_BOLUMLERI[kursId] ?? [];
}

export function bolumBul(kursId: string, bolumId: string): BolumVerisi | undefined {
  return kursBolumleri(kursId).find((bolum) => bolum.id === bolumId);
}

/** Bolum kimlikleri icerik dosyasindaki sirayla; kilit kurali bunu kullanir. */
export function bolumSiralamasi(kursId: string): string[] {
  return kursBolumleri(kursId).map((bolum) => bolum.id);
}

export function bulmacaSayisi(bolum: BolumVerisi): number {
  return bolum.bulmacalar.length;
}

/** Sira disina cikan istek undefined doner; cagiran yeri kendi karar verir. */
export function bulmacaBul(bolum: BolumVerisi, sira: number): BulmacaVerisi | undefined {
  if (sira < 0 || sira >= bolum.bulmacalar.length) return undefined;
  return bolum.bulmacalar[sira];
}

export function bulmacaHaritasi(bulmaca: BulmacaVerisi): Harita {
  return haritayiCoz(bulmaca.harita.satirlar, bulmaca.harita.bakis);
}

/** Icerikteki komut anahtarini bloga cevirir; anahtar bilinmiyorsa null. */
function anahtarBloku(anahtar: string): KomutBloku | null {
  const komut = anahtarKomutu(anahtar);
  return komut === null ? null : komutBloku(komut);
}

/**
 * Bulmaca acildiginda seritte duran program.
 *
 * Icerikteki kisa yazimi (komut anahtarlari ve kucaklar) motorun Blok
 * agacina cevirir. Tanimadigi anahtari SESSIZCE ATLAR: "npm run kontrol"
 * boyle bir anahtari zaten reddeder, calisma zamaninda cokmek yerine
 * eksik bir program gostermek daha guvenlidir.
 */
export function baslangicProgrami(bulmaca: BulmacaVerisi): Blok[] {
  const bloklar: Blok[] = [];
  for (const oge of bulmaca.baslangicProgrami ?? []) {
    if (typeof oge === "string") {
      const blok = anahtarBloku(oge);
      if (blok !== null) bloklar.push(blok);
      continue;
    }
    const govde = oge.govde.map(anahtarBloku).filter((blok) => blok !== null);
    bloklar.push({ tur: "tekrar", kez: oge.kez, govde });
  }
  return bloklar;
}
