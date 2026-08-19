// Bir bolumun en kisa cozumunu bulur.
//
// Yalnizca "npm run kontrol" kullanir: cozulemeyen ya da idealAdim degeri
// yanlis olan bir bolum depoya girmesin diye. Siteye dahil edilmez.
//
// Genislik oncelikli arama (BFS) yapilir. Durum = Turna'nin karesi + baktigi
// yon + hangi basaklarin toplandigi. Carpma hic denenmez: carpan bir komut
// durumu degistirmedigi icin en kisa cozumde asla bulunmaz.
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
