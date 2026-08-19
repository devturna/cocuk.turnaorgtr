// Cocugun dizdigi blok listesi uzerindeki islemler.
//
// Butun fonksiyonlar yeni dizi dondurur, girdiyi degistirmez: React durumu
// dogrudan bu dizilerle guncellenir.
import type { Komut } from "./labirent/komutlar";

// Serit ekrana sigmali ve ekranda kaydirma olmamali. Ust sinirin gerekcesi
// docs/tasarim/kodlama.md icinde.
export const EN_FAZLA_BLOK = 20;

export function blokEkle(program: Komut[], komut: Komut, enFazla = EN_FAZLA_BLOK): Komut[] {
  if (program.length >= enFazla) return program;
  return [...program, komut];
}

export function blokSil(program: Komut[], sira: number): Komut[] {
  if (sira < 0 || sira >= program.length) return program;
  return program.filter((_, i) => i !== sira);
}

export function sonBlokuSil(program: Komut[]): Komut[] {
  return program.slice(0, -1);
}

export function blokTasi(program: Komut[], kaynak: number, hedef: number): Komut[] {
  if (kaynak < 0 || kaynak >= program.length) return program;
  if (hedef < 0 || hedef >= program.length) return program;
  const kalanlar = program.filter((_, i) => i !== kaynak);
  return [...kalanlar.slice(0, hedef), program[kaynak], ...kalanlar.slice(hedef)];
}

export function programiTemizle(): Komut[] {
  return [];
}
