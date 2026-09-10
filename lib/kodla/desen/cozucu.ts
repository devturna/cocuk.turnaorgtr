// Bir desenin kac blokla cizilebildigini bulur.
//
// Labirentteki enKisaBlokCozumu'nun karsiligi: ayni program uzayini tarar
// (bkz. lib/kodla/blokUreteci.ts), yalnizca degerlendirme farkli --
// "kus hedefe vardi mi" degil, "desenin butun kenarlari cizildi mi".
//
// Yalnizca "npm run kontrol" kullanir; siteye dahil edilmez.
import { KOMUT_SETLERI, type KomutSeti } from "../labirent/komutlar";
import { blokProgramlari, type UretecSecenekleri } from "../blokUreteci";
import type { Blok } from "../program";
import { ciz } from "./ciz";
import type { Desen } from "./desen";

// Labirenttekiyle ayni tavan: butce basina yaklasik 8^n program, altida
// saniyenin altinda. Desen duraklarinin serit siniri da dort civarindadir.
export const DESEN_ARAMA_SINIRI = 6;

/** Deseni tamamlayan EN AZ BLOKLU program; sinira sigmiyorsa null. */
export function enKisaDesenCozumu(
  desen: Desen,
  seti: KomutSeti,
  enFazlaBlok: number,
  secenekler: UretecSecenekleri = {},
): Blok[] | null {
  if (enFazlaBlok > DESEN_ARAMA_SINIRI) {
    throw new Error(
      `Desen aramasi en fazla ${DESEN_ARAMA_SINIRI} blok tarar, ${enFazlaBlok} istendi.`,
    );
  }

  const komutlar = KOMUT_SETLERI[seti];
  for (let butce = 1; butce <= enFazlaBlok; butce++) {
    for (const program of blokProgramlari(butce, komutlar, secenekler)) {
      if (ciz(program, desen).basarili) return program;
    }
  }
  return null;
}
