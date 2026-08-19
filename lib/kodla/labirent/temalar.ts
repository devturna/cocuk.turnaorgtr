// Bolum temalari: zeminin rengi ve engelin nasil ciziliecegi.
//
// Durak konumdan, tema gorselden sorumludur. Bu ayrim sayesinde on bes bolum
// yedi takim cizimle karsilanir: Tuz Golu, Pamukkale, Salda ve Agri hepsi
// "beyaz" temasini paylasir, aralarindaki fark zemin tonudur.
//
// Faz 4a yalnizca ilk bes durakta kullanilan dort temayi tanimlar; kalanlar
// ilgili duraklar eklendiginde gelir.

export type Tema = {
  zeminRengi: string;
  cizgiRengi: string;
  engel: {
    /** 0-100 birimlik kare kutusunda SVG yolu. */
    d: string;
    dolgu: string;
    cizgi: string;
    kalinlik: number;
  };
};

export const TEMALAR: Record<string, Tema> = {
  sazlik: {
    zeminRengi: "#e8f3dc",
    cizgiRengi: "#c3d9ad",
    engel: {
      d: "M30 88 L36 28 M50 88 L50 18 M70 88 L64 32",
      dolgu: "none",
      cizgi: "#4a7c2f",
      kalinlik: 9,
    },
  },
  peribacasi: {
    zeminRengi: "#f6e7cf",
    cizgiRengi: "#e0cba9",
    engel: {
      d: "M36 88 L46 32 L54 32 L64 88 Z M28 32 L72 32 L50 12 Z",
      dolgu: "#d9c39a",
      cizgi: "#8a7350",
      kalinlik: 5,
    },
  },
  beyaz: {
    zeminRengi: "#f2f8fb",
    cizgiRengi: "#d5e4ec",
    engel: {
      d: "M18 86 Q50 40 82 86 Z",
      dolgu: "#e3eef4",
      cizgi: "#9fb6c2",
      kalinlik: 5,
    },
  },
  antiktas: {
    zeminRengi: "#f3ecdd",
    cizgiRengi: "#dfd2b8",
    engel: {
      d: "M34 88 L34 28 L66 28 L66 88 Z M26 28 L74 28 L74 18 L26 18 Z",
      dolgu: "#ded4c0",
      cizgi: "#8d7f66",
      kalinlik: 5,
    },
  },
};

/** Bilinmeyen tema ekrani bos birakmasin diye sazlik temasina duser. */
export function temaBul(ad: string): Tema {
  return TEMALAR[ad] ?? TEMALAR.sazlik;
}
