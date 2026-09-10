// Kurslarin bolum icerigi.
//
// Her kursun bolumleri kendi JSON dosyasindadir; yeni bir yas grubu eklemek
// buraya bir satir eklemektir.
import turnaYolu from "@/content/kodla/turna-yolu.json";
import { haritayiCoz, type Harita } from "./labirent/harita";
import type { KomutSeti, Yon } from "./labirent/komutlar";

/**
 * Bulmacanin kucak (tekrar kutusu) asamasi.
 *
 * Uc asama ust uste biner (docs/tasarim/kodlama-arayuz.md §5):
 *   hazir   — kucak dolu sayiyla ekranda hazir gelir, cocuk icini doldurur.
 *   oneri   — serit bos baslar; cocuk ayni komutu ust uste yazinca altta
 *             katlama onerisi belirir.
 *   serbest — onerinin ustune palet kutu dugmesi de gelir; cocuk kutuyu
 *             kendi koyar, sayiyi noktalarla bulur.
 *
 * "serbest" asamasi "oneri"nin gosterdigi her seyi de gosterir.
 */
export type Kucak =
  | { asama: "hazir"; kez: number }
  | { asama: "oneri" }
  | { asama: "serbest" };

export type BulmacaVerisi = {
  komutSeti: KomutSeti;
  idealAdim: number;
  harita: { bakis: Yon; satirlar: string[] };
  // Kucagin VARLIGI "bu bir dongu bulmacasi" demektir: idealAdim "en kisa
  // cozumun BLOK sayisi" olur ve denetim dongulu cozumu arar; alan yokken
  // idealAdim duz adim sayisidir. Tek alan olmasi, dongu gerektiren ama
  // kucagi olmayan (yani cozulemeyen) bir bulmacayi temsil edilemez kilar.
  kucak?: Kucak;
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
