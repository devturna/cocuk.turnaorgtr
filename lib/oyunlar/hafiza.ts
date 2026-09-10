// Hafiza oyununun mantigi: kart destesi ve acma kurallari.
//
// React bilmez, zaman bilmez, rastgelelik TASIMAZ: her tur numarasindan
// turetilir (sunucu/tarayici ayni ciziyor, test gercek destesi olcuyor).

/** Destedeki tek kart. `cift` ayni simgeyi tasiyan iki karti baglar. */
export type Kart = { sira: number; simge: string };

// Kartlar emoji: boyama bolumundeki gibi lisans derdi olmayan gorseller.
const SIMGELER = [
  "🐢", "🦋", "🐞", "🐬", "🦉", "🐝", "🐙", "🦔", "🐳", "🦩", "🐧", "🦊",
];

/** Ilk tur dort kart; her turda iki kart daha, on ikide durur. */
export const EN_AZ_KART = 4;
export const EN_FAZLA_KART = 12;

export function turdakiKartSayisi(sira: number): number {
  return Math.min(EN_FAZLA_KART, EN_AZ_KART + sira * 2);
}

function tohumluSayi(tohum: number): () => number {
  let durum = tohum * 2891336453 + 17;
  return () => {
    durum = (durum * 1103515245 + 12345) % 2147483648;
    return durum / 2147483648;
  };
}

function karistir<T>(dizi: T[], rastgele: () => number): T[] {
  const kopya = [...dizi];
  for (let i = kopya.length - 1; i > 0; i--) {
    const j = Math.floor(rastgele() * (i + 1));
    [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
  }
  return kopya;
}

/** Turun destesi: her simgeden iki kart, karisik sirada. */
export function desteUret(sira: number): Kart[] {
  const kartSayisi = turdakiKartSayisi(sira);
  const rastgele = tohumluSayi(sira + 1);
  // Simgeler de turdan tura degisiyor: ayni hayvanlar her turda ayni yerde
  // gorunse cocuk desteyi degil ekrani ezberlerdi.
  const havuz = karistir(SIMGELER, tohumluSayi(sira + 101));
  const secilenler = havuz.slice(0, kartSayisi / 2);
  const simgeler = karistir([...secilenler, ...secilenler], rastgele);
  return simgeler.map((simge, sira) => ({ sira, simge }));
}

/**
 * Iki acik kart eslesiyor mu.
 *
 * Ayni KARTA iki kez dokunmak eslesme sayilmaz: cocuk tek kartla turu
 * bitiremez.
 */
export function eslesiyorMu(deste: Kart[], ilk: number, ikinci: number): boolean {
  if (ilk === ikinci) return false;
  const a = deste[ilk];
  const b = deste[ikinci];
  if (a === undefined || b === undefined) return false;
  return a.simge === b.simge;
}

/** Butun kartlar bulunduysa tur biter. */
export function turBittiMi(deste: Kart[], bulunanlar: number[]): boolean {
  return deste.length > 0 && bulunanlar.length === deste.length;
}
