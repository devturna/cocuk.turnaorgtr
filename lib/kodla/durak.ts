// Bir durakta sirada ne oldugunun karari. React'tan bagimsiz: durak akisi
// tarayici acilmadan test edilir. BolumEkrani yalnizca burada verilen karari
// oynatir.
import type { YildizTuru } from "./yerelKayit";

export type DurakAdimi =
  | { tur: "bulmaca"; sira: number }
  | { tur: "bitti"; yildiz: YildizTuru };

/**
 * Duraga girildiginde kacinci bulmaca acilir.
 *
 * Bitmis bir durak bastan baslar: cocuk tekrar oynamak istedigi icin
 * girmistir, son bulmacayi bir daha gostermek istemez.
 */
export function baslangicBulmacasi(cozulen: number, toplam: number): number {
  if (cozulen <= 0 || cozulen >= toplam) return 0;
  return cozulen;
}

/** Bir bulmaca kazanildiktan sonra durakta ne olur. */
export function bulmacaSonrasi(
  sira: number,
  toplam: number,
  hepsiIdeal: boolean,
): DurakAdimi {
  const sonraki = sira + 1;
  if (sonraki < toplam) return { tur: "bulmaca", sira: sonraki };
  return { tur: "bitti", yildiz: hepsiIdeal ? "altin" : "yildiz" };
}
