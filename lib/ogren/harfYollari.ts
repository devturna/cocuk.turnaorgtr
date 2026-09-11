// Turk alfabesindeki buyuk harflerin cizim yollari.
//
// Bicim rakamlarla ayni (bkz. rakamYollari.ts): her harf bir veya daha cok
// "vurus"tur, her vurus kalem kaldirilmadan cizilen bir nokta listesidir.
// Ayni liste hem ekrandaki yolu hem cocugun gecmesi gereken kontrol
// noktalarini uretir, ikisi birbirinden kayamaz.
//
// Noktalar 400x400'luk tuvale gore verilmistir. Vurus sirasi okul
// oncesinde ogretilen sirayla ayni: once dikey/ana cizgi, sonra yataylar,
// en son aksan (Ç'nin kuyrugu, Ğ'nin sapkasi, I/İ'nin noktasi).
import { yay, type Nokta, type Vurus } from "./rakamYollari";

// Harf govdesinin oturdugu kutu: rakamlarla ayni yukseklikte dursun diye.
const UST = 75;
const ALT = 335;
const SOL = 120;
const SAG = 280;
const ORTA_Y = (UST + ALT) / 2;
const ORTA_X = (SOL + SAG) / 2;

// Duz kenarlar bu araliklarla ara noktalara bolunur.
//
// Bolunmeseydi vurus yalnizca KOSE noktalarindan ibaret olurdu ve
// kontrolNoktalari ara nokta uretemezdi: E'nin 260 birimlik dikey cizgisi
// iki kontrol noktasi verir, cocuk parmagini hic gezdirmeden iki ucuna
// dokunarak vurusu bitirirdi. Aralik, kontrol noktasi seyreltmesindeki
// EN_AZ_ARALIK'tan (42) kucuk olmali ki seyreltme sonrasi ara noktalar
// kalsin.
const ARA_ADIM = 30;

/**
 * Duz cizgi vurusu. Verilen kose noktalari arasi ARA_ADIM araliklarla
 * doldurulur.
 */
function cizgi(...koseler: [number, number][]): Vurus {
  const noktalar: Nokta[] = [{ x: koseler[0][0], y: koseler[0][1] }];

  for (let i = 1; i < koseler.length; i++) {
    const [x0, y0] = koseler[i - 1];
    const [x1, y1] = koseler[i];
    const uzunluk = Math.hypot(x1 - x0, y1 - y0);
    const adet = Math.max(1, Math.round(uzunluk / ARA_ADIM));
    for (let adim = 1; adim <= adet; adim++) {
      noktalar.push({
        x: Math.round(x0 + ((x1 - x0) * adim) / adet),
        y: Math.round(y0 + ((y1 - y0) * adim) / adet),
      });
    }
  }

  return { noktalar };
}

// C'nin govdesi: sag ustten baslayip AZALAN aciyla ust-sol-alt uzerinden
// sag alta iner, yani agzi saga bakar. Aci ARTARSA (rakamYollari.ts'teki
// nota bak) yay ters taraftan dolasir ve C, U gibi gorunur.
const C_GOVDESI = yay(ORTA_X, ORTA_Y, 80, 130, -50, -310, 28);

// O'nun govdesi: tepeden baslayip saat yonunun tersine tam tur.
const O_GOVDESI = yay(ORTA_X, ORTA_Y, 80, 130, -90, 270, 32);

// U'nun govdesi: soldan inip ALTTAN donup saga cikan tek vurus. Acinin
// 180'den 0'a AZALMASI sart: artarsa yay ustten dolasir ve U ters doner.
const U_GOVDESI = [
  { x: SOL, y: UST },
  { x: SOL, y: ORTA_Y + 40 },
  ...yay(ORTA_X, ORTA_Y + 40, 80, 90, 180, 0, 18),
  { x: SAG, y: UST },
];

// Noktali harflerin noktasi ve sapkasi kisa vuruslardir: cocugun parmagi
// buralarda uzun bir yol izlemez, yalnizca dokunur.
const NOKTA = (x: number) => cizgi([x - 12, 42], [x + 12, 42]);

