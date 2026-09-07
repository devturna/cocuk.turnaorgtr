// Bir bolumun en kisa cozumunu bulur.
//
// Yalnizca "npm run kontrol" kullanir: cozulemeyen ya da idealAdim degeri
// yanlis olan bir bolum depoya girmesin diye. Siteye dahil edilmez.
//
// Genislik oncelikli arama (BFS) yapilir. Durum = karakterin karesi + baktigi
// yon + hangi basaklarin toplandigi. Carpma hic denenmez: carpan bir komut
// durumu degistirmedigi icin en kisa cozumde asla bulunmaz.
//
// enKisaBlokCozumu ayri bir arama: ADIM degil BLOK sayar ve tekrar kutusunu
// dener, cunku dongu duraklarinin cozulebilirligi ancak boyle kanitlanir.
import {
  KOMUT_SETLERI,
  komsuKare,
  saatTersine,
  saatYonunde,
  type Komut,
  type KomutSeti,
  type Yon,
} from "./komutlar";
import { engelMi, haritaDisiMi, kareAnahtari, kareEsit, type Harita } from "./harita";
import { calistir } from "./calistir";
import {
  EN_AZ_KEZ,
  EN_FAZLA_KEZ,
  komutBloku,
  type Blok,
  type KomutBloku,
} from "../program";

type Durum = { x: number; y: number; bakis: Yon; toplananlar: number };

function durumAnahtari(durum: Durum): string {
  return `${durum.x},${durum.y},${durum.bakis},${durum.toplananlar}`;
}

/** Bulunan en kisa cozumun adim sayisi. */
export function enKisaCozum(harita: Harita, seti: KomutSeti): number | null {
  return enKisaCozumYolu(harita, seti)?.length ?? null;
}

/** En kisa cozumun kendisi. Uctan uca test bolumleri bununla oynar. */
export function enKisaCozumYolu(harita: Harita, seti: KomutSeti): Komut[] | null {
  const basakAnahtarlari = harita.basaklar.map(kareAnahtari);
  const hepsiToplandi = (1 << basakAnahtarlari.length) - 1;
  const komutlar = KOMUT_SETLERI[seti];

  const baslangic: Durum = {
    x: harita.baslangic.x,
    y: harita.baslangic.y,
    bakis: harita.bakis,
    toplananlar: 0,
  };

  const kuyruk: { durum: Durum; yol: Komut[] }[] = [{ durum: baslangic, yol: [] }];
  const gorulenler = new Set<string>([durumAnahtari(baslangic)]);

  while (kuyruk.length > 0) {
    const { durum, yol } = kuyruk.shift()!;

    for (const komut of komutlar) {
      let sonraki: Durum;

      if (komut.tur === "don") {
        const bakis = komut.yon === "sag" ? saatYonunde(durum.bakis) : saatTersine(durum.bakis);
        sonraki = { ...durum, bakis };
      } else {
        const bakis = komut.tur === "git" ? komut.yon : durum.bakis;
        const hedefKare = komsuKare({ x: durum.x, y: durum.y }, bakis);
        // Carpan komut durumu degistirmez; en kisa cozumde yeri yoktur.
        if (haritaDisiMi(harita, hedefKare) || engelMi(harita, hedefKare)) continue;

        const basakSirasi = basakAnahtarlari.indexOf(kareAnahtari(hedefKare));
        const toplananlar =
          basakSirasi === -1 ? durum.toplananlar : durum.toplananlar | (1 << basakSirasi);
        sonraki = { x: hedefKare.x, y: hedefKare.y, bakis, toplananlar };

        if (kareEsit(hedefKare, harita.hedef) && toplananlar === hepsiToplandi) {
          return [...yol, komut];
        }
      }

      const anahtar = durumAnahtari(sonraki);
      if (gorulenler.has(anahtar)) continue;
      gorulenler.add(anahtar);
      kuyruk.push({ durum: sonraki, yol: [...yol, komut] });
    }
  }

  return null;
}

// Blok butcesi ustten sinirlanir: arama uzayi butce basina yaklasik 8^n / 2
// program tutar (butce 4'te 2.048, 6'da 131.072, 8'de 8.388.608) ve cozumu
// olmayan bir haritada tavan butce TAMAMEN taranir. Altida toplam yaklasik
// 150 bin program, saniyenin altinda; sekizde dakikalar surerdi. Dongu
// duraklarinin serit siniri zaten dort civarindadir, tavan hic zorlanmaz.
export const ARAMA_BLOK_SINIRI = 6;

/**
 * Verilen blok siniri icinde bolumu bitiren EN AZ BLOKLU program.
 *
 * Duz arama (enKisaCozum) ADIM sayar ve dongu bilmez; bu arama BLOK sayar
 * ve tekrar kutusunu da dener. "npm run kontrol" dongu duraklarinin
 * gercekten cozulebildigini bununla kanitlar.
 *
 * Kaba kuvvet yeterlidir: butce kucuktur, komut seti en fazla dorttur ve
 * kez ikiyle bes arasindadir.
 */
export function enKisaBlokCozumu(
  harita: Harita,
  seti: KomutSeti,
  enFazlaBlok: number,
): Blok[] | null {
  if (enFazlaBlok > ARAMA_BLOK_SINIRI) {
    throw new Error(
      `Dongulu arama en fazla ${ARAMA_BLOK_SINIRI} blok tarar, ${enFazlaBlok} istendi.`,
    );
  }

  const komutlar = KOMUT_SETLERI[seti];

  // Butce artan sirada tarandigi icin ilk bulunan cozum en az bloklu olandir.
  for (let butce = 1; butce <= enFazlaBlok; butce++) {
    for (const program of programlar(butce, komutlar)) {
      if (calistir(program, harita).basarili) return program;
    }
  }

  return null;
}

/** Tam olarak `butce` blok tutan butun programlar. */
function* programlar(butce: number, komutlar: Komut[]): Generator<Blok[]> {
  if (butce === 0) {
    yield [];
    return;
  }

  for (const komut of komutlar) {
    for (const kalan of programlar(butce - 1, komutlar)) {
      yield [komutBloku(komut), ...kalan];
    }
  }

  // Kutu kendisi bir blok tutar; govde bir blokla baslar cunku bos kutu
  // hicbir sey yapmaz ve en az bloklu cozumde asla yer almaz.
  for (let govdeUzunlugu = 1; govdeUzunlugu <= butce - 1; govdeUzunlugu++) {
    for (const govde of govdeler(govdeUzunlugu, komutlar)) {
      for (let kez = EN_AZ_KEZ; kez <= EN_FAZLA_KEZ; kez++) {
        for (const kalan of programlar(butce - 1 - govdeUzunlugu, komutlar)) {
          yield [{ tur: "tekrar", kez, govde }, ...kalan];
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
