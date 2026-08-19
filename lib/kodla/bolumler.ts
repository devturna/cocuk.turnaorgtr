// Kurslarin bolum icerigi.
//
// Her kursun bolumleri kendi JSON dosyasindadir; yeni bir yas grubu eklemek
// buraya bir satir eklemektir.
import turnaYolu from "@/content/kodla/turna-yolu.json";
import { haritayiCoz, type Harita } from "./labirent/harita";
import type { KomutSeti, Yon } from "./labirent/komutlar";

export type BolumVerisi = {
  id: string;
  ad: string;
  mekanik: "labirent";
  komutSeti: KomutSeti;
  tema: string;
  durak: { x: number; y: number };
  idealAdim: number;
  ipucu: string;
  harita: { bakis: Yon; satirlar: string[] };
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

export function bolumHaritasi(bolum: BolumVerisi): Harita {
  return haritayiCoz(bolum.harita.satirlar, bolum.harita.bakis);
}
