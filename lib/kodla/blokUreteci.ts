// Belirli sayida blok tutan BUTUN programlari ureten yardimci.
//
// Iki cozucu de bunu kullanir: labirentte "kus hedefe varir mi", cizimde
// "desen tamamlanir mi" diye. Ikisi ayni program uzayini tarar, yalnizca
// degerlendirmeleri farklidir.
//
// Yalnizca "npm run kontrol" kullanir; siteye dahil edilmez.
import type { Komut } from "./labirent/komutlar";
import { EN_AZ_KEZ, EN_FAZLA_KEZ, komutBloku, type Blok, type KomutBloku } from "./program";

export type UretecSecenekleri = { kez?: number; enFazlaGovde?: number };

/**
 * Tam olarak `butce` blok tutan butun programlar.
 *
 * Cikti SALT OKUNURDUR: govde dizileri (govdeler() ile uretilir) uretilen
 * programlar arasinda PAYLASILIR, her programa ozel bir kopya degildir.
 * Cagiran taraf donen bir Blok[]'u yerinde degistirmemeli.
 */
export function* blokProgramlari(
  butce: number,
  komutlar: Komut[],
  secenekler: UretecSecenekleri = {},
): Generator<Blok[]> {
  if (butce === 0) {
    yield [];
    return;
  }

  for (const komut of komutlar) {
    for (const kalan of blokProgramlari(butce - 1, komutlar, secenekler)) {
      yield [komutBloku(komut), ...kalan];
    }
  }

  // Kutu kendisi bir blok tutar; govde bir blokla baslar cunku bos kutu
  // hicbir sey yapmaz ve en az bloklu cozumde asla yer almaz.
  const ilkKez = secenekler.kez ?? EN_AZ_KEZ;
  const sonKez = secenekler.kez ?? EN_FAZLA_KEZ;
  const enUzunGovde = Math.min(butce - 1, secenekler.enFazlaGovde ?? butce - 1);
  for (let govdeUzunlugu = 1; govdeUzunlugu <= enUzunGovde; govdeUzunlugu++) {
    for (const govde of govdeler(govdeUzunlugu, komutlar)) {
      for (let kutuKez = ilkKez; kutuKez <= sonKez; kutuKez++) {
        for (const kalan of blokProgramlari(butce - 1 - govdeUzunlugu, komutlar, secenekler)) {
          yield [{ tur: "tekrar", kez: kutuKez, govde }, ...kalan];
        }
      }
    }
  }
}

function* govdeler(uzunluk: number, komutlar: Komut[]): Generator<KomutBloku[]> {
  if (uzunluk === 0) {
    yield [];
    return;
  }
  for (const komut of komutlar) {
    for (const kalan of govdeler(uzunluk - 1, komutlar)) {
      yield [komutBloku(komut), ...kalan];
    }
  }
}
