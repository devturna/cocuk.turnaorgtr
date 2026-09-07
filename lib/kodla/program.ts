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

export function blokEkle(
  program: Blok[],
  komut: Komut,
  enFazla = EN_FAZLA_BLOK,
  hedefKutu: number | null = null,
): Blok[] {
  if (blokSayisi(program) >= enFazla) return program;
  if (hedefKutu === null) return [...program, komutBloku(komut)];

  // Kutu acikken eklenen blok kutunun ICINE duser: "icine koymak" diye ayri
  // bir jest yok, cunku bu yasta surukleyip birakma calismiyor. Gerekcesi
  // docs/tasarim/kodlama-arayuz.md §5 icinde.
  if (hedefKutu < 0 || hedefKutu >= program.length) return program;
  const kutu = program[hedefKutu];
  if (kutu.tur !== "tekrar") return program;

  const govde = [...kutu.govde, komutBloku(komut)];
  return program.map((oge, i) => (i === hedefKutu ? { ...kutu, govde } : oge));
}

export function blokSil(program: Blok[], yol: BlokYolu): Blok[] {
  if (yol.ust < 0 || yol.ust >= program.length) return program;

  // Kutunun kendisi silinince govdesi de gider: seritte tek bir sey olarak
  // gorunur, tek bir sey olarak da yok olur.
  if (yol.ic === null) return program.filter((_, i) => i !== yol.ust);

  const blok = program[yol.ust];
  if (blok.tur !== "tekrar") return program;
  if (yol.ic < 0 || yol.ic >= blok.govde.length) return program;

  const govde = blok.govde.filter((_, i) => i !== yol.ic);
  return program.map((oge, i) => (i === yol.ust ? { ...blok, govde } : oge));
}

export function sonBlokuSil(program: Blok[]): Blok[] {
  const son = program.at(-1);
  if (son === undefined) return program;

  // Geri alma jesti SERITTE en sonda gorunen blogu siler; dolu bir kutu
  // sondaysa o blok kutunun kendisi degil, govdesinin son blogudur.
  if (son.tur === "tekrar" && son.govde.length > 0) {
    return blokSil(program, { ust: program.length - 1, ic: son.govde.length - 1 });
  }
  return program.slice(0, -1);
}

/** Yoldaki blok; adres programa uymuyorsa null. */
function bloktaBul(program: Blok[], yol: BlokYolu): Blok | null {
  if (yol.ust < 0 || yol.ust >= program.length) return null;
  const blok = program[yol.ust];
  if (yol.ic === null) return blok;
  if (blok.tur !== "tekrar") return null;
  if (yol.ic < 0 || yol.ic >= blok.govde.length) return null;
  return blok.govde[yol.ic];
}

/** Blogu yola yerlestirir; adres uymuyorsa null. */
function blokYerlestir(program: Blok[], yol: BlokYolu, blok: Blok): Blok[] | null {
  if (yol.ic === null) {
    if (yol.ust < 0 || yol.ust > program.length) return null;
    return [...program.slice(0, yol.ust), blok, ...program.slice(yol.ust)];
  }

  if (yol.ust < 0 || yol.ust >= program.length) return null;
  const kutu = program[yol.ust];
  if (kutu.tur !== "tekrar") return null;
  // Ic ice dongu yok kuralinin ikinci kilidi: govdeye yerlestirilen blok da
  // komut olmali, kutu olamaz.
  if (blok.tur !== "komut") return null;
  if (yol.ic < 0 || yol.ic > kutu.govde.length) return null;

  const govde = [...kutu.govde.slice(0, yol.ic), blok, ...kutu.govde.slice(yol.ic)];
  return program.map((oge, i) => (i === yol.ust ? { ...kutu, govde } : oge));
}

/**
 * Blogu kaynak yolundan hedef yoluna tasir.
 *
 * Adres sozlesmesi: `hedef`, kaynak SILINDIKTEN SONRAKI programa gore
 * okunur. Ileri yonde (kaynak hedeften once) tasirken bu, kaynagin
 * bosalttigi bosluk kadar bir KAYMA demektir — cagiran taraf hedefi bu
 * kaymayi hesaba katarak vermelidir, aksi halde hedef bir konum kayar.
 * Bu davranis BILEREK degistirilmiyor: bugun yayindaki surukleme jesti tam
 * boyle calisiyor ve mevcut testler onu pinliyor.
 *
 * Kutu baska bir kutunun icine giremez: tasinan blok "tekrar" turundeyse ve
 * hedef bir govde ici (`ic !== null`) ise tasima yapilmaz.
 */
export function blokTasi(program: Blok[], kaynak: BlokYolu, hedef: BlokYolu): Blok[] {
  const tasinan = bloktaBul(program, kaynak);
  if (tasinan === null) return program;

  // Ic ice dongu yok: kutu baska bir kutunun icine giremez.
  if (tasinan.tur === "tekrar" && hedef.ic !== null) return program;

  const kalanlar = blokSil(program, kaynak);
  return blokYerlestir(kalanlar, hedef, tasinan) ?? program;
}

export function programiTemizle(): Blok[] {
  return [];
}

export function tekrarEkle(program: Blok[], enFazla = EN_FAZLA_BLOK): Blok[] {
  if (blokSayisi(program) >= enFazla) return program;
  return [...program, { tur: "tekrar", kez: EN_AZ_KEZ, govde: [] }];
}

/**
 * Noktalara her dokunusta sayi bir artar, en fazladan sonra basa doner.
 *
 * Kutu her zaman UST DUZEYDEDIR (govde icinde tekrar olamaz), bu yuzden
 * adres olarak BlokYolu degil ciplak bir sira (ust) alir.
 */
export function kezDegistir(program: Blok[], ust: number): Blok[] {
  if (ust < 0 || ust >= program.length) return program;
  const blok = program[ust];
  if (blok.tur !== "tekrar") return program;

  const kez = blok.kez >= EN_FAZLA_KEZ ? EN_AZ_KEZ : blok.kez + 1;
  return program.map((oge, i) => (i === ust ? { ...blok, kez } : oge));
}
