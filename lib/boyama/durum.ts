// Bir boyama sayfasinin cizim durumu ve geri alma mantigi.
// Bu dosya React bilmez; sadece veri alir, yeni veri dondurur.

/** Parmakla cizilen tek bir firca cizgisi. */
export type FircaCizgisi = {
  d: string;        // SVG yol verisi
  renk: string;
  kalinlik: number;
};

/** Tuvalin belirli bir andaki gorunumu. */
export type BoyamaDurumu = {
  dolgular: Record<string, string>;   // bolge kimligi -> renk
  fircaCizgileri: FircaCizgisi[];
};

/** Silginin dokundugu sey. */
export type SilmeHedefi =
  | { tur: "bolge"; bolgeId: string }
  | { tur: "cizgi"; indeks: number };

/**
 * Gecmis, tuvalin butun ara gorunumlerini sirayla tutar.
 * Geri alma, sadece simdikiAdim'i bir geri kaydirmaktir.
 */
export type BoyamaGecmisi = {
  adimlar: BoyamaDurumu[];
  simdikiAdim: number;
};

export const BOS_DURUM: BoyamaDurumu = { dolgular: {}, fircaCizgileri: [] };

export function yeniGecmis(baslangic: BoyamaDurumu = BOS_DURUM): BoyamaGecmisi {
  return { adimlar: [baslangic], simdikiAdim: 0 };
}

export function simdikiDurum(gecmis: BoyamaGecmisi): BoyamaDurumu {
  return gecmis.adimlar[gecmis.simdikiAdim];
}

/**
 * Yeni bir gorunumu gecmise ekler.
 * Daha once geri alinmis adimlar varsa onlar silinir; yeni dal buradan devam eder.
 */
function adimEkle(gecmis: BoyamaGecmisi, yeni: BoyamaDurumu): BoyamaGecmisi {
  const kalanlar = gecmis.adimlar.slice(0, gecmis.simdikiAdim + 1);
  return { adimlar: [...kalanlar, yeni], simdikiAdim: kalanlar.length };
}

export function bolgeyiDoldur(
  gecmis: BoyamaGecmisi,
  bolgeId: string,
  renk: string,
): BoyamaGecmisi {
  const simdiki = simdikiDurum(gecmis);
  return adimEkle(gecmis, {
    dolgular: { ...simdiki.dolgular, [bolgeId]: renk },
    fircaCizgileri: simdiki.fircaCizgileri,
  });
}

export function fircaCizgisiEkle(
  gecmis: BoyamaGecmisi,
  cizgi: FircaCizgisi,
): BoyamaGecmisi {
  const simdiki = simdikiDurum(gecmis);
  return adimEkle(gecmis, {
    dolgular: simdiki.dolgular,
    fircaCizgileri: [...simdiki.fircaCizgileri, cizgi],
  });
}

export function sil(gecmis: BoyamaGecmisi, hedef: SilmeHedefi): BoyamaGecmisi {
  const simdiki = simdikiDurum(gecmis);

  if (hedef.tur === "bolge") {
    // Zaten boyanmamissa gecmisi kalabaliklastirmayalim.
    if (!(hedef.bolgeId in simdiki.dolgular)) return gecmis;
    const kalanDolgular = { ...simdiki.dolgular };
    delete kalanDolgular[hedef.bolgeId];
    return adimEkle(gecmis, {
      dolgular: kalanDolgular,
      fircaCizgileri: simdiki.fircaCizgileri,
    });
  }

  if (hedef.indeks < 0 || hedef.indeks >= simdiki.fircaCizgileri.length) return gecmis;
  return adimEkle(gecmis, {
    dolgular: simdiki.dolgular,
    fircaCizgileri: simdiki.fircaCizgileri.filter((_, i) => i !== hedef.indeks),
  });
}

export function geriAlinabilirMi(gecmis: BoyamaGecmisi): boolean {
  return gecmis.simdikiAdim > 0;
}

export function geriAl(gecmis: BoyamaGecmisi): BoyamaGecmisi {
  if (!geriAlinabilirMi(gecmis)) return gecmis;
  return { adimlar: gecmis.adimlar, simdikiAdim: gecmis.simdikiAdim - 1 };
}

/** Tuvali temizler. Yanlislikla basilirsa geri alinabilsin diye bir adim olarak eklenir. */
export function bastanBasla(gecmis: BoyamaGecmisi): BoyamaGecmisi {
  return adimEkle(gecmis, BOS_DURUM);
}