export const HARF_YOLLARI: Record<string, Vurus[]> = {
  // Uc vurus: sol bacak, sag bacak, ortadaki bel.
  A: [
    cizgi([ORTA_X, UST], [SOL - 10, ALT]),
    cizgi([ORTA_X, UST], [SAG + 10, ALT]),
    cizgi([SOL + 18, ALT - 90], [SAG - 18, ALT - 90]),
  ],

  // Dikey cizgi, sonra iki karin.
  B: [
    cizgi([SOL, UST], [SOL, ALT]),
    { noktalar: [{ x: SOL, y: UST }, ...yay(SOL + 10, UST + 65, 70, 65, -90, 90, 16), { x: SOL, y: ORTA_Y }] },
    { noktalar: [{ x: SOL, y: ORTA_Y }, ...yay(SOL + 10, ORTA_Y + 65, 78, 65, -90, 90, 16), { x: SOL, y: ALT }] },
  ],

  C: [{ noktalar: C_GOVDESI }],

  // C ve kuyruk: kuyruk AYRI bir vurus, en sonda cizilir.
  "Ç": [{ noktalar: C_GOVDESI }, cizgi([ORTA_X, ALT - 10], [ORTA_X, ALT + 45])],

  // Dikey cizgi, sonra tek buyuk karin.
  D: [
    cizgi([SOL, UST], [SOL, ALT]),
    { noktalar: [{ x: SOL, y: UST }, ...yay(SOL + 5, ORTA_Y, 85, 130, -90, 90, 24), { x: SOL, y: ALT }] },
  ],

  // Dikey cizgi, sonra uc yatay.
  E: [
    cizgi([SOL, UST], [SOL, ALT]),
    cizgi([SOL, UST], [SAG, UST]),
    cizgi([SOL, ORTA_Y], [SAG - 15, ORTA_Y]),
    cizgi([SOL, ALT], [SAG, ALT]),
  ],

  // Dikey cizgi, sonra iki yatay.
  F: [
    cizgi([SOL, UST], [SOL, ALT]),
    cizgi([SOL, UST], [SAG, UST]),
    cizgi([SOL, ORTA_Y], [SAG - 15, ORTA_Y]),
  ],

  // C govdesi, sonra agzi kapatan dil: once yukari, sonra sola.
  G: [
    { noktalar: C_GOVDESI },
    // Dil, C'nin BITTIGI noktadan baslar: once yukari, sonra iceri.
    cizgi([251, 305], [268, 268], [268, 215], [212, 215]),
  ],

  // G ve sapkasi.
  "Ğ": [
    { noktalar: C_GOVDESI },
    cizgi([251, 305], [268, 268], [268, 215], [212, 215]),
    // Sapka bir KASE: aci 180'den 0'a azalinca alttan dolasir.
    { noktalar: yay(ORTA_X, 30, 45, 24, 180, 0, 12) },
  ],

  // Iki dikey ve bir yatay.
  H: [
    cizgi([SOL, UST], [SOL, ALT]),
    cizgi([SAG, UST], [SAG, ALT]),
    cizgi([SOL, ORTA_Y], [SAG, ORTA_Y]),
  ],

  // Noktasiz I: tek dikey cizgi.
  I: [cizgi([ORTA_X, UST], [ORTA_X, ALT])],

  // Noktali I: dikey cizgi ve nokta. Turkce'nin ayirt edici harfi.
  "İ": [cizgi([ORTA_X, UST + 20], [ORTA_X, ALT]), NOKTA(ORTA_X)],

  // Asagida kivrilan dikey cizgi ve nokta.
  J: [
    {
      noktalar: [
        { x: SAG - 30, y: UST + 20 },
        { x: SAG - 30, y: ALT - 60 },
        ...yay(SAG - 85, ALT - 60, 55, 55, 0, 150, 12),
      ],
    },
    NOKTA(SAG - 30),
  ],

  // Dikey cizgi, sonra iki kol.
  K: [
    cizgi([SOL, UST], [SOL, ALT]),
    cizgi([SAG, UST], [SOL, ORTA_Y + 10]),
    cizgi([SOL, ORTA_Y + 10], [SAG, ALT]),
  ],

  // Dikey cizgi ve alt yatay: tek vurus.
  L: [cizgi([SOL + 20, UST], [SOL + 20, ALT], [SAG, ALT])],

  // Tek vurus: yukari, asagi, yukari, asagi.
  M: [cizgi([SOL, ALT], [SOL, UST], [ORTA_X, ORTA_Y + 30], [SAG, UST], [SAG, ALT])],

  N: [cizgi([SOL, ALT], [SOL, UST], [SAG, ALT], [SAG, UST])],

  O: [{ noktalar: O_GOVDESI }],

  // O ve iki nokta.
  "Ö": [{ noktalar: O_GOVDESI }, NOKTA(ORTA_X - 40), NOKTA(ORTA_X + 40)],

  // Dikey cizgi ve tek karin.
  P: [
    cizgi([SOL, UST], [SOL, ALT]),
    { noktalar: [{ x: SOL, y: UST }, ...yay(SOL + 10, UST + 70, 75, 70, -90, 90, 16), { x: SOL, y: UST + 140 }] },
  ],

  // P ve bacak.
  R: [
    cizgi([SOL, UST], [SOL, ALT]),
    { noktalar: [{ x: SOL, y: UST }, ...yay(SOL + 10, UST + 70, 75, 70, -90, 90, 16), { x: SOL, y: UST + 140 }] },
    cizgi([SOL + 35, UST + 140], [SAG, ALT]),
  ],

  // S iki yayla kurulmuyor: yay yonleri yuzunden surekli C'ye benziyordu.
  // Elle verilmis nokta listesi hem daha okunakli hem daha guvenli.
  S: [
    cizgi(
      [265, 120], [240, 90], [200, 78], [160, 84], [133, 110], [130, 148],
      [155, 180], [205, 200], [250, 228], [267, 265], [258, 305], [222, 330],
      [175, 333], [138, 315], [122, 288],
    ),
  ],

  // S ve kuyrugu.
  "Ş": [
    cizgi(
      [265, 120], [240, 90], [200, 78], [160, 84], [133, 110], [130, 148],
      [155, 180], [205, 200], [250, 228], [267, 265], [258, 305], [222, 330],
      [175, 333], [138, 315], [122, 288],
    ),
    cizgi([185, 340], [185, 380]),
  ],

  // Ust yatay ve dikey.
  T: [cizgi([SOL - 10, UST], [SAG + 10, UST]), cizgi([ORTA_X, UST], [ORTA_X, ALT])],

  U: [{ noktalar: U_GOVDESI }],

  // U ve iki nokta.
  "Ü": [{ noktalar: U_GOVDESI }, NOKTA(ORTA_X - 40), NOKTA(ORTA_X + 40)],

  V: [cizgi([SOL - 10, UST], [ORTA_X, ALT], [SAG + 10, UST])],

  // Iki kol ve dikey govde.
  Y: [cizgi([SOL, UST], [ORTA_X, ORTA_Y]), cizgi([SAG, UST], [ORTA_X, ORTA_Y]), cizgi([ORTA_X, ORTA_Y], [ORTA_X, ALT])],

  // Ust yatay, capraz, alt yatay: tek vurus.
  Z: [cizgi([SOL, UST], [SAG, UST], [SOL, ALT], [SAG, ALT])],
};
