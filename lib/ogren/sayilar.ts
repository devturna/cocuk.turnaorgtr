// Rakamlar ve Turkce adlari.
// Yaz oyunu 0-9 arasini kullanir (her rakamin kendi cizim yolu vardir).
// Say oyunu 1-10 arasini kullanir; sifir nesne sayilamaz, on sayilabilir.

export type Sayi = {
  rakam: number;
  ad: string;
};

export const SAYILAR: Sayi[] = [
  { rakam: 0, ad: "Sıfır" },
  { rakam: 1, ad: "Bir" },
  { rakam: 2, ad: "İki" },
  { rakam: 3, ad: "Üç" },
  { rakam: 4, ad: "Dört" },
  { rakam: 5, ad: "Beş" },
  { rakam: 6, ad: "Altı" },
  { rakam: 7, ad: "Yedi" },
  { rakam: 8, ad: "Sekiz" },
  { rakam: 9, ad: "Dokuz" },
  { rakam: 10, ad: "On" },
];

/** Yaz oyununda ogretilen rakamlar. */
export function yazilabilirRakamlar(): Sayi[] {
  return SAYILAR.filter((sayi) => sayi.rakam <= 9);
}

/** Say oyununda kullanilabilecek miktarlar. */
export function sayilabilirMiktarlar(): Sayi[] {
  return SAYILAR.filter((sayi) => sayi.rakam >= 1);
}
