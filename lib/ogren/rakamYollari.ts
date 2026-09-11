// Rakamlarin cizim yollari.
//
// Her rakam bir veya daha cok "vurus"tan olusur; bir vurus, kalemi
// kaldirmadan cizilen tek bir cizgidir. Vuruslar egri yerine nokta listesi
// olarak tanimlanir. Boylece hem ekranda gosterilen yol hem de cocugun
// ustunden gecmesi gereken kontrol noktalari ayni listeden uretilir ve
// ikisi birbirinden kayamaz. Ayrica tarayiciya bagli getPointAtLength
// gerekmez; mantik tarayici acmadan test edilebilir.
//
// Noktalar 400x400'luk bir tuvale gore verilmistir.

export type Nokta = { x: number; y: number };
export type Vurus = { noktalar: Nokta[] };

export const TUVAL_BOYU = 400;

/**
 * Bir yayi noktalara boler. Acilar derece cinsindendir.
 *
 * ACI YONU (bu yazili olmadigi icin dort rakam ters cizilmisti):
 * SVG'de y asagi dogru buyudugu icin aci ARTTIKCA ekranda SAAT YONUNDE
 * donulur. Yani -90 tepe, 0 sag, 90 alt, 180 sol.
 * Soldan tepeye gitmek icin 180'den 270'e ARTMAK gerekir; 180'den 20'ye
 * azalmak alttan dolasir ve yayi ters cevirir.
 *
 * Bol nokta kullanmak cizimi yumusatir; kontrol noktalari zaten
 * kontrolNoktalari() ile seyreltildigi icin oyunun zorlugu degismez.
 *
 * Disa aciktir: harf yollari (harfYollari.ts) da ayni yay hesabini
 * kullanir; iki dosyada iki ayri kopyasi olsaydi biri duzeltilirken
 * digeri sessizce egri kalirdi.
 */
export function yay(
  mx: number,
  my: number,
  yariCapX: number,
  yariCapY: number,
  baslangicAci: number,
  bitisAci: number,
  adet: number,
): Nokta[] {
  const noktalar: Nokta[] = [];
  for (let i = 0; i <= adet; i++) {
    const aci = ((baslangicAci + ((bitisAci - baslangicAci) * i) / adet) * Math.PI) / 180;
    noktalar.push({
      x: Math.round(mx + yariCapX * Math.cos(aci)),
      y: Math.round(my + yariCapY * Math.sin(aci)),
    });
  }
  return noktalar;
}

export const RAKAM_YOLLARI: Record<number, Vurus[]> = {
  // Sifir: tepeden baslayip saat yonunun tersine tam tur.
  0: [{ noktalar: yay(200, 200, 90, 140, -90, 270, 32) }],

  // Bir: once kisa egik cizgi, sonra uzun dikey cizgi.
  1: [{ noktalar: [{ x: 150, y: 110 }, { x: 200, y: 65 }, { x: 200, y: 335 }] }],

  // Iki: ust yay, capraz inis, alt duz cizgi.
  2: [
    {
      noktalar: [
        ...yay(200, 130, 75, 65, 180, 340, 16),
        { x: 250, y: 190 },
        { x: 120, y: 335 },
        { x: 280, y: 335 },
      ],
    },
  ],

  // Uc: ust yay ve alt yay, tek vurusta.
  3: [
    {
      noktalar: [
        ...yay(200, 130, 70, 65, 180, 450, 16),
        { x: 175, y: 200 },
        ...yay(200, 265, 75, 70, -90, 160, 16),
      ],
    },
  ],

  // Dort: capraz inis ve yatay cizgi bir vurus, dikey cizgi ikinci vurus.
  4: [
    { noktalar: [{ x: 245, y: 70 }, { x: 105, y: 240 }, { x: 300, y: 240 }] },
    { noktalar: [{ x: 245, y: 70 }, { x: 245, y: 335 }] },
  ],

  // Bes: ust yatay cizgi ve dikey inis bir vurus, alt yay ikinci vurus.
  5: [
    { noktalar: [{ x: 275, y: 70 }, { x: 135, y: 70 }, { x: 130, y: 185 }] },
    { noktalar: yay(200, 255, 80, 80, 200, 465, 20) },
  ],

  // Alti: ustten inen egri, sonra alttaki halka.
  6: [
    {
      noktalar: [
        { x: 265, y: 80 },
        { x: 155, y: 165 },
        { x: 128, y: 250 },
        ...yay(200, 262, 72, 72, 180, 540, 24),
      ],
    },
  ],

  // Yedi: ust yatay cizgi ve capraz inis.
  7: [{ noktalar: [{ x: 120, y: 75 }, { x: 285, y: 75 }, { x: 175, y: 335 }] }],

  // Sekiz: ust halka ve alt halka, tek vurusta.
  8: [
    {
      noktalar: [
        // Ust halka ALTTAN baslayip alttan biter; o nokta alt halkanin
        // tepesiyle ayni yerdir, boylece aralarinda duz bir cizgi olusmaz.
        ...yay(200, 135, 65, 65, 90, 450, 24),
        ...yay(200, 268, 78, 68, -90, 270, 24),
      ],
    },
  ],

  // Dokuz: ustteki halka, sonra asagi inen kuyruk.
  9: [
    {
      noktalar: [
        ...yay(200, 145, 72, 72, 0, 360, 24),
        { x: 272, y: 220 },
        { x: 245, y: 335 },
      ],
    },
  ],
};

