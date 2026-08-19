// Labirent bolumunde kullanilan komutlar.
//
// Iki komut seti vardir. "yonler" seti mutlak yon verir (yukari git);
// "donusler" seti Turna'nin baktigi yone gore calisir (ileri, saga don).
// Ilk bolumler mutlak setle oynanir: bu yasta zihinsel dondurme henuz
// oturmamistir. Gerekcesi docs/tasarim/kodlama.md icinde.

export type Yon = "yukari" | "asagi" | "sol" | "sag";

export type Komut =
  | { tur: "git"; yon: Yon }
  | { tur: "ileri" }
  | { tur: "don"; yon: "sol" | "sag" };

export type KomutSeti = "yonler" | "donusler";

export const KOMUT_SETLERI: Record<KomutSeti, Komut[]> = {
  yonler: [
    { tur: "git", yon: "yukari" },
    { tur: "git", yon: "asagi" },
    { tur: "git", yon: "sol" },
    { tur: "git", yon: "sag" },
  ],
  donusler: [{ tur: "ileri" }, { tur: "don", yon: "sol" }, { tur: "don", yon: "sag" }],
};

/** Komutu React anahtari ve test karsilastirmasi icin tek metne indirger. */
export function komutAnahtari(komut: Komut): string {
  if (komut.tur === "ileri") return "ileri";
  return `${komut.tur}:${komut.yon}`;
}

// Yonler saat yonunde siralidir; donmek bu dizide bir adim ilerlemektir.
const SAAT_SIRASI: Yon[] = ["yukari", "sag", "asagi", "sol"];

export function saatYonunde(yon: Yon): Yon {
  return SAAT_SIRASI[(SAAT_SIRASI.indexOf(yon) + 1) % 4];
}

export function saatTersine(yon: Yon): Yon {
  return SAAT_SIRASI[(SAAT_SIRASI.indexOf(yon) + 3) % 4];
}

/** Ekran koordinati: y asagi dogru buyur. */
export function komsuKare(kare: { x: number; y: number }, yon: Yon): { x: number; y: number } {
  if (yon === "yukari") return { x: kare.x, y: kare.y - 1 };
  if (yon === "asagi") return { x: kare.x, y: kare.y + 1 };
  if (yon === "sol") return { x: kare.x - 1, y: kare.y };
  return { x: kare.x + 1, y: kare.y };
}
