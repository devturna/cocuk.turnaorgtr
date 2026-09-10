// Bul oyununun mantigi: hedef bir RAKAM, secenekler nesne gruplaridir.
//
// Say oyunu miktardan rakama gider (say, sonra rakami soyle); Bul tersini
// yapar: rakami gorur, o kadar nesnenin oldugu grubu bulur. Iki oyun ayni
// bilgiyi iki yonden yoklar, bu yuzden ikisi de gerekli.
//
// Say oyunundaki gibi rastgelelik TASIMAZ: her tur, tur numarasindan
// turetilir (sunucu/tarayici ayni ciziyor, test gercek turu olcuyor).
import { sayilabilirMiktarlar } from "./sayilar";

export type BulSecenegi = { miktar: number; simge: string };

export type BulTuru = {
  /** Ustte gosterilen rakam. */
  hedef: number;
  secenekler: BulSecenegi[];
};

const SIMGELER = ["🐟", "🍏", "🦋", "🌻", "🐤", "🍇", "🐌", "🌰", "🐠", "🍄"];

function tohumluSayi(tohum: number): () => number {
  let durum = tohum * 2246822519 + 3;
  return () => {
    durum = (durum * 1103515245 + 12345) % 2147483648;
    return durum / 2147483648;
  };
}

/**
 * Uc secenek: biri dogru, ikisi YAKIN miktarlar.
 *
 * Yakinlik sart: 3 ile 9 arasinda secim yapmak saymayi degil goz karari
 * buyuklugu olcerdi.
 */
export function bulTuruUret(sira: number): BulTuru {
  const miktarlar = sayilabilirMiktarlar();
  const hedef = miktarlar[sira % miktarlar.length].rakam;
  const rastgele = tohumluSayi(sira + 1);

  const adaylar = [hedef - 2, hedef - 1, hedef + 1, hedef + 2].filter(
    (miktar) => miktar >= 1 && miktar <= 10,
  );
  const secilenMiktarlar = new Set<number>([hedef]);
  while (secilenMiktarlar.size < 3 && adaylar.length > 0) {
    secilenMiktarlar.add(adaylar.splice(Math.floor(rastgele() * adaylar.length), 1)[0]);
  }

  // Siralamayi da tohum belirler: dogru secenek her zaman ayni yerde
  // olsaydi cocuk sayiyi degil KONUMU ogrenirdi.
  const siralanmis = [...secilenMiktarlar].sort(
    (a, b) => rastgele() - 0.5 || a - b,
  );

  const simge = SIMGELER[sira % SIMGELER.length];
  return { hedef, secenekler: siralanmis.map((miktar) => ({ miktar, simge })) };
}

export function bulTurSayisi(): number {
  return sayilabilirMiktarlar().length;
}
