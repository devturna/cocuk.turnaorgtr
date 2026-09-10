// Desen: cizim mekaniginin haritasi.
//
// Labirentte kus KARELERDE durur ve engellere carpar; cizimde KOSELERDE
// durur ve kenarlar boyunca cizgi birakir. Ayrim, docs/tasarim/
// kodlama-cizim.md §2-3 icinde.
import type { Yon } from "../labirent/komutlar";

/** Izgara kosesi. Sol ust kose (0,0), y asagi dogru buyur. */
export type Kose = { x: number; y: number };

export type Desen = {
  /** Kose sayisi (kare sayisi degil): 4 genislik, 3 kare demektir. */
  genislik: number;
  yukseklik: number;
  baslangic: { x: number; y: number; bakis: Yon };
  /** Cizilmesi gereken kenarlar, anahtar biciminde. */
  kenarlar: Set<string>;
};

/**
 * Iki kosenin arasindaki kenarin anahtari.
 *
 * Kenar YONSUZDUR: soldan saga cizmekle sagdan sola cizmek ayni kenardir,
 * o yuzden kose cifti her zaman ayni sirada yazilir.
 */
export function kenarAnahtari(a: Kose, b: Kose): string {
  const once = a.y < b.y || (a.y === b.y && a.x <= b.x) ? a : b;
  const sonra = once === a ? b : a;
  return `${once.x},${once.y} ${sonra.x},${sonra.y}`;
}

/** Anahtari iki koseye geri cevirir; bicim bozuksa null. */
export function anahtarKenari(anahtar: string): [Kose, Kose] | null {
  const parcalar = anahtar.trim().split(/\s+/);
  if (parcalar.length !== 2) return null;
  const koseler = parcalar.map((parca) => {
    const [x, y] = parca.split(",").map(Number);
    return Number.isInteger(x) && Number.isInteger(y) ? { x, y } : null;
  });
  if (koseler[0] === null || koseler[1] === null) return null;
  return [koseler[0], koseler[1]];
}

/** Iki kose birim uzunlukta komsu mu (capraz degil). */
export function komsuKoseMi(a: Kose, b: Kose): boolean {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
}

export type DesenVerisi = {
  genislik: number;
  yukseklik: number;
  baslangic: { x: number; y: number; bakis: Yon };
  kenarlar: string[];
};

/**
 * Icerikteki deseni calisma zamani bicimine cevirir.
 *
 * Bozuk veri icin hata atar: "npm run kontrol" bunu derleme oncesi
 * yakalar, tarayicida hicbir zaman gorulmemeli.
 */
export function deseniCoz(veri: DesenVerisi): Desen {
  if (veri.genislik < 2 || veri.yukseklik < 2) {
    throw new Error("Desen izgarasi en az 2x2 kose olmali.");
  }
  if (veri.kenarlar.length === 0) throw new Error("Desenin hic kenari yok.");

  const kenarlar = new Set<string>();
  for (const ham of veri.kenarlar) {
    const kenar = anahtarKenari(ham);
    if (kenar === null) throw new Error(`Kenar bicimi bozuk: "${ham}"`);
    const [a, b] = kenar;
    if (!komsuKoseMi(a, b)) throw new Error(`Kenar komsu iki koseyi birlestirmiyor: "${ham}"`);
    for (const kose of [a, b]) {
      if (kose.x < 0 || kose.x >= veri.genislik || kose.y < 0 || kose.y >= veri.yukseklik) {
        throw new Error(`Kenar izgaranin disinda: "${ham}"`);
      }
    }
    kenarlar.add(kenarAnahtari(a, b));
  }

  const { x, y } = veri.baslangic;
  if (x < 0 || x >= veri.genislik || y < 0 || y >= veri.yukseklik) {
    throw new Error("Baslangic kosesi izgaranin disinda.");
  }

  return {
    genislik: veri.genislik,
    yukseklik: veri.yukseklik,
    baslangic: veri.baslangic,
    kenarlar,
  };
}
