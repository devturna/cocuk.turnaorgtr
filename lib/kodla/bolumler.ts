// Kurslarin bolum icerigi.
//
// Her kursun bolumleri kendi JSON dosyasindadir; yeni bir yas grubu eklemek
// buraya bir satir eklemektir.
import turnaYolu from "@/content/kodla/turna-yolu.json";
import { haritayiCoz, type Harita } from "./labirent/harita";
import type { KomutSeti, Yon } from "./labirent/komutlar";

export type BulmacaVerisi = {
  komutSeti: KomutSeti;
  idealAdim: number;
  harita: { bakis: Yon; satirlar: string[] };
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
