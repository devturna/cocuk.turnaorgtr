// Arac dugmelerinin ikonlari.
//
// Emoji yerine kendi cizdigimiz ikonlari kullaniyoruz: emojiler her cihazda
// farkli gorunur, kucuk kalir ve 4-8 yas icin yeterince acik degildir.
//
// Onemli kural: her ikonun SILUETI farkli olmali. Cocuk sekli bir bakista
// ayirt edebilmeli, detaya bakmak zorunda kalmamali. Bu yuzden firca dikey
// ve ince, silgi yatay ve genis, kova ise agiz kismi belli bir kap olarak
// cizildi.

const ORTAK = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Bolgeyi doldurma araci: agzi acik boya kovasi ve akan damla. */
export function KovaIkonu() {
  return (
    <svg {...ORTAK} className="aracIkon">
      <path d="M11 15 L37 15 L33 40 L15 40 Z" />
      <ellipse cx="24" cy="15" rx="13" ry="5" />
      <path d="M16 12 C16 5 32 5 32 12" />
      <path d="M41 24 C45 31 45 36 41 36 C37 36 37 31 41 24 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Serbest cizim araci: dik duran, kili belirgin firca. */
export function FircaIkonu() {
  return (
    <svg {...ORTAK} className="aracIkon">
      <path d="M21 5 L27 5 L27 25 L21 25 Z" />
      <path d="M18 25 L30 25 L30 31 L18 31 Z" />
      <path d="M18 31 L30 31 L27 43 L21 43 Z" />
      <path d="M24 34 L24 40" />
    </svg>
  );
}

/** Silme araci: yatik duran, iki parcali silgi. */
export function SilgiIkonu() {
  return (
    <svg {...ORTAK} className="aracIkon">
      <path d="M13 41 L5 33 L26 12 L43 24 L31 41 Z" />
      <path d="M17 21 L34 33" />
      <path d="M13 41 L31 41" />
    </svg>
  );
}

/** Son islemi iptal: geriye kivrilan kalin ok. */
export function GeriIkonu() {
  return (
    <svg {...ORTAK} strokeWidth={3.5} className="aracIkon">
      <path d="M11 24 C11 14 20 8 29 11 C41 15 42 31 32 37 C27 40 21 40 17 38" />
      <path d="M11 13 L11 25 L23 25" />
    </svg>
  );
}

/** Tuvali temizleme: cop kutusu. Tehlikeli islem oldugu icin ayri durur. */
export function CopIkonu() {
  return (
    <svg {...ORTAK} strokeWidth={3.5} className="aracIkon">
      <path d="M9 14 L39 14" />
      <path d="M19 14 L19 10 C19 8 20 7 22 7 L26 7 C28 7 29 8 29 10 L29 14" />
      <path d="M13 14 L15 39 C15 41 16 42 18 42 L30 42 C32 42 33 41 33 39 L35 14" />
      <path d="M21 21 L21 35 M27 21 L27 35" />
    </svg>
  );
}

/** Onay: buyuk tik. Okuma bilmeyen cocuk icin yazi yerine sekil. */
export function TikIkonu() {
  return (
    <svg {...ORTAK} strokeWidth={5.5} className="onayIkon">
      <path d="M10 25 L20 35 L38 14" />
    </svg>
  );
}

/** Vazgecme: buyuk carpi. */
export function CarpiIkonu() {
  return (
    <svg {...ORTAK} strokeWidth={5.5} className="onayIkon">
      <path d="M13 13 L35 35 M35 13 L13 35" />
    </svg>
  );
}
