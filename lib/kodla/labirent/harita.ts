// Bolum haritasi metin satirlari olarak yazilir; bu dosya onu yapiya cevirir.
//
// Metin secildi cunku bolum ekleyen kisi haritayi gozuyle gorebilsin:
//   ".T.oH"
// Gerekcesi docs/tasarim/kodlama.md icinde.
import type { Yon } from "./komutlar";

export type Kare = { x: number; y: number };

export type Harita = {
  genislik: number;
  yukseklik: number;
  engeller: Kare[];
  basaklar: Kare[];
  baslangic: Kare;
  hedef: Kare;
  bakis: Yon;
};

const BOS = ".";
const ENGEL = "#";
const BASLANGIC = "T";
const HEDEF = "H";
const BASAK = "o";

export function haritayiCoz(satirlar: string[], bakis: Yon): Harita {
  if (satirlar.length === 0) {
    throw new Error("Harita en az bir satir icermeli.");
  }

  const genislik = satirlar[0].length;
  for (const satir of satirlar) {
    if (satir.length !== genislik) {
      throw new Error("Harita satirlari esit uzunlukta olmali.");
    }
  }

  const engeller: Kare[] = [];
  const basaklar: Kare[] = [];
  let baslangic: Kare | null = null;
  let hedef: Kare | null = null;

  for (let y = 0; y < satirlar.length; y++) {
    for (let x = 0; x < genislik; x++) {
      const isaret = satirlar[y][x];
      if (isaret === BOS) continue;
      if (isaret === ENGEL) {
        engeller.push({ x, y });
      } else if (isaret === BASAK) {
        basaklar.push({ x, y });
      } else if (isaret === BASLANGIC) {
        if (baslangic) throw new Error('Haritada tam bir "T" olmali.');
        baslangic = { x, y };
      } else if (isaret === HEDEF) {
        if (hedef) throw new Error('Haritada tam bir "H" olmali.');
        hedef = { x, y };
      } else {
        throw new Error(`Haritada bilinmeyen isaret "${isaret}".`);
      }
    }
  }

  if (!baslangic) throw new Error('Haritada tam bir "T" olmali.');
  if (!hedef) throw new Error('Haritada tam bir "H" olmali.');

  return { genislik, yukseklik: satirlar.length, engeller, basaklar, baslangic, hedef, bakis };
}

export function kareAnahtari(kare: Kare): string {
  return `${kare.x},${kare.y}`;
}

export function kareEsit(a: Kare, b: Kare): boolean {
  return a.x === b.x && a.y === b.y;
}

export function engelMi(harita: Harita, kare: Kare): boolean {
  return harita.engeller.some((engel) => kareEsit(engel, kare));
}

export function haritaDisiMi(harita: Harita, kare: Kare): boolean {
  return kare.x < 0 || kare.y < 0 || kare.x >= harita.genislik || kare.y >= harita.yukseklik;
}
