// Parmakla harf veya rakam izleme mantigi.
// Bu dosya React ve tarayici bilmez; sadece veri alir, yeni veri dondurur.
import type { Nokta } from "./rakamYollari";

/**
 * Izlemenin o andaki durumu.
 * tamamlanan[v][n] = v numarali vurusun n numarali kontrol noktasindan
 * gecilip gecilmedigi.
 */
export type IzlemeDurumu = {
  aktifVurus: number;
  tamamlanan: boolean[][];
};

export function yeniIzleme(kontroller: Nokta[][]): IzlemeDurumu {
  return {
    aktifVurus: 0,
    tamamlanan: kontroller.map((vurus) => vurus.map(() => false)),
  };
}

export function vurusBittiMi(durum: IzlemeDurumu, vurusIndeksi: number): boolean {
  const vurus = durum.tamamlanan[vurusIndeksi];
  return vurus !== undefined && vurus.every(Boolean);
}

export function hepsiBittiMi(durum: IzlemeDurumu): boolean {
  return durum.tamamlanan.every((vurus) => vurus.every(Boolean));
}

/** Tamamlanan kontrol noktalarinin butune orani. Ilerleme gostergesi icin. */
export function tamamlanmaOrani(durum: IzlemeDurumu): number {
  const hepsi = durum.tamamlanan.flat();
  if (hepsi.length === 0) return 0;
  return hepsi.filter(Boolean).length / hepsi.length;
}

/**
 * Parmagin gectigi noktayi isler.
 *
 * Yalnizca sirasi gelmis vurusun noktalari isaretlenir; boylece cocuk
 * vuruslari dogru sirada cizmeyi ogrenir. Bir vurus bitince sira
 * kendiliginden sonrakine gecer.
 *
 * Yanlis yere cizmek cezalandirilmaz; o hareket sadece sayilmaz.
 */
export function parmakGecti(
  durum: IzlemeDurumu,
  kontroller: Nokta[][],
  nokta: Nokta,
  tolerans: number,
): IzlemeDurumu {
  const aktif = durum.aktifVurus;
  const aktifKontroller = kontroller[aktif];
  if (!aktifKontroller) return durum;

  let degisti = false;
  const yeniVurus = durum.tamamlanan[aktif].map((tamam, i) => {
    if (tamam) return true;
    const uzaklik = Math.hypot(
      nokta.x - aktifKontroller[i].x,
      nokta.y - aktifKontroller[i].y,
    );
    if (uzaklik <= tolerans) {
      degisti = true;
      return true;
    }
    return false;
  });

  if (!degisti) return durum;

  const yeniTamamlanan = durum.tamamlanan.map((vurus, i) =>
    i === aktif ? yeniVurus : vurus,
  );

  // Vurus bittiyse sira sonraki vurusa gecer.
  const bitti = yeniVurus.every(Boolean);
  return {
    aktifVurus: bitti ? Math.min(aktif + 1, kontroller.length - 1) : aktif,
    tamamlanan: yeniTamamlanan,
  };
}
