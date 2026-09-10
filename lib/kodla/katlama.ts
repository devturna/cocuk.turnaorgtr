// Cocugun yazdigi tekrari tek kucaga katlama onerisi.
//
// Dongu ogretmenin ikinci asamasi (docs/tasarim/kodlama-arayuz.md §5):
// cocuk ayni komutu ust uste yazdiginda seridin altinda usulca bir oneri
// belirir, dokunursa bloklar tek kucaga katlanir. Ogrenilen sey dongunun ne
// oldugu degil NE ISE YARADIGI, ve cocuk bunu kendi yazdigi tekrar
// uzerinden ogrenir.
//
// Burasi React bilmez: oneriyi bulmak ve uygulamak saf iki fonksiyondur.
import { komutAnahtari } from "./labirent/komutlar";
import { EN_FAZLA_KEZ, komutBloku, type Blok } from "./program";

/** Katlanacak dizinin ust duzeydeki baslangici, uzunlugu ve kutunun kez degeri. */
export type KatlamaOnerisi = { ust: number; uzunluk: number; kez: number };

// Iki blok katlamak hicbir sey kazandirmaz: kutu (1) + govde (1) yine iki
// bloktur. Uc blok, kazanc getiren en kisa dizidir.
const EN_KISA_DIZI = 3;

/**
 * Katlanabilecek dizi varsa onerir, yoksa null.
 *
 * Yalnizca UST DUZEYDEKI ardisik ayni komutlara bakar: kutunun icini
 * onermek ic ice dongu demek olurdu, kutunun kendisi de diziyi boler.
 * Birden fazla dizi varsa SONUNCUSU onerilir -- cocugun az once yazdigi
 * odur, oneri de onun uzerine gelmelidir.
 */
export function katlamaOnerisi(program: Blok[]): KatlamaOnerisi | null {
  let oneri: KatlamaOnerisi | null = null;

  let dizininBasi = 0;
  while (dizininBasi < program.length) {
    const blok = program[dizininBasi];
    if (blok.tur !== "komut") {
      dizininBasi++;
      continue;
    }

    const anahtar = komutAnahtari(blok.komut);
    let son = dizininBasi + 1;
    while (son < program.length) {
      const sonraki = program[son];
      if (sonraki.tur !== "komut" || komutAnahtari(sonraki.komut) !== anahtar) break;
      son++;
    }

    const uzunluk = Math.min(son - dizininBasi, EN_FAZLA_KEZ);
    if (uzunluk >= EN_KISA_DIZI) oneri = { ust: dizininBasi, uzunluk, kez: uzunluk };
    dizininBasi = son;
  }

  return oneri;
}

/**
 * Oneriyi uygular: dizinin yerine tek bir kucak koyar.
 *
 * Dizi EN_FAZLA_KEZ'den uzunsa artan bloklar kucagin ARKASINDA duz kalir;
 * yurunen yol degismez, yalnizca yazilan kisalir.
 */
export function katla(program: Blok[], oneri: KatlamaOnerisi): Blok[] {
  const ilk = program[oneri.ust];
  if (ilk === undefined || ilk.tur !== "komut") return program;

  return [
    ...program.slice(0, oneri.ust),
    { tur: "tekrar", kez: oneri.kez, govde: [komutBloku(ilk.komut)] },
    ...program.slice(oneri.ust + oneri.uzunluk),
  ];
}
