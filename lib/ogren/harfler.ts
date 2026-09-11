// Turk alfabesi.
//
// Sira Turkce alfabetik siradir (Q, W, X yok; C-Ç, G-Ğ, I-İ, O-Ö, S-Ş,
// U-Ü ciftleri ayri harflerdir). Bu sira ekranda da gecerlidir: cocuk
// harfleri ogrendigi sirayla gorur.
export type Harf = {
  buyuk: string;
  kucuk: string;
  /** Harfle baslayan ornek kelime; Ğ icin kelime ICINDE gecer. */
  ornekKelime: string;
  /** Ornek kelimenin simgesi. */
  simge: string;
  /** Yalnizca Ğ: hicbir Turkce kelime bu harfle baslamaz. */
  basindaGecmez?: true;
};

export const HARFLER: Harf[] = [
  { buyuk: "A", kucuk: "a", ornekKelime: "Armut", simge: "🍐" },
  { buyuk: "B", kucuk: "b", ornekKelime: "Balık", simge: "🐟" },
  { buyuk: "C", kucuk: "c", ornekKelime: "Ceviz", simge: "🌰" },
  { buyuk: "Ç", kucuk: "ç", ornekKelime: "Çilek", simge: "🍓" },
  { buyuk: "D", kucuk: "d", ornekKelime: "Deve", simge: "🐫" },
  { buyuk: "E", kucuk: "e", ornekKelime: "Elma", simge: "🍎" },
  { buyuk: "F", kucuk: "f", ornekKelime: "Fil", simge: "🐘" },
  { buyuk: "G", kucuk: "g", ornekKelime: "Gemi", simge: "🚢" },
  // Hicbir Turkce kelime Ğ ile baslamaz; ornek kelime harfi ICINDE tasir.
  { buyuk: "Ğ", kucuk: "ğ", ornekKelime: "Ağaç", simge: "🌳", basindaGecmez: true },
  { buyuk: "H", kucuk: "h", ornekKelime: "Horoz", simge: "🐓" },
  { buyuk: "I", kucuk: "ı", ornekKelime: "Ilık", simge: "🫖" },
  { buyuk: "İ", kucuk: "i", ornekKelime: "İnek", simge: "🐄" },
  { buyuk: "J", kucuk: "j", ornekKelime: "Jeton", simge: "🪙" },
  { buyuk: "K", kucuk: "k", ornekKelime: "Kedi", simge: "🐈" },
  { buyuk: "L", kucuk: "l", ornekKelime: "Limon", simge: "🍋" },
  { buyuk: "M", kucuk: "m", ornekKelime: "Muz", simge: "🍌" },
  { buyuk: "N", kucuk: "n", ornekKelime: "Nar", simge: "🍈" },
  { buyuk: "O", kucuk: "o", ornekKelime: "Ok", simge: "🏹" },
  { buyuk: "Ö", kucuk: "ö", ornekKelime: "Ördek", simge: "🦆" },
  { buyuk: "P", kucuk: "p", ornekKelime: "Portakal", simge: "🍊" },
  { buyuk: "R", kucuk: "r", ornekKelime: "Robot", simge: "🤖" },
  { buyuk: "S", kucuk: "s", ornekKelime: "Süt", simge: "🥛" },
  { buyuk: "Ş", kucuk: "ş", ornekKelime: "Şemsiye", simge: "🌂" },
  { buyuk: "T", kucuk: "t", ornekKelime: "Tavşan", simge: "🐇" },
  { buyuk: "U", kucuk: "u", ornekKelime: "Uçak", simge: "✈️" },
  { buyuk: "Ü", kucuk: "ü", ornekKelime: "Üzüm", simge: "🍇" },
  { buyuk: "V", kucuk: "v", ornekKelime: "Vapur", simge: "⛴️" },
  { buyuk: "Y", kucuk: "y", ornekKelime: "Yıldız", simge: "⭐" },
  { buyuk: "Z", kucuk: "z", ornekKelime: "Zürafa", simge: "🦒" },
];

export function harfBul(buyuk: string): Harf | undefined {
  return HARFLER.find((harf) => harf.buyuk === buyuk);
}
