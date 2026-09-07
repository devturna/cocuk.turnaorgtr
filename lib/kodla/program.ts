// Cocugun dizdigi blok listesi uzerindeki islemler.
//
// Butun fonksiyonlar yeni dizi dondurur, girdiyi degistirmez: React durumu
// dogrudan bu dizilerle guncellenir.
import type { Komut } from "./labirent/komutlar";

// Serit ekrana sigmali ve ekranda kaydirma olmamali. Ust sinirin gerekcesi
// docs/tasarim/kodlama.md icinde.
export const EN_FAZLA_BLOK = 20;

// Tekrar sayisi ikiden baslar: "bir kez tekrarla" cocuga dongunun ne ise
// yaradigini gostermez, sifir ve bir ise dongunun hic calismadigi bir tuzaktir.
// Gerekcesi docs/tasarim/kodlama-kapsam.md §6 icinde.
export const EN_AZ_KEZ = 2;
export const EN_FAZLA_KEZ = 5;

export type KomutBloku = { tur: "komut"; komut: Komut };

// Govde yalnizca komut tutar; ic ice dongu boylece DERLEME ZAMANINDA
// imkansiz olur, calisma zamaninda kontrol etmeye gerek kalmaz.
export type Blok = KomutBloku | { tur: "tekrar"; kez: number; govde: KomutBloku[] };

// Bir blogun program icindeki adresi: kacinci ust blok, ve kutu icindeyse
// govdenin kacinci blogu. Ust duzeydeki blok icin ic null'dir.
export type BlokYolu = { ust: number; ic: number | null };

export function komutBloku(komut: Komut): KomutBloku {
  return { tur: "komut", komut };
}

// Serit siniri da altin yildiz da BLOK sayar, adim degil: olcu seritte
// gozukenin kendisidir. Kutu kendisi bir blok, govdesi ayrica sayilir.
export function blokSayisi(program: Blok[]): number {
  return program.reduce(
    (toplam, blok) => toplam + (blok.tur === "tekrar" ? 1 + blok.govde.length : 1),
    0,
  );
}

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