/** Vurusu SVG "d" niteligine cevirir. */
export function vurusYolu(vurus: Vurus): string {
  return vurus.noktalar
    .map((nokta, i) => `${i === 0 ? "M" : "L"}${nokta.x} ${nokta.y}`)
    .join(" ");
}

/**
 * Cocugun ustunden gecmesi gereken noktalar.
 * Birbirine cok yakin noktalar elenir; yoksa cocuk ayni yerde takilir.
 *
 * SON NOKTA da bu elemeye tabidir. Once kosulsuz ekleniyordu ve iki yerde
 * sorun cikariyordu: Ğ'nin sapkasinda son iki nokta alti birim araliktaydi
 * (tek dokunus ikisini birden isaretliyor, sapkanin ucuna hic gidilmiyordu),
 * kapali halkalarda (O, Ö, sifir, sekiz) ise son nokta ILKIYLE AYNI
 * koordinattaydi -- cocuk tepeye dokundugu anda ikisi birden isaretleniyor
 * ve halka kapatilmadan harf bitiyordu. Vurus her durumda en az iki nokta
 * tasir: tek noktaya inen bir vurus cizilemez.
 */
export function kontrolNoktalari(vurus: Vurus, enAzAralik: number): Nokta[] {
  const noktalar = vurus.noktalar;
  if (noktalar.length === 0) return [];

  const secilenler: Nokta[] = [noktalar[0]];
  for (let i = 1; i < noktalar.length; i++) {
    const sonuncu = secilenler[secilenler.length - 1];
    const uzaklik = Math.hypot(noktalar[i].x - sonuncu.x, noktalar[i].y - sonuncu.y);
    if (uzaklik >= enAzAralik) secilenler.push(noktalar[i]);
  }

  // Kapali halkanin son noktasi ILKIYLE ayni yerdedir (O, Ö, sifir,
  // sekiz): parmakGecti tolerans icindeki butun isaretsiz noktalari
  // birden isaretledigi icin cocuk tepeye dokundugu anda ikisi de
  // yesillenir ve halka kapatilmadan vurus biterdi.
  if (secilenler.length > 2) {
    const ilk = secilenler[0];
    const son = secilenler[secilenler.length - 1];
    if (Math.hypot(son.x - ilk.x, son.y - ilk.y) < enAzAralik) secilenler.pop();
  }

  // Vurusun sonu elendiyse (son parca kisa kaldiysa) yine de bir bitis
  // noktasi gerekiyor: en az iki nokta olmadan vurus "gecilemez".
  if (secilenler.length === 1 && noktalar.length > 1) {
    secilenler.push(noktalar[noktalar.length - 1]);
  }
  return secilenler;
}
