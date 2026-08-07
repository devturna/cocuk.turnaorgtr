// Boyama sayfasi katalogunu okur.
// Katalog JSON'u derleme aninda pakete gomulur; calisma aninda dosya okunmaz.
import katalogVerisi from "@/content/boyama-katalogu.json";

export type KatalogGirdisi = {
  id: string;
  ad: string;
  kategori: string;
  dosya: string;
  lisans: string;
  kaynak: string;
  kaynakUrl: string;
};

const katalog = katalogVerisi as KatalogGirdisi[];

export function tumResimler(): KatalogGirdisi[] {
  return katalog;
}

export function resmiBul(id: string): KatalogGirdisi | undefined {
  return katalog.find((resim) => resim.id === id);
}

/** Kategorileri katalogdaki ilk gorulme sirasina gore dondurur. */
export function tumKategoriler(): string[] {
  const gorulenler: string[] = [];
  for (const resim of katalog) {
    if (!gorulenler.includes(resim.kategori)) gorulenler.push(resim.kategori);
  }
  return gorulenler;
}
